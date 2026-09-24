"use client";

import { motion } from "framer-motion";
import {
  Wallet as WalletIcon,
  ShieldCheck,
  RotateCcw,
  User as UserIcon,
  ChevronDown,
  Database,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { User, Wallet } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface NavbarProps {
  users: User[];
  currentUser: User | null;
  currentWallet: Wallet | null;
  onSelectUser: (user: User) => void;
  onOpenDeposit: () => void;
  onResetDb: () => void;
  engineStatus?: {
    mode: string;
    isMysqlActive: boolean;
    acidCompliant: boolean;
  };
}

export function Navbar({
  users,
  currentUser,
  currentWallet,
  onSelectUser,
  onOpenDeposit,
  onResetDb,
  engineStatus,
}: NavbarProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & Academic Tag */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  Micro<span className="text-indigo-400">Lend</span>
                </span>
                <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                  OLTP Engine
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-mono">
                VIT DBMS Project • ACID-Compliant
              </p>
            </div>
          </div>

          {/* Right Controls: Engine Status, Wallet Pill, User Switcher, Reset Button */}
          <div className="flex items-center gap-3">
            {/* Engine Status Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs text-slate-300">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px] text-slate-300">
                {engineStatus?.mode.includes("MySQL") ? "MySQL 8.0 (Pool)" : "In-Memory OLTP (ACID)"}
              </span>
            </div>

            {/* Quick Wallet Balance Pill */}
            {currentWallet && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenDeposit}
                className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1.5 text-sm text-indigo-200 hover:bg-indigo-900/40 transition-colors shadow-sm cursor-pointer"
                title="Click to Fund Wallet"
              >
                <WalletIcon className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-wider text-indigo-300/80 block leading-tight font-medium">
                    Wallet
                  </span>
                  <span className="font-bold text-white leading-tight block">
                    {formatCurrency(currentWallet.balance)}
                  </span>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 ml-1 opacity-70" />
              </motion.button>
            )}

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-700 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-bold text-white">
                  {currentUser?.full_name?.charAt(0) || "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-white line-clamp-1">{currentUser?.full_name || "Select User"}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Switch Active Borrower
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {users.map((u) => (
                      <button
                        key={u.user_id}
                        onClick={() => {
                          onSelectUser(u);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                          currentUser?.user_id === u.user_id
                            ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                            : "text-slate-300 hover:bg-slate-800/80"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-white">{u.full_name}</p>
                          <p className="text-[10px] text-slate-400">{u.phone}</p>
                        </div>
                        {currentUser?.user_id === u.user_id && (
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Database Button */}
            <button
              onClick={onResetDb}
              title="Reset state to initial seed data"
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
