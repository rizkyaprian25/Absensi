import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

/**
 * Halaman 404 Not Found dengan estetika buku register
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)] text-[var(--text-primary)]">
      <div className="w-full max-w-md bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] p-6 text-center shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--surface-recessed)] text-[var(--text-secondary)] flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Halaman atau sesi absensi yang Anda cari tidak tersedia dalam buku presensi ini.
        </p>
        <Link
          href="/"
          className="w-full min-h-[44px] bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold rounded-[10px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
