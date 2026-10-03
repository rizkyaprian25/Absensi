"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Moon,
  Sun,
  HardDrive,
  LogOut,
  CheckCircle2,
  Lock,
  CalendarDays,
  CalendarOff,
  Plus,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import {
  HolidayItem,
  HolidayCategory,
} from "@/contracts/attendance";
import {
  DEFAULT_HOLIDAYS,
  getStoredHolidays,
  saveStoredHolidays,
  formatIndonesianDate,
  getCategoryLabel,
} from "@/lib/calendarUtils";

/**
 * Halaman Pengaturan, Profil Guru, dan Manajemen Kalender Hari Masuk/Libur
 */
export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State Hari Libur
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<HolidayCategory>("SEKOLAH");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    setHolidays(getStoredHolidays());
  }, []);

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

  // Tambah Hari Libur Baru
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) return;

    const newHolidayItem: HolidayItem = {
      id: `hld-${newDate}-${Date.now()}`,
      date: newDate,
      name: newName.trim(),
      category: newCategory,
      description: newDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [...holidays.filter((h) => h.date !== newDate), newHolidayItem].sort(
      (a, b) => a.date.localeCompare(b.date)
    );
    setHolidays(updated);
    saveStoredHolidays(updated);
    setIsAddModalOpen(false);
    setNewDate("");
    setNewName("");
    setNewDesc("");

    setToastMessage(`Hari libur "${newHolidayItem.name}" (${newHolidayItem.date}) berhasil ditambahkan`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Hapus Hari Libur (Jadikan Hari Masuk)
  const handleDeleteHoliday = (id: string, name: string) => {
    const updated = holidays.filter((h) => h.id !== id);
    setHolidays(updated);
    saveStoredHolidays(updated);

    setToastMessage(`Hari libur "${name}" berhasil dihapus (kini menjadi hari masuk)`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset ke Kalender Pendidikan Bawaan
  const handleResetHolidays = () => {
    setHolidays(DEFAULT_HOLIDAYS);
    saveStoredHolidays(DEFAULT_HOLIDAYS);
    setToastMessage("Daftar hari libur berhasil dipulihkan ke kalender pendidikan standar");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--text-primary)] text-[var(--color-bg)] px-4 py-2.5 rounded-[12px] shadow-xl flex items-center gap-2 text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-4 border border-[var(--border-hairline)] max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-[var(--status-hadir-fg)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Pengaturan
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Profil Guru, Kalender Hari Libur/Masuk, dan Manajemen Data Lokal
        </p>
      </header>

      {/* Kartu Profil Guru */}
      <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex items-center gap-4 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] text-[var(--color-on-accent)] flex items-center justify-center font-bold text-xl shrink-0">
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

      {/* Bagian: Manajemen Hari Masuk & Libur Sekolah */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] p-4 flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[var(--surface-recessed)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm md:text-base text-[var(--text-primary)]">
                Kalender Hari Masuk &amp; Libur Sekolah
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Tentukan hari efektif KBM dan hari libur agar rekap presensi tidak menghitung alpa pada hari libur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResetHolidays}
              title="Reset ke Kalender Pendidikan Standar"
              className="min-h-[38px] px-2.5 py-1.5 rounded-[8px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Default</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setNewDate(new Date().toISOString().split("T")[0]);
                setIsAddModalOpen(true);
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-[8px] bg-[var(--color-accent)] text-[var(--color-on-accent)] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Libur</span>
            </button>
          </div>
        </div>

        {/* Daftar Hari Libur Terdaftar */}
        <div className="flex flex-col divide-y divide-[var(--border-hairline)]">
          {holidays.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] py-4 text-center">
              Tidak ada hari libur kustom. Seluruh hari Senin–Jumat diperlakukan sebagai hari KBM aktif.
            </p>
          ) : (
            holidays.map((h) => (
              <div
                key={h.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--surface-recessed)]/30 px-2 rounded-[8px] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                      {h.date}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[var(--surface-recessed)] text-[var(--text-secondary)] font-semibold font-mono">
                      {getCategoryLabel(h.category)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)] mt-0.5">
                    {h.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {formatIndonesianDate(h.date)}
                    {h.description ? ` · ${h.description}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteHoliday(h.id, h.name)}
                  title="Hapus status libur (Jadikan hari masuk)"
                  className="p-2 rounded-[8px] text-[var(--status-alpa-fg)] hover:bg-[var(--status-alpa-bg)] transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
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
                Penyimpanan Lokal (IndexedDB &amp; LocalStorage)
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Cache data rombel, siswa, kalender, dan antrean mutasi offline
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
            Data kehadiran dan identitas siswa dilindungi secara ketat. Berkas absensi internal hanya dapat dikelola oleh guru bersangkutan. Tanpa pelacak pihak ketiga.
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

      {/* Modal Tambah Hari Libur Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] p-5 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Tambah Hari Libur Baru
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Tentukan tanggal dan keterangan hari libur
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Tanggal Libur
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Keterangan / Nama Kegiatan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Classmeeting, Maulid Nabi, Rapat Guru"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Kategori Libur
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as HolidayCategory)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  <option value="SEKOLAH">Libur / Kegiatan Khusus Sekolah</option>
                  <option value="NASIONAL">Libur Nasional / Tanggal Merah</option>
                  <option value="CUTI_BERSAMA">Cuti Bersama</option>
                  <option value="KHUSUS">Diliburkan Khusus Guru / Rapat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dispensasi KBM dari Dinas Pendidikan"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[40px] px-4 rounded-[10px] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 rounded-[10px] text-xs font-bold bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:opacity-95 shadow-xs"
                >
                  Simpan Hari Libur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
