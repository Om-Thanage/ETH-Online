// app/api/renew/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { verifyIssuer } from '@/middleware/issuerAuth';

export async function POST(req: Request) {
  const authError = await verifyIssuer(req);
  if (authError) return authError;

  const { tokenId, userWallet, additionalDays } = await req.json();
  const newExpires = Math.floor(Date.now() / 1000) + additionalDays * 86400;

  try {
    const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
    const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY!, provider);
    const skillNFT = new ethers.Contract(
      process.env.SKILL_NFT_ADDRESS!,
      ['function setUser(uint256,address,uint64)'],
      wallet
    );

    const tx = await skillNFT.setUser(tokenId, userWallet, newExpires);
    await tx.wait();

    return NextResponse.json({ success: true, newExpires });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}