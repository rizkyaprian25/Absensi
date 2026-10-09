"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Filter,
  Layers,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import {
  MOCK_CLASSES,
  getStudentsForClass,
} from "@/contracts/mocks/attendanceMocks";
import type {
  Class,
  HolidayItem,
  ScheduleDay,
  AttendanceSession,
  AttendanceRecord,
} from "@/contracts/attendance";
import {
  getStoredHolidays,
  findHolidayByDate,
  getCategoryLabel,
  formatIndonesianDate,
  isRealHoliday,
  isActiveSchoolEvent,
} from "@/lib/calendarUtils";
import { getSavedSessions, getSavedRecords } from "@/lib/attendanceStorage";
import {
  generateAttendanceCsvWithKop,
  generateAttendanceExcelHtmlWithKop,
  generateAttendanceXlsxWithKop,
  downloadXlsxFile,
} from "@/lib/exportUtils";

const SEMESTER_MONTHS = [
  { value: "2026-07", label: "Juli 2026" },
  { value: "2026-08", label: "Agustus 2026" },
  { value: "2026-09", label: "September 2026" },
  { value: "2026-10", label: "Oktober 2026" },
  { value: "2026-11", label: "November 2026" },
  { value: "2026-12", label: "Desember 2026" },
];

/**
 * Menghasilkan daftar tanggal efektif KBM kelas pada bulan terpilih
 */
function getDatesForClassMonth(
  yearMonth: string,
  scheduleDay?: ScheduleDay,
  classId?: string,
  savedSessions: AttendanceSession[] = []
): string[] {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const dayMap: Record<ScheduleDay, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
  };

  const targetDay = scheduleDay ? dayMap[scheduleDay] : 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const dateSet = new Set<string>();

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month - 1, d);
    const dayOfWeek = curDate.getDay();
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    // Khusus Juli 2026, KBM dimulai 13 Juli 2026 (awal semester)
    if (yearMonth === "2026-07" && d < 13) {
      continue;
    }

    if (dayOfWeek === targetDay) {
      dateSet.add(dateStr);
    }
  }

  // Tambahkan juga jika ada sesi tersimpan di luar jadwal (kelas pengganti)
  if (classId) {
    savedSessions.forEach((s) => {
      if (s.classId === classId && s.sessionDate.startsWith(yearMonth)) {
        dateSet.add(s.sessionDate);
      }
    });
  }

  return Array.from(dateSet).sort();
}

/**
 * Menghitung rekapitulasi data kehadiran untuk kelas tertentu pada bulan tertentu
 */
function computeRecapForClass(
  cls: Class,
  month: string,
  holidays: HolidayItem[],
  savedSessions: AttendanceSession[],
  savedRecords: AttendanceRecord[]
) {
  const students = getStudentsForClass(cls.id);
  const effectiveDates = getDatesForClassMonth(
    month,
    cls.scheduleDay,
    cls.id,
    savedSessions
  );
  const holidayDatesMap = new Map(holidays.map((h) => [h.date, h]));
  const classSessions = savedSessions.filter(
    (s) => s.classId === cls.id && s.sessionDate.startsWith(month)
  );

  const studentRecaps = students.map((s) => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let terlambat = 0;
    let dispen = 0;
    const dailyStatus: Record<string, string> = {};

    effectiveDates.forEach((date) => {
      const calItem = holidayDatesMap.get(date);
      // Hanya benar-benar libur jika kategori libur murni (sekolah libur, siswa bebas absen)
      const isRealHol = calItem ? isRealHoliday(calItem.category) : false;
      const session = classSessions.find((sess) => sess.sessionDate === date);

      // Jika hari libur murni dan tidak ada sesi pertemuan tersimpan, tandai L (Libur)
      if (isRealHol && !session) {
        dailyStatus[date] = "L";
        return;
      }

      // Jika ada sesi tersimpan (termasuk pada pekan UTS, UAS, Kokurikuler, maupun hari biasa)
      if (session) {
        const rec = savedRecords.find(
          (r) => r.sessionId === session.id && r.studentId === s.id
        );
        const st = rec ? rec.status : "HADIR";
        if (st === "HADIR") {
          hadir++;
          dailyStatus[date] = "H";
        } else if (st === "SAKIT") {
          sakit++;
          dailyStatus[date] = "S";
        } else if (st === "IZIN") {
          izin++;
          dailyStatus[date] = "I";
        } else if (st === "ALPA") {
          alpa++;
          dailyStatus[date] = "A";
        } else if (st === "TERLAMBAT") {
          terlambat++;
          dailyStatus[date] = "T";
        } else if (st === "DISPEN") {
          dispen++;
          dailyStatus[date] = "D";
        }
      } else {
        // Jika belum ada sesi: hari libur murni berstatus "L", hari aktif/pekan khusus berstatus "-" (belum diisi)
        dailyStatus[date] = isRealHol ? "L" : "-";
      }
    });

    const totalRecordedDays = hadir + sakit + izin + alpa + terlambat + dispen;
    const persentase =
      totalRecordedDays > 0
        ? Number((((hadir + dispen) / totalRecordedDays) * 100).toFixed(1))
        : 100;

    return {
      studentId: s.id,
      nis: s.nis ?? null,
      fullName: s.fullName,
      gender: s.gender ?? null,
      hadir,
      sakit,
      izin,
      alpa,
      terlambat,
      dispen,
      totalHari: totalRecordedDays,
      persentaseKehadiran: persentase,
      dailyStatus,
      needsAttention: totalRecordedDays > 0 && persentase < 85,
    };
  });

  const recordedStudents = studentRecaps.filter((s) => s.totalHari > 0);
  const averageAttendance =
    recordedStudents.length > 0
      ? Number(
          (
            recordedStudents.reduce((acc, curr) => acc + curr.persentaseKehadiran, 0) /
            recordedStudents.length
          ).toFixed(1)
        )
      : 100;

  return {
    classId: cls.id,
    className: cls.name,
    academicYear: cls.academicYear,
    month,
    effectiveDates,
    averageAttendance,
    students: studentRecaps,
  };
}

/**
 * Halaman Rekapitulasi Bulanan & Ekspor Ber-Kop Resmi (L8 Stitch)
 * Memuat matriks presensi siswa x tanggal, ringkasan persentase, ekspor Excel .xls, CSV UTF-8 BOM, dan cetak native
 */
export default function ReportsPage() {
  const [selectedClassId, setSelectedClassId] = useState("class-7a");
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [monthIndex, setMonthIndex] = useState(2); // 2 = September 2026
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [savedSessions, setSavedSessions] = useState<AttendanceSession[]>([]);
  const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  useEffect(() => {
    setHolidays(getStoredHolidays());
    setSavedSessions(getSavedSessions());
    setSavedRecords(getSavedRecords());
  }, [selectedClassId, selectedMonth]);

  const currentClass =
    MOCK_CLASSES.find((c) => c.id === selectedClassId) ?? MOCK_CLASSES[0];

  const currentMonthLabel = useMemo(() => {
    const found = SEMESTER_MONTHS.find((m) => m.value === selectedMonth);
    return found ? found.label : selectedMonth;
  }, [selectedMonth]);

  // Data rekapitulasi bulanan dinamis sesuai kelas yang dipilih & hari libur
  const recapData = useMemo(() => {
    return computeRecapForClass(
      currentClass,
      selectedMonth,
      holidays,
      savedSessions,
      savedRecords
    );
  }, [
    currentClass,
    selectedMonth,
    holidays,
    savedSessions,
    savedRecords,
  ]);

  // Hitung jumlah siswa yang perlu perhatian (< 85% kehadiran)
  const studentsNeedingAttention = useMemo(() => {
    return recapData.students.filter((s) => s.needsAttention);
  }, [recapData]);

  // Data Jurnal Agenda KBM untuk Bulan Terpilih
  const monthlyAgendas = useMemo(() => {
    return recapData.effectiveDates.map((date, idx) => {
      const session = savedSessions.find(
        (s) => s.classId === currentClass.id && s.sessionDate === date
      );
      const holiday = findHolidayByDate(date, holidays);
      const isSpecial = holiday && isActiveSchoolEvent(holiday.category);
      const isRealHol = holiday && isRealHoliday(holiday.category);

      return {
        meetingNumber: idx + 1,
        date,
        session,
        holiday,
        isSpecial,
        isRealHoliday: isRealHol,
        topic: session?.topic || null,
        learningActivities: session?.learningActivities || null,
        note: session?.note || null,
        hadirCount: session
          ? savedRecords.filter(
              (r) => r.sessionId === session.id && r.status === "HADIR"
            ).length
          : null,
        totalCount: session
          ? savedRecords.filter((r) => r.sessionId === session.id).length
          : null,
      };
    });
  }, [recapData.effectiveDates, savedSessions, savedRecords, currentClass.id, holidays]);

  // Ekspor Excel (.xlsx) dengan Kop Surat Resmi Sekolah & Jurnal Agenda
  const handleExportExcel = (targetClass: Class = currentClass) => {
    const data =
      targetClass.id === currentClass.id
        ? recapData
        : computeRecapForClass(targetClass, selectedMonth, holidays, savedSessions, savedRecords);

    const xlsxBuffer = generateAttendanceXlsxWithKop(
      targetClass,
      currentMonthLabel,
      data.effectiveDates,
      data.students,
      holidays,
      {},
      savedSessions
    );

    const filename = `Daftar_Hadir_Kelas_${targetClass.name}_${selectedMonth}_SMPN3Cibungbulang.xlsx`;
    downloadXlsxFile(xlsxBuffer, filename);

    setToastMessage(`Berkas Excel (.xlsx) Ber-Kop Kelas ${targetClass.name} berhasil diunduh`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ekspor CSV Native dengan UTF-8 BOM, Kop Surat Resmi Sekolah & Jurnal Agenda
  const handleExportCsv = (targetClass: Class = currentClass) => {
    const data =
      targetClass.id === currentClass.id
        ? recapData
        : computeRecapForClass(targetClass, selectedMonth, holidays, savedSessions, savedRecords);

    const csvContent = generateAttendanceCsvWithKop(
      targetClass,
      currentMonthLabel,
      data.effectiveDates,
      data.students,
      holidays,
      {},
      savedSessions
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Daftar_Hadir_Kelas_${targetClass.name}_${selectedMonth}_SMPN3Cibungbulang.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(`Berkas CSV Ber-Kop Kelas ${targetClass.name} berhasil diunduh`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ekspor Seluruh Kelas Sekaligus (Batch Export)
  const handleExportAllClasses = async (format: "xlsx" | "csv" | "xls") => {
    setIsExportDropdownOpen(false);
    setToastMessage(`Memproses ekspor 10 kelas (${format.toUpperCase()})...`);

    for (let i = 0; i < MOCK_CLASSES.length; i++) {
      const cls = MOCK_CLASSES[i];
      if (format === "csv") {
        handleExportCsv(cls);
      } else {
        handleExportExcel(cls);
      }
      // Jeda antar pengunduhan agar tidak diblokir browser
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setToastMessage(`Semua 10 kelas (${format.toUpperCase()}) berhasil diunduh dengan Kop Surat!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Cetak Dokumen via Native Window Print (PRD §5 FR-8)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-5 print:p-0">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--status-hadir-fg)] text-white px-4 py-2.5 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-4 print:hidden">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman & Aksi Cepat */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Rekap Kehadiran
            </h1>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-[8px] bg-[var(--surface-card)] text-[var(--color-accent)] font-mono font-bold border border-[var(--border-hairline)] shadow-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer"
            >
              {MOCK_CLASSES.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Kelas {cls.name} ({cls.scheduleDay} · {cls.schedulePeriod})
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Informatika · SMP Negeri 3 Cibungbulang · Muhamad Rizky Aprian, S.Kom
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Ekspor Excel Ber-Kop Resmi */}
          <button
            type="button"
            onClick={() => handleExportExcel(currentClass)}
            className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
            title="Unduh berkas Excel (.xlsx) dengan Kop Surat Resmi SMPN 3 Cibungbulang"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          {/* Tombol Ekspor CSV Ber-Kop Resmi */}
          <button
            type="button"
            onClick={() => handleExportCsv(currentClass)}
            className="min-h-[44px] px-3.5 py-2 bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--text-primary)] border border-[var(--border-hairline)] rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
            title="Unduh berkas CSV dengan Kop Surat Resmi"
          >
            <Download className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Ekspor CSV</span>
          </button>

          {/* Menu Dropdown Ekspor Kolektif Semua Kelas */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="min-h-[44px] px-3 py-2 bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--text-primary)] border border-[var(--border-hairline)] rounded-[10px] text-xs font-semibold flex items-center gap-1 transition-all shadow-xs active:scale-[0.98]"
            >
              <Layers className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Semua Kelas</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            </button>

            {isExportDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsExportDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[12px] shadow-lg py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-[var(--border-hairline)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Ekspor Kolektif (10 Kelas)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportAllClasses("xlsx")}
                    className="w-full px-3 py-2 text-left hover:bg-[var(--surface-recessed)] flex items-center gap-2 text-[var(--text-primary)] transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">Unduh Excel Semua Kelas</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">7A–7H, 8A, 8B (.xlsx ber-kop)</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportAllClasses("csv")}
                    className="w-full px-3 py-2 text-left hover:bg-[var(--surface-recessed)] flex items-center gap-2 text-[var(--text-primary)] transition-colors"
                  >
                    <Download className="w-4 h-4 text-[var(--color-accent)]" />
                    <div>
                      <div className="font-semibold">Unduh CSV Semua Kelas</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">7A–7H, 8A, 8B (.csv ber-kop)</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tombol Cetak Native */}
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[44px] px-3.5 py-2 bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--text-primary)] border border-[var(--border-hairline)] rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Cetak</span>
          </button>
        </div>
      </header>

      {/* Tampilan Header Khusus Cetak (Hanya tampil saat print) */}
      <div className="hidden print:block mb-4 border-b-2 border-black pb-3 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wider">
          DAFTAR HADIR SISWA KELAS {currentClass.name.toUpperCase()}
        </h1>
        <h2 className="text-base font-bold uppercase tracking-wide">
          SMP NEGERI 3 CIBUNGBULANG KABUPATEN BOGOR
        </h2>
        <p className="text-xs font-semibold">
          TAHUN PELAJARAN {currentClass.academicYear}
        </p>
        <p className="text-xs text-gray-700 mt-1">
          Mata Pelajaran: <strong>{currentClass.subject || "Informatika"}</strong> | Semester: <strong>{currentClass.semester ?? 1} (Ganjil)</strong> | Bulan: <strong>{currentMonthLabel}</strong>
        </p>
      </div>

      {/* Navigasi Periode Bulan Interaktif */}
      <div className="p-3 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex items-center justify-between shadow-xs print:hidden">
        <button
          type="button"
          disabled={monthIndex <= 0}
          onClick={() => {
            if (monthIndex > 0) {
              const prev = monthIndex - 1;
              setMonthIndex(prev);
              setSelectedMonth(SEMESTER_MONTHS[prev].value);
            }
          }}
          className={`w-9 h-9 rounded-[8px] flex items-center justify-center transition-colors ${
            monthIndex <= 0
              ? "opacity-30 cursor-not-allowed bg-[var(--surface-recessed)] text-[var(--text-secondary)]"
              : "bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-[var(--text-primary)] cursor-pointer"
          }`}
          aria-label="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center">
          <select
            value={selectedMonth}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedMonth(val);
              const idx = SEMESTER_MONTHS.findIndex((m) => m.value === val);
              if (idx !== -1) setMonthIndex(idx);
            }}
            className="font-bold text-sm text-[var(--text-primary)] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-[8px] px-3 py-1 shadow-xs"
          >
            {SEMESTER_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-mono">
            Tahun Ajaran 2026/2027 · Semester Ganjil
          </p>
        </div>

        <button
          type="button"
          disabled={monthIndex >= SEMESTER_MONTHS.length - 1}
          onClick={() => {
            if (monthIndex < SEMESTER_MONTHS.length - 1) {
              const next = monthIndex + 1;
              setMonthIndex(next);
              setSelectedMonth(SEMESTER_MONTHS[next].value);
            }
          }}
          className={`w-9 h-9 rounded-[8px] flex items-center justify-center transition-colors ${
            monthIndex >= SEMESTER_MONTHS.length - 1
              ? "opacity-30 cursor-not-allowed bg-[var(--surface-recessed)] text-[var(--text-secondary)]"
              : "bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-[var(--text-primary)] cursor-pointer"
          }`}
          aria-label="Bulan Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Kartu Ikhtisar Kehadiran Bulanan */}
      <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-bold uppercase tracking-wider">
            Ikhtisar Bulanan
          </span>
          <span className="font-mono">
            {recapData.students.length} Siswa Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-hairline)] text-center">
          {/* Rata-rata */}
          <div className="p-2 rounded-[10px] bg-[var(--surface-recessed)]/50">
            <p className="text-[11px] text-[var(--text-secondary)]">Rata-rata</p>
            <p className="text-lg md:text-xl font-extrabold text-[var(--status-hadir-fg)] font-tabular">
              {recapData.averageAttendance}%
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">Target: 90%</p>
          </div>

          {/* Hari Efektif */}
          <div className="p-2 rounded-[10px] bg-[var(--surface-recessed)]/50">
            <p className="text-[11px] text-[var(--text-secondary)]">Hari Belajar</p>
            <p className="text-lg md:text-xl font-extrabold text-[var(--text-primary)] font-tabular">
              {recapData.effectiveDates.length} Hari
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">4 Pekan KBM</p>
          </div>

          {/* Perhatian */}
          <div className="p-2 rounded-[10px] bg-[var(--surface-recessed)]/50">
            <p className="text-[11px] text-[var(--text-secondary)]">Perhatian</p>
            <p className="text-lg md:text-xl font-extrabold text-[var(--status-alpa-fg)] font-tabular">
              {studentsNeedingAttention.length} Siswa
            </p>
            <p className="text-[10px] text-[var(--status-alpa-fg)] font-medium">
              &lt; 85% Hadir
            </p>
          </div>
        </div>

        {/* Peringatan Siswa Perlu Perhatian */}
        {studentsNeedingAttention.length > 0 && (
          <div className="p-3 bg-[var(--status-alpa-bg)]/60 border border-[var(--status-alpa-fg)]/20 rounded-[10px] flex items-start gap-2.5 text-xs text-[var(--status-alpa-fg)]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {studentsNeedingAttention.map((s) => s.fullName).join(", ")}
              </span>{" "}
              memiliki persentase kehadiran di bawah ambang batas (
              {studentsNeedingAttention[0]?.persentaseKehadiran}%). Disarankan tindak lanjut koordinasi dengan Guru BP/BK.
            </div>
          </div>
        )}
      </div>

      {/* Panduan Kode Kehadiran */}
      <div className="flex items-center gap-2 text-xs flex-wrap px-1">
        <span className="text-[var(--text-secondary)] font-bold">KODE:</span>
        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] font-mono font-bold">
          H (Hadir)
        </span>
        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)] font-mono font-bold">
          S (Sakit)
        </span>
        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--status-izin-bg)] text-[var(--status-izin-fg)] font-mono font-bold">
          I (Izin)
        </span>
        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-mono font-bold">
          A (Alpa)
        </span>
        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--status-dispen-bg)] text-[var(--status-dispen-fg)] font-mono font-bold">
          D (Dispensasi)
        </span>
        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--surface-recessed)] text-[var(--text-secondary)] font-mono font-bold border border-[var(--border-hairline)]">
          L (Libur Sekolah)
        </span>
        <span className="px-2 py-0.5 rounded-[4px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono font-bold border border-purple-200 dark:border-purple-800">
          UTS / UAS / P5 (Tetap Masuk &amp; Diabsen)
        </span>
      </div>

      {/* Matriks Presensi Harian (Tabel Scrollable Horizontal dengan Kolom Sticky) */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] overflow-hidden shadow-xs">
        <div className="p-3 bg-[var(--surface-recessed)] border-b border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-bold text-[var(--text-primary)]">
            Matriks Presensi Harian
          </span>
          <span className="text-[11px] italic">
            Geser tabel ke kanan untuk melihat seluruh tanggal &rarr;
          </span>
        </div>

        {/* Kontainer Scroll Terisolasi (Anti-Leak SOP §7.5) */}
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-recessed)]/50 border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                {/* Kolom Sticky Kiri untuk Nomor & Nama */}
                <th className="sticky left-0 z-10 bg-[var(--surface-card)] p-2.5 font-bold min-w-[160px] border-r border-[var(--border-hairline)] shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                  No. &amp; Nama Siswa
                </th>

                {/* Kolom Tanggal-Tanggal Efektif */}
                {recapData.effectiveDates.map((date) => {
                  const hol = findHolidayByDate(date, holidays);
                  const isSpecial = hol?.category === "UTS" || hol?.category === "UAS" || hol?.category === "KOKURIKULER";
                  const badgeText = hol?.category === "UTS" ? "UTS" : hol?.category === "UAS" ? "UAS" : hol?.category === "KOKURIKULER" ? "P5" : "L";

                  return (
                    <th
                      key={date}
                      title={hol ? `${getCategoryLabel(hol.category)}: ${hol.name}` : `Tanggal ${date}`}
                      className={`p-2 text-center font-mono font-semibold min-w-[34px] border-r border-[var(--border-hairline)]/60 text-[11px] ${
                        isSpecial
                          ? "bg-purple-100/70 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300 font-bold"
                          : hol
                          ? "bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-bold"
                          : ""
                      }`}
                    >
                      <span>{date.slice(8)}</span>
                      {hol && (
                        <span className={`block text-[8px] leading-tight font-sans uppercase font-extrabold ${
                          isSpecial ? "text-purple-700 dark:text-purple-300" : ""
                        }`}>
                          {badgeText}
                        </span>
                      )}
                    </th>
                  );
                })}

                {/* Kolom Ringkasan Total */}
                <th className="p-2 text-center font-bold text-[var(--status-hadir-fg)] min-w-[28px] border-l border-[var(--border-hairline)]" title="Hadir">
                  H
                </th>
                <th className="p-2 text-center font-bold text-[var(--status-sakit-fg)] min-w-[28px]" title="Sakit">
                  S
                </th>
                <th className="p-2 text-center font-bold text-[var(--status-izin-fg)] min-w-[28px]" title="Izin">
                  I
                </th>
                <th className="p-2 text-center font-bold text-[var(--status-alpa-fg)] min-w-[28px]" title="Alpa">
                  A
                </th>
                <th className="p-2 text-center font-bold text-[var(--status-dispen-fg)] min-w-[28px]" title="Dispensasi">
                  D
                </th>
                <th className="p-2 text-center font-bold text-[var(--text-primary)] min-w-[50px] border-l border-[var(--border-hairline)]">
                  %
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-hairline)]">
              {recapData.students.map((student, idx) => {
                const indexStr = String(idx + 1).padStart(2, "0");
                const isWarning = student.needsAttention;

                return (
                  <tr
                    key={student.studentId}
                    className={`hover:bg-[var(--surface-recessed)]/40 transition-colors ${
                      isWarning ? "bg-[var(--status-alpa-bg)]/20" : ""
                    }`}
                  >
                    {/* Kolom Sticky Nama Siswa */}
                    <td
                      className={`sticky left-0 z-10 p-2.5 font-medium border-r border-[var(--border-hairline)] shadow-[2px_0_4px_rgba(0,0,0,0.02)] truncate max-w-[180px] ${
                        isWarning
                          ? "bg-[#FEF6F5]"
                          : "bg-[var(--surface-card)]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                          {indexStr}
                        </span>
                        <div className="truncate">
                          <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                            {student.fullName}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                              {student.nis}
                            </span>
                            {isWarning && (
                              <span className="text-[9px] px-1 py-0.2 rounded-[3px] bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-bold">
                                Perhatian
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sel Status Tiap Tanggal */}
                    {recapData.effectiveDates.map((date) => {
                      const code = student.dailyStatus[date] ?? "-";

                      return (
                        <td
                          key={date}
                          className="p-1 text-center border-r border-[var(--border-hairline)]/50"
                        >
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-[4px] font-mono text-[11px] font-bold ${
                              code === "L"
                                ? "bg-[var(--surface-recessed)] text-[var(--text-secondary)] border border-[var(--border-hairline)]"
                                : code === "H"
                                ? "bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)]"
                                : code === "S"
                                ? "bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)]"
                                : code === "I"
                                ? "bg-[var(--status-izin-bg)] text-[var(--status-izin-fg)]"
                                : code === "A"
                                ? "bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)]"
                                : code === "T"
                                ? "bg-amber-100 text-amber-800"
                                : code === "D"
                                ? "bg-[var(--status-dispen-bg)] text-[var(--status-dispen-fg)] ring-1 ring-[var(--status-dispen-fg)]/30 font-bold"
                                : "text-[var(--text-secondary)]/50 font-normal"
                            }`}
                          >
                            {code}
                          </span>
                        </td>
                      );
                    })}

                    {/* Total Angka & Persentase */}
                    <td className="p-2 text-center font-mono font-semibold text-[var(--status-hadir-fg)] border-l border-[var(--border-hairline)]">
                      {student.hadir}
                    </td>
                    <td className="p-2 text-center font-mono font-semibold text-[var(--status-sakit-fg)]">
                      {student.sakit}
                    </td>
                    <td className="p-2 text-center font-mono font-semibold text-[var(--status-izin-fg)]">
                      {student.izin}
                    </td>
                    <td className="p-2 text-center font-mono font-semibold text-[var(--status-alpa-fg)]">
                      {student.alpa}
                    </td>
                    <td className="p-2 text-center font-mono font-semibold text-[var(--status-dispen-fg)]">
                      {student.dispen}
                    </td>
                    <td
                      className={`p-2 text-center font-mono font-bold border-l border-[var(--border-hairline)] ${
                        isWarning
                          ? "text-[var(--status-alpa-fg)]"
                          : "text-[var(--status-hadir-fg)]"
                      }`}
                    >
                      {student.persentaseKehadiran}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seksi Jurnal Agenda Pembelajaran & Materi KBM */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] overflow-hidden shadow-xs">
        <div className="p-3 bg-[var(--surface-recessed)] border-b border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="font-bold text-[var(--text-primary)]">
              Jurnal Agenda Pembelajaran &amp; Materi KBM Bulan {currentMonthLabel}
            </span>
          </div>
          <span className="text-[11px] font-mono">
            Kelas {currentClass.name} · {monthlyAgendas.length} Pertemuan
          </span>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-recessed)]/50 border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                <th className="p-2.5 font-bold w-12 text-center border-r border-[var(--border-hairline)]">Temu</th>
                <th className="p-2.5 font-bold min-w-[130px] border-r border-[var(--border-hairline)]">Hari &amp; Tanggal</th>
                <th className="p-2.5 font-bold min-w-[120px] border-r border-[var(--border-hairline)]">Status / Kategori</th>
                <th className="p-2.5 font-bold min-w-[200px] border-r border-[var(--border-hairline)]">Materi / Topik Pembelajaran</th>
                <th className="p-2.5 font-bold min-w-[240px] border-r border-[var(--border-hairline)]">Uraian Kegiatan &amp; Refleksi KBM</th>
                <th className="p-2.5 font-bold text-center min-w-[90px]">Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {monthlyAgendas.map((item) => (
                <tr key={item.date} className="hover:bg-[var(--surface-recessed)]/40 transition-colors">
                  <td className="p-2.5 text-center font-mono font-bold text-[var(--color-accent)] border-r border-[var(--border-hairline)]">
                    #{item.meetingNumber}
                  </td>
                  <td className="p-2.5 font-semibold text-[var(--text-primary)] border-r border-[var(--border-hairline)] whitespace-nowrap">
                    {formatIndonesianDate(item.date)}
                  </td>
                  <td className="p-2.5 border-r border-[var(--border-hairline)]">
                    {item.isRealHoliday ? (
                      <span className="px-2 py-0.5 rounded-[4px] bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-bold text-[11px]">
                        Libur: {item.holiday?.name}
                      </span>
                    ) : item.isSpecial ? (
                      <span className="px-2 py-0.5 rounded-[4px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-800">
                        {item.holiday?.category === "UTS" ? "Pekan UTS" : item.holiday?.category === "UAS" ? "Pekan UAS" : "Kokurikuler (P5)"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-[4px] bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] font-bold text-[11px]">
                        KBM Normal
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 border-r border-[var(--border-hairline)] font-medium text-[var(--text-primary)]">
                    {item.topic ? (
                      <span>{item.topic}</span>
                    ) : item.isRealHoliday ? (
                      <span className="italic text-[var(--text-secondary)]">Tidak ada KBM (Hari Libur)</span>
                    ) : (
                      <span className="italic text-[var(--text-tertiary)]">Belum ada catatan materi</span>
                    )}
                  </td>
                  <td className="p-2.5 border-r border-[var(--border-hairline)] text-[var(--text-secondary)]">
                    {item.learningActivities ? (
                      <span>{item.learningActivities}</span>
                    ) : (
                      <span className="italic text-[var(--text-tertiary)]">-</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center font-mono">
                    {item.hadirCount !== null ? (
                      <span className="font-semibold text-[var(--status-hadir-fg)]">
                        {item.hadirCount}/{item.totalCount} Hadir
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blok Tanda Tangan Cetak (Kop Bawah) */}
      <div className="hidden print:flex justify-between items-start mt-8 pt-4 px-6 text-xs text-black">
        <div className="text-left">
          <p>Mengetahui,</p>
          <p className="font-semibold">Kepala SMP Negeri 3 Cibungbulang</p>
          <div className="h-16"></div>
          <p className="font-bold underline">( ............................................................ )</p>
          <p>NIP. ........................................................</p>
        </div>
        <div className="text-right">
          <p>Cibungbulang, {formatIndonesianDate(new Date().toISOString().slice(0, 10))}</p>
          <p className="font-semibold">Guru Mata Pelajaran Informatika,</p>
          <div className="h-16"></div>
          <p className="font-bold underline">Muhamad Rizky Aprian, S.Kom</p>
          <p>NIP. 19940825 202221 1 004</p>
        </div>
      </div>

      {/* Footer Berita Acara Rekap */}
      <footer className="text-center text-xs text-[var(--text-secondary)] py-2 border-t border-[var(--border-hairline)] mt-2 print:hidden">
        Dicetak secara otomatis oleh Sistem Buku Presensi Digital · SMP Negeri 3 Cibungbulang
      </footer>
    </div>
  );
}
