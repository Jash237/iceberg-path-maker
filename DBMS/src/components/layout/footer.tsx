import { Heart, ShieldCheck, Database, Award, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/60 py-10 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/60">
          {/* Col 1: Project Overview */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>MicroLend OLTP System</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A high-precision Online Transaction Processing (OLTP) micro-lending & EMI management engine built on relational database guarantees (ACID compliance, Row-Level Locking, 3NF Normalization, Immutable Audit Ledger).
            </p>
          </div>

          {/* Col 2: Academic Credits */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Project Team & Guidance</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1 font-mono">
              <li>• <strong className="text-white">Jash Waghela</strong> (Roll: 25102B0011)</li>
              <li>• <strong className="text-white">Shubham Jadhav</strong> (Roll: 25102B0002)</li>
              <li>• <strong className="text-white">Ayush Ubhad</strong> (Roll: 25102B0030)</li>
              <li className="pt-1 text-slate-400 font-sans">
                Under Guidance of: <strong className="text-indigo-300">Prof. Pankaj Vanwari</strong>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Institution */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Academic Context</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Course: <strong className="text-slate-200">Database Management Systems</strong>
              <br />
              Institution: <strong className="text-slate-200">Vidyalankar Institute of Technology (VIT)</strong>
              <br />
              Academic Year: <span className="text-indigo-400 font-semibold">2026 – 2027</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 MicroLend • OLTP Microfinance System. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>MySQL 8.0 / InnoDB • ACID Transactions • Row-Level Locks (`SELECT FOR UPDATE`)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
