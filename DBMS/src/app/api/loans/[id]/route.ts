import { NextResponse } from "next/server";
import { getLoanAccountById, getEmiSchedules, getTransactionLedger } from "@/lib/db";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const loanId = parseInt(params.id, 10);
    const loan = await getLoanAccountById(loanId);

    if (!loan) {
      return NextResponse.json({ success: false, error: "Loan account not found" }, { status: 404 });
    }

    const emiSchedules = await getEmiSchedules(loanId);
    const ledger = await getTransactionLedger();
    const loanLedger = ledger.filter((l) => l.loan_account_id === loanId);

    return NextResponse.json({
      success: true,
      data: {
        loan,
        emiSchedules,
        ledger: loanLedger,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch loan details";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
