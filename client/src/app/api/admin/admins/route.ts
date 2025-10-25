import { NextResponse, NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/middleware/adminAuth';
import { getAllAdmins } from '@/lib/models/Admin';

export async function GET(req: NextRequest) {
  const { admin, error: authError } = await verifySuperAdmin(req);
  if (authError) {
    return NextResponse.json(
      { error: authError },
      { status: 403 }
    );
  }

  try {
    const admins = await getAllAdmins();
    // Don't send password hashes to frontend
    const safeAdmins = admins.map(({ password, ...admin }) => admin);
    return NextResponse.json({ success: true, admins: safeAdmins });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
