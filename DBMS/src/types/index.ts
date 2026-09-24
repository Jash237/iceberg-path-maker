export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  password_hash?: string;
  address: string;
  aadhaar_number: string;
  created_at: string;
}

export interface Wallet {
  wallet_id: number;
  user_id: number;
  balance: number;
  created_at: string;
  last_updated: string;
}

export interface LoanProduct {
  product_id: number;
  wallet_id?: number | null;
  product_name: string;
  interest_rate: number; // percentage, e.g. 12.00
  tenure_months: number;
  processing_fee: number;
  min_loan_amount: number;
  max_loan_amount: number;
  description?: string;
  created_at?: string;
}

export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'DEFAULTED' | 'PENDING';

export interface LoanAccount {
  loan_account_id: number;
  user_id: number;
  product_id: number;
  principal_amount: number;
  interest_rate: number;
  emi_amount: number;
  total_payable: number;
  outstanding_balance: number;
  loan_status: LoanStatus;
  disbursement_date: string;
  loan_start_date: string;
  loan_end_date: string;
  // Joins
  product_name?: string;
  borrower_name?: string;
}

export type EmiStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID';

export interface EmiSchedule {
  emi_id: number;
  loan_account_id: number;
  installment_number: number;
  due_date: string;
  emi_amount: number;
  principal_component: number;
  interest_component: number;
  amount_paid: number;
  payment_date?: string | null;
  status: EmiStatus;
}

export type TransactionType =
  | 'WALLET_CREDIT'
  | 'WALLET_DEBIT'
  | 'LOAN_DISBURSEMENT'
  | 'EMI_PAYMENT'
  | 'PENALTY'
  | 'REFUND';

export interface TransactionLedger {
  transaction_id: number;
  wallet_id: number;
  loan_account_id?: number | null;
  transaction_type: TransactionType;
  amount: number;
  balance_after_transaction: number;
  reference_no: string;
  transaction_date: string;
  remarks?: string;
  // UI extras
  user_name?: string;
}

export interface AmortizationRow {
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  remainingBalance: number;
}

export interface ConcurrencySimulationResult {
  mode: 'LOCKED_ACID' | 'UNLOCKED_RACE';
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  initialBalance: number;
  expectedFinalBalance: number;
  actualFinalBalance: number;
  discrepancy: number;
  durationMs: number;
  logs: {
    threadId: number;
    timestamp: number;
    action: string;
    status: 'SUCCESS' | 'FAILED' | 'ROLLED_BACK' | 'RACE_DETECTED';
    message: string;
    balanceSnapshot: number;
  }[];
}
