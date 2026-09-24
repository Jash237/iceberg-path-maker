import { NextResponse } from "next/server";
import { getWalletByUserId, fundWallet, withdrawWallet } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "1", 10);

    const wallet = await getWalletByUserId(userId);
    if (!wallet) {
      return NextResponse.json({ success: false, error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: wallet });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch wallet";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, amount, remarks, enableLocking = true } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters: userId and positive amount are required" },
        { status: 400 }
      );
    }

    if (action === "CREDIT") {
      const result = await fundWallet(parseInt(userId, 10), parseFloat(amount), remarks);
      return NextResponse.json({ success: true, data: result });
    } else if (action === "DEBIT") {
      const result = await withdrawWallet(parseInt(userId, 10), parseFloat(amount), remarks, enableLocking);
      return NextResponse.json({ success: true, data: result });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'CREDIT' or 'DEBIT'" },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Wallet transaction failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
