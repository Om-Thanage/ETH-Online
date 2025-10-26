// app/api/issue/record/route.ts
import { NextResponse } from 'next/server';
import { verifyIssuer } from '@/middleware/issuerAuth';
import { createPendingAction } from '@/models/PendingAction';
import { findIssuerByApiKey } from '@/models/Issuer';

export async function POST(req: Request) {
  const authError = await verifyIssuer(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      userWallet,
      course,
      skills = [],
      expires = 0,
      cid,
      isRental = false,
      transactionHash,
      blockNumber,
      tokenId,
    } = body || {};

    if (!userWallet || !course || !cid || !transactionHash) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const issuer = await findIssuerByApiKey(
      req.headers.get('authorization')!.split(' ')[1]!
    );
    if (!issuer) {
      return NextResponse.json({ error: 'Issuer not found' }, { status: 404 });
    }

    const record = await createPendingAction({
      userWallet,
      course,
      skills,
      expiresAt: expires || null,
      cid,
      isRental,
      issuerId: issuer._id!,
      transactionHash,
      blockNumber,
      tokenId,
    });

    return NextResponse.json({ success: true, credential: record });
  } catch (error: any) {
    console.error('Record issue error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
