import { NextResponse, NextRequest } from 'next/server';
import { verifyAdmin } from '@/middleware/adminAuth';
import { updateIssuerStatus, updateIssuerApiKey } from '@/models/Issuer';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { admin, error: authError } = await verifyAdmin(req);
  if (authError) {
    return NextResponse.json(
      { error: authError },
      { status: 401 }
    );
  }

  const { issuerId } = await req.json();

  if (!issuerId) {
    return NextResponse.json(
      { error: 'Missing issuerId' },
      { status: 400 }
    );
  }

  try {
    const apiKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;

    await updateIssuerStatus(issuerId, 'approved');
    await updateIssuerApiKey(issuerId, apiKey);

    return NextResponse.json({
      success: true,
      message: 'Issuer approved',
      apiKey,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
