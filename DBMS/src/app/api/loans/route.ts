import { NextResponse } from "next/server";
import { getLoanAccounts, disburseLoan } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    const userId = userIdParam ? parseInt(userIdParam, 10) : undefined;
    const loans = await getLoanAccounts(userId);

    return NextResponse.json({ success: true, data: loans });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch loans";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, principalAmount } = body;

    if (!userId || !productId || !principalAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: userId, productId, and principalAmount" },
        { status: 400 }
      );
    }

    const result = await disburseLoan(
      parseInt(userId, 10),
      parseInt(productId, 10),
      parseFloat(principalAmount)
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Loan disbursement failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
