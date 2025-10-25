import { NextResponse, NextRequest } from 'next/server';
import { getIssuerByWallet } from '@/models/Issuer';

export async function GET(req: NextRequest) {
  try {
    // Get wallet address from query params
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Find issuer by wallet
    const issuer = await getIssuerByWallet(wallet);

    if (!issuer) {
      return NextResponse.json(
        { error: 'Issuer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      issuer,
    });
  } catch (error: any) {
    console.error('Error fetching issuer status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch issuer status' },
      { status: 500 }
    );
  }
}
