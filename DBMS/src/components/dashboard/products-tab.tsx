"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Calculator,
  CreditCard,
  Percent,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { LoanProduct, User, Wallet as WalletType } from "@/types";
import { formatCurrency, calculateEMI, generateAmortizationSchedule } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ProductsTabProps {
  products: LoanProduct[];
  currentUser: User | null;
  currentWallet: WalletType | null;
  onLoanCreated: () => void;
  onNavigateTab: (tabId: string) => void;
}

export function ProductsTab({
  products,
  currentUser,
  currentWallet,
  onLoanCreated,
  onNavigateTab,
}: ProductsTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct>(
    products[0] || {
      product_id: 1,
      product_name: "Nano Instant Credit (30-Day)",
      interest_rate: 8.5,
      tenure_months: 1,
      processing_fee: 100,
      min_loan_amount: 1000,
      max_loan_amount: 15000,
      description: "Ultra-short term micro loan",
    }
  );

  const [loanAmount, setLoanAmount] = useState<number>(
    products[0] ? products[0].min_loan_amount * 2 : 5000
  );

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Calculate live values
  const emi = calculateEMI(loanAmount, selectedProduct.interest_rate, selectedProduct.tenure_months);
  const totalPayable = Math.round(emi * selectedProduct.tenure_months * 100) / 100;
  const totalInterest = Math.max(0, Math.round((totalPayable - loanAmount) * 100) / 100);

  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    selectedProduct.interest_rate,
    selectedProduct.tenure_months
  );

  async function handleDisburseLoan() {
    if (!currentUser) return;
    setIsSubmitting(true);
    setApplyError(null);

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.user_id,
          productId: selectedProduct.product_id,
          principalAmount: loanAmount,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Disbursement failed");
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsApplyModalOpen(false);
      onLoanCreated();
      onNavigateTab("loans");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Disbursement failed";
      setApplyError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Micro-Lending Products & Calculator</h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore standardized micro-credit packages, run interactive amortization modeling, and trigger instant atomic disbursements.
        </p>
      </div>

      {/* Product Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const isSelected = selectedProduct.product_id === p.product_id;
          return (
            <motion.div
              key={p.product_id}
              whileHover={{ y: -3 }}
              onClick={() => {
                setSelectedProduct(p);
                setLoanAmount(Math.min(p.max_loan_amount, Math.max(p.min_loan_amount, loanAmount)));
              }}
              className={`cursor-pointer rounded-2xl border p-5 transition-all relative overflow-hidden ${
                isSelected
                  ? "border-indigo-500 bg-indigo-950/40 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                  : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  Selected
                </div>
              )}

              <p className="text-sm font-bold text-white line-clamp-1">{p.product_name}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">{p.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Interest Rate:</span>
                  <span className="font-bold text-emerald-400 font-mono">{p.interest_rate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tenure:</span>
                  <span className="font-bold text-slate-200">{p.tenure_months} Month{p.tenure_months > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Borrow Range:</span>
                  <span className="font-mono text-slate-300">
                    ₹{(p.min_loan_amount / 1000).toFixed(0)}k – ₹{(p.max_loan_amount / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Loan Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Sliders & Instant Breakdown */}
        <SpotlightCard className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Interactive Loan Modeler</h2>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="text-slate-400">Loan Amount</span>
              <span className="font-bold text-indigo-400 font-mono text-sm">{formatCurrency(loanAmount)}</span>
            </div>
            <input
              type="range"
              min={selectedProduct.min_loan_amount}
              max={selectedProduct.max_loan_amount}
              step={500}
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>{formatCurrency(selectedProduct.min_loan_amount)}</span>
              <span>{formatCurrency(selectedProduct.max_loan_amount)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Monthly EMI</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{formatCurrency(emi)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Principal Amount</span>
              <span className="font-mono text-slate-200">{formatCurrency(loanAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Interest ({selectedProduct.interest_rate}%)</span>
              <span className="font-mono text-purple-400">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Processing Fee</span>
              <span className="font-mono text-slate-200">{formatCurrency(selectedProduct.processing_fee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
              <span className="text-white">Total Amount Payable</span>
              <span className="font-mono text-indigo-300">{formatCurrency(totalPayable)}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsApplyModalOpen(true)}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply & Disburse Instantly</span>
          </motion.button>
        </SpotlightCard>

        {/* Right 2 Cols: Visual Amortization Breakdown */}
        <SpotlightCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Amortization Schedule Breakdown</h2>
              <p className="text-xs text-slate-400">
                Principal vs. Interest distribution calculated using standard financial reducing balance
              </p>
            </div>
            <Badge variant="purple">{selectedProduct.tenure_months} Installments</Badge>
          </div>

          {/* Amortization Bar Chart */}
          <div className="h-56 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amortizationSchedule}>
                <XAxis
                  dataKey="installmentNumber"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `EMI #${val}`}
                />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="principalComponent" name="Principal Component" stackId="a" fill="#6366f1" />
                <Bar dataKey="interestComponent" name="Interest Component" stackId="a" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Amortization Table */}
          <div className="overflow-x-auto max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                <tr className="text-slate-400 font-semibold">
                  <th className="pb-2">Installment</th>
                  <th className="pb-2">Due Date</th>
                  <th className="pb-2">EMI Amount</th>
                  <th className="pb-2">Principal</th>
                  <th className="pb-2">Interest</th>
                  <th className="pb-2">Balance Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {amortizationSchedule.map((row) => (
                  <tr key={row.installmentNumber} className="hover:bg-slate-800/20">
                    <td className="py-2 font-mono text-indigo-400">#{row.installmentNumber}</td>
                    <td className="py-2 text-slate-300">{row.dueDate}</td>
                    <td className="py-2 font-bold text-white">{formatCurrency(row.emiAmount)}</td>
                    <td className="py-2 font-mono text-emerald-400">{formatCurrency(row.principalComponent)}</td>
                    <td className="py-2 font-mono text-purple-400">{formatCurrency(row.interestComponent)}</td>
                    <td className="py-2 font-mono text-slate-400">{formatCurrency(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      </div>

      {/* Instant Loan Disbursement Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Confirm Micro-Loan Disbursement"
        subtitle="Review loan terms before executing atomic multi-table OLTP transaction"
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Borrower:</span>
              <span className="font-bold text-white">{currentUser?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Product Plan:</span>
              <span className="font-bold text-indigo-300">{selectedProduct.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Disbursed Principal:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{formatCurrency(loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Monthly EMI:</span>
              <span className="font-bold text-white font-mono">{formatCurrency(emi)} / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Tenure:</span>
              <span className="font-bold text-slate-200">{selectedProduct.tenure_months} Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Total Repayable:</span>
              <span className="font-bold text-purple-300 font-mono">{formatCurrency(totalPayable)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1 text-slate-400">
            <p className="font-semibold text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              OLTP Transaction Steps:
            </p>
            <p>1. Open new Loan Account record in `loan_account`</p>
            <p>2. Pre-generate {selectedProduct.tenure_months} installments into `emi_schedule`</p>
            <p>3. Acquire row lock (`FOR UPDATE`) and credit {formatCurrency(loanAmount)} to Wallet #{currentWallet?.wallet_id}</p>
            <p>4. Append `LOAN_DISBURSEMENT` record to immutable `transaction_ledger`</p>
          </div>

          {applyError && (
            <div className="rounded-xl border border-rose-800/60 bg-rose-950/70 p-3 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{applyError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleDisburseLoan}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
            >
              {isSubmitting ? "Executing Transaction..." : "Confirm & Disburse to Wallet"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
