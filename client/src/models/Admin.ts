import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface Admin {
  _id?: ObjectId;
  email: string;
  password: string; // hashed with bcrypt
  role: 'super_admin' | 'admin';
  canApproveIssuers: boolean;
  createdAt: Date;
}

export async function createAdmin(email: string, hashedPassword: string) {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('admins').insertOne({
    email,
    password: hashedPassword,
    role: 'admin',
    canApproveIssuers: true,
    createdAt: new Date(),
  });
  return result.insertedId;
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<Admin>('admins').findOne({ email });
}

export async function verifyAdminSession(sessionId: string): Promise<Admin | null> {
  const client = await clientPromise;
  const db = client.db();
  const session = await db.collection('admin_sessions').findOne({ 
    _id: new ObjectId(sessionId),
    expiresAt: { $gt: new Date() }
  });
  if (!session) return null;
  return db.collection<Admin>('admins').findOne({ _id: session.adminId });
}