// app/api/revoke/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { verifyIssuer } from '@/middleware/issuerAuth';

export async function POST(req: Request) {
  const authError = await verifyIssuer(req);
  if (authError) return authError;

  const { tokenId } = await req.json();

  try {
    const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
    const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY!, provider);
    const skillNFT = new ethers.Contract(
      process.env.SKILL_NFT_ADDRESS!,
      ['function setUser(uint256,address,uint64)'],
      wallet
    );

    const tx = await skillNFT.setUser(tokenId, '0x0000000000000000000000000000000000000000', 0);
    await tx.wait();

    return NextResponse.json({ success: true, revoked: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}