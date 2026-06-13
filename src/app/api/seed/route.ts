import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { seedPlaybooks } from "@/lib/db/seed-playbooks";
import { seedDemoContract } from "@/lib/db/seed-demo-contract";
import { Contract } from "@/lib/db/prisma";
import { connectDB } from "@/lib/db/mongodb";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Seed playbooks first (required for demo contract evidence)
    await seedPlaybooks();

    // Seed demo contract (skips if already exists)
    await seedDemoContract();

    // Get the demo contract ID
    await connectDB();
    const demoContract = await Contract.findOne({ isDemo: true }).lean({ virtuals: true });

    return NextResponse.json({
      success: true,
      demoContractId: demoContract?._id?.toString() || null,
      message: "Demo data seeded successfully",
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed demo data", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if demo contract exists
  await connectDB();
  const demoContract = await Contract.findOne({ isDemo: true }).lean({ virtuals: true });

  return NextResponse.json({
    hasDemo: !!demoContract,
    demoContractId: demoContract?._id?.toString() || null,
  });
}
