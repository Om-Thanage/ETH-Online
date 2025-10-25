import { NextResponse, NextRequest } from 'next/server';
import { createIssuer, getIssuerByWallet } from '@/models/Issuer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, organizationType, website, wallet } = body;

    // Validation
    if (!name || !email || !phone || !organizationType || !wallet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if issuer already exists
    const existingIssuer = await getIssuerByWallet(wallet);
    if (existingIssuer) {
      return NextResponse.json(
        { error: 'Issuer with this wallet already exists' },
        { status: 409 }
      );
    }

    // Create new issuer
    const issuer = await createIssuer({
      name,
      email,
      phone,
      organizationType,
      website,
      wallet,
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      issuer,
    });
  } catch (error: any) {
    console.error('Error creating issuer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
