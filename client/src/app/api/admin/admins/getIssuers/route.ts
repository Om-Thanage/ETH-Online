import { NextResponse, NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/middleware/adminAuth';
import { getAllIssuers } from '@/models/Issuer';

export async function GET(req: NextRequest) {
  const { admin, error: authError } = await verifySuperAdmin(req);
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
