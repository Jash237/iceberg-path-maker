import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AmortizationRow } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return String(dateStr);
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * Standard EMI Calculation Formula:
 * E = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 * where P = principal, r = monthly interest rate (annual / 12 / 100), n = months
 */
export function calculateEMI(principal: number, annualInterestRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) {
    return Math.round((principal / tenureMonths) * 100) / 100;
  }

  const monthlyRate = annualInterestRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi * 100) / 100;
}

/**
 * Generates an accurate Reducing-Balance Amortization Schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  startDateStr?: string
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const emi = calculateEMI(principal, annualInterestRate, tenureMonths);
  const monthlyRate = annualInterestRate / (12 * 100);

  let currentBalance = principal;
  const baseDate = startDateStr ? new Date(startDateStr) : new Date();

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const interestComponent = Math.round(currentBalance * monthlyRate * 100) / 100;
    let principalComponent = Math.round((emi - interestComponent) * 100) / 100;

    // Handle last installment edge case to ensure exact balance 0
    if (i === tenureMonths || principalComponent > currentBalance) {
      principalComponent = currentBalance;
    }

    currentBalance = Math.max(0, Math.round((currentBalance - principalComponent) * 100) / 100);

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split("T")[0],
      emiAmount: Math.round((principalComponent + interestComponent) * 100) / 100,
      principalComponent,
      interestComponent,
      remainingBalance: currentBalance,
    });
  }

  return schedule;
}

// Animation constants from sexy-ui-motion
export const EASINGS = {
  snappy: [0.16, 1, 0.3, 1],
  smooth: [0.25, 1, 0.5, 1],
  emphasized: [0.4, 0.0, 0.2, 1],
  bouncy: [0.34, 1.56, 0.64, 1],
} as const;

export const SPRINGS = {
  snappy: { type: "spring", stiffness: 400, damping: 25 },
  damping: { type: "spring", stiffness: 100, damping: 30, restDelta: 0.001 },
  bouncy: { type: "spring", stiffness: 300, damping: 15 },
  gentle: { type: "spring", stiffness: 180, damping: 24 },
} as const;
