import { NextResponse, NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/middleware/adminAuth';
import { deleteAdmin } from '@/lib/models/Admin';

export async function POST(req: NextRequest) {
  const { admin, error: authError } = await verifySuperAdmin(req);
  if (authError) {
    return NextResponse.json(
      { error: authError },
      { status: 403 }
    );
  }

  const { adminId } = await req.json();

  if (!adminId) {
    return NextResponse.json(
      { error: 'Admin ID required' },
      { status: 400 }
    );
  }

  // Prevent self-deletion
  if (admin._id.toString() === adminId) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 403 }
    );
  }

  try {
    await deleteAdmin(adminId);

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
