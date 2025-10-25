import { NextResponse } from 'next/server';
import { findIssuerByApiKey } from '@/models/Issuer';

export async function verifyIssuer(request: Request): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  const apiKey = authHeader.substring(7);
  const issuer = await findIssuerByApiKey(apiKey);

  if (!issuer || issuer.status !== 'approved') {
    return NextResponse.json({ error: 'Unauthorized issuer' }, { status: 403 });
  }

  return null; // Valid
}