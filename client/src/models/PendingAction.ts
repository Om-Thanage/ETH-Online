// models/PendingAction.ts
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface PendingAction {
  _id?: ObjectId;
  userWallet: string;
  course: string;
  skills: string[];
  expiresAt: number | null;
  cid: string;
  isRental: boolean;
  issuerId: ObjectId;
  settled: boolean;
  createdAt: Date;
}

export async function createPendingAction(data: Omit<PendingAction, 'createdAt' | 'settled'>) {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('pending_actions').insertOne({
    ...data,
    settled: false,
    createdAt: new Date(),
  });
  return { ...data, _id: result.insertedId, settled: false, createdAt: new Date() };
}

export async function getPendingActions(userWallet: string): Promise<PendingAction[]> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<PendingAction>('pending_actions')
    .find({ userWallet, settled: false })
    .toArray();
}

export async function markSettled(ids: ObjectId[]) {
  const client = await clientPromise;
  const db = client.db();
  await db.collection('pending_actions').updateMany(
    { _id: { $in: ids } },
    { $set: { settled: true } }
  );
}