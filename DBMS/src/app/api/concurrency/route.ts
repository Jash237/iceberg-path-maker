import { NextResponse } from "next/server";
import { simulateConcurrencyTest } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, totalThreads = 6, amountPerRequest = 2500, userId = 1 } = body;

    if (mode !== "LOCKED_ACID" && mode !== "UNLOCKED_RACE") {
      return NextResponse.json(
        { success: false, error: "Invalid mode. Must be 'LOCKED_ACID' or 'UNLOCKED_RACE'" },
        { status: 400 }
      );
    }

    const result = await simulateConcurrencyTest({
      mode,
      totalThreads: parseInt(totalThreads, 10),
      amountPerRequest: parseFloat(amountPerRequest),
      userId: parseInt(userId, 10),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Concurrency test failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
