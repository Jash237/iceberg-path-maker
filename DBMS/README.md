# MicroLend: A Secure OLTP-Based Micro-Lending & EMI Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-blue?style=flat&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer_Motion-f43f5e?style=flat)](https://motion.dev/)
[![Lenis Scroll](https://img.shields.io/badge/Smooth_Scroll-Lenis-6366f1?style=flat)](https://github.com/darkroomengineering/lenis)
[![ACID Compliant](https://img.shields.io/badge/OLTP-ACID_Compliant-10b981?style=flat)]()

An academic & enterprise-grade Online Transaction Processing (OLTP) micro-financing and EMI management platform engineered with strict relational constraints, 3NF normalization, mathematical decimal precision, and ACID row-level locking guarantees.

---

## 👥 Academic Project Team & Guidance

**Course:** Database Management Systems (DBMS)  
**Institution:** Vidyalankar Institute of Technology (VIT), Mumbai  
**Academic Year:** 2026 – 2027  
**Faculty Guide:** Prof. Pankaj Vanwari  

| Student Name | Roll Number |
| :--- | :--- |
| **Shubham Jadhav** | `25102B0002` |
| **Jash Waghela** | `25102B0011` |
| **Ayush Ubhad** | `25102B0030` |

---

## 🏛️ Core Relational Entities & ER Schema (3NF)

The database schema is strictly designed up to the **3rd Normal Form (3NF)** to eliminate redundancy and update anomalies:

1. **`user`**: Primary borrower entity (`user_id`, `full_name`, `email`, `phone`, `password_hash`, `address`, `aadhaar_number`, `created_at`).
2. **`wallet`**: Digital wallet entity storing liquid borrower funds (`wallet_id`, `user_id`, `balance`, `created_at`, `last_updated`).
3. **`loan_product`**: Catalog of standardized micro-loan tiers (`product_id`, `product_name`, `interest_rate`, `tenure_months`, `processing_fee`, `min_loan_amount`, `max_loan_amount`).
4. **`loan_account`**: Contracted loan account instance (`loan_account_id`, `user_id`, `product_id`, `principal_amount`, `interest_rate`, `emi_amount`, `total_payable`, `outstanding_balance`, `loan_status`, `disbursement_date`, `loan_start_date`, `loan_end_date`).
5. **`emi_schedule`**: Automated installment amortization table (`emi_id`, `loan_account_id`, `installment_number`, `due_date`, `emi_amount`, `principal_component`, `interest_component`, `amount_paid`, `payment_date`, `status`).
6. **`transaction_ledger`**: Append-only, immutable Single Source of Truth (SSOT) audit trail (`transaction_id`, `wallet_id`, `loan_account_id`, `transaction_type`, `amount`, `balance_after_transaction`, `reference_no`, `transaction_date`, `remarks`).

---

## ⚡ Technical Highlights

- **Lenis Buttery-Smooth Scrolling**: Configured through global providers to deliver seamless momentum scrolling.
- **Micro-Interactions & Aceternity UI Motion**: Built using Framer Motion springs, Spotlight cursor effects, and layout animations.
- **Live ACID vs. Race Condition Simulator**: Interactive concurrency stress test executing parallel threads with and without `SELECT ... FOR UPDATE` row locks to prove double-spend prevention.
- **Reducing-Balance Amortization Engine**: Dynamic mathematical modeling with visual stacked breakdown charts.
- **Dual-Mode Engine Architecture**: Connects directly to MySQL 8.0+ connection pools or seamlessly runs with the built-in in-memory OLTP engine with exact ACID semantics.

---

## 🚀 Getting Started

### 1. Installation
```bash
cd dbms
npm install
```

### 2. Configure Environment (Optional MySQL)
Copy `.env.example` to `.env`:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=microlend_db
```

### 3. Initialize & Seed MySQL Database (If MySQL is running)
```bash
npm run db:init
npm run db:seed
```
*(Note: If MySQL is not running, the application automatically runs on its built-in in-memory OLTP engine).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```
