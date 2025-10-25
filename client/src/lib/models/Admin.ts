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
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;
  return db.collection<Admin>('admins').findOne({ _id: session.adminId });
}

export async function getAllAdmins(): Promise<Admin[]> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<Admin>('admins').find({}).toArray();
}

export async function updateAdminRole(adminId: string, newRole: 'super_admin' | 'admin') {
  const client = await clientPromise;
  const db = client.db();
  await db.collection('admins').updateOne(
    { _id: new ObjectId(adminId) },
    { $set: { role: newRole } }
  );
}

export async function deleteAdmin(adminId: string) {
  const client = await clientPromise;
  const db = client.db();
  await db.collection('admins').deleteOne({ _id: new ObjectId(adminId) });
}

export async function getAdminById(adminId: string): Promise<Admin | null> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<Admin>('admins').findOne({ _id: new ObjectId(adminId) });
}
