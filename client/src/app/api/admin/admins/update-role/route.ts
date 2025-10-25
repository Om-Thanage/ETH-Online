import { NextResponse, NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/middleware/adminAuth';
import { updateAdminRole } from '@/lib/models/Admin';

export async function POST(req: NextRequest) {
  const { admin, error: authError } = await verifySuperAdmin(req);
  if (authError) {
    return NextResponse.json(
      { error: authError },
      { status: 403 }
    );
  }

  const { adminId, role } = await req.json();

  if (!adminId || !['admin', 'super_admin'].includes(role)) {
    return NextResponse.json(
      { error: 'Invalid adminId or role' },
      { status: 400 }
    );
  }

  try {
    await updateAdminRole(adminId, role);

    return NextResponse.json({
      success: true,
      message: `Admin role updated to ${role}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
