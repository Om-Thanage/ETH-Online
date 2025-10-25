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
      process.env.CERT_NFT_ADDRESS!,
      ['function batchMint(address[],string[],uint256[],string[],bool[])'],
      wallet
    );

    const calldata = contract.interface.encodeFunctionData('batchMint', [
      pending.map(p => p.userWallet),
      pending.map(p => p.course),
      pending.map(p => p.expiresAt || 0),
      pending.map(p => p.cid),
      pending.map(p => p.isRental),
    ]);

    const tx = await wallet.sendTransaction({ to: process.env.CERT_NFT_ADDRESS, data: calldata });
    await tx.wait();

    await markSettled(pending.map(p => p._id!));

    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}