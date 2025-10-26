// app/api/issue/route.ts
import { NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';
import { createPendingAction } from '@/models/PendingAction';
import { sendOffchainMint } from '@/lib/yellow';
import { verifyIssuer } from '@/middleware/issuerAuth';
import { findIssuerByApiKey } from '@/models/Issuer';

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
          image: `ipfs://${imageCid}`,
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
        metadataUri = `ipfs://${cid}`;
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
      metadataUri = `ipfs://${cid}`;
    }

    const expires = expiresInDays > 0 ? Math.floor(Date.now() / 1000) + expiresInDays * 86400 : 0;

    // Get issuer before sending offchain mint
    const issuer = await findIssuerByApiKey(req.headers.get('authorization')!.split(' ')[1]!);
    
    // Send offchain mint with timeout to prevent hanging
    try {
      await Promise.race([
        sendOffchainMint({ to: userWallet, course, expires, cid: metadataUri, isRental: expiresInDays > 0 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Offchain mint timeout')), 10000))
      ]);
    } catch (mintError: any) {
      console.error('Offchain mint error (continuing anyway):', mintError);
      // Continue execution even if offchain mint fails - we'll still create the pending action
    }

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
      metadataUri 
    });
  } catch (error: any) {
    console.error('Issue certificate error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}