import { NextResponse, NextRequest } from 'next/server';
import { verifyAdmin } from '@/middleware/adminAuth';
import { updateIssuerStatus } from '@/models/Issuer';

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
    await updateIssuerStatus(issuerId, 'rejected');

    return NextResponse.json({
      success: true,
      message: 'Issuer rejected',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
