import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Role promotion/demotion has been disabled. Contact your super admin.' },
    { status: 410 } // 410 Gone - endpoint is deprecated
  );
}
