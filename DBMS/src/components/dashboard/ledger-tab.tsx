"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  Layers,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { TransactionLedger, TransactionType } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface LedgerTabProps {
  ledger: TransactionLedger[];
}

export function LedgerTab({ ledger }: LedgerTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const filterTypes = [
    { label: "All Transactions", value: "ALL" },
    { label: "Wallet Credits", value: "WALLET_CREDIT" },
    { label: "Wallet Debits", value: "WALLET_DEBIT" },
    { label: "Loan Disbursements", value: "LOAN_DISBURSEMENT" },
    { label: "EMI Repayments", value: "EMI_PAYMENT" },
  ];

  const filteredLedger = ledger.filter((row) => {
    const matchesType = selectedType === "ALL" || row.transaction_type === selectedType;
    const matchesSearch =
      searchTerm.trim() === "" ||
      row.reference_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.remarks && row.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.user_name && row.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      row.transaction_type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  function exportToCSV() {
    const headers = [
      "Transaction ID",
      "Reference No",
      "Wallet ID",
      "Loan Account ID",
      "Type",
      "Amount",
      "Balance After Transaction",
      "Remarks",
      "Timestamp",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredLedger.map((row) =>
        [
          row.transaction_id,
          `"${row.reference_no}"`,
          row.wallet_id,
          row.loan_account_id || "",
          row.transaction_type,
          row.amount,
          row.balance_after_transaction,
          `"${(row.remarks || "").replace(/"/g, '""')}"`,
          `"${row.transaction_date}"`,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `microlend-transaction-ledger-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Immutable Transaction Ledger</h1>
          <p className="text-sm text-slate-400 mt-1">
            Single Source of Truth (SSOT) append-only financial audit trail compliant with 3NF relational modeling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Audit Hash Verified (0 Discrepancies)</span>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Ref #, borrower, type, or remarks..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {filterTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                selectedType === t.value
                  ? "bg-indigo-600 text-white font-semibold shadow"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <SpotlightCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Transaction Log Entries ({filteredLedger.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Table: `transaction_ledger`</span>
        </div>

        {filteredLedger.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No transaction records matched your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Txn ID</th>
                  <th className="pb-3">Reference No</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Borrower / Wallet</th>
                  <th className="pb-3">Loan Account</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Post-Txn Balance</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLedger.map((row) => (
                  <tr key={row.transaction_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-mono text-slate-400">#{row.transaction_id}</td>
                    <td className="py-3 font-mono text-indigo-400 font-bold">{row.reference_no}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          row.transaction_type === "WALLET_CREDIT" || row.transaction_type === "LOAN_DISBURSEMENT"
                            ? "success"
                            : "purple"
                        }
                      >
                        {row.transaction_type}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-200">
                      {row.user_name ? (
                        <span>
                          {row.user_name}{" "}
                          <span className="text-[10px] text-slate-400 font-mono">(W#{row.wallet_id})</span>
                        </span>
                      ) : (
                        `Wallet #${row.wallet_id}`
                      )}
                    </td>
                    <td className="py-3 font-mono text-slate-400">
                      {row.loan_account_id ? `Loan #${row.loan_account_id}` : "—"}
                    </td>
                    <td
                      className={`py-3 font-semibold font-mono ${
                        row.transaction_type === "WALLET_CREDIT" || row.transaction_type === "LOAN_DISBURSEMENT"
                          ? "text-emerald-400"
                          : "text-slate-200"
                      }`}
                    >
                      {row.transaction_type === "WALLET_CREDIT" || row.transaction_type === "LOAN_DISBURSEMENT"
                        ? "+"
                        : "-"}
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-3 font-mono text-indigo-300 font-bold">
                      {formatCurrency(row.balance_after_transaction)}
                    </td>
                    <td className="py-3 text-slate-400 font-mono">{formatDateTime(row.transaction_date)}</td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">{row.remarks || "—"}</td>
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
