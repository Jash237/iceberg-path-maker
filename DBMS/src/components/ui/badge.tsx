import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "purple" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60",
    warning: "bg-amber-950/70 text-amber-300 border-amber-800/60",
    danger: "bg-rose-950/70 text-rose-300 border-rose-800/60",
    purple: "bg-indigo-950/70 text-indigo-300 border-indigo-800/60",
    outline: "bg-transparent text-slate-400 border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
