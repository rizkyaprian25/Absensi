"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  MOCK_CLASSES,
  MOCK_STUDENTS_8B,
} from "@/contracts/mocks/attendanceMocks";
import { AttendanceStatus } from "@/contracts/attendance";

interface StudentAttendanceState {
  status: AttendanceStatus;
  note?: string;
}

/**
 * Layar Inti: Pencatatan Absensi Kelas (L3 Stitch)
 * Dioptimalkan untuk pengoperasian satu tangan guru di kelas
 */
export default function AttendanceTakingPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  // Dapatkan informasi kelas (fallback ke VIII-B jika mock)
  const currentClass =
    MOCK_CLASSES.find((c) => c.id === classId) ?? MOCK_CLASSES[1];

  // State pencarian siswa
  const [searchQuery, setSearchQuery] = useState("");

  // State absensi lokal: Default semua Hadir (pre-filled sesuai SOP & PRD §4 Q3)
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, StudentAttendanceState>
  >(() => {
    const initial: Record<string, StudentAttendanceState> = {};
    MOCK_STUDENTS_8B.forEach((student) => {
      // Data awal realistis: Dimas Sakit, Farhan Izin, lainnya Hadir
      if (student.fullName === "Dimas Anggara") {
        initial[student.id] = { status: "SAKIT", note: "Surat dokter" };
      } else if (student.fullName === "Farhan Maulana") {
        initial[student.id] = { status: "IZIN", note: "Dispensasi OSIS" };
      } else {
        initial[student.id] = { status: "HADIR" };
      }
    });
    return initial;
  });

  // State toast notifikasi simpan
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

    return { hadir, sakit, izin, alpa, terlambat, total: MOCK_STUDENTS_8B.length };
  }, [attendanceMap]);

  // Filter siswa berdasarkan input pencarian
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_STUDENTS_8B;
    const query = searchQuery.toLowerCase();
    return MOCK_STUDENTS_8B.filter(
      (s) =>
        s.fullName.toLowerCase().includes(query) ||
        (s.nis && s.nis.toLowerCase().includes(query))
    );
  }, [searchQuery]);

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

  // Aksi simpan absensi (idempoten)
  const handleSaveAttendance = () => {
    setIsSaving(true);
    // Simulasi penyimpanan lokal / optimistic update
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage(`Presensi ${currentClass.name} berhasil disimpan`);
      setTimeout(() => {
        router.push("/");
      }, 1200);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Toast Notifikasi Sukses Simpan */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--status-hadir-fg)] text-white px-4 py-2.5 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman & Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px] py-2 px-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-hairline)] text-[var(--text-secondary)] font-mono">
          <Calendar className="w-3.5 h-3.5" />
          <span>29/09/2026</span>
        </div>
      </div>

      {/* Judul Kelas & Info Sesi */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Presensi Kelas {currentClass.name}
          </h1>
          <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#E3F3EA] text-[#146C43] font-semibold">
            Smt Ganjil
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Matematika Wajib · Jam Ke 1–2 (07.15 – 08.45)
        </p>
      </div>

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

      {/* Input Pencarian Siswa */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari siswa atau NISN..."
          className="w-full min-h-[44px] pl-9 pr-4 py-2 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all shadow-xs"
        />
      </div>

      {/* Subheader Daftar Siswa */}
      <div className="flex items-center justify-between px-1 text-xs text-[var(--text-secondary)]">
        <span className="font-bold uppercase tracking-wider">
          Daftar Presensi Harian
        </span>
        <span className="font-mono bg-[var(--surface-recessed)] px-2 py-0.5 rounded-[6px]">
          {MOCK_STUDENTS_8B.length} Siswa Terdaftar
        </span>
      </div>

      {/* Daftar Ruled List Siswa (Ledger Style) */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
            Tidak ada nama siswa yang cocok dengan &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredStudents.map((student, index) => {
            const currentStatus =
              attendanceMap[student.id]?.status ?? "HADIR";
            const note = attendanceMap[student.id]?.note;
            const indexStr = String(index + 1).padStart(2, "0");

            return (
              <div
                key={student.id}
                className="p-3.5 flex items-center justify-between gap-2 hover:bg-[var(--surface-recessed)]/50 transition-colors"
              >
                {/* Sisi Kiri: Nomor Urut & Identitas Siswa */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="font-mono text-xs text-[var(--text-secondary)] w-6 text-center shrink-0">
                    {indexStr}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {student.fullName}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        NIS {student.nis}
                      </span>
                      {note && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)] font-medium">
                          {note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sisi Kanan: Kontrol Status 4-Kotak Segmen (Hit Target >= 44px) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Hadir */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "HADIR")}
                    aria-label={`Tandai Hadir untuk ${student.fullName}`}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-[8px] flex items-center justify-center font-bold text-xs transition-all ${
                      currentStatus === "HADIR"
                        ? "bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)] ring-2 ring-[var(--status-hadir-fg)] shadow-xs"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:bg-[var(--border-hairline)]"
                    }`}
                  >
                    H
                  </button>

                  {/* Sakit */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "SAKIT")}
                    aria-label={`Tandai Sakit untuk ${student.fullName}`}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-[8px] flex items-center justify-center font-bold text-xs transition-all ${
                      currentStatus === "SAKIT"
                        ? "bg-[var(--status-sakit-bg)] text-[var(--status-sakit-fg)] ring-2 ring-[var(--status-sakit-fg)] shadow-xs"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:bg-[var(--border-hairline)]"
                    }`}
                  >
                    S
                  </button>

                  {/* Izin */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "IZIN")}
                    aria-label={`Tandai Izin untuk ${student.fullName}`}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-[8px] flex items-center justify-center font-bold text-xs transition-all ${
                      currentStatus === "IZIN"
                        ? "bg-[var(--status-izin-bg)] text-[var(--status-izin-fg)] ring-2 ring-[var(--status-izin-fg)] shadow-xs"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:bg-[var(--border-hairline)]"
                    }`}
                  >
                    I
                  </button>

                  {/* Alpa */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "ALPA")}
                    aria-label={`Tandai Alpa untuk ${student.fullName}`}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-[8px] flex items-center justify-center font-bold text-xs transition-all ${
                      currentStatus === "ALPA"
                        ? "bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)] ring-2 ring-[var(--status-alpa-fg)] shadow-xs"
                        : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:bg-[var(--border-hairline)]"
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

      {/* Catatan Validasi Guru */}
      <div className="p-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[14px] flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <FileCheck className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
        <span>Validasi Wali Kelas: Bu Rina, S.Pd. · 07.42 WIB</span>
      </div>

      {/* Bilah Aksi Bawah Mengambang (Floating Action Bar dengan Glass Blur) */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-20 bg-[var(--bg-page)]/90 backdrop-blur-md border-t border-[var(--border-hairline)] p-3 md:p-4">
        <div className="w-full max-w-md mx-auto md:max-w-4xl flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="min-h-[44px] px-3.5 py-2 rounded-[10px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-[var(--text-primary)] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <CheckCheck className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Semua hadir</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAttendance}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-[10px] bg-[var(--color-accent)] text-[var(--color-on-accent)] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSaving
                ? "Menyimpan..."
                : `Simpan Presensi (${MOCK_STUDENTS_8B.length})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
