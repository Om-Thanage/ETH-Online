import { NextResponse } from 'next/server';
import { findIssuerByApiKey } from '@/models/Issuer';

export async function verifyIssuer(request: Request): Promise<NextResponse | null> {
  const apiKey = request.headers.get('authorization')?.split(' ')[1];
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  const issuer = await findIssuerByApiKey(apiKey);
  if (!issuer || issuer.status !== 'approved') {
    return NextResponse.json({ error: 'Unauthorized issuer' }, { status: 403 });
  }

  return null; // Valid
}