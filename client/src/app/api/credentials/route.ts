// app/api/credentials/route.ts
import { NextResponse } from 'next/server';
import { getPendingActions, getPendingActionsByIssuer } from '@/models/PendingAction';
import { verifyIssuer } from '@/middleware/issuerAuth';
import { findIssuerByApiKey } from '@/models/Issuer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');
  const userWallet = searchParams.get('userWallet');
  
  // If wallet parameter is provided, fetch certificates for that wallet (public access)
  if (wallet) {
    const certs = await getPendingActions(wallet);
    return NextResponse.json({ success: true, credentials: certs });
  }

  // If userWallet parameter is provided (legacy support)
  if (userWallet) {
    const certs = await getPendingActions(userWallet);
    return NextResponse.json({ success: true, credentials: certs });
  }

  // Otherwise, require authentication and fetch issuer's certificates
  const authError = await verifyIssuer(req);
  if (authError) return authError;

  try {
    const issuer = await findIssuerByApiKey(req.headers.get('authorization')!.split(' ')[1]!);
    if (!issuer) {
      return NextResponse.json({ error: 'Issuer not found' }, { status: 404 });
    }

    const certs = await getPendingActionsByIssuer(issuer._id!);
    return NextResponse.json({ success: true, credentials: certs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}