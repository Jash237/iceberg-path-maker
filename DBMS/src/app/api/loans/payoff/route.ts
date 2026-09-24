import { NextResponse } from "next/server";
import { payFullLoan } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loanId, userId } = body;

    if (!loanId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: loanId and userId" },
        { status: 400 }
      );
    }

    const result = await payFullLoan(
      parseInt(loanId, 10),
      parseInt(userId, 10)
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Full loan payoff failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
