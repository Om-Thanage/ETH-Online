// app/api/verify/route.ts
import { NextResponse } from 'next/server';
import { getPendingActions } from '@/models/PendingAction';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tokenId = searchParams.get('tokenId');
  const cid = searchParams.get('cid');
  const wallet = searchParams.get('wallet');

  try {
    const client = await clientPromise;
    const db = client.db();

    if (wallet) {
      // Return all certificates for a wallet
      const certificates = await getPendingActions(wallet);
      
      if (certificates.length === 0) {
        return NextResponse.json({
          valid: false,
          error: 'No certificates found for this wallet address',
        });
      }

      return NextResponse.json({
        valid: true,
        count: certificates.length,
        certificates: certificates.map(cert => getCertificateStatus(cert)),
      });
    }

    if (tokenId) {
      // Verify by token ID
      const certificate = await db.collection('pending_actions').findOne({
        tokenId: parseInt(tokenId),
      });

      if (!certificate) {
        return NextResponse.json({
          valid: false,
          error: 'Certificate not found with this Token ID',
        });
      }

      // Get issuer info
      const issuer = await db.collection('issuers').findOne({
        _id: new ObjectId(certificate.issuerId),
      });

      return NextResponse.json({
        valid: true,
        certificate: {
          ...getCertificateStatus(certificate),
          issuerName: issuer?.name || 'Unknown',
        },
      });
    }

    if (cid) {
      // Verify by CID
      const certificate = await db.collection('pending_actions').findOne({
        cid: cid,
      });

      if (!certificate) {
        return NextResponse.json({
          valid: false,
          error: 'Certificate not found with this CID',
        });
      }

      // Get issuer info
      const issuer = await db.collection('issuers').findOne({
        _id: new ObjectId(certificate.issuerId),
      });

      return NextResponse.json({
        valid: true,
        certificate: {
          ...getCertificateStatus(certificate),
          issuerName: issuer?.name || 'Unknown',
        },
      });
    }

    return NextResponse.json({
      valid: false,
      error: 'Please provide tokenId, cid, or wallet parameter',
    }, { status: 400 });

  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({
      valid: false,
      error: error.message || 'Verification failed',
    }, { status: 500 });
  }
}

// Helper function to determine certificate status
function getCertificateStatus(cert: any) {
  let status: 'active' | 'expired' | 'revoked' = 'active';
  
  // Check if revoked (user set to 0x0)
  if (cert.status === 'revoked') {
    status = 'revoked';
  } else if (cert.expiresAt && cert.expiresAt * 1000 < Date.now()) {
    status = 'expired';
  }

  return {
    course: cert.course,
    skills: cert.skills || [],
    issuedAt: cert.createdAt,
    expiresAt: cert.expiresAt,
    userWallet: cert.userWallet,
    tokenId: cert.tokenId,
    cid: cert.cid,
    status,
    isRental: cert.isRental || false,
    imageUrl: cert.cid ? `https://gateway.lighthouse.storage/ipfs/${cert.cid}` : undefined,
  };
}
