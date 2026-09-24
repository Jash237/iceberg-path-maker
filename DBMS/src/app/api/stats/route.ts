import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
