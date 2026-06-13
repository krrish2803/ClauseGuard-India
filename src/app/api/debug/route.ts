import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    hasSession: !!session,
    session,
    hasSecret: !!process.env.AUTH_SECRET,
    secretPrefix: process.env.AUTH_SECRET?.substring(0, 10),
    secretLength: process.env.AUTH_SECRET?.length,
    nodeEnv: process.env.NODE_ENV,
  });
}
