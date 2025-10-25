// app/api/credentials/route.ts
import { NextResponse } from 'next/server';
import { getPendingActions } from '@/models/PendingAction';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userWallet = searchParams.get('userWallet');
  if (!userWallet) return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });

  const certs = await getPendingActions(userWallet);
  return NextResponse.json({ success: true, credentials: certs });
}