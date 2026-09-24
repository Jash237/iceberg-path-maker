import { NextResponse } from "next/server";
import { getTransactionLedger } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ? parseInt(searchParams.get("userId")!, 10) : undefined;
    const walletId = searchParams.get("walletId") ? parseInt(searchParams.get("walletId")!, 10) : undefined;
    const type = searchParams.get("type") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const ledger = await getTransactionLedger({ userId, walletId, type, limit });
    return NextResponse.json({ success: true, data: ledger });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch transaction ledger";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
