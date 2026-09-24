-- ==============================================================================
-- MicroLend Seed Data
-- ==============================================================================

-- 1. USERS
INSERT INTO user (user_id, full_name, email, phone, password_hash, address, aadhaar_number, created_at) VALUES
(1, 'Jash Waghela', 'jash.waghela@microlend.io', '+91 98765 43210', '$2b$10$e8wJkL8fH9...hash', 'Dadar West, Mumbai, Maharashtra', '4521-8976-1123', '2026-01-10 10:00:00'),
(2, 'Shubham Jadhav', 'shubham.jadhav@microlend.io', '+91 98123 45678', '$2b$10$w9uKl8vJ7...hash', 'Kurla East, Mumbai, Maharashtra', '7845-1234-9988', '2026-01-12 11:30:00'),
(3, 'Ayush Ubhad', 'ayush.ubhad@microlend.io', '+91 97654 32109', '$2b$10$p0iOl8kM6...hash', 'Vidyavihar, Mumbai, Maharashtra', '3321-9988-4455', '2026-01-15 14:15:00'),
(4, 'Priya Sharma', 'priya.sharma@gmail.com', '+91 98234 56789', '$2b$10$m3kLo9iJ2...hash', 'Andheri West, Mumbai, Maharashtra', '8877-6655-4433', '2026-02-01 09:00:00');

-- 2. WALLETS
INSERT INTO wallet (wallet_id, user_id, balance, created_at, last_updated) VALUES
(1, 1, 14250.00, '2026-01-10 10:00:00', '2026-03-01 12:00:00'),
(2, 2, 8500.00, '2026-01-12 11:30:00', '2026-03-01 12:00:00'),
(3, 3, 22000.00, '2026-01-15 14:15:00', '2026-03-01 12:00:00'),
(4, 4, 3400.00, '2026-02-01 09:00:00', '2026-03-01 12:00:00');

-- 3. LOAN PRODUCTS
INSERT INTO loan_product (product_id, wallet_id, product_name, interest_rate, tenure_months, processing_fee, min_loan_amount, max_loan_amount, description, created_at) VALUES
(1, 1, 'Nano Instant Credit (30-Day)', 8.50, 1, 100.00, 1000.00, 15000.00, 'Ultra-short term micro loan designed for emergency expenses and cash-flow smoothing with zero paperwork.', '2026-01-01 00:00:00'),
(2, 1, 'Student Tech & Book Booster', 6.00, 3, 150.00, 5000.00, 30000.00, 'Low-interest education support micro-financing for student devices, semester fees, and project materials.', '2026-01-01 00:00:00'),
(3, 1, 'Merchant Daily Working Capital', 11.25, 6, 250.00, 10000.00, 75000.00, 'Tailored for small street vendors and local merchants needing inventory and seasonal stock capital.', '2026-01-01 00:00:00'),
(4, 1, 'Micro-Enterprise Growth Starter', 13.50, 12, 500.00, 25000.00, 150000.00, 'Comprehensive annual financing package for micro-enterprises scaling operations and equipment.', '2026-01-01 00:00:00');

-- 4. LOAN ACCOUNTS
INSERT INTO loan_account (loan_account_id, user_id, product_id, principal_amount, interest_rate, emi_amount, total_payable, outstanding_balance, loan_status, disbursement_date, loan_start_date, loan_end_date) VALUES
(1, 1, 2, 15000.00, 6.00, 5050.25, 15150.75, 5050.25, 'ACTIVE', '2026-01-15 10:30:00', '2026-01-15', '2026-04-15'),
(2, 2, 1, 5000.00, 8.50, 5035.42, 5035.42, 0.00, 'CLOSED', '2026-01-20 14:00:00', '2026-01-20', '2026-02-20'),
(3, 3, 3, 30000.00, 11.25, 5166.45, 30998.70, 20665.80, 'ACTIVE', '2026-02-01 16:45:00', '2026-02-01', '2026-08-01');

-- 5. EMI SCHEDULES
-- Loan 1 (User 1 - 3 Month Loan, 2 EMIs Paid, 1 Pending)
INSERT INTO emi_schedule (emi_id, loan_account_id, installment_number, due_date, emi_amount, principal_component, interest_component, amount_paid, payment_date, status) VALUES
(1, 1, 1, '2026-02-15', 5050.25, 4975.25, 75.00, 5050.25, '2026-02-14 18:20:00', 'PAID'),
(2, 1, 2, '2026-03-15', 5050.25, 5000.13, 50.12, 5050.25, '2026-03-14 11:05:00', 'PAID'),
(3, 1, 3, '2026-04-15', 5050.25, 5025.13, 25.12, 0.00, NULL, 'PENDING');

-- Loan 2 (User 2 - 1 Month Loan, Paid & Closed)
INSERT INTO emi_schedule (emi_id, loan_account_id, installment_number, due_date, emi_amount, principal_component, interest_component, amount_paid, payment_date, status) VALUES
(4, 2, 1, '2026-02-20', 5035.42, 5000.00, 35.42, 5035.42, '2026-02-19 15:30:00', 'PAID');

-- Loan 3 (User 3 - 6 Month Loan, 2 EMIs Paid, 4 Pending)
INSERT INTO emi_schedule (emi_id, loan_account_id, installment_number, due_date, emi_amount, principal_component, interest_component, amount_paid, payment_date, status) VALUES
(5, 3, 1, '2026-03-01', 5166.45, 4885.20, 281.25, 5166.45, '2026-03-01 09:10:00', 'PAID'),
(6, 3, 2, '2026-04-01', 5166.45, 4931.00, 235.45, 5166.45, '2026-03-25 10:00:00', 'PAID'),
(7, 3, 3, '2026-05-01', 5166.45, 4977.23, 189.22, 0.00, NULL, 'PENDING'),
(8, 3, 4, '2026-06-01', 5166.45, 5023.89, 142.56, 0.00, NULL, 'PENDING'),
(9, 3, 5, '2026-07-01', 5166.45, 5070.99, 95.46, 0.00, NULL, 'PENDING'),
(10, 3, 6, '2026-08-01', 5166.45, 5118.52, 47.93, 0.00, NULL, 'PENDING');

-- 6. TRANSACTION LEDGER
INSERT INTO transaction_ledger (transaction_id, wallet_id, loan_account_id, transaction_type, amount, balance_after_transaction, reference_no, transaction_date, remarks) VALUES
(1, 1, NULL, 'WALLET_CREDIT', 10000.00, 10000.00, 'TXN-INIT-001', '2026-01-10 10:05:00', 'Initial user wallet funding via UPI NetBanking'),
(2, 1, 1, 'LOAN_DISBURSEMENT', 15000.00, 25000.00, 'TXN-DISB-001', '2026-01-15 10:30:00', 'Loan #1 disbursement credited instantly to wallet'),
(3, 1, 1, 'EMI_PAYMENT', 5050.25, 19949.75, 'TXN-EMI-001', '2026-02-14 18:20:00', 'EMI #1 repayment for Student Tech & Book Booster'),
(4, 1, 1, 'EMI_PAYMENT', 5050.25, 14899.50, 'TXN-EMI-002', '2026-03-14 11:05:00', 'EMI #2 repayment for Student Tech & Book Booster'),
(5, 2, 2, 'LOAN_DISBURSEMENT', 5000.00, 5000.00, 'TXN-DISB-002', '2026-01-20 14:00:00', 'Loan #2 Nano Instant Credit disbursement'),
(6, 2, NULL, 'WALLET_CREDIT', 8535.42, 13535.42, 'TXN-CRD-001', '2026-02-10 12:00:00', 'Wallet top-up via UPI'),
(7, 2, 2, 'EMI_PAYMENT', 5035.42, 8500.00, 'TXN-EMI-003', '2026-02-19 15:30:00', 'Full final EMI repayment for Nano Loan #2 (Loan Closed)'),
(8, 3, 3, 'LOAN_DISBURSEMENT', 30000.00, 30000.00, 'TXN-DISB-003', '2026-02-01 16:45:00', 'Working Capital Loan #3 disbursement'),
(9, 3, 3, 'EMI_PAYMENT', 5166.45, 24833.55, 'TXN-EMI-004', '2026-03-01 09:10:00', 'EMI #1 repayment for Merchant Working Capital'),
(10, 3, 3, 'EMI_PAYMENT', 5166.45, 19667.10, 'TXN-EMI-005', '2026-03-25 10:00:00', 'EMI #2 repayment for Merchant Working Capital');
