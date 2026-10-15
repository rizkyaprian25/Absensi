"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export interface ToastProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

/**
 * Komponen Toast Notifikasi Global
 * Mematuhi tema sistem: Terang (Kartu Putih + Teks Gelap Kontras) & Gelap (Kartu Gelap + Teks Terang Kontras).
 * Mengatasi masalah inkonsistensi kontras dan keterbacaan teks notifikasi.
 */
export function Toast({ message, type = "success", onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onClose}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-xl backdrop-blur-md max-w-[90vw] md:max-w-md animate-in fade-in slide-in-from-top-4 duration-200 transition-all select-none print:hidden cursor-pointer"
    >
      {type === "success" && (
        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-accent)] shrink-0" />
      )}
      {type === "error" && (
        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-[var(--status-alpa-fg)] shrink-0" />
      )}
      {type === "info" && (
        <Info className="w-4 h-4 md:w-5 md:h-5 text-[var(--status-sakit-fg)] shrink-0" />
      )}
      <span className="text-xs md:text-sm font-semibold leading-snug break-words">
        {message}
      </span>
    </div>
  );
}
