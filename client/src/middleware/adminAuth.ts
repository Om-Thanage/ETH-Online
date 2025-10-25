import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAdminByEmail } from '@/lib/models/Admin';

export async function verifyAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return { admin: null, error: 'Unauthorized' };
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set in environment');
      return { admin: null, error: 'Server configuration error' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      email: string;
      adminId: string;
    };

    const admin = await getAdminByEmail(decoded.email);

    if (!admin || !admin.canApproveIssuers) {
      return { admin: null, error: 'Forbidden' };
    }

    return { admin, error: null };
  } catch (err: any) {
    console.error('Admin verification error:', err.message);
    return { admin: null, error: 'Invalid token' };
  }
}

export async function verifySuperAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return { admin: null, error: 'Unauthorized' };
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set in environment');
      return { admin: null, error: 'Server configuration error' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      email: string;
      adminId: string;
    };

    const admin = await getAdminByEmail(decoded.email);

    if (!admin || admin.role !== 'super_admin') {
      return { admin: null, error: 'Only super admins can perform this action' };
    }

    return { admin, error: null };
  } catch (err: any) {
    console.error('Super admin verification error:', err.message);
    return { admin: null, error: 'Invalid token' };
  }
}
