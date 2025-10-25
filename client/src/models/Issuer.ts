import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface Issuer {
  _id?: ObjectId;
  name: string;
  wallet: string;
  email: string;
  phone: string;
  organizationType: string;
  website?: string;
  status: 'pending' | 'approved' | 'rejected';
  apiKey?: string;
  createdAt: Date;
  approvedAt?: Date;
}

export async function createIssuer(data: Omit<Issuer, 'createdAt' | 'status'>) {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('issuers').insertOne({
    ...data,
    status: 'pending',
    createdAt: new Date(),
  });
  return { ...data, _id: result.insertedId, status: 'pending', createdAt: new Date() };
}

export async function findIssuerByApiKey(apiKey: string): Promise<Issuer | null> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<Issuer>('issuers').findOne({ apiKey });
}

export async function getIssuerByWallet(wallet: string): Promise<Issuer | null> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<Issuer>('issuers').findOne({ wallet });
}

export async function updateIssuerStatus(id: string, status: 'approved' | 'rejected') {
  const client = await clientPromise;
  const db = client.db();
  const update: any = { status };
  if (status === 'approved') update.approvedAt = new Date();
  await db.collection('issuers').updateOne({ _id: new ObjectId(id) }, { $set: update });
}

export async function updateIssuerApiKey(id: ObjectId | string, apiKey: string) {
  const client = await clientPromise;
  const db = client.db();
  const objectId = typeof id === 'string' ? new ObjectId(id) : id;
  await db.collection('issuers').updateOne({ _id: objectId }, { $set: { apiKey } });
}

export async function getAllIssuers(): Promise<Issuer[]> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<Issuer>('issuers').find({}).toArray();
}

export async function getPendingIssuers(): Promise<Issuer[]> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<Issuer>('issuers').find({ status: 'pending' }).toArray();
}

export async function getApprovedIssuers(): Promise<Issuer[]> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<Issuer>('issuers').find({ status: 'approved' }).toArray();
}
