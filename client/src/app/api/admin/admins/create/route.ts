import { NextResponse, NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/middleware/adminAuth';
import { createAdmin, getAdminByEmail } from '@/lib/models/Admin';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { admin, error: authError } = await verifySuperAdmin(req);
  if (authError) {
    return NextResponse.json(
      { error: authError },
      { status: 403 }
    );
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password required' },
      { status: 400 }
    );
  }

  try {
    // Check if admin already exists
    const existingAdmin = await getAdminByEmail(email);
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const adminId = await createAdmin(email, hashedPassword);

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      adminId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
