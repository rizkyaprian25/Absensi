"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  FileText,
  Plus,
  Search,
  X,
  Clock,
  Send,
  AlertCircle,
  FileCheck,
  CalendarOff,
  History,
  RotateCcw,
} from "lucide-react";
import {
  MOCK_CLASSES,
  getStudentsForClass,
  MOCK_TEACHER_NAME,
  MOCK_SCHOOL_NAME,
} from "@/contracts/mocks/attendanceMocks.ts";
import type {
  AttendanceStatus,
  HolidayItem,
  AttendanceSession,
  AttendanceRecord,
} from "@/contracts/attendance.ts";
import {
  getStoredHolidays,
  findHolidayByDate,
  formatIndonesianDate,
} from "@/lib/calendarUtils.ts";
import {
  getSessionAndRecords,
  saveSessionAndRecords,
} from "@/lib/attendanceStorage.ts";

interface StudentAttendanceState {
  status: AttendanceStatus;
  note?: string;
}

/**
 * Komponen Konten Form Presensi (Dengan Dukungan Backfill Tanggal Lampau)
 */
function AttendanceTakingContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const classId = params.id as string;
  const dateParam = searchParams.get("date");

  // Dapatkan informasi kelas dari jadwal resmi (fallback ke kelas pertama)
  const currentClass =
    MOCK_CLASSES.find((c) => c.id === classId) ?? MOCK_CLASSES[0];

  // Dapatkan siswa khusus untuk kelas ini
  const classStudents = useMemo(() => {
    return getStudentsForClass(classId);
  }, [classId]);

  // Tanggal hari ini dalam format YYYY-MM-DD
  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // Tanggal yang sedang diabsen (Bisa tanggal lampau / susulan)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayIso;
  });

  // State pencarian siswa
  const [searchQuery, setSearchQuery] = useState("");

  // State absensi lokal siswa (Map studentId -> StudentAttendanceState)
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StudentAttendanceState>>({});

  // State toast notifikasi simpan
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);

  // Muat hari libur saat mount
  useEffect(() => {
    setHolidays(getStoredHolidays());
  }, []);

  // Muat data presensi yang sudah tersimpan untuk kelas dan tanggal yang dipilih
  useEffect(() => {
    const { session, records } = getSessionAndRecords(classId, selectedDate);
    const newMap: Record<string, StudentAttendanceState> = {};

    if (session && records.length > 0) {
      records.forEach((r) => {
        newMap[r.studentId] = {
          status: r.status,
          note: r.note ?? undefined,
        };
      });
      // Pastikan setiap siswa ada di map
      classStudents.forEach((s) => {
        if (!newMap[s.id]) {
          newMap[s.id] = { status: "HADIR" };
        }
      });
    } else {
      // Default: Seluruh siswa hadir (Pre-filled sesuai SOP & PRD §4 Q3)
      classStudents.forEach((student, idx) => {
        // Simulasi jika hari ini tanggal 29 Sep bawaan mock demo
        if (selectedDate === "2026-09-29") {
          if (idx === 7) {
            newMap[student.id] = { status: "SAKIT", note: "Surat dokter" };
          } else if (idx === 9) {
            newMap[student.id] = { status: "IZIN", note: "Dispensasi OSIS" };
          } else {
            newMap[student.id] = { status: "HADIR" };
          }
        } else {
          newMap[student.id] = { status: "HADIR" };
        }
      });
    }

    setAttendanceMap(newMap);
  }, [selectedDate, classId, classStudents]);

  // Cek apakah tanggal yang dipilih adalah hari libur
  const currentHoliday = useMemo(() => {
    return findHolidayByDate(selectedDate, holidays);
  }, [selectedDate, holidays]);

  // Status apakah ini presensi susulan (tanggal di masa lalu)
  const isBackfill = selectedDate < todayIso;

  // Nama hari dari tanggal yang dipilih (Senin, Selasa, dll.)
  const selectedDayName = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      return days[dateObj.getDay()] ?? "";
    } catch {
      return "";
    }
  }, [selectedDate]);

  // Apakah hari ini sesuai dengan jadwal reguler kelas tersebut
  const isScheduledDay = currentClass.scheduleDay === selectedDayName;

  // Perhitungan ringkasan real-time (Live Tally)
  const tally = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let terlambat = 0;

    Object.values(attendanceMap).forEach((item) => {
      if (item.status === "HADIR") hadir++;
      else if (item.status === "SAKIT") sakit++;
      else if (item.status === "IZIN") izin++;
      else if (item.status === "ALPA") alpa++;
      else if (item.status === "TERLAMBAT") terlambat++;
    });

    return { hadir, sakit, izin, alpa, terlambat, total: classStudents.length };
  }, [attendanceMap, classStudents.length]);

  // Filter siswa berdasarkan input pencarian
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const query = searchQuery.toLowerCase();
    return classStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(query) ||
        (s.nis && s.nis.toLowerCase().includes(query))
    );
  }, [classStudents, searchQuery]);

  // Fungsi pengubah status seorang siswa
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Tombol aksi "Semua hadir"
  const handleMarkAllPresent = () => {
    setAttendanceMap((prev) => {
      const updated: Record<string, StudentAttendanceState> = {};
      Object.keys(prev).forEach((id) => {
        updated[id] = { status: "HADIR" };
      });
      return updated;
    });
  };

  // Ubah tanggal yang sedang diabsen
  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    router.replace(`/attendance/${classId}?date=${newDate}`);
  };

  // Aksi simpan absensi (persisten ke localStorage)
  const handleSaveAttendance = () => {
    setIsSaving(true);

    const sessionId = `session-${classId}-${selectedDate}`;
    const session: AttendanceSession = {
      id: sessionId,
      classId,
      sessionDate: selectedDate,
      slot: 0,
      subject: currentClass.subject ?? "Informatika",
      note: isBackfill ? "Presensi Susulan" : null,
      clientRequestId: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const records: AttendanceRecord[] = classStudents.map((student) => {
      const st = attendanceMap[student.id] ?? { status: "HADIR" };
      return {
        id: `rec-${sessionId}-${student.id}`,
        sessionId,
        studentId: student.id,
        status: st.status,
        note: st.note ?? null,
      };
    });

    saveSessionAndRecords(session, records);

    setTimeout(() => {
      setIsSaving(false);
      setToastMessage(
        `Presensi Kelas ${currentClass.name} untuk tanggal ${formatIndonesianDate(selectedDate)} berhasil disimpan!`
      );
      setTimeout(() => {
        router.push(`/classes/${classId}`);
      }, 1200);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Toast Notifikasi Sukses Simpan */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--text-primary)] text-[var(--color-bg)] px-4 py-2.5 rounded-[12px] shadow-xl flex items-center gap-2 text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-4 border border-[var(--border-hairline)] max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-[var(--status-hadir-fg)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman & Navigasi Kembali */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/classes/${classId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px] py-2 px-1 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kelas {currentClass.name}</span>
        </Link>

        {/* Pemilih Tanggal Absensi (Dukungan Susulan / Lampau) */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--surface-card)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-mono shadow-xs hover:border-[var(--color-accent)] transition-all">
            <Calendar className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
            <span className="font-bold text-[var(--text-secondary)] mr-1">Tgl:</span>
            <input
              type="date"
              min="2026-07-01"
              max={todayIso}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
            />
          </div>

          {selectedDate !== todayIso && (
            <button
              type="button"
              onClick={() => handleDateChange(todayIso)}
              title="Kembali ke Tanggal Hari Ini"
              className="min-h-[38px] px-2.5 py-1 rounded-[8px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-xs font-semibold text-[var(--text-secondary)] transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hari Ini</span>
            </button>
          )}
        </div>
      </div>

      {/* Judul Kelas & Info Sesi */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Presensi Kelas {currentClass.name}
          </h1>
          {isBackfill ? (
            <span className="text-[11px] px-2.5 py-0.5 rounded-[6px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1 font-mono">
              <History className="w-3 h-3" />
              Presensi Susulan
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-0.5 rounded-[6px] bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] font-bold font-mono">
              Hari Ini
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {currentClass.subject ?? "Informatika"} · {formatIndonesianDate(selectedDate)}
          {isScheduledDay
            ? ` · Jadwal Reguler (${currentClass.scheduleDay}, ${currentClass.schedulePeriod})`
            : ` · KBM Tambahan / Pengganti (Jadwal Asli: ${currentClass.scheduleDay})`}
        </p>
      </div>

      {/* Banner Notifikasi Mode Susulan (Jika Tanggal Lampau) */}
      {isBackfill && (
        <div className="p-3.5 rounded-[12px] bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-[var(--text-secondary)] shadow-xs animate-in fade-in">
          <History className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-amber-700 dark:text-amber-400">
              Mode Pengisian Presensi Susulan ({formatIndonesianDate(selectedDate)})
            </p>
            <p className="mt-0.5 leading-relaxed">
              Anda sedang mencatat kehadiran untuk tanggal lampau. Data kehadiran yang Anda simpan akan langsung tersimpan secara permanen ke riwayat pertemuan kelas dan rekapitulasi semester.
            </p>
          </div>
        </div>
      )}

      {/* Banner Peringatan Jika Hari Libur */}
      {currentHoliday && (
        <div className="p-3.5 rounded-[12px] bg-[var(--status-alpa-bg)] border border-[var(--status-alpa-fg)]/20 flex items-start gap-2.5 text-xs text-[var(--text-secondary)] shadow-xs animate-in fade-in">
          <CalendarOff className="w-4 h-4 text-[var(--status-alpa-fg)] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--status-alpa-fg)]">
              Pemberitahuan: Tanggal Ini Tercatat Sebagai Hari Libur ({currentHoliday.name})
            </p>
            <p className="mt-0.5">
              Anda tetap dapat mencatat presensi jika menyelenggarakan jam pelajaran pengganti atau kegiatan ekstra.
            </p>
          </div>
        </div>
      )}

      {/* Live Tally Ledger Bar (Menghitung Real-Time) */}
      <div className="p-3 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex items-center justify-between gap-1 shadow-xs font-tabular">
        {/* Hadir */}
        <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-[8px] bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] font-bold text-xs">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>H:</span>
          <span className="text-sm font-extrabold">{tally.hadir}</span>
        </div>
        {/* Sakit */}
        <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-[8px] bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)] font-bold text-xs">
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>S:</span>
          <span className="text-sm font-extrabold">{tally.sakit}</span>
        </div>
        {/* Izin */}
        <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-[8px] bg-[var(--status-izin-bg)] text-[var(--status-izin-fg)] font-bold text-xs">
          <FileText className="w-3.5 h-3.5" />
          <span>I:</span>
          <span className="text-sm font-extrabold">{tally.izin}</span>
        </div>
        {/* Alpa */}
        <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-[8px] bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-bold text-xs">
          <X className="w-3.5 h-3.5 stroke-[3]" />
          <span>A:</span>
          <span className="text-sm font-extrabold">{tally.alpa}</span>
        </div>
      </div>

      {/* Bilah Aksi Cepat & Pencarian Siswa */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleMarkAllPresent}
          className="min-h-[44px] px-3.5 py-2 rounded-[10px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] border border-[var(--border-hairline)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <CheckCheck className="w-4 h-4 text-[var(--status-hadir-fg)]" />
          <span>Set Semua Hadir</span>
        </button>

        <span className="text-xs text-[var(--text-secondary)] font-mono">
          {tally.hadir}/{tally.total} Siswa Hadir ({Math.round((tally.hadir / (tally.total || 1)) * 100)}%)
        </span>
      </div>

      {/* Input Pencarian Siswa (Debounced via React state) */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nama atau NIS siswa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-9 pr-4 py-2 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all shadow-xs"
        />
      </div>

      {/* Subheader Daftar Siswa */}
      <div className="flex items-center justify-between px-1 text-xs text-[var(--text-secondary)]">
        <span className="font-bold uppercase tracking-wider">
          Daftar Presensi ({formatIndonesianDate(selectedDate)})
        </span>
        <span className="font-mono bg-[var(--surface-recessed)] px-2 py-0.5 rounded-[6px]">
          {classStudents.length} Siswa Terdaftar
        </span>
      </div>

      {/* Daftar Ruled List Siswa (Ledger Style) */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
            Tidak ada nama siswa yang cocok dengan &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredStudents.map((student, idx) => {
            const currentStatus = attendanceMap[student.id]?.status ?? "HADIR";
            const indexStr = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={student.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-recessed)]/50 transition-colors"
              >
                {/* Info Siswa */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-[var(--text-secondary)] w-6 text-center shrink-0">
                    {indexStr}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">
                      NIS: {student.nis ?? "-"} · {student.gender === "L" ? "L" : "P"}
                    </p>
                  </div>
                </div>

                {/* 4 Segmented Control Buttons (H, S, I, A) */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  {/* Hadir (H) */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "HADIR")}
                    className={`min-w-[44px] min-h-[44px] px-3 rounded-[10px] text-xs font-extrabold flex items-center justify-center transition-all ${
                      currentStatus === "HADIR"
                        ? "bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] ring-2 ring-[var(--status-hadir-fg)] shadow-xs scale-105"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)]"
                    }`}
                  >
                    H
                  </button>

                  {/* Sakit (S) */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "SAKIT")}
                    className={`min-w-[44px] min-h-[44px] px-3 rounded-[10px] text-xs font-extrabold flex items-center justify-center transition-all ${
                      currentStatus === "SAKIT"
                        ? "bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)] ring-2 ring-[var(--status-sakit-fg)] shadow-xs scale-105"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)]"
                    }`}
                  >
                    S
                  </button>

                  {/* Izin (I) */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "IZIN")}
                    className={`min-w-[44px] min-h-[44px] px-3 rounded-[10px] text-xs font-extrabold flex items-center justify-center transition-all ${
                      currentStatus === "IZIN"
                        ? "bg-[var(--status-izin-bg)] text-[var(--status-izin-fg)] ring-2 ring-[var(--status-izin-fg)] shadow-xs scale-105"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)]"
                    }`}
                  >
                    I
                  </button>

                  {/* Alpa (A) */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "ALPA")}
                    className={`min-w-[44px] min-h-[44px] px-3 rounded-[10px] text-xs font-extrabold flex items-center justify-center transition-all ${
                      currentStatus === "ALPA"
                        ? "bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] ring-2 ring-[var(--status-alpa-fg)] shadow-xs scale-105"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)]"
                    }`}
                  >
                    A
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Bar: Simpan Presensi */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[var(--surface-card)]/90 backdrop-blur-md border-t border-[var(--border-hairline)] z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex flex-col text-xs">
            <span className="font-bold text-[var(--text-primary)]">
              Presensi Kelas {currentClass.name} · {selectedDate}
            </span>
            <span className="text-[var(--text-secondary)]">
              {tally.hadir} Hadir, {tally.sakit} Sakit, {tally.izin} Izin, {tally.alpa} Alpa
            </span>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAttendance}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-[12px] bg-[var(--color-accent)] text-[var(--color-on-accent)] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan Presensi...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {isBackfill
                    ? `Simpan Presensi Susulan (${selectedDate})`
                    : "Simpan Presensi Kelas"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Halaman Presensi Kelas dengan Pembungkus Suspense (Next.js SSR Safety)
 */
export default function AttendanceTakingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
          Memuat formulir presensi...
        </div>
      }
    >
      <AttendanceTakingContent />
    </Suspense>
  );
}
