# MicroLend OLTP Development Plans & Future Roadmap
*Created for session tracking & next iteration milestones*

---

## 🎯 Current Milestone Completed (v1.0.0)
- [x] Read & parsed DBMS ER Model specification and schema definition.
- [x] Implemented 3NF Relational Schema (`user`, `wallet`, `loan_product`, `loan_account`, `emi_schedule`, `transaction_ledger`) in MySQL DDL.
- [x] Created database seed scripts and node execution utilities (`scripts/init-db.js`, `scripts/seed-db.js`).
- [x] Built complete Next.js 15 App Router architecture with full API endpoints:
  - `/api/users`, `/api/wallet`, `/api/products`, `/api/loans`, `/api/loans/[id]`, `/api/emi/pay`, `/api/loans/payoff`, `/api/ledger`, `/api/concurrency`, `/api/stats`, `/api/reset`.
- [x] Integrated **Lenis Smooth Scroll** provider and custom fluid easing curves.
- [x] Engineered UI with **Aceternity Spotlight Cards**, dynamic interactive charts (Recharts), and micro-interactions with **Framer Motion**.
- [x] Built interactive **ACID Concurrency Simulator Lab** demonstrating `SELECT ... FOR UPDATE` vs Unlocked race condition anomalies.
- [x] Verified full production build with 100% TypeScript compile pass.

---

## 📋 Roadmap for Next Sessions

### 1. Advanced Financial & Banking Capabilities
- [ ] Implement penalty interest calculation for overdue EMIs based on delinquent days.
- [ ] Add support for dynamic custom partial EMI repayments with real-time recalculation of remaining amortization schedules.
- [ ] Generate downloadable PDF loan agreement statements and EMI NOC (No Objection Certificates) using jsPDF / pdfkit.

### 2. Enhanced Authentication & KYC
- [ ] Implement JWT / session-based borrower login and role-based access control (Borrower vs Loan Officer Admin).
- [ ] Add simulated OTP / biometric Aadhaar verification workflow during loan application.

### 3. Analytics & Administrative Dashboard
- [ ] Build a dedicated "Loan Officer / Admin Console" for manual loan underwriting approval / rejection workflows.
- [ ] Add credit risk scoring algorithm based on historical repayment consistency and debt-to-income ratios.
- [ ] Add aggregate portfolio risk analytics (Non-Performing Assets - NPA analysis, expected loss provisions).

### 4. Deployment & Cloud CI/CD
- [ ] Deploy to Vercel with remote MySQL / PostgreSQL database (Neon / PlanetScale / Supabase).
- [ ] Set up automated GitHub Actions workflow for linting, database migrations, and build testing.
