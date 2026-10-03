"use client";

import React, { useState } from "react";
import {
  User,
  Shield,
  Moon,
  Sun,
  HardDrive,
  LogOut,
  CheckCircle2,
  Lock,
  CloudCheck,
} from "lucide-react";

/**
 * Halaman Pengaturan & Profil Guru (S6)
 */
export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      setToastMessage("Mode Gelap diaktifkan");
    } else {
      document.documentElement.classList.remove("dark");
      setToastMessage("Mode Terang diaktifkan");
    }
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClearCache = () => {
    setToastMessage("Cache data lokal berhasil dibersihkan");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--status-hadir-fg)] text-white px-4 py-2.5 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Pengaturan
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Profil Guru, Tampilan, dan Manajemen Data Lokal
        </p>
      </header>

      {/* Kartu Profil Guru */}
      <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex items-center gap-4 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] text-[var(--color-on-accent)] flex items-center justify-center font-bold text-xl">
          M
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-base text-[var(--text-primary)] truncate">
            Muhamad Rizky Aprian, S.Kom
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            NIP 19940825 202221 1 004
          </p>
          <p className="text-xs text-[var(--color-accent)] font-medium mt-0.5">
            Guru Mata Pelajaran Informatika · SMP Negeri 3 Cibungbulang
          </p>
        </div>
      </div>

      {/* Bagian: Tampilan & Preferensi */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-[var(--color-accent)]" />
            ) : (
              <Sun className="w-5 h-5 text-[var(--color-accent)]" />
            )}
            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">
                Mode Tampilan
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {isDarkMode ? "Mode Gelap aktif" : "Mode Terang (Kertas Hangat)"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="min-h-[40px] px-3 py-1.5 rounded-[8px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] transition-all"
          >
            Ganti Mode
          </button>
        </div>

        {/* Keamanan & Sandi */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-[var(--text-secondary)]" />
            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">
                Kata Sandi &amp; Akun
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Tersambung via Supabase Auth
              </p>
            </div>
          </div>
          <span className="text-xs text-[var(--status-hadir-fg)] font-semibold">
            Aman
          </span>
        </div>
      </div>

      {/* Bagian: Ketahanan Offline & Penyimpanan */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-[var(--text-secondary)]" />
            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">
                Penyimpanan Lokal (IndexedDB)
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Antrean mutasi offline &amp; cache data kelas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            className="min-h-[40px] px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)] transition-all"
          >
            Bersihkan Cache
          </button>
        </div>
      </div>

      {/* Informasi Privasi Sesuai UU PDP */}
      <div className="p-3.5 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[14px] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
        <Shield className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[var(--text-primary)]">
            Privasi &amp; Perlindungan Data Siswa (UU PDP)
          </p>
          <p className="mt-0.5 leading-relaxed">
            Data kehadiran dan identitas siswa dilindungi secara ketat dengan Row Level Security (RLS). Hanya guru yang berwenang yang dapat membaca dan memperbarui data kelas ini. Tanpa pelacak pihak ketiga.
          </p>
        </div>
      </div>

      {/* Tombol Logout */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            setToastMessage("Sesi akun telah ditutup");
            setTimeout(() => setToastMessage(null), 2500);
          }}
          className="w-full min-h-[44px] rounded-[10px] border border-[var(--status-alpa-fg)]/30 text-[var(--status-alpa-fg)] hover:bg-[var(--status-alpa-bg)]/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun Guru</span>
        </button>
      </div>
    </div>
  );
}
