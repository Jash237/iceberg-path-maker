-- ==============================================================================
-- MicroLend: A Secure OLTP-Based Micro-Lending & EMI Management System
-- Vidyalankar Institute of Technology (AY 2026-27)
-- Authors: Shubham Jadhav (25102B0002), Jash Waghela (25102B0011), Ayush Ubhad (25102B0030)
-- Guide: Prof. Pankaj Vanwari
-- Target RDBMS: MySQL 8.0+ / MariaDB / PostgreSQL Compatible
-- ==============================================================================

-- Drop tables in reverse foreign-key order
DROP TABLE IF EXISTS transaction_ledger;
DROP TABLE IF EXISTS emi_schedule;
DROP TABLE IF EXISTS loan_account;
DROP TABLE IF EXISTS loan_product;
DROP TABLE IF EXISTS wallet;
DROP TABLE IF EXISTS user;

-- 1. USER ENTITY
-- Stores primary borrower and user profile details
CREATE TABLE user (
    user_id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(255) DEFAULT 'Mumbai, Maharashtra, India',
    aadhaar_number VARCHAR(50) DEFAULT '1234-5678-9012',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    INDEX idx_user_email (email),
    INDEX idx_user_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. WALLET ENTITY
-- Holds user digital wallet balance for instant disbursements and EMI repayments
CREATE TABLE wallet (
    wallet_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (wallet_id),
    UNIQUE KEY uq_wallet_user (user_id),
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_wallet_balance_positive CHECK (balance >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. LOAN PRODUCT ENTITY
-- Defines lending plans, rates, tenures, processing fees, and borrow limits
CREATE TABLE loan_product (
    product_id INT NOT NULL AUTO_INCREMENT,
    wallet_id INT NULL,
    product_name VARCHAR(255) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL, -- Annual interest rate percentage (e.g., 12.00%)
    tenure_months INT NOT NULL,           -- Loan duration in months
    processing_fee DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    min_loan_amount DECIMAL(15, 2) NOT NULL DEFAULT 500.00,
    max_loan_amount DECIMAL(15, 2) NOT NULL DEFAULT 100000.00,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id),
    CONSTRAINT fk_product_wallet FOREIGN KEY (wallet_id) REFERENCES wallet(wallet_id) ON DELETE SET NULL,
    INDEX idx_product_rate (interest_rate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LOAN ACCOUNT ENTITY
-- Represents a specific loan contracted between a user and the micro-lending engine
CREATE TABLE loan_account (
    loan_account_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    total_payable DECIMAL(15, 2) NOT NULL,
    outstanding_balance DECIMAL(15, 2) NOT NULL,
    loan_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, DEFAULTED, PENDING
    disbursement_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    loan_start_date DATE NOT NULL,
    loan_end_date DATE NOT NULL,
    PRIMARY KEY (loan_account_id),
    CONSTRAINT fk_loan_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_loan_product FOREIGN KEY (product_id) REFERENCES loan_product(product_id) ON DELETE RESTRICT,
    INDEX idx_loan_user (user_id),
    INDEX idx_loan_status (loan_status),
    INDEX idx_loan_disbursement (disbursement_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. EMI SCHEDULE ENTITY
-- Amortization schedule containing individual installment due dates, principal & interest breakdown
CREATE TABLE emi_schedule (
    emi_id INT NOT NULL AUTO_INCREMENT,
    loan_account_id INT NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    principal_component DECIMAL(15, 2) NOT NULL,
    interest_component DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    payment_date DATETIME NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE, PARTIALLY_PAID
    PRIMARY KEY (emi_id),
    CONSTRAINT fk_emi_loan FOREIGN KEY (loan_account_id) REFERENCES loan_account(loan_account_id) ON DELETE CASCADE,
    INDEX idx_emi_loan (loan_account_id),
    INDEX idx_emi_due_date (due_date),
    INDEX idx_emi_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TRANSACTION LEDGER ENTITY
-- Immutable, append-only financial audit trail for wallets and loan accounts
CREATE TABLE transaction_ledger (
    transaction_id INT NOT NULL AUTO_INCREMENT,
    wallet_id INT NOT NULL,
    loan_account_id INT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- WALLET_CREDIT, WALLET_DEBIT, LOAN_DISBURSEMENT, EMI_PAYMENT, PENALTY, REFUND
    amount DECIMAL(15, 2) NOT NULL,
    balance_after_transaction DECIMAL(15, 2) NOT NULL,
    reference_no VARCHAR(100) NOT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    PRIMARY KEY (transaction_id),
    CONSTRAINT fk_ledger_wallet FOREIGN KEY (wallet_id) REFERENCES wallet(wallet_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ledger_loan FOREIGN KEY (loan_account_id) REFERENCES loan_account(loan_account_id) ON DELETE RESTRICT,
    INDEX idx_ledger_wallet (wallet_id),
    INDEX idx_ledger_loan (loan_account_id),
    INDEX idx_ledger_date (transaction_date),
    INDEX idx_ledger_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
