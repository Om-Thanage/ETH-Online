import { NextResponse, NextRequest } from 'next/server';
import { verifyAdmin } from '@/middleware/adminAuth';
import { getAllIssuers } from '@/models/Issuer';

export async function GET(req: NextRequest) {
  const { admin, error: authError } = await verifyAdmin(req);
  if (authError) {
    return NextResponse.json(
      { error: authError },
      { status: 401 }
    );
  }

  try {
    const issuers = await getAllIssuers();
    return NextResponse.json({ success: true, issuers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
