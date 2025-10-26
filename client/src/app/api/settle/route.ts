// app/api/settle/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getPendingActions, markSettled } from '@/models/PendingAction';

export async function POST(req: Request) {
  const { userWallet } = await req.json();
  const pending = await getPendingActions(userWallet);

  if (pending.length === 0) {
    return NextResponse.json({ success: true, message: 'Nothing to settle' });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
    const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(
      process.env.ISSUANCE_API_ADDRESS!,
      ['function issueCredential(address,string,uint64,string) returns (uint256)'],
      wallet
    );

    const txHashes = [];
    
    // Issue credentials one by one
    for (const action of pending) {
      const tx = await contract.issueCredential(
        action.userWallet,
        action.cid, // URI
        action.expiresAt || 0, // expires
        action.course // skill
      );
      const receipt = await tx.wait();
      txHashes.push(receipt.hash);
    }

    await markSettled(pending.map(p => p._id!));

    return NextResponse.json({ success: true, txHashes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}