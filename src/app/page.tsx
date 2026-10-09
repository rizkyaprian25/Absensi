"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  School,
  CalendarOff,
  AlertCircle,
  Plus,
  X,
  Sparkles,
  History,
  FileCheck,
} from "lucide-react";
import {
  MOCK_CLASSES,
  MOCK_SCHOOL_NAME,
  MOCK_SUBJECT,
  getStudentsForClass,
} from "@/contracts/mocks/attendanceMocks";
import {
  ScheduleDay,
  HolidayItem,
  HolidayCategory,
} from "@/contracts/attendance";
import {
  getStoredHolidays,
  saveStoredHolidays,
  findHolidayByDate,
  getDateForWeekday,
  formatIndonesianDate,
  getCategoryLabel,
  isRealHoliday,
  isActiveSchoolEvent,
} from "@/lib/calendarUtils";

const DAYS_OF_WEEK: ScheduleDay[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

/**
 * Halaman Dashboard "Hari Ini" & Jadwal Mengajar
 * Dilengkapi fitur kustomisasi Hari Masuk (KBM Aktif) vs Hari Libur (Sekolah/Nasional/Khusus)
 */
export default function TodayDashboardPage() {
  // Dapatkan nama hari saat ini dalam bahasa Indonesia
  const currentDayName = useMemo<ScheduleDay>(() => {
    const dayIndex = new Date().getDay(); // 0 = Minggu, 1 = Senin, ... 5 = Jumat, 6 = Sabtu
    if (dayIndex === 1) return "Senin";
    if (dayIndex === 2) return "Selasa";
    if (dayIndex === 3) return "Rabu";
    if (dayIndex === 4) return "Kamis";
    if (dayIndex === 5) return "Jumat";
    return "Senin";
  }, []);

  const [selectedDay, setSelectedDay] = useState<ScheduleDay>(currentDayName);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State Modal Kustomisasi Libur
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [targetHolidayDate, setTargetHolidayDate] = useState<string | null>(null);
  const [holidayNameInput, setHolidayNameInput] = useState("");
  const [holidayCategoryInput, setHolidayCategoryInput] = useState<HolidayCategory>("SEKOLAH");
  const [holidayDescInput, setHolidayDescInput] = useState("");

  // Tanggal hari ini ISO
  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // State untuk form cepat presensi susulan tanggal lalu di dashboard
  const [quickBackfillClassId, setQuickBackfillClassId] = useState("class-7a");
  const [quickBackfillDate, setQuickBackfillDate] = useState("2026-07-13");

  // Inisialisasi daftar hari libur dari penyimpanan lokal saat mount
  useEffect(() => {
    setHolidays(getStoredHolidays());
  }, []);

  // Filter kelas berdasarkan hari yang dipilih
  const classesForSelectedDay = useMemo(() => {
    return MOCK_CLASSES.filter((c) => c.scheduleDay === selectedDay);
  }, [selectedDay]);

  // Tanggal pekan aktif untuk hari terpilih (YYYY-MM-DD)
  const selectedDate = useMemo(() => {
    return getDateForWeekday(selectedDay);
  }, [selectedDay]);

  // Cek apakah tanggal terpilih merupakan hari libur atau agenda pekan khusus
  const currentHoliday = useMemo(() => {
    return findHolidayByDate(selectedDate, holidays);
  }, [selectedDate, holidays]);

  // Libur murni (siswa bebas absen) vs Agenda khusus (UTS/UAS/Kokurikuler tetap ada absensi)
  const isCurrentDayRealHoliday = useMemo(() => {
    return currentHoliday ? isRealHoliday(currentHoliday.category) : false;
  }, [currentHoliday]);

  const currentSpecialAgenda = useMemo(() => {
    return currentHoliday && isActiveSchoolEvent(currentHoliday.category) ? currentHoliday : null;
  }, [currentHoliday]);

  const isCurrentDayOff = isCurrentDayRealHoliday;

  // Cek apakah tanggal susulan yang dipilih adalah hari libur murni
  const quickHoliday = useMemo(() => {
    return findHolidayByDate(quickBackfillDate, holidays);
  }, [quickBackfillDate, holidays]);

  // Format tanggal hari ini di header
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  // Handler: Simpan Hari Libur Baru untuk Tanggal Terpilih / Tanggal Lampau
  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayNameInput.trim()) return;

    const dateToSave = targetHolidayDate || selectedDate;
    const newHoliday: HolidayItem = {
      id: `hld-${dateToSave}-${Date.now()}`,
      date: dateToSave,
      name: holidayNameInput.trim(),
      category: holidayCategoryInput,
      description: holidayDescInput.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [...holidays.filter((h) => h.date !== dateToSave), newHoliday];
    setHolidays(updated);
    saveStoredHolidays(updated);
    setIsHolidayModalOpen(false);
    setHolidayNameInput("");
    setHolidayDescInput("");
    setTargetHolidayDate(null);

    setToastMessage(
      `Tanggal ${formatIndonesianDate(dateToSave)} berhasil ditetapkan sebagai Hari Libur: "${newHoliday.name}"`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handler: Batalkan Status Libur (Jadikan Hari Masuk KBM Aktif)
  const handleRemoveHoliday = (holidayId: string) => {
    const holidayToRemove = holidays.find((h) => h.id === holidayId);
    const updated = holidays.filter((h) => h.id !== holidayId);
    setHolidays(updated);
    saveStoredHolidays(updated);

    setToastMessage(
      `Status libur dibatalkan. Tanggal ${holidayToRemove ? formatIndonesianDate(holidayToRemove.date) : ""} kini menjadi Hari Masuk (KBM Aktif).`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notifikasi Aksi */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--text-primary)] text-[var(--color-bg)] px-4 py-2.5 rounded-[12px] shadow-xl flex items-center gap-2 text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-4 border border-[var(--border-hairline)] max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-[var(--status-hadir-fg)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Guru & Status Sistem */}
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)] font-medium">
              Selamat datang, <strong className="text-[var(--text-primary)]">Pak Rizky</strong>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--surface-card)] border border-[var(--border-hairline)] text-[var(--status-hadir-fg)] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--status-hadir-fg)] animate-pulse" />
            TERSIMPAN
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {formattedToday}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium mt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              {MOCK_SCHOOL_NAME}
            </span>
            <span>·</span>
            <span className="font-semibold text-[var(--color-accent)]">
              {MOCK_SUBJECT}
            </span>
            <span>·</span>
            <span>Semester Ganjil 2026/2027</span>
          </div>
        </div>
      </header>

      {/* Selektor Hari Jadwal Mengajar & Status Libur per Hari */}
      <div className="p-1.5 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex items-center justify-between gap-1 shadow-xs overflow-x-auto">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = currentDayName === day;
          const dayDate = getDateForWeekday(day);
          const dayItem = findHolidayByDate(dayDate, holidays);
          const isDayRealHoliday = Boolean(dayItem && isRealHoliday(dayItem.category));
          const daySpecialEvent = dayItem && isActiveSchoolEvent(dayItem.category) ? dayItem : null;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`flex-1 min-h-[46px] px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex flex-col items-center justify-center shrink-0 relative ${
                isSelected
                  ? "bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-recessed)]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{day}</span>
                {isToday && (
                  <span
                    title="Hari Ini"
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-[var(--color-accent)]"
                    }`}
                  />
                )}
                {daySpecialEvent && (
                  <span
                    title={`Pekan ${daySpecialEvent.category}: ${daySpecialEvent.name}`}
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? "bg-purple-200" : "bg-purple-600"
                    }`}
                  />
                )}
                {isDayRealHoliday && (
                  <span
                    title={`Libur: ${dayItem?.name}`}
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? "bg-amber-300" : "bg-[var(--status-alpa-fg)]"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-normal font-mono ${
                  isSelected
                    ? "text-white/80"
                    : isDayRealHoliday
                    ? "text-[var(--status-alpa-fg)] font-semibold"
                    : daySpecialEvent
                    ? "text-purple-600 dark:text-purple-300 font-bold"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {isDayRealHoliday
                  ? "Libur"
                  : daySpecialEvent
                  ? daySpecialEvent.category === "KOKURIKULER"
                    ? "Projek P5"
                    : `Pekan ${daySpecialEvent.category}`
                  : "2 Sesi KBM"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bagian: Jadwal KBM Hari Terpilih & Pengaturan Masuk/Libur */}
      <section className="flex flex-col gap-3">
        {/* Header Seksi & Kontrol Cepat Kustomisasi Libur */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
                Jadwal Mengajar {selectedDay}
              </h2>
              <span className="font-mono text-xs text-[var(--text-secondary)]">
                · {formatIndonesianDate(selectedDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {currentSpecialAgenda ? (
                <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center gap-1.5 border border-purple-500/30 font-mono">
                  <FileCheck className="w-3.5 h-3.5" />
                  PEKAN {currentSpecialAgenda.category === "UTS" ? "UTS" : currentSpecialAgenda.category === "UAS" ? "UAS" : "KOKURIKULER (P5)"} · TETAP ADA PRESENSI
                </span>
              ) : isCurrentDayRealHoliday ? (
                <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-bold bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] flex items-center gap-1.5 border border-[var(--status-alpa-fg)]/20 font-mono">
                  <CalendarOff className="w-3.5 h-3.5" />
                  HARI LIBUR ({currentHoliday?.name})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-bold bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] flex items-center gap-1.5 border border-[var(--status-hadir-fg)]/20 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  HARI MASUK (KBM AKTIF) · {classesForSelectedDay.length} Kelas
                </span>
              )}
            </div>
          </div>

          {/* Tombol Aksi Cepat: Masuk <-> Libur */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isCurrentDayRealHoliday ? (
              <button
                type="button"
                onClick={() => handleRemoveHoliday(currentHoliday!.id)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-[10px] bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--status-hadir-fg)] flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ubah Jadi Hari Masuk</span>
              </button>
            ) : currentSpecialAgenda ? (
              <button
                type="button"
                onClick={() => handleRemoveHoliday(currentSpecialAgenda.id)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-[10px] bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
                <span>Hapus Agenda Pekan Ini</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setHolidayNameInput("Kegiatan / Libur Khusus");
                  setIsHolidayModalOpen(true);
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-[10px] bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--status-alpa-fg)] flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              >
                <CalendarOff className="w-4 h-4" />
                <span>Tandai Hari Ini Libur</span>
              </button>
            )}
          </div>
        </div>

        {/* Banner Penjelasan Jika Berstatus Agenda Khusus (UTS, UAS, Kokurikuler) */}
        {currentSpecialAgenda && (
          <div className="p-4 rounded-[14px] bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-purple-900 dark:text-purple-200">
                    Agenda: {currentSpecialAgenda.name} (Sekolah Masuk &amp; Tetap Absensi)
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold font-mono">
                    {getCategoryLabel(currentSpecialAgenda.category)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {currentSpecialAgenda.description || "Pekan kegiatan khusus. Siswa tetap hadir dan dicatat presensinya secara aktif."}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  📝 Presensi tetap berjalan seperti biasa. Gunakan status Dispensasi (D) jika ada siswa yang bertugas khusus.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveHoliday(currentSpecialAgenda.id)}
              className="min-h-[38px] px-3 py-1.5 rounded-[8px] bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] transition-all shrink-0 self-start sm:self-auto"
            >
              Hapus Agenda
            </button>
          </div>
        )}

        {/* Banner Penjelasan Jika Hari Berstatus Libur Murni */}
        {isCurrentDayRealHoliday && (
          <div className="p-4 rounded-[14px] bg-[var(--status-alpa-bg)] border border-[var(--status-alpa-fg)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[var(--status-alpa-fg)] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <CalendarOff className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-[var(--status-alpa-fg)]">
                    Hari Ini Ditetapkan Sebagai Hari Libur / Tidak Ada KBM
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[var(--status-alpa-fg)]/10 text-[var(--status-alpa-fg)] font-bold font-mono">
                    {getCategoryLabel(currentHoliday!.category)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Keterangan: <strong className="text-[var(--text-primary)]">{currentHoliday!.name}</strong>
                  {currentHoliday?.description ? ` — ${currentHoliday.description}` : ""}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  💡 Seluruh siswa tidak dihitung alpa pada rekap bulanan. Jika ada jam pengganti atau kegiatan ekstra, Anda tetap dapat mencatat presensi kelas di bawah.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveHoliday(currentHoliday!.id)}
              className="min-h-[38px] px-3 py-1.5 rounded-[8px] bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] transition-all shrink-0 self-start sm:self-auto"
            >
              Batalkan Libur
            </button>
          </div>
        )}

        {/* Daftar Kartu Kelas Sesuai Jadwal */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
          {classesForSelectedDay.map((cls) => {
            const studentCount = getStudentsForClass(cls.id).length;

            return (
              <div
                key={cls.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-recessed)]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] flex flex-col items-center justify-center font-bold shrink-0">
                    <span className="text-xs text-[var(--text-secondary)] font-mono">KELAS</span>
                    <span className="text-base text-[var(--color-accent)] font-extrabold leading-none">
                      {cls.name}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-base text-[var(--text-primary)]">
                        Kelas {cls.name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[var(--surface-recessed)] text-[var(--text-secondary)] font-mono font-medium">
                        {cls.schedulePeriod}
                      </span>
                      {isCurrentDayOff && (
                        <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-bold font-mono">
                          Diliburkan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      <span>{cls.scheduleTime} WIB</span>
                      <span>·</span>
                      <span>{studentCount} Siswa</span>
                    </p>
                  </div>
                </div>

                <Link
                  href={`/attendance/${cls.id}`}
                  className={`min-h-[44px] px-4 py-2 font-semibold rounded-[10px] text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-xs active:scale-[0.98] ${
                    isCurrentDayOff
                      ? "bg-[var(--surface-recessed)] text-[var(--text-primary)] hover:bg-[var(--border-hairline)] border border-[var(--border-hairline)]"
                      : "bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:opacity-95"
                  }`}
                >
                  <span>
                    {isCurrentDayOff
                      ? `Ambil Presensi Pengganti Kelas ${cls.name}`
                      : `Mulai Absen Kelas ${cls.name}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Seksi: Presensi Susulan Bulan-Bulan Lalu (Backfill Tanggal Lampau) */}
      <div className="p-5 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-recessed)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Isi Presensi Susulan (Bulan-Bulan Lalu)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Tahun ajaran berjalan sejak 13 Juli 2026. Pilih rombel dan tanggal lampau untuk melengkapi absensi yang belum tercatat.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-[6px] bg-[var(--surface-recessed)] font-mono text-[var(--text-secondary)] self-start sm:self-auto">
            Mode Susulan Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Pilih Kelas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Pilih Rombel / Kelas
            </label>
            <select
              value={quickBackfillClassId}
              onChange={(e) => setQuickBackfillClassId(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer"
            >
              {MOCK_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  Kelas {c.name} ({c.scheduleDay} · {c.scheduleTime} WIB)
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Tanggal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Pilih Tanggal Presensi
            </label>
            <input
              type="date"
              value={quickBackfillDate}
              min="2026-07-01"
              max={todayIso}
              onChange={(e) => setQuickBackfillDate(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          {/* Tombol Aksi Form Presensi & Tandai Libur */}
          <div className="flex flex-col gap-1.5 justify-end">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Aksi Tanggal Terpilih
            </label>
            <div className="flex items-center gap-2">
              <Link
                href={`/attendance/${quickBackfillClassId}?date=${quickBackfillDate}`}
                className="flex-1 min-h-[42px] px-3.5 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-bold rounded-[10px] text-xs flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
              >
                <span>Isi Presensi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {quickHoliday ? (
                <button
                  type="button"
                  onClick={() => handleRemoveHoliday(quickHoliday.id)}
                  className="min-h-[42px] px-3 py-2 bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-xs font-semibold text-[var(--status-hadir-fg)] rounded-[10px] border border-[var(--border-hairline)] transition-all shadow-xs shrink-0"
                  title="Batalkan status libur untuk tanggal ini"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                  <span>Batal Libur</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTargetHolidayDate(quickBackfillDate);
                    setHolidayNameInput("Kegiatan / Libur Khusus Sekolah");
                    setIsHolidayModalOpen(true);
                  }}
                  className="min-h-[42px] px-3 py-2 bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-xs font-semibold text-[var(--status-alpa-fg)] rounded-[10px] border border-[var(--border-hairline)] transition-all shadow-xs flex items-center gap-1 shrink-0"
                  title="Tandai tanggal ini sebagai hari libur"
                >
                  <CalendarOff className="w-3.5 h-3.5" />
                  <span>Tandai Libur</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 flex items-center justify-between text-xs text-[var(--text-secondary)] flex-wrap gap-2">
          <span>
            💡 Seluruh siswa akan langsung berstatus <strong className="text-[var(--status-hadir-fg)] font-semibold">HADIR</strong> secara otomatis agar pengisian tanggal lalu cepat selesai.
          </span>
          <Link
            href={`/classes/${quickBackfillClassId}`}
            className="font-bold text-[var(--color-accent)] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Lihat Riwayat &amp; Jadwal Lengkap Kelas Ini</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Ringkasan Beban Mengajar Mingguan */}
      <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-bold uppercase tracking-wider">
            Total Beban Mengajar Mingguan
          </span>
          <span className="font-semibold text-[var(--color-accent)]">
            10 Rombel · aSc Timetables
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">SENIN</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">7A &amp; 7D</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">08.00–11.55</span>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">SELASA</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">8B &amp; 7B</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">07.30–11.25</span>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">RABU</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">7F &amp; 7E</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">07.30–11.25</span>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">KAMIS</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">8A &amp; 7H</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">07.30–11.25</span>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">JUMAT</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">7G &amp; 7C</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">08.00–11.20</span>
          </div>
        </div>
      </div>

      {/* Modal: Tandai Hari Libur Kustom */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] p-5 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Tandai Sebagai Hari Libur
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {formatIndonesianDate(targetHolidayDate || selectedDate)}
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

            <form onSubmit={handleSaveHoliday} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Keterangan / Nama Hari Libur
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Maulid Nabi, Classmeeting, Pekan Ujian"
                  value={holidayNameInput}
                  onChange={(e) => setHolidayNameInput(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Kategori Libur
                </label>
                <select
                  value={holidayCategoryInput}
                  onChange={(e) => setHolidayCategoryInput(e.target.value as HolidayCategory)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
                >
                  <option value="SEKOLAH">Libur / Kegiatan Khusus Sekolah</option>
                  <option value="UTS">Minggu / Pekan UTS (Penilaian Tengah Semester)</option>
                  <option value="UAS">Minggu / Pekan UAS (Penilaian Akhir Semester)</option>
                  <option value="KOKURIKULER">Minggu Kokurikuler / Projek P5 / Classmeeting</option>
                  <option value="KHUSUS">Diliburkan Khusus Guru / Rapat</option>
                  <option value="NASIONAL">Libur Nasional / Tanggal Merah</option>
                  <option value="CUTI_BERSAMA">Cuti Bersama</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Surat Edaran Kepala Sekolah No. 12"
                  value={holidayDescInput}
                  onChange={(e) => setHolidayDescInput(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="min-h-[40px] px-4 rounded-[10px] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 rounded-[10px] text-xs font-bold bg-[var(--status-alpa-fg)] text-white hover:opacity-95 shadow-xs"
                >
                  Tandai Libur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
