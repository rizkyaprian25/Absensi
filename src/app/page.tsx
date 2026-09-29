import React from "react";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Clock, CloudCheck } from "lucide-react";
import { MOCK_CLASSES } from "@/contracts/mocks/attendanceMocks";

/**
 * Halaman Dashboard "Hari Ini" (L2 Stitch)
 * Memuat ringkasan kelas yang perlu diabsen dan yang sudah selesai
 */
export default function TodayDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Dashboard & Status Sinkronisasi */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)] font-medium">
            Selamat pagi, Bu Rina
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--surface-card)] border border-[var(--border-hairline)] text-[var(--status-hadir-fg)] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--status-hadir-fg)] animate-pulse" />
            TERSIMPAN
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Selasa, 29 September
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-medium tracking-wide">
          SEMESTER 1 · 2026/2027
        </p>
      </header>

      {/* Bagian: Perlu Diabsen */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
              Perlu Diabsen
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-recessed)] text-[var(--text-secondary)]">
              2 Kelas
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">Prioritas Pagi</span>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
          {/* Kelas VIII-B */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-[var(--text-primary)]">VIII-B</span>
                <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[var(--surface-recessed)] text-[var(--text-secondary)] font-mono">
                  Ruang 204
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] truncate">
                Matematika Wajib · 34 siswa
              </p>
            </div>
            <Link
              href="/attendance/class-8b-uuid"
              className="min-h-[44px] px-4 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold rounded-[10px] text-sm flex items-center gap-1.5 shrink-0 hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
            >
              <span>Mulai absen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Kelas VIII-D */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-[var(--text-primary)]">VIII-D</span>
                <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[var(--surface-recessed)] text-[var(--text-secondary)] font-mono">
                  Lab Sains
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] truncate">
                IPAS · 32 siswa
              </p>
            </div>
            <Link
              href="/attendance/class-8d-uuid"
              className="min-h-[44px] px-4 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold rounded-[10px] text-sm flex items-center gap-1.5 shrink-0 hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
            >
              <span>Mulai absen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bagian: Sudah Diabsen */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
              Sudah Diabsen
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-recessed)] text-[var(--text-secondary)]">
              1 Kelas Selesai
            </span>
          </div>
          <span className="text-xs text-[var(--status-hadir-fg)] flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terverifikasi
          </span>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] p-4 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[var(--text-primary)]">VIII-A</span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] font-medium">
                  <Check className="w-3 h-3" /> Sudah diabsen
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Wali Kelas · 07.12 WIB · 34 siswa
              </p>
            </div>
            <Link
              href="/attendance/class-8a-uuid"
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
            >
              Rincian <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Deret Tally Mini */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
            <div className="px-2.5 py-1 rounded-[6px] bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] font-mono text-xs font-bold">
              H <span className="text-sm">31</span>
            </div>
            <div className="px-2.5 py-1 rounded-[6px] bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)] font-mono text-xs font-bold">
              S <span className="text-sm">1</span>
            </div>
            <div className="px-2.5 py-1 rounded-[6px] bg-[var(--status-izin-bg)] text-[var(--status-izin-fg)] font-mono text-xs font-bold">
              I <span className="text-sm">1</span>
            </div>
            <div className="px-2.5 py-1 rounded-[6px] bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-mono text-xs font-bold">
              A <span className="text-sm">1</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catatan Berita Acara Presensi */}
      <div className="p-3.5 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[14px] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
        <Clock className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Buku Berita Acara Presensi</p>
          <p>Perekaman presensi harian ditutup otomatis pukul 14.00 WIB sesuai jadwal dinas sekolah.</p>
        </div>
      </div>
    </div>
  );
}
