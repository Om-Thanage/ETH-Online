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

  const body = await req.json();
  const { userWallet, course, skills = [], expiresInDays = 0, signedMessage } = body;

  if (!userWallet || !course || !signedMessage) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const certData = { course, skills, issuedAt: new Date().toISOString() };
    const { data } = await lighthouse.uploadEncrypted(
      JSON.stringify(certData),
      process.env.LIGHTHOUSE_API_KEY!,
      process.env.BACKEND_PUBLIC_KEY!,
      signedMessage
    );
    const cid = data[0].Hash;

    const expires = expiresInDays > 0 ? Math.floor(Date.now() / 1000) + expiresInDays * 86400 : 0;

    await sendOffchainMint({ to: userWallet, course, expires, cid, isRental: expiresInDays > 0 });

    const issuer = await findIssuerByApiKey(req.headers.get('authorization')!.split(' ')[1]!);
    await createPendingAction({
      userWallet,
      course,
      skills,
      expiresAt: expires || null,
      cid,
      isRental: expiresInDays > 0,
      issuerId: issuer!._id!,
    });

    return NextResponse.json({ success: true, cid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}