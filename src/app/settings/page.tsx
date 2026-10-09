"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Download,
  Upload,
  Database,
  ShieldCheck,
  History,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
  FileJson,
  Check,
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
  addOrUpdateSpecialPeriod,
  isRealHoliday,
  isActiveSchoolEvent,
} from "@/lib/calendarUtils";
import {
  AppBackupPayload,
  AutoSnapshotItem,
  DataIntegrityStats,
  getDataIntegrityStats,
  getAutoSnapshots,
  triggerAutoSnapshot,
  downloadBackupFile,
  restoreFromSnapshot,
  deleteSnapshot,
  restoreFromUploadedJson,
} from "@/lib/backupManager";

/**
 * Halaman Pengaturan, Profil Guru, Manajemen Kalender, dan Pusat Keamanan Cadangan Data
 */
export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State Hari Libur & Agenda Khusus
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<HolidayCategory>("SEKOLAH");
  const [newDesc, setNewDesc] = useState("");

  // State Pusat Keamanan & Cadangan Data
  const [integrityStats, setIntegrityStats] = useState<DataIntegrityStats | null>(null);
  const [snapshots, setSnapshots] = useState<AutoSnapshotItem[]>([]);
  const [isSnapshotHistoryExpanded, setIsSnapshotHistoryExpanded] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<AppBackupPayload | null>(null);
  const [pendingRestoreFileName, setPendingRestoreFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshBackupData = () => {
    setIntegrityStats(getDataIntegrityStats());
    setSnapshots(getAutoSnapshots());
  };

  useEffect(() => {
    setHolidays(getStoredHolidays());
    refreshBackupData();

    // Dengarkan perubahan data lokal secara reaktif
    const handleDataChanged = () => {
      refreshBackupData();
    };

    window.addEventListener("absensi-data-changed", handleDataChanged);
    return () => {
      window.removeEventListener("absensi-data-changed", handleDataChanged);
    };
  }, []);

  /**
   * Membuka modal dengan preset agenda pekan khusus (UTS, UAS, Kokurikuler, atau Libur Harian)
   */
  const openAddModalWithPreset = (preset?: "UTS" | "UAS" | "KOKURIKULER" | "SINGLE") => {
    const today = new Date().toISOString().split("T")[0];
    setNewDate(today);
    setEndDate(today);
    if (preset === "UTS") {
      setIsRangeMode(true);
      setNewCategory("UTS");
      setNewName("Minggu Penilaian Tengah Semester (UTS / PTS)");
      setNewDesc("Pekan pelaksanaan tes sumatif tengah semester ganjil");
    } else if (preset === "UAS") {
      setIsRangeMode(true);
      setNewCategory("UAS");
      setNewName("Minggu Penilaian Akhir Semester (UAS / PAS)");
      setNewDesc("Pekan asesmen sumatif akhir semester ganjil");
    } else if (preset === "KOKURIKULER") {
      setIsRangeMode(true);
      setNewCategory("KOKURIKULER");
      setNewName("Minggu Kokurikuler / Projek P5");
      setNewDesc("Kegiatan kokurikuler blok proyek bertema P5");
    } else {
      setIsRangeMode(false);
      setNewCategory("SEKOLAH");
      setNewName("");
      setNewDesc("");
    }
    setIsAddModalOpen(true);
  };

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

  // Unduh Cadangan JSON Lengkap
  const handleDownloadBackup = () => {
    try {
      const result = downloadBackupFile();
      refreshBackupData();
      setToastMessage(`Cadangan ${result.filename} (${(result.sizeBytes / 1024).toFixed(1)} KB) berhasil diunduh`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(`Gagal mengunduh berkas cadangan: ${err?.message || "Kesalahan tidak dikenal"}`);
    }
  };

  // Buat Snapshot Manual
  const handleManualSnapshot = () => {
    try {
      const snap = triggerAutoSnapshot("Snapshot Manual Pengguna");
      if (snap) {
        refreshBackupData();
        setToastMessage("Snapshot pengaman sistem berhasil dibuat");
        setTimeout(() => setToastMessage(null), 2500);
      }
    } catch (err: any) {
      alert(`Gagal membuat snapshot: ${err?.message}`);
    }
  };

  // Buka dialog pemilihan berkas
  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Pemilihan Berkas JSON untuk Pemulihan
  const handleFileSelectedForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as AppBackupPayload;

        if (!parsed || typeof parsed !== "object" || !parsed.data) {
          alert("Format berkas tidak valid: Berkas bukan arsip cadangan Buku Presensi.");
          return;
        }

        if (parsed.version !== 2 && parsed.version !== 1) {
          alert(`Versi cadangan (${parsed.version}) tidak didukung oleh sistem ini.`);
          return;
        }

        setPendingRestoreData(parsed);
        setPendingRestoreFileName(file.name);
        setIsRestoreModalOpen(true);
      } catch (err: any) {
        alert(`Gagal membaca berkas JSON: ${err?.message || "Berkas korup atau rusak"}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Konfirmasi Terapkan Pemulihan Berkas JSON
  const handleConfirmRestore = () => {
    if (!pendingRestoreData) return;

    const result = restoreFromUploadedJson(JSON.stringify(pendingRestoreData));
    if (result.success) {
      setHolidays(getStoredHolidays());
      refreshBackupData();
      setIsRestoreModalOpen(false);
      setPendingRestoreData(null);
      setToastMessage("Data berhasil dipulihkan secara utuh!");
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      alert(`Gagal memulihkan data: ${result.message}`);
    }
  };

  // Pulihkan dari Snapshot Tertentu
  const handleRestoreFromSnapshot = (snapshotId: string, triggerLabel: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin memulihkan sistem ke titik snapshot:\n"${triggerLabel}"?\n\nSistem akan otomatis mencadangkan data saat ini terlebih dahulu untuk keamanan.`
    );
    if (!confirmed) return;

    const success = restoreFromSnapshot(snapshotId);
    if (success) {
      setHolidays(getStoredHolidays());
      refreshBackupData();
      setToastMessage("Sistem berhasil dipulihkan ke titik snapshot terpilih!");
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      alert("Gagal memulihkan snapshot.");
    }
  };

  // Hapus Satu Snapshot dari Riwayat
  const handleDeleteSnapshot = (snapshotId: string) => {
    const confirmed = window.confirm("Hapus arsip snapshot ini dari riwayat lokal?");
    if (!confirmed) return;

    deleteSnapshot(snapshotId);
    refreshBackupData();
    setToastMessage("Snapshot berhasil dihapus dari riwayat");
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Pembersihan Cache dengan Konfirmasi & Safety Snapshot
  const handleClearCache = () => {
    const confirmed = window.confirm(
      "PERHATIAN: Tindakan ini akan mengosongkan cache presensi dan nilai di peramban ini.\n\nSistem akan otomatis mengamankan 1 snapshot darurat sebelum dibersihkan.\n\nPastikan Anda sudah mengunduh cadangan berkas (.json) jika ingin menyimpan data secara permanen di komputer. Lanjutkan?"
    );
    if (!confirmed) return;

    triggerAutoSnapshot("Sebelum Pengosongan Cache");
    localStorage.removeItem("absensi_sessions_v1");
    localStorage.removeItem("absensi_records_v1");
    localStorage.removeItem("absensi_assessments_v1");
    localStorage.removeItem("absensi_scores_v1");
    setHolidays(getStoredHolidays());
    refreshBackupData();
    setToastMessage("Cache dibersihkan. Snapshot darurat telah disimpan.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tambah Hari Libur atau Pekan Agenda Baru
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) return;

    if (isRangeMode && endDate) {
      if (endDate < newDate) {
        alert("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
        return;
      }
      const updated = addOrUpdateSpecialPeriod(newDate, endDate, newName.trim(), newCategory, newDesc.trim());
      setHolidays(updated);
      setIsAddModalOpen(false);
      setNewDate("");
      setEndDate("");
      setNewName("");
      setNewDesc("");
      setIsRangeMode(false);
      setToastMessage(`Agenda "${newName.trim()}" (${newDate} s/d ${endDate}) berhasil ditambahkan`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

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
    setEndDate("");
    setNewName("");
    setNewDesc("");

    setToastMessage(`Hari libur / agenda "${newHolidayItem.name}" (${newHolidayItem.date}) berhasil ditambahkan`);
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
                Kalender Akademik: Hari Libur &amp; Pekan Kegiatan Khusus
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Atur hari libur murni (siswa bebas absen) dan pekan kegiatan khusus seperti UTS, UAS, dan Kokurikuler/P5. Catatan: Pada pekan UTS, UAS, dan Kokurikuler, sekolah tetap masuk dan presensi tetap wajib diambil.
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
              onClick={() => openAddModalWithPreset("SINGLE")}
              className="min-h-[38px] px-3 py-1.5 rounded-[8px] bg-[var(--color-accent)] text-[var(--color-on-accent)] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Libur</span>
            </button>
          </div>
        </div>

        {/* Tombol Pintas Penentuan Jadwal Pekan Khusus (Manual oleh Guru) */}
        <div className="flex items-center gap-2 flex-wrap p-2.5 bg-[var(--surface-recessed)]/60 rounded-[10px] border border-[var(--border-hairline)] text-xs">
          <span className="font-semibold text-[var(--text-secondary)] text-[11px] shrink-0">
            Atur Manual Jadwal Pekan:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => openAddModalWithPreset("UTS")}
              className="px-2.5 py-1 rounded-[6px] bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-semibold hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              + Pekan UTS
            </button>
            <button
              type="button"
              onClick={() => openAddModalWithPreset("UAS")}
              className="px-2.5 py-1 rounded-[6px] bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 font-semibold hover:bg-rose-200 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              + Pekan UAS
            </button>
            <button
              type="button"
              onClick={() => openAddModalWithPreset("KOKURIKULER")}
              className="px-2.5 py-1 rounded-[6px] bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-semibold hover:bg-teal-200 dark:hover:bg-teal-900 border border-teal-300 dark:border-teal-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              + Pekan Kokurikuler (P5)
            </button>
          </div>
        </div>

        {/* Daftar Hari Libur & Pekan Khusus Terdaftar */}
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
                    <span className={`text-[10px] px-2 py-0.5 rounded-[4px] font-semibold font-mono ${
                      h.category === "UTS"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                        : h.category === "UAS"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : h.category === "KOKURIKULER"
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)]"
                    }`}>
                      {getCategoryLabel(h.category)}
                    </span>
                    {isActiveSchoolEvent(h.category) ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-[3px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold font-mono">
                        TETAP MASUK &amp; ABSEN
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-[3px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold font-mono">
                        LIBUR (BEBAS ABSEN)
                      </span>
                    )}
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
                  title="Hapus status ini dari kalender"
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

      {/* Bagian: Pusat Keamanan & Cadangan Data Otomatis (Disaster Recovery & Multi-tier Vault) */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] overflow-hidden shadow-xs">
        {/* Header Seksi Cadangan */}
        <div className="p-4 border-b border-[var(--border-hairline)] bg-[var(--surface-card)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Pusat Keamanan &amp; Cadangan Data
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Proteksi Aktif
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Multi-tier Vault (LocalStorage + IndexedDB), rolling snapshot otomatis, &amp; ekspor JSON
              </p>
            </div>
          </div>

          {/* Tombol Aksi Cepat Cadangan */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleManualSnapshot}
              title="Buat satu titik pemulihan baru di riwayat lokal"
              className="min-h-[40px] px-3 py-1.5 rounded-[10px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ambil Snapshot</span>
            </button>

            {/* Input Berkas JSON Tersembunyi */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelectedForRestore}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleTriggerFileInput}
              title="Pulihkan seluruh data dari berkas .json eksternal"
              className="min-h-[40px] px-3 py-1.5 rounded-[10px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pulihkan (.json)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBackup}
              title="Unduh seluruh data presensi, nilai, dan kalender ke komputer"
              className="min-h-[40px] px-3.5 py-1.5 rounded-[10px] bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-on-accent)] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Cadangan (.json)</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Status Proteksi Data */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--surface-recessed)]/50 border-b border-[var(--border-hairline)] text-xs">
          <div className="p-3 rounded-[12px] bg-[var(--surface-card)] border border-[var(--border-hairline)]">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold mb-1">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Dual-Write Vault</span>
            </div>
            <p className="text-[var(--text-primary)] font-bold text-sm">
              LocalStorage + IndexedDB
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Kebal pembersihan cookie / cache browser
            </p>
          </div>

          <div className="p-3 rounded-[12px] bg-[var(--surface-card)] border border-[var(--border-hairline)]">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold mb-1">
              <History className="w-4 h-4 text-blue-500" />
              <span>Auto-Snapshot Berkala</span>
            </div>
            <p className="text-[var(--text-primary)] font-bold text-sm">
              Tiap Simpan &amp; Tiap 15 Menit
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Tersedia {integrityStats?.totalSnapshots ?? 0} titik rollback lokal
            </p>
          </div>

          <div className="p-3 rounded-[12px] bg-[var(--surface-card)] border border-[var(--border-hairline)]">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold mb-1">
              <FileJson className="w-4 h-4 text-amber-500" />
              <span>Cadangan Terakhir</span>
            </div>
            <p className="text-[var(--text-primary)] font-bold text-sm truncate">
              {integrityStats?.lastBackupTimestamp
                ? new Date(integrityStats.lastBackupTimestamp).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Belum pernah diekspor"}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Disarankan unduh berkala ke komputer
            </p>
          </div>
        </div>

        {/* Counter Ringkasan Data yang Diamankan */}
        <div className="p-4 border-b border-[var(--border-hairline)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
            Inventaris Data Tersimpan &amp; Terlindungi:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)]">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {integrityStats?.totalSessions ?? 0}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">Sesi Presensi</p>
            </div>
            <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)]">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {integrityStats?.totalRecords ?? 0}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">Rekaman Absen</p>
            </div>
            <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)]">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {integrityStats?.totalAssessments ?? 0}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">Asesmen Nilai</p>
            </div>
            <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)]">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {integrityStats?.totalScores ?? 0}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">Butir Nilai Siswa</p>
            </div>
            <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] col-span-2 sm:col-span-1">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {integrityStats?.totalHolidays ?? 0}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">Agenda Kalender</p>
            </div>
          </div>
        </div>

        {/* Accordion: Riwayat Snapshot Otomatis Lokal */}
        <div className="divide-y divide-[var(--border-hairline)]">
          <button
            type="button"
            onClick={() => setIsSnapshotHistoryExpanded(!isSnapshotHistoryExpanded)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[var(--surface-recessed)] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Riwayat Snapshot Otomatis ({snapshots.length} Arsip Tersimpan)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span>{isSnapshotHistoryExpanded ? "Tutup" : "Lihat Riwayat"}</span>
              {isSnapshotHistoryExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {isSnapshotHistoryExpanded && (
            <div className="p-3.5 bg-[var(--surface-recessed)]/40 flex flex-col gap-2">
              {snapshots.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] text-center py-4">
                  Belum ada rekaman snapshot. Snapshot akan otomatis terisi saat Anda menyimpan absensi atau nilai.
                </p>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-3 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">
                          {snap.trigger}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-recessed)] text-[var(--text-secondary)] font-mono">
                          {new Date(snap.timestamp).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "medium",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        {snap.payload.stats.totalSessions} Sesi · {snap.payload.stats.totalRecords} Rekaman Absen · {snap.payload.stats.totalAssessments} Asesmen · {snap.payload.stats.totalScores} Nilai Siswa
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleRestoreFromSnapshot(snap.id, snap.trigger)}
                        title="Kembalikan kondisi data ke titik snapshot ini"
                        className="px-2.5 py-1.5 rounded-[8px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold hover:opacity-90 flex items-center gap-1 transition-opacity text-[11px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        title="Hapus snapshot ini dari memori"
                        className="p-1.5 rounded-[8px] text-[var(--status-alpa-fg)] hover:bg-[var(--status-alpa-bg)] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Opsi Pengosongan Cache dengan Pengaman */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-xs text-[var(--text-primary)]">
                Pengosongan Ruang Cache
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Gunakan jika ingin membersihkan peramban (snapshot pengaman akan dibuat otomatis)
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="min-h-[36px] px-3 py-1 rounded-[8px] text-xs font-semibold text-[var(--status-alpa-fg)] hover:bg-[var(--status-alpa-bg)]/40 transition-colors"
            >
              Bersihkan Cache
            </button>
          </div>
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
              {/* Template Cepat */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Template Cepat:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRangeMode(true);
                    setNewCategory("UTS");
                    setNewName("Minggu Penilaian Tengah Semester (UTS / PTS)");
                    setNewDesc("Pekan pelaksanaan tes sumatif tengah semester ganjil");
                  }}
                  className="px-2 py-0.5 rounded-[5px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[11px] font-bold hover:opacity-90"
                >
                  UTS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRangeMode(true);
                    setNewCategory("UAS");
                    setNewName("Minggu Penilaian Akhir Semester (UAS / PAS)");
                    setNewDesc("Pekan asesmen sumatif akhir semester ganjil");
                  }}
                  className="px-2 py-0.5 rounded-[5px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold hover:opacity-90"
                >
                  UAS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRangeMode(true);
                    setNewCategory("KOKURIKULER");
                    setNewName("Minggu Kokurikuler / Projek P5");
                    setNewDesc("Kegiatan kokurikuler blok proyek bertema P5");
                  }}
                  className="px-2 py-0.5 rounded-[5px] bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[11px] font-bold hover:opacity-90"
                >
                  Kokurikuler (P5)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRangeMode(false);
                    setNewCategory("SEKOLAH");
                    setNewName("");
                    setNewDesc("");
                  }}
                  className="px-2 py-0.5 rounded-[5px] bg-[var(--surface-recessed)] text-[var(--text-secondary)] text-[11px] font-medium hover:text-[var(--text-primary)]"
                >
                  Reset
                </button>
              </div>

              {/* Pilihan Mode: 1 Hari atau Rentang Pekan (Minggu UTS, UAS, Kokurikuler) */}
              <div className="flex items-center gap-2 p-2 bg-[var(--surface-recessed)] rounded-[10px]">
                <input
                  type="checkbox"
                  id="rangeModeToggle"
                  checked={isRangeMode}
                  onChange={(e) => setIsRangeMode(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
                />
                <label htmlFor="rangeModeToggle" className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                  Tandai Rentang Pekan Penuh (Misal: 1 Minggu UTS / UAS / Kokurikuler)
                </label>
              </div>

              <div className={isRangeMode ? "grid grid-cols-2 gap-2" : ""}>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    {isRangeMode ? "Tanggal Mulai (Senin)" : "Tanggal Libur / Agenda"}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono"
                  />
                </div>

                {isRangeMode && (
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Tanggal Selesai (Jumat)
                    </label>
                    <input
                      type="date"
                      required={isRangeMode}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Keterangan / Nama Kegiatan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Minggu Penilaian Tengah Semester (UTS), Pekan P5"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Kategori Agenda / Status Hari
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as HolidayCategory)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
                >
                  <optgroup label="Pekan Khusus (Sekolah Masuk &amp; Tetap Ada Presensi)">
                    <option value="UTS">Minggu / Pekan UTS (Penilaian Tengah Semester)</option>
                    <option value="UAS">Minggu / Pekan UAS (Penilaian Akhir Semester)</option>
                    <option value="KOKURIKULER">Minggu Kokurikuler / Projek P5 / Classmeeting</option>
                  </optgroup>
                  <optgroup label="Hari Libur (Siswa Bebas Presensi / di Rumah)">
                    <option value="SEKOLAH">Libur / Kegiatan Khusus Sekolah</option>
                    <option value="KHUSUS">Diliburkan Khusus Guru / Rapat</option>
                    <option value="NASIONAL">Libur Nasional / Tanggal Merah</option>
                    <option value="CUTI_BERSAMA">Cuti Bersama</option>
                  </optgroup>
                </select>
              </div>

              {/* Notifikasi Penjelasan Sifat Hari */}
              {isActiveSchoolEvent(newCategory) ? (
                <div className="p-2.5 rounded-[10px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pekan {newCategory}:</strong> Bukan hari libur! Siswa tetap masuk dan absensi tetap wajib direkam ke jurnal kelas.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                  <CalendarOff className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hari Libur:</strong> Siswa libur di rumah dan tidak dihitung alpa pada rekap bulanan.
                  </span>
                </div>
              )}

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
                  {isActiveSchoolEvent(newCategory) ? "Simpan Jadwal Pekan" : "Simpan Hari Libur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pemulihan Cadangan Data (.json) */}
      {isRestoreModalOpen && pendingRestoreData && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[18px] p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Konfirmasi Pemulihan Data
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] truncate max-w-[240px]">
                    Berkas: {pendingRestoreFileName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setPendingRestoreData(null);
                }}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rincian Konten Berkas Cadangan */}
            <div className="p-3.5 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[12px] flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-hairline)]">
                <span className="text-[var(--text-secondary)]">Waktu Pencadangan:</span>
                <span className="font-semibold text-[var(--text-primary)] font-mono">
                  {new Date(pendingRestoreData.exportedAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Sesi Presensi:</span>
                  <span className="font-bold text-[var(--text-primary)]">{pendingRestoreData.stats.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Rekaman Absen:</span>
                  <span className="font-bold text-[var(--text-primary)]">{pendingRestoreData.stats.totalRecords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Asesmen Nilai:</span>
                  <span className="font-bold text-[var(--text-primary)]">{pendingRestoreData.stats.totalAssessments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Butir Nilai Siswa:</span>
                  <span className="font-bold text-[var(--text-primary)]">{pendingRestoreData.stats.totalScores}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-[var(--text-secondary)]">Agenda Kalender:</span>
                  <span className="font-bold text-[var(--text-primary)]">{pendingRestoreData.stats.totalHolidays}</span>
                </div>
              </div>
            </div>

            {/* Catatan Jaminan Keamanan */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-[12px] text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Jaminan Tanpa Risiko Kehilangan:</strong> Sistem secara otomatis membuat satu snapshot cadangan dari data Anda saat ini sebelum ditimpa. Anda selalu dapat melakukan <em>rollback</em> kapan saja.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setPendingRestoreData(null);
                }}
                className="min-h-[40px] px-4 rounded-[10px] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="min-h-[40px] px-4 rounded-[10px] text-xs font-bold bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:opacity-95 shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Konfirmasi Pulihkan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
