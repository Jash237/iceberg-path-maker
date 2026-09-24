import { NextResponse } from "next/server";
import { payEmi } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emiId, userId, enableLocking = true } = body;

    if (!emiId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: emiId and userId" },
        { status: 400 }
      );
    }

    const result = await payEmi(
      parseInt(emiId, 10),
      parseInt(userId, 10),
      enableLocking
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "EMI repayment failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
