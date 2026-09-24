"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { User, Wallet as WalletType, TransactionLedger } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import confetti from "canvas-confetti";

interface WalletTabProps {
  currentUser: User | null;
  currentWallet: WalletType | null;
  ledger: TransactionLedger[];
  onRefresh: () => void;
}

export function WalletTab({ currentUser, currentWallet, ledger, onRefresh }: WalletTabProps) {
  const [amount, setAmount] = useState<string>("5000");
  const [remarks, setRemarks] = useState<string>("");
  const [actionType, setActionType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const walletLedger = ledger.filter((l) => l.wallet_id === currentWallet?.wallet_id);

  const quickAmounts = [1000, 2500, 5000, 10000, 25000];

  async function handleTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !currentWallet) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid positive amount." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          userId: currentUser.user_id,
          amount: numAmount,
          remarks: remarks || (actionType === "CREDIT" ? "Wallet Top-up" : "Wallet Withdrawal"),
          enableLocking: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Transaction failed");
      }

      if (actionType === "CREDIT") {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      setMessage({
        type: "success",
        text: `Transaction executed! ${actionType === "CREDIT" ? "Credited" : "Debited"} ${formatCurrency(
          numAmount
        )} (Ref: ${data.data.ledger.reference_no})`,
      });

      setRemarks("");
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Digital Wallet Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Atomic OLTP wallet storage with real-time balance tracking, row-level locking, and immutable ledger entries.
        </p>
      </div>

      {/* Main Grid: Wallet Card & Transaction Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Visual Digital Card */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 shadow-2xl text-white">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-indigo-200">MicroLend Digital Wallet</span>
              </div>
              <Badge variant="purple">ACID-Locked</Badge>
            </div>

            <div className="mt-8">
              <span className="text-xs uppercase tracking-widest text-indigo-300/80 font-medium">Available Balance</span>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                {formatCurrency(currentWallet?.balance || 0)}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-indigo-800/40 flex items-center justify-between text-xs font-mono text-indigo-200">
              <div>
                <span className="block text-[10px] text-indigo-400 uppercase">Wallet ID</span>
                <span className="font-bold">#WLT-{currentWallet?.wallet_id.toString().padStart(4, "0")}</span>
              </div>
              <div>
                <span className="block text-[10px] text-indigo-400 uppercase">Holder</span>
                <span className="font-bold">{currentUser?.full_name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-indigo-400 uppercase">Aadhaar Verified</span>
                <span className="font-bold">✓ Active</span>
              </div>
            </div>
          </div>

          {/* Wallet Metadata Info Card */}
          <SpotlightCard className="p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Last Transaction Update:</span>
              <span className="font-mono text-slate-200">{formatDateTime(currentWallet?.last_updated)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>User Email:</span>
              <span className="text-slate-200">{currentUser?.email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Registered Phone:</span>
              <span className="text-slate-200">{currentUser?.phone}</span>
            </div>
          </SpotlightCard>
        </div>

        {/* Right 2 Cols: Transaction Action Portal */}
        <SpotlightCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Execute Wallet Transaction</h2>
              <p className="text-xs text-slate-400">Instantly credit or debit funds with transactional consistency</p>
            </div>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setActionType("CREDIT")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  actionType === "CREDIT"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Deposit (Credit)
              </button>
              <button
                onClick={() => setActionType("DEBIT")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  actionType === "DEBIT"
                    ? "bg-rose-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Withdraw (Debit)
              </button>
            </div>
          </div>

          <form onSubmit={handleTransaction} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Transaction Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-9 pr-4 text-lg font-bold text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
                  >
                    +₹{q.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Remarks / Purpose (Audit Trail)
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  actionType === "CREDIT"
                    ? "e.g., Bank transfer via UPI / NetBanking"
                    : "e.g., Withdrawal to primary savings account"
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {message && (
              <div
                className={`rounded-xl p-3.5 text-xs flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800/60"
                    : "bg-rose-950/70 text-rose-300 border border-rose-800/60"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
              type="submit"
              className={`w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                actionType === "CREDIT"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500"
                  : "bg-gradient-to-r from-rose-600 to-orange-600 shadow-rose-600/25 hover:from-rose-500 hover:to-orange-500"
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : actionType === "CREDIT" ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Execute ACID Deposit ({formatCurrency(parseFloat(amount) || 0)})</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Execute Row-Locked Withdrawal ({formatCurrency(parseFloat(amount) || 0)})</span>
                </>
              )}
            </motion.button>
          </form>
        </SpotlightCard>
      </div>

      {/* Wallet-Specific Ledger History */}
      <SpotlightCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Wallet #{currentWallet?.wallet_id} Ledger History</h2>
            <p className="text-xs text-slate-400">Immutable transaction logs registered to this digital wallet</p>
          </div>
          <Badge variant="purple">{walletLedger.length} Records</Badge>
        </div>

        {walletLedger.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No transactions recorded for this wallet yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Reference No</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Post-Transaction Balance</th>
                  <th className="pb-3">Remarks</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {walletLedger.map((row) => (
                  <tr key={row.transaction_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-mono text-indigo-400">{row.reference_no}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          row.transaction_type === "WALLET_CREDIT" || row.transaction_type === "LOAN_DISBURSEMENT"
                            ? "success"
                            : "danger"
                        }
                      >
                        {row.transaction_type}
                      </Badge>
                    </td>
                    <td
                      className={`py-3 font-semibold ${
                        row.transaction_type === "WALLET_CREDIT" || row.transaction_type === "LOAN_DISBURSEMENT"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {row.transaction_type === "WALLET_CREDIT" || row.transaction_type === "LOAN_DISBURSEMENT"
                        ? "+"
                        : "-"}
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-3 font-mono text-slate-300">{formatCurrency(row.balance_after_transaction)}</td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">{row.remarks}</td>
                    <td className="py-3 text-slate-400 font-mono">{formatDateTime(row.transaction_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}
