"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserMinus,
  Search,
  Filter,
  ArrowLeft,
  BookOpen,
  FileText,
  RotateCcw,
  Printer,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  School,
  Calendar,
  GraduationCap,
  Download,
  Info,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Toast } from "@/components/ui/Toast";
import { MOCK_CLASSES } from "@/contracts/mocks/attendanceMocks";
import type { Student } from "@/contracts/attendance";
import type {
  StudentMutationRecord,
  StudentMutationReasonCategory,
  StudentAcademicStatus,
} from "@/contracts/academic";
import {
  getStoredDynamicStudentsMap,
  getStoredStudentMutations,
  deactivateStudentWithMutation,
  reactivateStudentFromMutation,
  getStudentHistoricalAuditData,
  STORAGE_KEY_ALUMNI_STUDENTS,
  type AlumniStudentRecord,
} from "@/lib/rolloverStorage";

const REASON_CATEGORIES: { value: StudentMutationReasonCategory; label: string }[] = [
  { value: "PINDAH_SEKOLAH", label: "Pindah Sekolah (Mutasi Keluar)" },
  { value: "IKUT_ORANG_TUA", label: "Mengikuti Kepindahan Orang Tua / Domisili" },
  { value: "MENGUNDURKAN_DIRI", label: "Mengundurkan Diri atas Kemauan Sendiri" },
  { value: "PELANGGARAN_DISIPLIN", label: "Dikeluarkan Akibat Pelanggaran Berat Tata Tertib" },
  { value: "WAFAT", label: "Meninggal Dunia (Wafat)" },
  { value: "LAINNYA", label: "Alasan Administratif Lainnya" },
];

export default function AdminStudentsArchivePage() {
  const { currentUser, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "MUTATED" | "ALUMNI">("ACTIVE");

  // State data
  const [studentsMap, setStudentsMap] = useState<Record<string, Student[]>>({});
  const [mutations, setMutations] = useState<StudentMutationRecord[]>([]);
  const [alumni, setAlumni] = useState<AlumniStudentRecord[]>([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>("ALL");

  // Modal State
  const [mutatingStudent, setMutatingStudent] = useState<{
    student: Student;
    classId: string;
    className: string;
  } | null>(null);
  const [mutationDate, setMutationDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [reasonCategory, setReasonCategory] = useState<StudentMutationReasonCategory>("PINDAH_SEKOLAH");
  const [reasonDetail, setReasonDetail] = useState("");
  const [destinationSchool, setDestinationSchool] = useState("");
  const [referenceLetterNo, setReferenceLetterNo] = useState("");

  // Modal Rekam Jejak Audit Dinas / Buku Induk
  const [auditTarget, setAuditTarget] = useState<{
    record: StudentMutationRecord;
    historicalData: ReturnType<typeof getStudentHistoricalAuditData>;
  } | null>(null);

  // Modal Konfirmasi Pemulihan
  const [reactivatingMutation, setReactivatingMutation] = useState<StudentMutationRecord | null>(null);

  // Notifikasi Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshAllData = () => {
    if (typeof window === "undefined") return;
    setStudentsMap(getStoredDynamicStudentsMap());
    setMutations(getStoredStudentMutations());

    try {
      const rawAlumni = localStorage.getItem(STORAGE_KEY_ALUMNI_STUDENTS);
      if (rawAlumni) setAlumni(JSON.parse(rawAlumni));
    } catch (e) {
      console.warn("Gagal membaca data alumni:", e);
    }
  };

  useEffect(() => {
    setMounted(true);
    refreshAllData();
  }, []);

  // Daftar Siswa Aktif Terfilter
  const activeStudentsList = useMemo(() => {
    const list: Array<{ student: Student; classId: string; className: string }> = [];
    for (const [classId, arr] of Object.entries(studentsMap)) {
      if (selectedClassFilter !== "ALL" && classId !== selectedClassFilter) continue;
      const classObj = MOCK_CLASSES.find((c) => c.id === classId);
      const className = classObj?.name || classId;
      for (const s of arr) {
        list.push({ student: s, classId, className });
      }
    }

    if (!searchQuery.trim()) {
      return list.sort((a, b) => a.student.fullName.localeCompare(b.student.fullName, "id"));
    }

    const q = searchQuery.toLowerCase().trim();
    return list
      .filter(
        (item) =>
          item.student.fullName.toLowerCase().includes(q) ||
          (item.student.nis && item.student.nis.toLowerCase().includes(q)) ||
          item.className.toLowerCase().includes(q)
      )
      .sort((a, b) => a.student.fullName.localeCompare(b.student.fullName, "id"));
  }, [studentsMap, selectedClassFilter, searchQuery]);

  // Daftar Mutasi Terfilter
  const filteredMutations = useMemo(() => {
    return mutations.filter((m) => {
      const matchReason = selectedReasonFilter === "ALL" || m.reasonCategory === selectedReasonFilter;
      const matchQuery =
        !searchQuery.trim() ||
        m.studentName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        m.studentNis.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (m.destinationSchool && m.destinationSchool.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (m.referenceLetterNo && m.referenceLetterNo.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchReason && matchQuery;
    });
  }, [mutations, selectedReasonFilter, searchQuery]);

  // Daftar Alumni Terfilter
  const filteredAlumni = useMemo(() => {
    if (!searchQuery.trim()) return alumni;
    const q = searchQuery.toLowerCase().trim();
    return alumni.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.nis && a.nis.includes(q)) ||
        (a.lastClass && a.lastClass.toLowerCase().includes(q))
    );
  }, [alumni, searchQuery]);

  // Eksekusi Mutasi Siswa
  const handleExecuteMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutatingStudent) return;

    if (!reasonDetail.trim()) {
      setToastMessage("Mohon lengkapi catatan alasan mutasi/keluar siswa.");
      return;
    }

    const res = deactivateStudentWithMutation({
      studentId: mutatingStudent.student.id,
      classId: mutatingStudent.classId,
      status: "TRANSFERRED",
      mutationDate,
      reasonCategory,
      reasonDetail: reasonDetail.trim(),
      destinationSchool: destinationSchool.trim() || undefined,
      referenceLetterNo: referenceLetterNo.trim() || undefined,
      adminUser: {
        id: currentUser?.id || "user-admin",
        fullName: currentUser?.fullName || "Administrator",
      },
    });

    if (!res.success) {
      setToastMessage(res.error || "Gagal memproses mutasi siswa.");
      return;
    }

    setToastMessage(
      `Siswa ${mutatingStudent.student.fullName} berhasil dialihkan ke Arsip Mutasi. Data presensi dan nilai lampau tetap aman.`
    );
    setMutatingStudent(null);
    setReasonDetail("");
    setDestinationSchool("");
    setReferenceLetterNo("");
    refreshAllData();
  };

  // Buka Lembar Audit Rekam Jejak Dinas
  const handleOpenAudit = (record: StudentMutationRecord) => {
    const historicalData = getStudentHistoricalAuditData(record.studentId);
    setAuditTarget({ record, historicalData });
  };

  // Eksekusi Pemulihan Siswa (Reactivate)
  const handleExecuteReactivate = () => {
    if (!reactivatingMutation) return;

    const res = reactivateStudentFromMutation(reactivatingMutation.id);
    if (!res.success) {
      setToastMessage(res.error || "Gagal memulihkan siswa.");
      return;
    }

    setToastMessage(
      `Siswa ${reactivatingMutation.studentName} berhasil dipulihkan kembali ke kelas ${reactivatingMutation.lastClassName}.`
    );
    setReactivatingMutation(null);
    refreshAllData();
  };

  if (!mounted) return null;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Akses Terbatas</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md">
          Modul Buku Induk & Arsip Mutasi Siswa hanya dapat diakses oleh Administrator dan Tata Usaha.
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Panel Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[var(--color-accent)]" />
            Buku Induk & Arsip Mutasi Siswa
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Pengelolaan peserta didik aktif, mutasi keluar, rekam jejak historis, dan verifikasi dokumen resmi Dinas Pendidikan
          </p>
        </div>

        {/* Tab Navigasi Utama */}
        <div className="flex items-center bg-[var(--surface-recessed)] p-1 rounded-2xl border border-[var(--border-hairline)] shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("ACTIVE");
              setSearchQuery("");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ACTIVE"
                ? "bg-[var(--surface-card)] text-[var(--color-accent)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Siswa Aktif</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 text-[10px]">
              {activeStudentsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("MUTATED");
              setSearchQuery("");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "MUTATED"
                ? "bg-[var(--surface-card)] text-rose-600 shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Arsip Mutasi / Keluar</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600 text-[10px]">
              {mutations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("ALUMNI");
              setSearchQuery("");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ALUMNI"
                ? "bg-[var(--surface-card)] text-purple-600 shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Alumni ({alumni.length})</span>
          </button>
        </div>
      </div>

      {/* Peringatan Integritas Data Dinas */}
      <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-semibold text-blue-800 dark:text-blue-200">
            Standar Tata Kelola Arsip Siswa (Buku Induk Digital SMPN 3 Cibungbulang):
          </p>
          <p>
            Siswa yang pindah sekolah atau mengundurkan diri <strong>tidak dihapus permanen</strong> dari basis data.
            Siswa dialihkan ke <em>Arsip Mutasi</em> sehingga tidak lagi muncul di absensi harian KBM guru berjalan,
            namun seluruh riwayat kehadiran dan capaian nilai lampau tetap tersimpan utuh untuk keperluan audit atau verifikasi Dinas Pendidikan.
          </p>
        </div>
      </div>

      {/* Kontrol Pencarian & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface-card)] p-3 rounded-2xl border border-[var(--border-hairline)] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder={
              activeTab === "ACTIVE"
                ? "Cari nama atau NIS siswa aktif..."
                : activeTab === "MUTATED"
                ? "Cari siswa mutasi, sekolah tujuan, no. surat..."
                : "Cari alumni lulusan..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === "ACTIVE" && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-[var(--text-secondary)] font-semibold shrink-0">Filter Kelas:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-none"
              >
                <option value="ALL">Semua Kelas ({MOCK_CLASSES.length} Rombel)</option>
                {MOCK_CLASSES.map((c, idx) => (
                  <option key={`${c.id}-${idx}`} value={c.id}>
                    Kelas {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === "MUTATED" && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-[var(--text-secondary)] font-semibold shrink-0">Alasan:</span>
              <select
                value={selectedReasonFilter}
                onChange={(e) => setSelectedReasonFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-none"
              >
                <option value="ALL">Semua Alasan Keluar</option>
                {REASON_CATEGORIES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR SISWA AKTIF */}
      {/* ========================================================================= */}
      {activeTab === "ACTIVE" && (
        <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-recessed)] border-b border-[var(--border-hairline)] text-[var(--text-secondary)] font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4">Nama Lengkap Siswa</th>
                  <th className="py-3 px-4 w-16 text-center">L/P</th>
                  <th className="py-3 px-4 w-24 text-center">Kelas</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-44 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {activeStudentsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--text-tertiary)] italic">
                      Tidak ada data siswa aktif yang cocok dengan pencarian atau filter.
                    </td>
                  </tr>
                ) : (
                  activeStudentsList.map((item, idx) => (
                    <tr
                      key={`${item.classId}-${item.student.id}`}
                      className="hover:bg-[var(--surface-recessed)]/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-center text-[var(--text-tertiary)] font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-[var(--text-secondary)]">
                        {item.student.nis || "-"}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[var(--text-primary)]">
                        {item.student.fullName}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.student.gender === "L"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-pink-500/10 text-pink-600"
                          }`}
                        >
                          {item.student.gender || "-"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-[var(--text-secondary)]">
                        Kelas {item.className}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setMutatingStudent({
                              student: item.student,
                              classId: item.classId,
                              className: item.className,
                            });
                            setMutationDate(new Date().toISOString().split("T")[0]);
                            setReasonCategory("PINDAH_SEKOLAH");
                            setReasonDetail("");
                            setDestinationSchool("");
                            setReferenceLetterNo("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-[11px] transition-colors cursor-pointer border border-rose-500/20"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Keluarkan / Mutasikan</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ARSIP SISWA MUTASI / KELUAR (JEJAK AUDIT DINAS) */}
      {/* ========================================================================= */}
      {activeTab === "MUTATED" && (
        <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] shadow-xs overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-recessed)] border-b border-[var(--border-hairline)] text-[var(--text-secondary)] font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 w-20 text-center">Rombel Terakhir</th>
                  <th className="py-3 px-4 w-28">Tgl Keluar</th>
                  <th className="py-3 px-4">Kategori Alasan & Detail</th>
                  <th className="py-3 px-4">Sekolah Tujuan / Surat</th>
                  <th className="py-3 px-4 w-48 text-right">Dokumen & Rekam Jejak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredMutations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[var(--text-tertiary)] italic">
                      Belum ada catatan mutasi keluar atau siswa non-aktif. Seluruh siswa terdaftar di rombel berjalan.
                    </td>
                  </tr>
                ) : (
                  filteredMutations.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-[var(--surface-recessed)]/50 transition-colors">
                      <td className="py-2.5 px-4 text-center text-[var(--text-tertiary)] font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-[var(--text-secondary)]">
                        {m.studentNis}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[var(--text-primary)]">
                        <div>{m.studentName}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)] font-normal">
                          Diproses oleh: {m.processedByUserName}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-[var(--text-secondary)]">
                        Kelas {m.lastClassName}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[var(--text-secondary)]">
                        {m.mutationDate}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1">
                          {REASON_CATEGORIES.find((r) => r.value === m.reasonCategory)?.label || m.reasonCategory}
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 italic">
                          &ldquo;{m.reasonDetail}&rdquo;
                        </p>
                      </td>
                      <td className="py-2.5 px-4 text-[11px]">
                        {m.destinationSchool ? (
                          <div className="font-semibold text-[var(--text-primary)]">
                            Ke: {m.destinationSchool}
                          </div>
                        ) : (
                          <span className="text-[var(--text-tertiary)] italic">-</span>
                        )}
                        {m.referenceLetterNo && (
                          <div className="font-mono text-[10px] text-[var(--text-secondary)]">
                            No: {m.referenceLetterNo}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAudit(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--surface-recessed)] hover:bg-[var(--surface-card)] text-[var(--color-accent)] font-bold text-[11px] border border-[var(--border-hairline)] transition-colors cursor-pointer"
                            title="Buka Lembar Buku Induk & Riwayat untuk Dinas"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Buku Induk</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setReactivatingMutation(m)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold text-[11px] border border-emerald-500/20 transition-colors cursor-pointer"
                            title="Kembalikan siswa ke kelas semula jika mutasi batal"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pulihkan</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUKU INDUK ALUMNI (LULUSAN KELAS 9) */}
      {/* ========================================================================= */}
      {activeTab === "ALUMNI" && (
        <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-recessed)] border-b border-[var(--border-hairline)] text-[var(--text-secondary)] font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4">Nama Lengkap Alumni</th>
                  <th className="py-3 px-4 w-16 text-center">L/P</th>
                  <th className="py-3 px-4 w-28 text-center">Kelas Terakhir</th>
                  <th className="py-3 px-4 w-32 text-center">Tahun Kelulusan</th>
                  <th className="py-3 px-4 w-36 text-center">Status Kelulusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredAlumni.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--text-tertiary)] italic">
                      Belum ada data alumni yang diarsipkan dari modul Tutup Tahun & Kelulusan Kelas 9.
                    </td>
                  </tr>
                ) : (
                  filteredAlumni.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-[var(--surface-recessed)]/50 transition-colors">
                      <td className="py-2.5 px-4 text-center text-[var(--text-tertiary)] font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-[var(--text-secondary)]">
                        {a.nis}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[var(--text-primary)]">
                        {a.name}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            a.gender === "L" ? "bg-blue-500/10 text-blue-600" : "bg-pink-500/10 text-pink-600"
                          }`}
                        >
                          {a.gender}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-[var(--text-secondary)]">
                        Kelas {a.lastClass}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-[var(--text-secondary)]">
                        {a.graduationYear}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          <GraduationCap className="w-3 h-3" /> Lulus (Alumni)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORMULIR MUTASI SISWA (SOFT DEACTIVATION) */}
      {/* ========================================================================= */}
      {mutatingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--surface-card)] rounded-2xl border border-rose-500/30 shadow-2xl p-6 space-y-4 animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-start gap-3 border-b border-[var(--border-hairline)] pb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
                <UserMinus className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Proses Pengeluaran / Mutasi Siswa
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Memindahkan siswa dari rombel aktif ke Arsip Mutasi tanpa menghapus histori presensi/nilai
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteMutation} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
              {/* Rincian Siswa yang Dipilih */}
              <div className="p-3 bg-[var(--surface-recessed)] rounded-xl border border-[var(--border-hairline)] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Nama Siswa:</span>
                  <span className="font-bold text-[var(--text-primary)]">{mutatingStudent.student.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">NIS / Gender:</span>
                  <span className="font-mono text-[var(--text-secondary)]">
                    {mutatingStudent.student.nis || "-"} ({mutatingStudent.student.gender === "L" ? "Putra" : "Putri"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Rombongan Belajar:</span>
                  <span className="font-bold text-[var(--color-accent)]">Kelas {mutatingStudent.className}</span>
                </div>
              </div>

              {/* Tanggal Efektif Keluar */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Tanggal Resmi Efektif Keluar / Mutasi:
                </label>
                <input
                  type="date"
                  required
                  value={mutationDate}
                  onChange={(e) => setMutationDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Kategori Alasan */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Kategori Alasan Pengeluaran / Mutasi:
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value as StudentMutationReasonCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {REASON_CATEGORIES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sekolah Tujuan (Jika Pindah) */}
              {reasonCategory === "PINDAH_SEKOLAH" && (
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Sekolah Tujuan Mutasi:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SMP Negeri 1 Leuwiliang"
                    value={destinationSchool}
                    onChange={(e) => setDestinationSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              {/* Nomor Surat Pindah / Dinas */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Nomor Surat Keterangan Pindah / SK Sekolah (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 421.3/089/SMPN3/X/2026"
                  value={referenceLetterNo}
                  onChange={(e) => setReferenceLetterNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Catatan Alasan Detail */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Catatan Alasan Lengkap (Wajib Diisi):
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jelaskan alasan detail pengeluaran/kepindahan siswa..."
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Catatan Integritas */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  Jaminan Integritas & Kepatuhan Dapodik:
                </p>
                <p>
                  Siswa tidak akan muncul di presensi harian KBM guru berikutnya. Namun jika sewaktu-waktu pihak Dinas Pendidikan
                  atau Pengawas meminta data riwayat anak ini, lembar buku induk digital dan arsip nilai tetap dapat dibuka dan dicetak.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setMutatingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  Keluarkan & Arsipkan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LEMBAR REKAM JEJAK AUDIT DINAS / BUKU INDUK DIGITAL */}
      {/* ========================================================================= */}
      {auditTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white text-stone-900 rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-up max-h-[92vh] flex flex-col print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Header Modal Aksi */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 print:hidden">
              <div className="flex items-center gap-2 text-stone-700">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-stone-900">
                  Lembar Rekam Jejak Peserta Didik (Buku Induk Digital)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Berkas Dinas
                </button>
                <button
                  type="button"
                  onClick={() => setAuditTarget(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Konten Cetak / Dokumen Resmi */}
            <div className="overflow-y-auto space-y-4 pr-1 text-xs text-stone-800 leading-relaxed font-sans">
              {/* Kop Surat Resmi */}
              <div className="border-b-2 border-stone-800 pb-3 text-center space-y-0.5">
                <h4 className="font-serif text-sm tracking-wider uppercase font-bold text-stone-700">
                  PEMERINTAH KABUPATEN BOGOR · DINAS PENDIDIKAN
                </h4>
                <h2 className="font-serif text-lg font-black tracking-wide uppercase text-stone-950">
                  SMP NEGERI 3 CIBUNGBULANG
                </h2>
                <p className="text-[10px] text-stone-600 italic">
                  Jl. Kapten Dasuki Bakri KM 4, Cibatok 1, Kec. Cibungbulang, Kab. Bogor, Jawa Barat 16630
                </p>
                <div className="pt-2 text-[11px] font-bold tracking-widest uppercase border-t border-stone-300 mt-2">
                  BUKU INDUK & LEMBAR RIWAYAT MUTASI SISWA
                </div>
              </div>

              {/* Data Identitas Siswa */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-500 font-medium">Nama Peserta Didik:</span>{" "}
                  <strong className="text-stone-900">{auditTarget.record.studentName}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Nomor Induk Siswa (NIS):</span>{" "}
                  <strong className="font-mono text-stone-900">{auditTarget.record.studentNis}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Jenis Kelamin:</span>{" "}
                  <strong>{auditTarget.record.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Rombel Terakhir:</span>{" "}
                  <strong>Kelas {auditTarget.record.lastClassName}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Tanggal Efektif Keluar:</span>{" "}
                  <strong className="font-mono text-stone-900">{auditTarget.record.mutationDate}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Status Keberadaan:</span>{" "}
                  <span className="font-bold text-rose-700">MUTASI KELUAR / NON-AKTIF</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Sekolah Tujuan:</span>{" "}
                  <strong className="text-stone-900">{auditTarget.record.destinationSchool || "-"}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">No. Surat Keterangan:</span>{" "}
                  <strong className="font-mono text-stone-900">{auditTarget.record.referenceLetterNo || "-"}</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-stone-200">
                  <span className="text-stone-500 font-medium">Alasan Pengeluaran/Mutasi:</span>{" "}
                  <span className="italic text-stone-800">
                    &ldquo;{auditTarget.record.reasonDetail}&rdquo; (Kategori:{" "}
                    {REASON_CATEGORIES.find((r) => r.value === auditTarget.record.reasonCategory)?.label ||
                      auditTarget.record.reasonCategory}
                    )
                  </span>
                </div>
              </div>

              {/* Rekam Jejak Kehadiran (Presensi) */}
              <div>
                <h4 className="font-bold text-xs uppercase text-stone-900 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  I. Rekapitulasi Presensi & Disiplin Belajar Siswa
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-stone-100 border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">Total Sesi KBM</span>
                    <span className="font-bold font-mono text-sm text-stone-900">
                      {auditTarget.historicalData.attendanceStats.totalSessions}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="text-[10px] block">Hadir (H)</span>
                    <span className="font-bold font-mono text-sm">
                      {auditTarget.historicalData.attendanceStats.hadir}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                    <span className="text-[10px] block">Sakit (S)</span>
                    <span className="font-bold font-mono text-sm">
                      {auditTarget.historicalData.attendanceStats.sakit}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                    <span className="text-[10px] block">Izin (I)</span>
                    <span className="font-bold font-mono text-sm">
                      {auditTarget.historicalData.attendanceStats.izin}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="text-[10px] block">Alpa (A)</span>
                    <span className="font-bold font-mono text-sm">
                      {auditTarget.historicalData.attendanceStats.alpa}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-800">
                    <span className="text-[10px] block">Dispen (D)</span>
                    <span className="font-bold font-mono text-sm">
                      {auditTarget.historicalData.attendanceStats.dispen}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-100 border border-stone-300">
                    <span className="text-[10px] text-stone-600 block">% Kehadiran</span>
                    <span className="font-bold font-mono text-sm text-blue-700">
                      {auditTarget.historicalData.attendanceStats.persentase}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Rekam Jejak Capaian Nilai */}
              <div>
                <h4 className="font-bold text-xs uppercase text-stone-900 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  II. Riwayat Capaian Penilaian / Asesmen Pembelajaran
                </h4>
                {auditTarget.historicalData.scores.length === 0 ? (
                  <p className="text-[11px] text-stone-500 italic p-3 bg-stone-50 rounded-lg border border-stone-200">
                    Belum ada rekaman nilai tugas/ujian yang terinput untuk siswa ini selama semester berjalan.
                  </p>
                ) : (
                  <div className="border border-stone-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                        <tr>
                          <th className="py-1.5 px-3">Mata Pelajaran</th>
                          <th className="py-1.5 px-3">Judul Penilaian</th>
                          <th className="py-1.5 px-3">Kategori</th>
                          <th className="py-1.5 px-3 text-center">Tanggal</th>
                          <th className="py-1.5 px-3 text-right">Nilai Perolehan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {auditTarget.historicalData.scores.map((sc, scIdx) => (
                          <tr key={scIdx}>
                            <td className="py-1.5 px-3 font-semibold text-stone-900">{sc.subject}</td>
                            <td className="py-1.5 px-3">{sc.title}</td>
                            <td className="py-1.5 px-3 text-stone-600">{sc.type}</td>
                            <td className="py-1.5 px-3 text-center font-mono">{sc.date}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-blue-700">
                              {sc.score} / {sc.maxScore}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Kolom Tanda Tangan Resmi Pengesahan Dinas */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-stone-600">Mengetahui,</p>
                  <p className="font-bold text-stone-900">Kepala SMPN 3 Cibungbulang</p>
                  <div className="h-16 flex items-center justify-center italic text-stone-400">
                    (Tanda Tangan & Cap Sekolah)
                  </div>
                  <p className="font-bold underline text-stone-900">Hj. Juwariyah, M.Pd</p>
                  <p className="text-[10px] font-mono text-stone-600">NIP. 196805121998022001</p>
                </div>

                <div>
                  <p className="text-stone-600">Cibungbulang, {auditTarget.record.mutationDate}</p>
                  <p className="font-bold text-stone-900">Petugas Tata Usaha / Admin</p>
                  <div className="h-16 flex items-center justify-center italic text-stone-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-bold underline text-stone-900">{auditTarget.record.processedByUserName}</p>
                  <p className="text-[10px] font-mono text-stone-600">Admin SSOT Sistem Digital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: KONFIRMASI PEMULIHAN SISWA (REACTIVATE) */}
      {/* ========================================================================= */}
      {reactivatingMutation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--surface-card)] rounded-2xl border border-emerald-500/30 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Pulihkan Siswa ke Kelas?
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Membatalkan status mutasi dan mengembalikan siswa ke rombel aslinya.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[var(--surface-recessed)] rounded-xl border border-[var(--border-hairline)] text-xs space-y-1">
              <div>
                <span className="text-[var(--text-tertiary)]">Nama Siswa:</span>{" "}
                <strong className="text-[var(--text-primary)]">{reactivatingMutation.studentName}</strong>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Rombel Tujuan:</span>{" "}
                <strong className="text-emerald-600">Kelas {reactivatingMutation.lastClassName}</strong>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Tgl Mutasi Semula:</span>{" "}
                <span className="font-mono text-[var(--text-secondary)]">{reactivatingMutation.mutationDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => setReactivatingMutation(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReactivate}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ya, Pulihkan ke Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
