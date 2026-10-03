"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Calendar,
  CalendarOff,
  BarChart3,
  Check,
  Search,
  History,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  MOCK_CLASSES,
  getStudentsForClass,
} from "@/contracts/mocks/attendanceMocks";
import { Student, HolidayItem, HolidayCategory } from "@/contracts/attendance";
import {
  generatePastTeachingDates,
  PastTeachingDateInfo,
  SEMESTER_START_DATE,
} from "@/lib/attendanceStorage";
import {
  formatIndonesianDate,
  getStoredHolidays,
  addOrUpdateHoliday,
  removeHolidayByDate,
  getCategoryLabel,
} from "@/lib/calendarUtils";

interface CsvPreviewItem {
  row: number;
  nis: string;
  nama: string;
  jk: "L" | "P" | "-";
  isValid: boolean;
  error?: string;
}

/**
 * Halaman Detail Kelas & Impor Siswa CSV (L6 & L7 Stitch)
 */
export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;
  const currentClass =
    MOCK_CLASSES.find((c) => c.id === classId) ?? MOCK_CLASSES[0];

  const [activeTab, setActiveTab] = useState<"siswa" | "riwayat" | "rekap">("siswa");
  const [students, setStudents] = useState<Student[]>(() => getStudentsForClass(classId));
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal Impor CSV
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvStep, setCsvStep] = useState<1 | 2>(1);
  const [csvPreview, setCsvPreview] = useState<CsvPreviewItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tanggal hari ini ISO
  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // State tanggal bebas untuk presensi susulan / jam pengganti
  const [customBackfillDate, setCustomBackfillDate] = useState(todayIso);

  // State hari libur dan daftar seluruh pertemuan KBM lampau sejak 13 Juli 2026
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [pastTeachingDates, setPastTeachingDates] = useState<PastTeachingDateInfo[]>([]);

  useEffect(() => {
    const loadedHolidays = getStoredHolidays();
    setHolidays(loadedHolidays);
    if (currentClass.scheduleDay) {
      const dates = generatePastTeachingDates(
        currentClass.scheduleDay,
        currentClass.id,
        SEMESTER_START_DATE,
        new Date(),
        loadedHolidays
      );
      setPastTeachingDates(dates);
    }
  }, [currentClass.scheduleDay, currentClass.id]);

  // State Modal Kustomisasi Libur di Tab Riwayat
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [targetHolidayDate, setTargetHolidayDate] = useState("");
  const [holidayNameInput, setHolidayNameInput] = useState("");
  const [holidayCategoryInput, setHolidayCategoryInput] = useState<HolidayCategory>("SEKOLAH");
  const [holidayDescInput, setHolidayDescInput] = useState("");

  const refreshTeachingDates = (currentHolidays: HolidayItem[]) => {
    if (currentClass.scheduleDay) {
      const dates = generatePastTeachingDates(
        currentClass.scheduleDay,
        currentClass.id,
        SEMESTER_START_DATE,
        new Date(),
        currentHolidays
      );
      setPastTeachingDates(dates);
    }
  };

  const handleOpenHolidayModal = (dateStr: string) => {
    setTargetHolidayDate(dateStr);
    setHolidayNameInput("Kegiatan / Libur Khusus Sekolah");
    setHolidayCategoryInput("SEKOLAH");
    setHolidayDescInput("");
    setIsHolidayModalOpen(true);
  };

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayNameInput.trim() || !targetHolidayDate) return;

    const updated = addOrUpdateHoliday(
      targetHolidayDate,
      holidayNameInput.trim(),
      holidayCategoryInput,
      holidayDescInput.trim() || undefined
    );
    setHolidays(updated);
    refreshTeachingDates(updated);
    setIsHolidayModalOpen(false);

    setToastMessage(
      `Pertemuan tanggal ${formatIndonesianDate(targetHolidayDate)} berhasil ditandai sebagai Hari Libur: "${holidayNameInput.trim()}"`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemoveHoliday = (dateStr: string) => {
    const updated = removeHolidayByDate(dateStr);
    setHolidays(updated);
    refreshTeachingDates(updated);

    setToastMessage(
      `Status libur tanggal ${formatIndonesianDate(dateStr)} dibatalkan. Pertemuan kembali menjadi KBM aktif.`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const unfilledCount = useMemo(() => {
    return pastTeachingDates.filter((d) => !d.isFilled && !d.isHoliday).length;
  }, [pastTeachingDates]);

  // Filter siswa
  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis && s.nis.includes(searchQuery))
  );

  // Unduh Templat CSV Contoh (PRD §5 FR-3)
  const handleDownloadTemplate = () => {
    const templateContent =
      "\uFEFFnis,nama,jk\r\n260835,Ahmad Fauzan Pratama,L\r\n260836,Citra Kirana Dewi,P\r\n260837,Danu Wijaya,L\r\n";
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "templat-impor-siswa.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simulasi parsing berkas CSV dengan pratinjau validasi per baris (L7 Stitch)
  const handleSimulateUpload = () => {
    const mockParsed: CsvPreviewItem[] = [
      { row: 1, nis: "260835", nama: "Ahmad Fauzan Pratama", jk: "L", isValid: true },
      { row: 2, nis: "260836", nama: "Citra Kirana Dewi", jk: "P", isValid: true },
      { row: 3, nis: "260837", nama: "Danu Wijaya", jk: "L", isValid: true },
      { row: 4, nis: "260801", nama: "Eka Saputra", jk: "L", isValid: false, error: "NIS 260801 sudah dipakai di kelas ini" },
      { row: 5, nis: "260838", nama: "", jk: "P", isValid: false, error: "Nama siswa tidak boleh kosong" },
    ];
    setCsvPreview(mockParsed);
    setCsvStep(2);
  };

  // Konfirmasi Impor Baris yang Valid
  const handleCommitImport = () => {
    const validRows = csvPreview.filter((item) => item.isValid);
    const newStudents: Student[] = validRows.map((item) => ({
      id: `std-imported-${Date.now()}-${item.row}`,
      classId: currentClass.id,
      nis: item.nis,
      fullName: item.nama,
      gender: item.jk === "-" ? null : item.jk,
      isActive: true,
      createdAt: new Date().toISOString(),
    }));

    setStudents((prev) => [...prev, ...newStudents]);
    setIsCsvModalOpen(false);
    setCsvStep(1);
    setCsvPreview([]);
    setToastMessage(`Berhasil mengimpor ${validRows.length} siswa ke kelas ${currentClass.name}`);
    setTimeout(() => setToastMessage(null), 3000);
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

      {/* Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px] py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Daftar Kelas</span>
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-[6px] bg-[var(--surface-recessed)] text-[var(--text-secondary)] font-mono">
          {currentClass.academicYear}
        </span>
      </div>

      {/* Judul & Detail Kelas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Kelas {currentClass.name}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Informatika · {currentClass.scheduleDay ?? "KBM"}, {currentClass.schedulePeriod ?? "Jam Ke 1–3"} ({currentClass.scheduleTime ?? "Sesuai Jadwal"} WIB) · {students.length} Siswa
          </p>
        </div>

        {/* Tombol Impor & Tambah Siswa */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsCsvModalOpen(true);
              setCsvStep(1);
            }}
            className="min-h-[44px] px-3.5 py-2 bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] font-semibold rounded-[10px] text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Impor CSV</span>
          </button>

          <Link
            href={`/attendance/${currentClass.id}`}
            className="min-h-[44px] px-3.5 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold rounded-[10px] text-xs flex items-center gap-1.5 hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Mulai Absen</span>
          </Link>
        </div>
      </div>

      {/* Segmented Top Tabs: Siswa | Riwayat | Rekap (L6 Stitch) */}
      <div className="p-1 bg-[var(--surface-recessed)] rounded-[12px] flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("siswa")}
          className={`flex-1 min-h-[38px] rounded-[9px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "siswa"
              ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Siswa ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("riwayat")}
          className={`flex-1 min-h-[38px] rounded-[9px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "riwayat"
              ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Riwayat &amp; Susulan</span>
          {unfilledCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {unfilledCount}
            </span>
          )}
        </button>

        <Link
          href="/reports"
          className="flex-1 min-h-[38px] rounded-[9px] text-xs font-semibold flex items-center justify-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Rekap Bulanan</span>
        </Link>
      </div>

      {/* Konten Tab Siswa */}
      {activeTab === "siswa" && (
        <div className="flex flex-col gap-3">
          {/* Kolom Pencarian Siswa */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NIS siswa..."
              className="w-full min-h-[44px] pl-9 pr-4 py-2 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] shadow-xs"
            />
          </div>

          {/* Daftar Siswa */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
            {filteredStudents.map((student, idx) => (
              <div
                key={student.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-[var(--surface-recessed)]/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-[var(--text-secondary)] w-6 text-center shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">
                      NIS {student.nis ?? "-"} · {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] font-semibold shrink-0">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Konten Tab Riwayat & Susulan Pertemuan KBM */}
      {activeTab === "riwayat" && (
        <div className="flex flex-col gap-4">
          {/* Header & Statistik Sesi */}
          <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex flex-col gap-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <History className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>Riwayat Pertemuan &amp; Presensi Susulan</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Jadwal resmi: Setiap {currentClass.scheduleDay}, {currentClass.scheduleTime} WIB. Dimulai sejak 13 Juli 2026.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-[6px] bg-[var(--surface-recessed)] font-mono text-[var(--text-secondary)] self-start sm:self-auto">
                Semester Ganjil 2026/2027
              </span>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Total Pertemuan</span>
                <span className="font-extrabold text-base text-[var(--text-primary)] font-mono">{pastTeachingDates.length}</span>
                <span className="text-[10px] text-[var(--text-secondary)] block">Jadwal Terdaftar</span>
              </div>
              <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Sudah Direkam</span>
                <span className="font-extrabold text-base text-[var(--status-hadir-fg)] font-mono">
                  {pastTeachingDates.filter((d) => d.isFilled).length}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block">Sesi Selesai</span>
              </div>
              <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Perlu Susulan</span>
                <span className="font-extrabold text-base text-amber-500 font-mono">
                  {unfilledCount}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block">Belum Diabsen</span>
              </div>
              <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Hari Libur</span>
                <span className="font-extrabold text-base text-[var(--text-secondary)] font-mono">
                  {pastTeachingDates.filter((d) => d.isHoliday).length}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block">Bebas KBM</span>
              </div>
            </div>
          </div>

          {/* Form Pintas Presensi Tanggal Lainnya / Jam Pengganti */}
          <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Isi Presensi Tanggal Lainnya / Jam Pengganti</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Pilih tanggal apa pun dari bulan Juli hingga hari ini untuk kelas pengganti atau kegiatan ekstra.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={customBackfillDate}
                min="2026-07-01"
                max={todayIso}
                onChange={(e) => setCustomBackfillDate(e.target.value)}
                className="min-h-[40px] px-3 py-1.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-mono font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <Link
                href={`/attendance/${currentClass.id}?date=${customBackfillDate}`}
                className="min-h-[40px] px-3.5 py-1.5 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold rounded-[10px] text-xs flex items-center gap-1.5 hover:opacity-95 transition-all shadow-xs shrink-0"
              >
                <span>Buka Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => handleOpenHolidayModal(customBackfillDate)}
                className="min-h-[40px] px-3 py-1.5 rounded-[10px] bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--status-alpa-fg)] border border-[var(--border-hairline)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                title="Tandai tanggal ini sebagai hari libur"
              >
                <CalendarOff className="w-3.5 h-3.5" />
                <span>Tandai Libur</span>
              </button>
            </div>
          </div>

          {/* Daftar Riwayat Pertemuan Terjadwal */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
            <div className="p-3 bg-[var(--surface-recessed)]/50 flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              <span>Daftar Pertemuan Terjadwal Sejak Awal Semester</span>
              <span>{pastTeachingDates.length} Pertemuan</span>
            </div>

            {pastTeachingDates.map((item, index) => {
              const meetingNumber = pastTeachingDates.length - index;

              return (
                <div
                  key={item.date}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-recessed)]/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-[var(--text-secondary)] font-mono leading-none">TEMU</span>
                      <span className="text-sm font-extrabold text-[var(--color-accent)] font-mono leading-none mt-0.5">
                        #{meetingNumber}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[var(--text-primary)]">
                          {formatIndonesianDate(item.date)}
                        </h4>
                        {item.isToday && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[var(--color-accent)] text-[var(--color-on-accent)] font-bold">
                            Hari Ini
                          </span>
                        )}
                        {item.isHoliday && (
                          <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-bold font-mono">
                            Libur: {item.holidayName}
                          </span>
                        )}
                        {!item.isHoliday && item.isFilled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] font-bold font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Sudah Diisi ({item.hadirCount ?? 0} Hadir)
                          </span>
                        )}
                        {!item.isHoliday && !item.isFilled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold font-mono flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Belum Diisi (Perlu Susulan)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                        {item.isHoliday
                          ? "Tidak ada KBM terjadwal (bebas presensi)."
                          : item.isFilled
                          ? `Terekam: ${item.hadirCount ?? 0} dari ${item.totalStudents ?? students.length} siswa hadir.`
                          : "Presensi belum direkam untuk pertemuan ini."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                    {item.isHoliday ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRemoveHoliday(item.date)}
                          className="min-h-[40px] px-3 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-[var(--status-hadir-fg)] border border-[var(--border-hairline)] transition-all shadow-xs"
                          title="Batalkan status libur (kembali jadi KBM aktif)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Batalkan Libur</span>
                        </button>
                        <Link
                          href={`/attendance/${currentClass.id}?date=${item.date}`}
                          className="min-h-[40px] px-3.5 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-[var(--text-primary)] border border-[var(--border-hairline)] transition-all shadow-xs"
                        >
                          <span>Catat Jam Pengganti</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenHolidayModal(item.date)}
                          className="min-h-[40px] px-3 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--status-alpa-fg)] border border-[var(--border-hairline)] transition-all shadow-xs"
                          title="Tandai pertemuan ini sebagai hari libur (siswa bebas absen)"
                        >
                          <CalendarOff className="w-3.5 h-3.5" />
                          <span>Tandai Libur</span>
                        </button>
                        <Link
                          href={`/attendance/${currentClass.id}?date=${item.date}`}
                          className={`min-h-[40px] px-3.5 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98] ${
                            !item.isFilled
                              ? "bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:opacity-95 font-bold"
                              : "bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-[var(--text-primary)] border border-[var(--border-hairline)]"
                          }`}
                        >
                          <span>
                            {item.isFilled
                              ? "Lihat / Edit Presensi"
                              : "Isi Presensi Susulan"}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal / Bottom Sheet Impor CSV (L7 Stitch) */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] p-5 shadow-xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Impor Siswa dari CSV
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Kelas {currentClass.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[var(--surface-recessed)] flex items-center justify-center text-[var(--text-secondary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Langkah 1: Pilih Berkas & Unduh Templat */}
            {csvStep === 1 && (
              <div className="flex flex-col gap-4">
                <div
                  onClick={handleSimulateUpload}
                  className="border-2 border-dashed border-[var(--border-hairline)] hover:border-[var(--color-accent)] rounded-[14px] p-8 text-center cursor-pointer transition-colors bg-[var(--surface-recessed)]/40 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-recessed)] text-[var(--color-accent)] flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">
                    Pilih Berkas CSV Siswa
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Klik di sini untuk mengunggah berkas (.csv)
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[var(--text-secondary)]">
                    Format kolom: <code className="font-mono">nis,nama,jk</code>
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
                  >
                    Unduh Templat CSV
                  </button>
                </div>
              </div>
            )}

            {/* Langkah 2: Pratinjau Validasi Baris (L7 Stitch) */}
            {csvStep === 2 && (
              <div className="flex flex-col gap-3 overflow-hidden flex-1">
                <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--status-hadir-fg)] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    3 Baris Valid
                  </span>
                  <span className="font-semibold text-[var(--status-alpa-fg)] flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    2 Perlu Diperbaiki
                  </span>
                </div>

                {/* Tabel Pratinjau Baris */}
                <div className="overflow-y-auto max-h-[300px] border border-[var(--border-hairline)] rounded-[10px] divide-y divide-[var(--border-hairline)] text-xs">
                  {csvPreview.map((item) => (
                    <div
                      key={item.row}
                      className={`p-2.5 flex items-start justify-between gap-2 ${
                        item.isValid ? "bg-white" : "bg-[var(--status-alpa-bg)]/20"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-[var(--text-secondary)] w-6">
                          #{item.row}
                        </span>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {item.nama || <span className="italic text-[var(--status-alpa-fg)]">(Nama Kosong)</span>}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                            NIS: {item.nis} · JK: {item.jk}
                          </p>
                          {!item.isValid && (
                            <p className="text-[11px] text-[var(--status-alpa-fg)] font-medium mt-0.5">
                              {item.error}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.isValid ? (
                        <Check className="w-4 h-4 text-[var(--status-hadir-fg)] shrink-0 mt-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[var(--status-alpa-fg)] shrink-0 mt-1" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Tombol Aksi Impor */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
                  <button
                    type="button"
                    onClick={() => setCsvStep(1)}
                    className="min-h-[40px] px-4 rounded-[10px] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
                  >
                    Unggah Ulang
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitImport}
                    className="min-h-[40px] px-4 rounded-[10px] text-xs font-bold bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-xs"
                  >
                    Impor 3 Siswa Valid
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Tandai Hari Libur Pertemuan Lampau */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] p-5 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Tandai Sebagai Hari Libur
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {formatIndonesianDate(targetHolidayDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(false)}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Nama / Alasan Libur
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kegiatan MPLS / Rapat Dinas / Class Meeting"
                  value={holidayNameInput}
                  onChange={(e) => setHolidayNameInput(e.target.value)}
                  className="min-h-[42px] px-3 py-2 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Kategori Libur
                </label>
                <select
                  value={holidayCategoryInput}
                  onChange={(e) => setHolidayCategoryInput(e.target.value as HolidayCategory)}
                  className="min-h-[42px] px-3 py-2 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer"
                >
                  <option value="SEKOLAH">Libur / Kegiatan Sekolah</option>
                  <option value="KHUSUS">Diliburkan Khusus Guru</option>
                  <option value="NASIONAL">Libur Nasional / Tanggal Merah</option>
                  <option value="CUTI_BERSAMA">Cuti Bersama</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Keterangan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan untuk jurnal pertemuan..."
                  value={holidayDescInput}
                  onChange={(e) => setHolidayDescInput(e.target.value)}
                  className="px-3 py-2 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="min-h-[38px] px-3.5 rounded-[8px] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[38px] px-4 rounded-[8px] text-xs font-bold bg-[var(--status-alpa-fg)] text-white shadow-xs hover:opacity-95"
                >
                  Simpan Status Libur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
