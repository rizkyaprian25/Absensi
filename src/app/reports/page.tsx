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
} from "lucide-react";
import {
  MOCK_CLASSES,
  getStudentsForClass,
} from "@/contracts/mocks/attendanceMocks";
import { HolidayItem } from "@/contracts/attendance";
import { getStoredHolidays, findHolidayByDate } from "@/lib/calendarUtils";

/**
 * Halaman Rekapitulasi Bulanan & Ekspor (L8 Stitch)
 * Memuat matriks presensi siswa x tanggal, ringkasan persentase, ekspor CSV UTF-8 BOM, dan cetak native
 */
export default function ReportsPage() {
  const [selectedClassId, setSelectedClassId] = useState("class-7a");
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);

  useEffect(() => {
    setHolidays(getStoredHolidays());
  }, []);

  const currentClass =
    MOCK_CLASSES.find((c) => c.id === selectedClassId) ?? MOCK_CLASSES[0];

  // Ambil data siswa otentik untuk kelas terpilih
  const classStudents = useMemo(() => {
    return getStudentsForClass(selectedClassId);
  }, [selectedClassId]);

  // Data rekapitulasi bulanan dinamis sesuai kelas yang dipilih & hari libur
  const recapData = useMemo(() => {
    const effectiveDates = [
      "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04",
      "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11",
      "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18",
      "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25",
      "2026-09-28", "2026-09-29",
    ];
    const holidayDatesSet = new Set(holidays.map((h) => h.date));
    const kbmDaysCount = effectiveDates.filter((d) => !holidayDatesSet.has(d)).length;

    const studentRecaps = classStudents.map((s, idx) => {
      const isProblematic = idx === 11;
      const hadir = isProblematic
        ? Math.max(1, kbmDaysCount - 5)
        : idx % 5 === 0
        ? Math.max(1, kbmDaysCount - 1)
        : kbmDaysCount;
      const sakit = isProblematic ? 1 : idx % 5 === 0 ? 1 : 0;
      const izin = isProblematic ? 1 : 1;
      const alpa = isProblematic ? 3 : 0;
      const persentase = Number(((hadir / (kbmDaysCount || 1)) * 100).toFixed(1));

      return {
        studentId: s.id,
        nis: s.nis ?? null,
        fullName: s.fullName,
        hadir,
        sakit,
        izin,
        alpa,
        terlambat: 0,
        totalHari: kbmDaysCount,
        persentaseKehadiran: persentase,
        dailyStatus: {} as Record<string, string>,
        needsAttention: persentase < 85,
      };
    });

    const averageAttendance = Number(
      (
        studentRecaps.reduce((acc, curr) => acc + curr.persentaseKehadiran, 0) /
        (studentRecaps.length || 1)
      ).toFixed(1)
    );

    return {
      classId: selectedClassId,
      className: currentClass.name,
      academicYear: currentClass.academicYear,
      month: selectedMonth,
      effectiveDates,
      averageAttendance,
      students: studentRecaps,
    };
  }, [classStudents, selectedClassId, currentClass, selectedMonth, holidays]);

  // Hitung jumlah siswa yang perlu perhatian (< 85% kehadiran)
  const studentsNeedingAttention = useMemo(() => {
    return recapData.students.filter((s) => s.needsAttention);
  }, [recapData]);

  // Ekspor CSV Native dengan UTF-8 BOM (PRD §5 FR-8 & ADR-0004)
  const handleExportCsv = () => {
    const holidayDatesSet = new Set(holidays.map((h) => h.date));
    // Header CSV
    const headers = [
      "No",
      "NIS",
      "Nama Siswa",
      ...recapData.effectiveDates.map((d) => {
        const isHol = holidayDatesSet.has(d);
        return isHol ? `${d.slice(8)}(L)` : d.slice(8);
      }),
      "Hadir",
      "Sakit",
      "Izin",
      "Alpa",
      "Terlambat",
      "% Kehadiran",
    ];

    // Baris Siswa
    const rows = recapData.students.map((student, idx) => {
      const dailyCols = recapData.effectiveDates.map((date) => {
        if (holidayDatesSet.has(date)) return "L";
        if (student.needsAttention) {
          if (date.endsWith("04") || date.endsWith("11") || date.endsWith("18") || date.endsWith("25")) return "A";
          if (date.endsWith("08")) return "S";
          if (date.endsWith("15")) return "I";
        }
        return "H";
      });

      return [
        idx + 1,
        student.nis ?? "-",
        `"${student.fullName}"`,
        ...dailyCols,
        student.hadir,
        student.sakit,
        student.izin,
        student.alpa,
        student.terlambat,
        `"${student.persentaseKehadiran}%"`,
      ].join(",");
    });

    // Metadata & Konten CSV dengan UTF-8 BOM (\uFEFF)
    const csvContent =
      "\uFEFF" +
      [
        `"REKAP PRESENSI KELAS ${currentClass.name} - BULAN SEPTEMBER 2026"`,
        `"Tahun Ajaran: ${currentClass.academicYear} | Semester: ${currentClass.semester ?? 1}"`,
        `"Rata-rata Kehadiran Kelas: ${recapData.averageAttendance}%"`,
        "",
        headers.join(","),
        ...rows,
      ].join("\r\n");

    // Unduh berkas via Blob Native
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `rekap-presensi-${currentClass.name.toLowerCase()}-${selectedMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage("Berkas CSV berhasil diunduh (format Excel)");
    setTimeout(() => setToastMessage(null), 3000);
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[44px] px-3.5 py-2 bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--text-primary)] border border-[var(--border-hairline)] rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Unduh CSV</span>
          </button>
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
      <div className="hidden print:block mb-4 border-b pb-2">
        <h1 className="text-xl font-bold">
          LAPORAN REKAPITULASI PRESENSI SISWA
        </h1>
        <p className="text-sm">
          Kelas: {currentClass.name} | Periode: September 2026 | Tahun Ajaran: {currentClass.academicYear}
        </p>
      </div>

      {/* Navigasi Periode Bulan */}
      <div className="p-3 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex items-center justify-between shadow-xs print:hidden">
        <button
          type="button"
          className="w-9 h-9 rounded-[8px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] flex items-center justify-center text-[var(--text-primary)] transition-colors"
          aria-label="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <p className="font-bold text-sm text-[var(--text-primary)]">
            September 2026
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Tahun Ajaran 2026/2027 · Semester Ganjil
          </p>
        </div>

        <button
          type="button"
          className="w-9 h-9 rounded-[8px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] flex items-center justify-center text-[var(--text-primary)] transition-colors"
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
                  return (
                    <th
                      key={date}
                      title={hol ? `Hari Libur: ${hol.name}` : `Tanggal ${date}`}
                      className={`p-2 text-center font-mono font-semibold min-w-[32px] border-r border-[var(--border-hairline)]/60 text-[11px] ${
                        hol ? "bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] font-bold" : ""
                      }`}
                    >
                      <span>{date.slice(8)}</span>
                      {hol && <span className="block text-[8px] leading-tight font-sans">L</span>}
                    </th>
                  );
                })}

                {/* Kolom Ringkasan Total */}
                <th className="p-2 text-center font-bold text-[var(--status-hadir-fg)] min-w-[28px] border-l border-[var(--border-hairline)]">
                  H
                </th>
                <th className="p-2 text-center font-bold text-[var(--status-sakit-fg)] min-w-[28px]">
                  S
                </th>
                <th className="p-2 text-center font-bold text-[var(--status-izin-fg)] min-w-[28px]">
                  I
                </th>
                <th className="p-2 text-center font-bold text-[var(--status-alpa-fg)] min-w-[28px]">
                  A
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
                      const isHoliday = Boolean(findHolidayByDate(date, holidays));
                      let cellStatus: "HADIR" | "SAKIT" | "IZIN" | "ALPA" | "LIBUR" = "HADIR";
                      if (isHoliday) {
                        cellStatus = "LIBUR";
                      } else if (student.needsAttention) {
                        if (
                          date.endsWith("04") ||
                          date.endsWith("11") ||
                          date.endsWith("18") ||
                          date.endsWith("25")
                        ) {
                          cellStatus = "ALPA";
                        } else if (date.endsWith("08")) {
                          cellStatus = "SAKIT";
                        } else if (date.endsWith("15")) {
                          cellStatus = "IZIN";
                        }
                      }

                      return (
                        <td
                          key={date}
                          className="p-1 text-center border-r border-[var(--border-hairline)]/50"
                        >
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-[4px] font-mono text-[11px] font-bold ${
                              cellStatus === "LIBUR"
                                ? "bg-[var(--surface-recessed)] text-[var(--text-secondary)] border border-[var(--border-hairline)]"
                                : cellStatus === "HADIR"
                                ? "bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)]"
                                : cellStatus === "SAKIT"
                                ? "bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)]"
                                : cellStatus === "IZIN"
                                ? "bg-[var(--status-izin-bg)] text-[var(--status-izin-fg)]"
                                : "bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)]"
                            }`}
                          >
                            {cellStatus === "LIBUR"
                              ? "L"
                              : cellStatus === "HADIR"
                              ? "H"
                              : cellStatus === "SAKIT"
                              ? "S"
                              : cellStatus === "IZIN"
                              ? "I"
                              : "A"}
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

      {/* Footer Berita Acara Rekap */}
      <footer className="text-center text-xs text-[var(--text-secondary)] py-2 border-t border-[var(--border-hairline)] mt-2">
        Dicetak secara otomatis oleh Sistem Buku Presensi Digital · Terakhir diperbarui: 29 Sep 2026, 14:00 WIB
      </footer>
    </div>
  );
}
