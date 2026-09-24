"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Zap,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { LoanAccount, EmiSchedule, User, Wallet as WalletType, TransactionLedger } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import confetti from "canvas-confetti";

interface LoansTabProps {
  loans: LoanAccount[];
  emiSchedules: EmiSchedule[];
  currentUser: User | null;
  currentWallet: WalletType | null;
  ledger: TransactionLedger[];
  onRefresh: () => void;
  onOpenDeposit: () => void;
}

export function LoansTab({
  loans,
  emiSchedules,
  currentUser,
  currentWallet,
  ledger,
  onRefresh,
  onOpenDeposit,
}: LoansTabProps) {
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(
    loans.length > 0 ? loans[0].loan_account_id : null
  );

  const [payingEmiId, setPayingEmiId] = useState<number | null>(null);
  const [isPayingFull, setIsPayingFull] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const userLoans = loans.filter((l) => (currentUser ? l.user_id === currentUser.user_id : true));
  const activeLoan = loans.find((l) => l.loan_account_id === selectedLoanId) || userLoans[0] || null;

  const activeLoanEmis = activeLoan
    ? emiSchedules.filter((e) => e.loan_account_id === activeLoan.loan_account_id)
    : [];

  const paidEmis = activeLoanEmis.filter((e) => e.status === "PAID");
  const pendingEmis = activeLoanEmis.filter((e) => e.status !== "PAID");
  const nextPendingEmi = pendingEmis[0] || null;

  const repaidPercentage = activeLoan
    ? Math.round(((activeLoan.total_payable - activeLoan.outstanding_balance) / activeLoan.total_payable) * 100)
    : 0;

  async function handlePayEmi(emiId: number) {
    if (!currentUser) return;
    setPayingEmiId(emiId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/emi/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emiId,
          userId: currentUser.user_id,
          enableLocking: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Payment failed");
      }

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });

      setActionMessage({
        type: "success",
        text: `EMI installment #${data.data.emi.installment_number} settled successfully! Recorded in Ledger (Ref: ${data.data.ledger.reference_no})`,
      });

      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setPayingEmiId(null);
    }
  }

  async function handlePayFullLoan(loanId: number) {
    if (!currentUser) return;
    setIsPayingFull(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/loans/payoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId,
          userId: currentUser.user_id,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Full payoff failed");
      }

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      setActionMessage({
        type: "success",
        text: `Congratulations! Loan #${loanId} is now 100% paid and closed!`,
      });

      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Full payoff failed";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setIsPayingFull(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Active Loans & EMI Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time amortization schedule monitoring, atomic EMI repayments with row-level locks, and early loan payoff.
          </p>
        </div>
      </div>

      {actionMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 text-xs flex items-center gap-3 ${
            actionMessage.type === "success"
              ? "bg-emerald-950/70 text-emerald-200 border border-emerald-800/60 shadow-lg shadow-emerald-950/40"
              : "bg-rose-950/70 text-rose-200 border border-rose-800/60 shadow-lg shadow-rose-950/40"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div className="flex-1">{actionMessage.text}</div>
          {actionMessage.type === "error" && actionMessage.text.includes("balance") && (
            <button
              onClick={onOpenDeposit}
              className="rounded-lg bg-indigo-600 px-3 py-1 font-bold text-white hover:bg-indigo-500"
            >
              Fund Wallet
            </button>
          )}
        </motion.div>
      )}

      {/* Main Content Layout */}
      {userLoans.length === 0 ? (
        <SpotlightCard className="p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-white">No active loans found for current borrower</p>
          <p className="text-xs text-slate-400 mt-1">Visit the Loan Products catalog to apply for an instant micro-loan.</p>
        </SpotlightCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 1 Col: Loan Accounts List */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Your Contracted Loans</h2>
            <div className="space-y-3">
              {userLoans.map((loan) => {
                const isSelected = selectedLoanId === loan.loan_account_id;
                return (
                  <motion.div
                    key={loan.loan_account_id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedLoanId(loan.loan_account_id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 shadow-lg ring-1 ring-indigo-500/50"
                        : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{loan.product_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Account #{loan.loan_account_id}</p>
                      </div>
                      <Badge variant={loan.loan_status === "ACTIVE" ? "success" : "default"}>
                        {loan.loan_status}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Outstanding</span>
                        <span className="font-bold text-white font-mono">{formatCurrency(loan.outstanding_balance)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">EMI / Mo</span>
                        <span className="font-bold text-indigo-300 font-mono">{formatCurrency(loan.emi_amount)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Cols: Selected Loan Deep-Dive & Installments */}
          {activeLoan && (
            <SpotlightCard className="lg:col-span-2 p-6 space-y-6">
              {/* Selected Loan Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{activeLoan.product_name}</h2>
                    <Badge variant={activeLoan.loan_status === "ACTIVE" ? "success" : "default"}>
                      {activeLoan.loan_status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Disbursed on {formatDate(activeLoan.disbursement_date)} • Tenure ends {formatDate(activeLoan.loan_end_date)}
                  </p>
                </div>

                {activeLoan.loan_status === "ACTIVE" && activeLoan.outstanding_balance > 0 && (
                  <button
                    disabled={isPayingFull}
                    onClick={() => handlePayFullLoan(activeLoan.loan_account_id)}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/50 px-3.5 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-900/50 transition-colors shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Payoff Full Loan ({formatCurrency(activeLoan.outstanding_balance)})</span>
                  </button>
                )}
              </div>

              {/* Progress & Quick Stats */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Repayment Progress: {repaidPercentage}%</span>
                  <span className="font-mono text-emerald-400">
                    {paidEmis.length} of {activeLoanEmis.length} Installments Settled
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${repaidPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <span className="text-[10px] text-slate-400 block uppercase">Principal</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(activeLoan.principal_amount)}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <span className="text-[10px] text-slate-400 block uppercase">Interest Rate</span>
                  <span className="font-bold text-purple-400 font-mono">{activeLoan.interest_rate}% p.a.</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Payable</span>
                  <span className="font-bold text-slate-200 font-mono">{formatCurrency(activeLoan.total_payable)}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <span className="text-[10px] text-slate-400 block uppercase">Outstanding</span>
                  <span className="font-bold text-amber-400 font-mono">{formatCurrency(activeLoan.outstanding_balance)}</span>
                </div>
              </div>

              {/* Installments Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Installment Amortization Schedule
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-2">#</th>
                        <th className="pb-2">Due Date</th>
                        <th className="pb-2">EMI Amount</th>
                        <th className="pb-2">Principal</th>
                        <th className="pb-2">Interest</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {activeLoanEmis.map((emi) => {
                        const isPending = emi.status !== "PAID";
                        const isPaying = payingEmiId === emi.emi_id;

                        return (
                          <tr key={emi.emi_id} className="hover:bg-slate-800/20">
                            <td className="py-3 font-mono text-indigo-400">#{emi.installment_number}</td>
                            <td className="py-3 text-slate-300">{formatDate(emi.due_date)}</td>
                            <td className="py-3 font-bold text-white font-mono">{formatCurrency(emi.emi_amount)}</td>
                            <td className="py-3 font-mono text-emerald-400">{formatCurrency(emi.principal_component)}</td>
                            <td className="py-3 font-mono text-purple-400">{formatCurrency(emi.interest_component)}</td>
                            <td className="py-3">
                              <Badge variant={emi.status === "PAID" ? "success" : "warning"}>
                                {emi.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-right">
                              {isPending ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  disabled={isPaying}
                                  onClick={() => handlePayEmi(emi.emi_id)}
                                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 font-bold text-white shadow-sm transition-all text-xs"
                                >
                                  {isPaying ? "Processing..." : `Pay ₹${emi.emi_amount.toFixed(0)}`}
                                </motion.button>
                              ) : (
                                <span className="text-[11px] text-emerald-400 font-mono">
                                  ✓ Paid on {formatDate(emi.payment_date)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </SpotlightCard>
          )}
        </div>
      )}
    </div>
  );
}
