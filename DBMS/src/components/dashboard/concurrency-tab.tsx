"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  Layers,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Lock,
  Unlock,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { ConcurrencySimulationResult, User, Wallet as WalletType } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ConcurrencyTabProps {
  currentUser: User | null;
  currentWallet: WalletType | null;
  onRefresh: () => void;
}

export function ConcurrencyTab({ currentUser, currentWallet, onRefresh }: ConcurrencyTabProps) {
  const [testMode, setTestMode] = useState<"LOCKED_ACID" | "UNLOCKED_RACE">("LOCKED_ACID");
  const [threadCount, setThreadCount] = useState<number>(6);
  const [amountPerThread, setAmountPerThread] = useState<number>(3000);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ConcurrencySimulationResult | null>(null);

  async function runSimulation() {
    if (!currentUser) return;
    setIsRunning(true);

    try {
      const res = await fetch("/api/concurrency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: testMode,
          totalThreads: threadCount,
          amountPerRequest: amountPerThread,
          userId: currentUser.user_id,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Simulation failed");
      }

      setResult(data.data);
      onRefresh();
    } catch (err: unknown) {
      console.error("Simulation error:", err);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
          OLTP Concurrency & ACID Simulator Lab
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Directly observe and test ACID Isolation guarantees and Row-Level Locking (`SELECT ... FOR UPDATE`) vs. catastrophic Race Conditions and Lost Update anomalies.
        </p>
      </div>

      {/* Control Panel & Mode Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mode Selector */}
        <SpotlightCard className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            1. Select Execution Mode
          </h2>

          <div className="space-y-3">
            <div
              onClick={() => setTestMode("LOCKED_ACID")}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                testMode === "LOCKED_ACID"
                  ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-lg"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Row-Level Locked (ACID)</span>
                </div>
                <Badge variant="success">Safe</Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Uses MySQL `SELECT ... FOR UPDATE` mutex lock. Serializes balance mutations and guarantees zero double-spending or balance discrepancies.
              </p>
            </div>

            <div
              onClick={() => setTestMode("UNLOCKED_RACE")}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                testMode === "UNLOCKED_RACE"
                  ? "border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/50 shadow-lg"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Unlock className="w-4 h-4 text-rose-400" />
                  <span>Unlocked (Race Condition)</span>
                </div>
                <Badge variant="danger">Anomaly</Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Naive concurrent reads and writes without locks. Simulates concurrent threads reading stale values, causing lost updates and financial leakage.
              </p>
            </div>
          </div>
        </SpotlightCard>

        {/* Test Parameters */}
        <SpotlightCard className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            2. Configure Workload
          </h2>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-400">Concurrent Threads:</span>
              <span className="font-bold text-white font-mono">{threadCount} Threads</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={threadCount}
              onChange={(e) => setThreadCount(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>2 Parallel</span>
              <span>12 Parallel</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-400">Deduction / Thread:</span>
              <span className="font-bold text-indigo-400 font-mono">{formatCurrency(amountPerThread)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={10000}
              step={500}
              value={amountPerThread}
              onChange={(e) => setAmountPerThread(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>₹1,000</span>
              <span>₹10,000</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Target Wallet:</span>
              <span className="font-bold text-white">#WLT-{currentWallet?.wallet_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Balance:</span>
              <span className="font-mono font-bold text-emerald-400">{formatCurrency(currentWallet?.balance || 0)}</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Launch Trigger */}
        <SpotlightCard className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              3. Trigger Concurrency Load
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fires {threadCount} simultaneous asynchronous requests against Wallet #{currentWallet?.wallet_id} to test database transaction isolation.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isRunning}
            onClick={runSimulation}
            className={`w-full rounded-2xl py-4 text-sm font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              testMode === "LOCKED_ACID"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500"
                : "bg-gradient-to-r from-rose-600 to-orange-600 shadow-rose-600/25 hover:from-rose-500 hover:to-orange-500"
            }`}
          >
            {isRunning ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Launch {testMode === "LOCKED_ACID" ? "ACID-Locked" : "Unlocked Race"} Test</span>
              </>
            )}
          </motion.button>
        </SpotlightCard>
      </div>

      {/* Simulation Results Section */}
      {result && (
        <SpotlightCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Simulation Execution Analysis</h2>
                <Badge variant={result.mode === "LOCKED_ACID" ? "success" : "danger"}>
                  {result.mode}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Completed {result.totalRequests} parallel threads in {result.durationMs}ms
              </p>
            </div>

            {result.discrepancy > 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-rose-800/60 bg-rose-950/70 px-4 py-2 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>RACE ANOMALY: Discrepancy of {formatCurrency(result.discrepancy)}!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-800/60 bg-emerald-950/70 px-4 py-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% ACID INTEGRITY VERIFIED (0.00 Discrepancy)</span>
              </div>
            )}
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="text-[10px] text-slate-400 block uppercase">Initial Balance</span>
              <span className="text-base font-bold text-white font-mono">{formatCurrency(result.initialBalance)}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="text-[10px] text-slate-400 block uppercase">Successful Deductions</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {result.successfulRequests} / {result.totalRequests}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="text-[10px] text-slate-400 block uppercase">Expected Final Balance</span>
              <span className="text-base font-bold text-slate-300 font-mono">
                {formatCurrency(result.expectedFinalBalance)}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="text-[10px] text-slate-400 block uppercase">Actual Final Balance</span>
              <span
                className={`text-base font-bold font-mono ${
                  result.discrepancy > 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {formatCurrency(result.actualFinalBalance)}
              </span>
            </div>
          </div>

          {/* Detailed Thread Execution Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Thread Execution Timeline & Lock Audit Logs
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs pr-2">
              {result.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start justify-between rounded-xl border p-2.5 ${
                    log.status === "SUCCESS"
                      ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-300"
                      : log.status === "ROLLED_BACK"
                      ? "border-amber-900/50 bg-amber-950/20 text-amber-300"
                      : "border-rose-900/50 bg-rose-950/30 text-rose-300"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">+{log.timestamp}ms</span>
                    <span className="font-bold">[{log.action}]</span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-semibold ml-2">
                    Bal: {formatCurrency(log.balanceSnapshot)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}
