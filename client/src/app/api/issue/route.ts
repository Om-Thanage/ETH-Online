// app/api/issue/route.ts
import { NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';
import { createPendingAction } from '@/models/PendingAction';
import { sendOffchainMint } from '@/lib/yellow';
import { verifyIssuer } from '@/middleware/issuerAuth';
import { findIssuerByApiKey } from '@/models/Issuer';
import { sendGaslessTransaction, isBiconomyAvailable } from '@/lib/biconomy';

export async function POST(req: Request) {
  const authError = await verifyIssuer(req);
  if (authError) return authError;

  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any;
    let certificateType = 'text';
    let imageFile: File | null = null;

    // Handle FormData (image upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {
        userWallet: formData.get('userWallet') as string,
        course: formData.get('course') as string,
        skills: JSON.parse(formData.get('skills') as string || '[]'),
        expiresInDays: parseInt(formData.get('expiresInDays') as string || '0'),
        signedMessage: formData.get('signedMessage') as string,
        certificateType: formData.get('certificateType') as string,
      };
      imageFile = formData.get('image') as File;
      certificateType = body.certificateType || 'image';
    } else {
      // Handle JSON (text-based)
      body = await req.json();
      certificateType = body.certificateType || 'text';
    }

    const { userWallet, course, skills = [], expiresInDays = 0, signedMessage } = body;

    if (!userWallet || !course || !signedMessage) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let cid: string;
    let metadataUri: string;

    if (certificateType === 'image' && imageFile) {
      // Convert File to Buffer for Lighthouse upload
      const imageArrayBuffer = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);
      
      // Create a temporary file-like object for Lighthouse
      // Lighthouse SDK expects either a path or a readable stream
      // We'll save the file temporarily or upload directly
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      // Create temp file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `cert-${Date.now()}-${imageFile.name}`);
      fs.writeFileSync(tempFilePath, imageBuffer);
      
      try {
        // Upload image to Lighthouse using file path
        const imageUpload = await lighthouse.upload(
          tempFilePath,
          process.env.LIGHTHOUSE_API_KEY!
        );
        const imageCid = imageUpload.data.Hash;
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        // Create metadata with image
        const metadata = {
          name: course,
          description: `Certificate for ${course}`,
          image: `https://gateway.lighthouse.storage/ipfs/${imageCid}`,
          attributes: [
            { trait_type: 'Course', value: course },
            { trait_type: 'Skills', value: skills.join(', ') },
            { trait_type: 'Issued At', value: new Date().toISOString() },
            { trait_type: 'Type', value: 'Image Certificate' },
          ],
        };

        // Upload metadata
        const metadataUpload = await lighthouse.uploadText(
          JSON.stringify(metadata),
          process.env.LIGHTHOUSE_API_KEY!
        );
        cid = metadataUpload.data.Hash;
        metadataUri = `https://gateway.lighthouse.storage/ipfs/${cid}`;
      } catch (uploadError) {
        // Clean up temp file on error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        throw uploadError;
      }
    } else {
      // Text-based certificate
      const certData = {
        name: course,
        description: `Certificate for ${course}`,
        image: `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(course)}`, // Placeholder image for text certificates
        course,
        skills,
        issuedAt: new Date().toISOString(),
        attributes: [
          { trait_type: 'Course', value: course },
          { trait_type: 'Skills', value: skills.join(', ') },
          { trait_type: 'Issued At', value: new Date().toISOString() },
          { trait_type: 'Type', value: 'Text Certificate' },
        ],
      };

      const response = await lighthouse.uploadText(
        JSON.stringify(certData),
        process.env.LIGHTHOUSE_API_KEY!
      );
      cid = response.data.Hash;
      metadataUri = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    }

    const expires = expiresInDays > 0 ? Math.floor(Date.now() / 1000) + expiresInDays * 86400 : 0;

    // Get issuer before minting
    const issuer = await findIssuerByApiKey(req.headers.get('authorization')!.split(' ')[1]!);
    
    // Try minting strategies in order: Biconomy (gasless) -> Direct (backend pays gas) -> Queue for later
    let mintResult: any = null;
    
    // Strategy 1: Try Biconomy for gasless transactions
    if (isBiconomyAvailable()) {
      try {
        console.log('[Mint] Attempting Biconomy gasless transaction...');
        mintResult = await sendGaslessTransaction({
          to: userWallet,
          course,
          expires,
          cid: metadataUri,
          isRental: expiresInDays > 0
        });
        
        console.log('[Mint] ✅ Biconomy gasless mint successful!');
        
        await createPendingAction({
          userWallet,
          course,
          skills,
          expiresAt: expires || null,
          cid,
          isRental: expiresInDays > 0,
          issuerId: issuer!._id!,
          transactionHash: mintResult.hash,
          blockNumber: mintResult.blockNumber,
        });

        return NextResponse.json({ 
          success: true, 
          cid,
          type: certificateType,
          metadataUri,
          transactionHash: mintResult.hash,
          blockNumber: mintResult.blockNumber,
          method: 'biconomy',
          message: 'Certificate minted successfully with Biconomy (gasless)!'
        });
      } catch (biconomyError: any) {
        console.warn('[Mint] Biconomy failed, trying fallback:', biconomyError.message);
      }
    }
    
    // Strategy 2: Direct on-chain minting (backend pays gas)
    try {
      console.log('[Mint] Attempting direct on-chain minting...');
      // Use ethers v6 (works better in Next.js API routes)
      const { JsonRpcProvider, Wallet, Contract } = await import('ethers');
      const provider = new JsonRpcProvider(process.env.MUMBAI_RPC);
      const backendWallet = new Wallet(process.env.BACKEND_PRIVATE_KEY!, provider);
      
      // Call SkillNFT.mintToUser directly instead of going through IssuanceAPI
      const contractABI = [
        'function mintToUser(address to, string memory uri, uint64 expires, string memory skill) external returns (uint256)'
      ];
      
      const contract = new Contract(
        process.env.SKILL_NFT_ADDRESS!,  // Changed from ISSUANCE_API_ADDRESS to SKILL_NFT_ADDRESS
        contractABI,
        backendWallet
      );

      const tx = await contract.mintToUser(userWallet, metadataUri, expires, course);
      console.log('[Mint] Transaction submitted:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('[Mint] ✅ NFT minted successfully! Block:', receipt.blockNumber);
      
      await createPendingAction({
        userWallet,
        course,
        skills,
        expiresAt: expires || null,
        cid,
        isRental: expiresInDays > 0,
        issuerId: issuer!._id!,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
      });

      return NextResponse.json({ 
        success: true, 
        cid,
        type: certificateType,
        metadataUri,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        method: 'direct',
        message: 'Certificate minted successfully on-chain!'
      });
    } catch (mintError: any) {
      console.error('[Mint] All minting strategies failed:', mintError);
      
      // Strategy 3: Fallback - Store as pending action for manual settlement
      await createPendingAction({
        userWallet,
        course,
        skills,
        expiresAt: expires || null,
        cid,
        isRental: expiresInDays > 0,
        issuerId: issuer!._id!,
      });

      return NextResponse.json({ 
        success: true, 
        cid,
        type: certificateType,
        metadataUri,
        pending: true,
        method: 'queued',
        message: 'Certificate created and queued for minting. Use /api/settle to complete.'
      });
    }
  } catch (error: any) {
    console.error('Issue certificate error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}