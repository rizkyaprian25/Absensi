"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Global Error Boundary untuk menangani kesalahan rendering secara elegan
 * Mencegah White Screen of Death (SOP §3.3 & §5.8)
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ponytail: Logging error terstruktur di boundary aplikasi
    console.error("[ERROR_BOUNDARY]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)] text-[var(--text-primary)]">
      <div className="w-full max-w-md bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] p-6 text-center shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold mb-2">Terjadi Gangguan</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Aplikasi mengalami kendala saat memuat data. Data absensi lokal Anda tetap aman.
        </p>
        <button
          onClick={() => reset()}
          className="w-full min-h-[44px] bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold rounded-[10px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Muat Ulang Halaman
        </button>
      </div>
    </div>
  );
}
