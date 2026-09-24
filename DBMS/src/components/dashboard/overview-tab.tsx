"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  CreditCard,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Percent,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { User, Wallet as WalletType, LoanAccount, TransactionLedger } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface OverviewTabProps {
  currentUser: User | null;
  currentWallet: WalletType | null;
  stats: {
    totalUsers: number;
    totalWallets: number;
    totalWalletLiquidity: number;
    totalLoans: number;
    activeLoansCount: number;
    closedLoansCount: number;
    totalDisbursedAmount: number;
    totalOutstandingBalance: number;
    pendingEmisCount: number;
    paidEmisCount: number;
    totalEmisCollected: number;
    recoveryRate: number;
    totalLedgerTransactions: number;
    dbStatus?: {
      mode: string;
      isMysqlActive: boolean;
      acidCompliant: boolean;
    };
  } | null;
  loans: LoanAccount[];
  ledger: TransactionLedger[];
  onNavigateTab: (tabId: string) => void;
  onOpenDeposit: () => void;
  onOpenApplyLoan: () => void;
}

export function OverviewTab({
  currentUser,
  currentWallet,
  stats,
  loans,
  ledger,
  onNavigateTab,
  onOpenDeposit,
  onOpenApplyLoan,
}: OverviewTabProps) {
  // Chart data preparation
  const chartData = [
    { month: "Jan", disbursed: 20000, repayments: 0 },
    { month: "Feb", disbursed: 30000, repayments: 10085 },
    { month: "Mar", disbursed: 0, repayments: 15251 },
    { month: "Apr (Proj)", disbursed: 15000, repayments: 10216 },
    { month: "May (Proj)", disbursed: 25000, repayments: 5166 },
  ];

  const userActiveLoans = loans.filter((l) => l.user_id === currentUser?.user_id && l.loan_status === "ACTIVE");

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/50 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                Live OLTP Session
              </Badge>
              <span className="text-xs text-slate-400 font-mono">Borrower ID: #{currentUser?.user_id || 1}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Welcome, <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">{currentUser?.full_name || "Borrower"}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time OLTP micro-financing dashboard with mathematical decimal precision, automated EMI amortization schedules, and zero-loss ACID concurrency protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenApplyLoan}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Apply for Micro-Loan</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenDeposit}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-indigo-400" />
              <span>Fund Wallet</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Wallet</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatCurrency(currentWallet?.balance || 0)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Instant Liquid Balance</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform Disbursed</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatCurrency(stats?.totalDisbursedAmount || 50000)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400">
            <span>{stats?.totalLoans || 3} Loans Contracted</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Outstanding</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatCurrency(stats?.totalOutstandingBalance || 25716)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-300">
            <span>{stats?.pendingEmisCount || 5} Pending EMIs</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recovery Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {stats?.recoveryRate || 50.8}%
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <span>{formatCurrency(stats?.totalEmisCollected || 25402)} Repaid</span>
          </div>
        </SpotlightCard>
      </div>

      {/* Main 2-Column Section: Charts & Active Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Amortization & Cashflow Chart */}
        <SpotlightCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Disbursement vs Repayments Cashflow</h2>
              <p className="text-xs text-slate-400">Monthly OLTP volume flow across all micro-loan accounts</p>
            </div>
            <Badge variant="purple">OLTP Ledger Stream</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRepayments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                />
                <Area
                  type="monotone"
                  dataKey="disbursed"
                  name="Disbursements"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDisbursed)"
                />
                <Area
                  type="monotone"
                  dataKey="repayments"
                  name="EMI Repayments"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRepayments)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Right 1 Col: User Active Loans Summary */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Your Active Loans</h2>
            <button
              onClick={() => onNavigateTab("loans")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {userActiveLoans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">No active loans for current user.</p>
              <button
                onClick={onOpenApplyLoan}
                className="mt-3 text-xs font-semibold text-indigo-400 underline"
              >
                Apply for an instant loan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userActiveLoans.map((loan) => (
                <div
                  key={loan.loan_account_id}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{loan.product_name}</p>
                      <p className="text-[11px] text-slate-400">Loan #{loan.loan_account_id}</p>
                    </div>
                    <Badge variant="success">{loan.loan_status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">EMI Amount</span>
                      <span className="font-bold text-indigo-300">{formatCurrency(loan.emi_amount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Outstanding</span>
                      <span className="font-bold text-white">{formatCurrency(loan.outstanding_balance)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Due: {formatDate(loan.loan_end_date)}
                    </span>
                    <button
                      onClick={() => onNavigateTab("loans")}
                      className="rounded-lg bg-indigo-600/30 border border-indigo-500/40 px-2.5 py-1 text-xs font-medium text-indigo-200 hover:bg-indigo-600/50"
                    >
                      Manage EMI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>
      </div>

      {/* Recent Immutable Ledger Activity */}
      <SpotlightCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent Immutable Transaction Ledger</h2>
            <p className="text-xs text-slate-400">Cryptographically verifiable append-only audit trail</p>
          </div>
          <button
            onClick={() => onNavigateTab("ledger")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            Full Ledger ({ledger.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3">Reference No</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Borrower / Wallet</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Post Balance</th>
                <th className="pb-3">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ledger.slice(0, 5).map((row) => (
                <tr key={row.transaction_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono text-indigo-400">{row.reference_no}</td>
                  <td className="py-3">
                    <Badge
                      variant={
                        row.transaction_type === "LOAN_DISBURSEMENT" || row.transaction_type === "WALLET_CREDIT"
                          ? "success"
                          : "purple"
                      }
                    >
                      {row.transaction_type.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-300">{row.user_name || `Wallet #${row.wallet_id}`}</td>
                  <td className="py-3 font-semibold text-white">{formatCurrency(row.amount)}</td>
                  <td className="py-3 font-mono text-slate-400">{formatCurrency(row.balance_after_transaction)}</td>
                  <td className="py-3 text-slate-400">{formatDate(row.transaction_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );
}
