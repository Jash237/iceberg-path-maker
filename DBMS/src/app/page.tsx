"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wallet as WalletIcon,
  CreditCard,
  FileSpreadsheet,
  Cpu,
  Database,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Modal } from "@/components/ui/modal";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { WalletTab } from "@/components/dashboard/wallet-tab";
import { ProductsTab } from "@/components/dashboard/products-tab";
import { LoansTab } from "@/components/dashboard/loans-tab";
import { LedgerTab } from "@/components/dashboard/ledger-tab";
import { ConcurrencyTab } from "@/components/dashboard/concurrency-tab";
import { User, Wallet, LoanProduct, LoanAccount, EmiSchedule, TransactionLedger } from "@/types";
import { formatCurrency } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "wallet", label: "Digital Wallet", icon: WalletIcon },
  { id: "products", label: "Loan Products & Modeler", icon: CreditCard },
  { id: "loans", label: "Active Loans & EMI", icon: FileSpreadsheet },
  { id: "ledger", label: "Transaction Ledger", icon: Database },
  { id: "concurrency", label: "ACID Concurrency Lab", icon: Cpu },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");

  // Core Data State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [emiSchedules, setEmiSchedules] = useState<EmiSchedule[]>([]);
  const [ledger, setLedger] = useState<TransactionLedger[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("5000");
  const [depositRemarks, setDepositRemarks] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // Fetch all state
  async function refreshData() {
    try {
      const [usersRes, productsRes, loansRes, ledgerRes, statsRes] = await Promise.all([
        fetch("/api/users").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/loans").then((r) => r.json()),
        fetch("/api/ledger").then((r) => r.json()),
        fetch("/api/stats").then((r) => r.json()),
      ]);

      if (usersRes.success) {
        setUsers(usersRes.data);
        if (!currentUser && usersRes.data.length > 0) {
          setCurrentUser(usersRes.data[0]);
        }
      }

      if (productsRes.success) setProducts(productsRes.data);
      if (loansRes.success) setLoans(loansRes.data);
      if (ledgerRes.success) setLedger(ledgerRes.data);
      if (statsRes.success) setStats(statsRes.data);

      // Fetch wallet & EMIs for current user
      const targetUserId = currentUser ? currentUser.user_id : (usersRes.data?.[0]?.user_id || 1);
      const [walletRes, ...loanDetailPromises] = await Promise.all([
        fetch(`/api/wallet?userId=${targetUserId}`).then((r) => r.json()),
        ...(loansRes.data || []).map((l: LoanAccount) =>
          fetch(`/api/loans/${l.loan_account_id}`).then((r) => r.json())
        ),
      ]);

      if (walletRes.success) setCurrentWallet(walletRes.data);

      const allEmis: EmiSchedule[] = [];
      for (const res of loanDetailPromises) {
        if (res.success && res.data.emiSchedules) {
          allEmis.push(...res.data.emiSchedules);
        }
      }
      setEmiSchedules(allEmis);
    } catch (err) {
      console.error("Failed to load platform data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, [currentUser?.user_id]);

  async function handleQuickDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setIsDepositing(true);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREDIT",
          userId: currentUser.user_id,
          amount: parseFloat(depositAmount),
          remarks: depositRemarks || "Quick UPI Deposit",
          enableLocking: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsDepositModalOpen(false);
        setDepositRemarks("");
        refreshData();
      }
    } catch (err) {
      console.error("Deposit error:", err);
    } finally {
      setIsDepositing(false);
    }
  }

  async function handleResetDb() {
    if (!confirm("Reset database state to original seed data?")) return;
    try {
      await fetch("/api/reset", { method: "POST" });
      refreshData();
    } catch (err) {
      console.error("Reset error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navigation */}
      <Navbar
        users={users}
        currentUser={currentUser}
        currentWallet={currentWallet}
        onSelectUser={(u) => setCurrentUser(u)}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
        onResetDb={handleResetDb}
        engineStatus={stats?.dbStatus}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Animated Navigation Tabs */}
        <div className="mb-8 flex overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-1.5 rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800 backdrop-blur-xl">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Views */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <OverviewTab
                currentUser={currentUser}
                currentWallet={currentWallet}
                stats={stats}
                loans={loans}
                ledger={ledger}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                onOpenApplyLoan={() => setActiveTab("products")}
              />
            )}

            {activeTab === "wallet" && (
              <WalletTab
                currentUser={currentUser}
                currentWallet={currentWallet}
                ledger={ledger}
                onRefresh={refreshData}
              />
            )}

            {activeTab === "products" && (
              <ProductsTab
                products={products}
                currentUser={currentUser}
                currentWallet={currentWallet}
                onLoanCreated={refreshData}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "loans" && (
              <LoansTab
                loans={loans}
                emiSchedules={emiSchedules}
                currentUser={currentUser}
                currentWallet={currentWallet}
                ledger={ledger}
                onRefresh={refreshData}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
              />
            )}

            {activeTab === "ledger" && <LedgerTab ledger={ledger} />}

            {activeTab === "concurrency" && (
              <ConcurrencyTab
                currentUser={currentUser}
                currentWallet={currentWallet}
                onRefresh={refreshData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quick Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Fund Digital Wallet"
        subtitle={`Instantly credit funds to ${currentUser?.full_name}'s wallet`}
        maxWidth="md"
      >
        <form onSubmit={handleQuickDeposit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deposit Amount (₹ INR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 pl-8 text-base font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[1000, 2500, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDepositAmount(val.toString())}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white"
                >
                  +₹{val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Remarks (Optional)</label>
            <input
              type="text"
              value={depositRemarks}
              onChange={(e) => setDepositRemarks(e.target.value)}
              placeholder="e.g. UPI NetBanking Top-up"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(false)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300"
            >
              Cancel
            </button>
            <button
              disabled={isDepositing}
              type="submit"
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 font-bold text-white shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
            >
              {isDepositing ? "Processing..." : `Deposit ${formatCurrency(parseFloat(depositAmount) || 0)}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Academic Footer */}
      <Footer />
    </div>
  );
}
