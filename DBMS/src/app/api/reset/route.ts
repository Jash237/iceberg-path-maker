import { NextResponse } from "next/server";
import { resetDatabaseState } from "@/lib/db";

export async function POST() {
  try {
    await resetDatabaseState();
    return NextResponse.json({ success: true, message: "Database state reset to seed data" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reset database";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
