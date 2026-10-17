"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Users,
  School,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  Archive,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Toast } from "@/components/ui/Toast";
import {
  downloadPpdbTemplate,
  parsePpdbExcelBuffer,
  commitPpdbImport,
  executeParallelPromotion,
  executeGraduationClass9,
  getStoredDynamicStudentsMap,
  STORAGE_KEY_ALUMNI_STUDENTS,
  type ParsedPpdbResult,
  type AlumniStudentRecord,
} from "@/lib/rolloverStorage";
import type { Student } from "@/contracts/attendance";
import { MOCK_CLASSES } from "@/contracts/mocks/attendanceMocks";

type RolloverTab = "ppdb" | "promotion" | "graduation";

/**
 * Halaman Pusat Kenaikan Kelas, Kelulusan, dan Impor Siswa Baru PPDB
 * SMP Negeri 3 Cibungbulang
 */
export default function AdminRolloverPage() {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<RolloverTab>("ppdb");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ==========================================
  // STATE TAB 1: PPDB XLSX ENGINE
  // ==========================================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedPpdbResult | null>(null);
  const [autoBalance, setAutoBalance] = useState(true);
  const [isCommitting, setIsCommitting] = useState(false);

  // ==========================================
  // STATE TAB 2: KENAIKAN KELAS PARALEL
  // ==========================================
  const [studentsMap, setStudentsMap] = useState<Record<string, Student[]>>({});
  const [retainedStudentIds, setRetainedStudentIds] = useState<Set<string>>(new Set());
  const [promotionFilterGrade, setPromotionFilterGrade] = useState<"7" | "8">("7");
  const [promotionSearchQuery, setPromotionSearchQuery] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);

  // ==========================================
  // STATE TAB 3: KELULUSAN KELAS 9 (ALUMNI)
  // ==========================================
  const [alumniList, setAlumniList] = useState<AlumniStudentRecord[]>([]);
  const [isGraduating, setIsGraduating] = useState(false);

  const refreshLocalData = () => {
    const map = getStoredDynamicStudentsMap();
    setStudentsMap(map);

    try {
      const raw = localStorage.getItem(STORAGE_KEY_ALUMNI_STUDENTS);
      if (raw) setAlumniList(JSON.parse(raw));
    } catch (e) {
      console.warn("Gagal membaca arsip alumni:", e);
    }
  };

  useEffect(() => {
    refreshLocalData();
  }, []);

  // 1. Tangani Unggah Berkas Excel PPDB
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = parsePpdbExcelBuffer(buffer);
      setParsedResult(result);
      if (result.errorRows.length > 0) {
        setToastMessage(`Ditemukan ${result.validRows.length} data valid dan ${result.errorRows.length} baris tidak valid.`);
      } else {
        setToastMessage(`Berhasil membaca ${result.validRows.length} data calon siswa baru.`);
      }
    } catch (err: any) {
      alert(`Gagal membaca berkas Excel: ${err.message}`);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. Simpan Impor PPDB Masuk ke Database
  const handleCommitPpdb = () => {
    if (!parsedResult || parsedResult.validRows.length === 0) return;

    if (
      !confirm(
        `Apakah Anda yakin ingin mengimpor ${parsedResult.validRows.length} siswa baru ke kelas 7? Data akan langsung terdaftar di sistem presensi.`
      )
    ) {
      return;
    }

    setIsCommitting(true);
    try {
      const res = commitPpdbImport(parsedResult.validRows, autoBalance);
      if (res.success) {
        setToastMessage(
          `Sukses! ${res.importedCount} siswa baru berhasil diimpor ke kelas 7.`
        );
        setParsedResult(null);
        refreshLocalData();
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan saat menyimpan data: ${err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  // 3. Toggle Siswa Tinggal Kelas (Retained)
  const handleToggleRetained = (studentId: string) => {
    const next = new Set(retainedStudentIds);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      next.add(studentId);
    }
    setRetainedStudentIds(next);
  };

  // 4. Eksekusi Kenaikan Kelas Paralel
  const handleExecutePromotion = () => {
    const retainedCount = retainedStudentIds.size;
    const confirmMsg =
      retainedCount > 0
        ? `Konfirmasi Kenaikan Kelas:\n• Kelas 8 naik ke Kelas 9\n• Kelas 7 naik ke Kelas 8\n• ${retainedCount} siswa ditandai tinggal kelas.\n\nLanjutkan proses kenaikan kelas?`
        : `Konfirmasi Kenaikan Kelas:\n• Seluruh Kelas 8 naik ke Kelas 9\n• Seluruh Kelas 7 naik ke Kelas 8\n(Tidak ada siswa yang tinggal kelas).\n\nLanjutkan proses kenaikan kelas?`;

    if (!confirm(confirmMsg)) return;

    setIsPromoting(true);
    try {
      const res = executeParallelPromotion(retainedStudentIds, currentUser?.username || "admin");
      if (res.success) {
        setToastMessage(
          `Kenaikan Kelas Berhasil! ${res.promotedToGrade9} siswa naik ke Kelas 9, ${res.promotedToGrade8} siswa naik ke Kelas 8${
            res.retainedCount > 0 ? `, dan ${res.retainedCount} siswa tinggal kelas` : ""
          }.`
        );
        setRetainedStudentIds(new Set());
        refreshLocalData();
      }
    } catch (err: any) {
      alert(`Gagal memproses kenaikan kelas: ${err.message}`);
    } finally {
      setIsPromoting(false);
    }
  };

  // 5. Eksekusi Kelulusan Kelas 9
  const handleExecuteGraduation = () => {
    // Hitung berapa siswa kelas 9 aktif
    const class9Ids = ["class-9a", "class-9b", "class-9c", "class-9d", "class-9e", "class-9f", "class-9g"];
    let class9Total = 0;
    for (const cid of class9Ids) {
      class9Total += (studentsMap[cid] || []).length;
    }

    if (class9Total === 0) {
      alert("Saat ini belum ada data siswa aktif di Kelas 9 (9A-9G). Jika belum dilakukan kenaikan kelas, jalankan kenaikan kelas terlebih dahulu.");
      return;
    }

    if (
      !confirm(
        `PERINGATAN KELULUSAN KELAS 9:\nSebanyak ${class9Total} siswa Kelas 9 (9A s.d. 9G) akan diluluskan menjadi Alumni resmi.\n\nRombel Kelas 9 akan dikosongkan agar siap menerima kenaikan dari Kelas 8.\nRiwayat presensi dan nilai lampau tetap aman tersimpan.\n\nLanjutkan kelulusan angkatan?`
      )
    ) {
      return;
    }

    setIsGraduating(true);
    try {
      const res = executeGraduationClass9(currentUser?.username || "admin");
      if (res.success) {
        setToastMessage(`Kelulusan Selesai! ${res.graduatedCount} siswa Kelas 9 resmi berstatus Alumni.`);
        refreshLocalData();
      }
    } catch (err: any) {
      alert(`Gagal memproses kelulusan: ${err.message}`);
    } finally {
      setIsGraduating(false);
    }
  };

  // Filter Siswa untuk Tab Kenaikan Kelas
  const studentsForPromotionTab = useMemo(() => {
    const list: { student: Student; classId: string; className: string }[] = [];
    for (const [classId, students] of Object.entries(studentsMap)) {
      if (classId.includes(promotionFilterGrade)) {
        const clsName = classId.replace("class-", "").toUpperCase();
        for (const s of students) {
          list.push({ student: s, classId, className: clsName });
        }
      }
    }

    if (!promotionSearchQuery.trim()) return list;
    const q = promotionSearchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.student.fullName.toLowerCase().includes(q) ||
        (item.student.nis && item.student.nis.includes(q)) ||
        item.className.toLowerCase().includes(q)
    );
  }, [studentsMap, promotionFilterGrade, promotionSearchQuery]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Akses Terbatas</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md">
          Modul Tutup Tahun, Kenaikan Kelas, dan PPDB hanya dapat diakses oleh Administrator.
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
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dasbor Admin
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Tutup Tahun, Kenaikan Kelas & PPDB
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Alur otomatisasi transisi tahun ajaran baru, promosi rombel paralel, dan impor siswa PPDB via Excel
          </p>
        </div>

        {/* Tab Switcher Apple HIG */}
        <div className="flex items-center gap-1 bg-[var(--surface-recessed)] p-1 rounded-2xl border border-[var(--border-hairline)] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("ppdb")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ppdb"
                ? "bg-[var(--surface-card)] text-[var(--color-accent)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Upload className="w-4 h-4" />
            1. PPDB Siswa Baru (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("promotion")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "promotion"
                ? "bg-[var(--surface-card)] text-[var(--color-accent)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <School className="w-4 h-4" />
            2. Kenaikan Kelas Paralel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("graduation")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "graduation"
                ? "bg-[var(--surface-card)] text-[var(--color-accent)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            3. Kelulusan Kelas 9 (Alumni)
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* KONTEN TAB 1: PPDB SISWA BARU DENGAN TEMPLATE XLSX */}
      {/* ==================================================================== */}
      {activeTab === "ppdb" && (
        <div className="space-y-6">
          {/* Kartu Panduan & Tombol Unduh Template */}
          <div className="bg-[var(--surface-card)] p-5 md:p-6 rounded-2xl border border-[var(--border-hairline)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Format Baku Resmi PPDB
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Unduh Template Excel Penerimaan Siswa Baru (.xlsx)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Gunakan template resmi untuk menginput data siswa baru dari panitia PPDB. Dilengkapi petunjuk format kolom, opsi alokasi rombel 7A–7H, dan contoh baris data yang siap diisi.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadPpdbTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh Template (.xlsx)
            </button>
          </div>

          {/* Zona Unggah Berkas Excel */}
          <div className="bg-[var(--surface-card)] p-6 rounded-2xl border-2 border-dashed border-[var(--border-hairline)] text-center space-y-4 hover:border-[var(--color-accent)] transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="ppdb-file-input"
            />

            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-recessed)] text-[var(--color-accent)] flex items-center justify-center mx-auto">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <label
                htmlFor="ppdb-file-input"
                className="inline-block px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer transition-all"
              >
                Pilih Berkas Excel PPDB
              </label>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Mendukung berkas Microsoft Excel <strong>.xlsx</strong>, <strong>.xls</strong>, atau berkas tabel <strong>.csv</strong>
              </p>
            </div>

            {isParsing && (
              <p className="text-xs font-semibold text-[var(--color-accent)] animate-pulse">
                Memvalidasi data siswa dari berkas Excel...
              </p>
            )}
          </div>

          {/* Pratinjau Interaktif Jika Berkas Telah Diunggah */}
          {parsedResult && (
            <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] p-5 shadow-xs space-y-4 animate-scale-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Pratinjau & Validasi Data Siswa Baru
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Total: {parsedResult.totalRows} baris ·{" "}
                    <span className="text-emerald-600 font-bold">{parsedResult.validRows.length} valid</span>
                    {parsedResult.errorRows.length > 0 && (
                      <span className="text-rose-500 font-bold ml-1.5">
                        · {parsedResult.errorRows.length} baris tidak valid
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoBalance}
                      onChange={(e) => setAutoBalance(e.target.checked)}
                      className="rounded accent-[var(--color-accent)] w-4 h-4 cursor-pointer"
                    />
                    <span>Alokasi Berimbang 7A–7H (Seimbang L/P)</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleCommitPpdb}
                    disabled={isCommitting || parsedResult.validRows.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan Masuk Database
                  </button>
                </div>
              </div>

              {/* Rangkuman Komposisi Gender */}
              <div className="flex items-center gap-4 text-xs bg-[var(--surface-recessed)] p-3 rounded-xl border border-[var(--border-hairline)]">
                <span className="font-semibold text-[var(--text-secondary)]">Komposisi Calon Siswa:</span>
                <span className="text-blue-600 font-bold">{parsedResult.summary.totalL} Putra (L)</span>
                <span>·</span>
                <span className="text-pink-600 font-bold">{parsedResult.summary.totalP} Putri (P)</span>
                <span>·</span>
                <span className="text-[var(--text-secondary)]">
                  {parsedResult.summary.unassignedClassCount} siswa belum memiliki rombel (siap dialokasikan otomatis)
                </span>
              </div>

              {/* Tabel Pratinjau Siswa */}
              <div className="max-h-72 overflow-y-auto overflow-x-auto border border-[var(--border-hairline)] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-recessed)] sticky top-0 border-b border-[var(--border-hairline)]">
                    <tr className="text-[var(--text-secondary)] font-semibold">
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">NIS</th>
                      <th className="py-2 px-3">Nama Lengkap</th>
                      <th className="py-2 px-3 text-center">L/P</th>
                      <th className="py-2 px-3">Rombel Tujuan</th>
                      <th className="py-2 px-3">Status Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {parsedResult.validRows.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[var(--surface-recessed)]/50">
                        <td className="py-2 px-3 font-mono text-[var(--text-tertiary)]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-[var(--text-primary)]">{row.nis}</td>
                        <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{row.fullName}</td>
                        <td className="py-2 px-3 text-center font-bold text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              row.gender === "L" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {row.gender}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[var(--text-secondary)]">
                          {row.targetClass || (
                            <span className="text-[10px] text-[var(--color-accent)] italic">
                              Auto-Alokasi (7A–7H)
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Siap Impor
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedResult.validRows.length > 50 && (
                <p className="text-[10px] text-[var(--text-tertiary)] text-center">
                  Menampilkan 50 baris pertama dari total {parsedResult.validRows.length} siswa valid.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* KONTEN TAB 2: KENAIKAN KELAS PARALEL */}
      {/* ==================================================================== */}
      {activeTab === "promotion" && (
        <div className="space-y-6">
          {/* Diagram Alur Kenaikan Kelas */}
          <div className="bg-[var(--surface-card)] p-5 rounded-2xl border border-[var(--border-hairline)] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <School className="w-5 h-5 text-[var(--color-accent)]" />
              Alur Promosi Kenaikan Kelas Paralel
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Sistem akan mempromosikan siswa secara paralel berdasarkan rombongan belajar. Siswa yang tinggal kelas dapat Anda centang pada tabel di bawah agar tetap tinggal di kelas asalnya.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                  Tahap 1: Kenaikan Kelas 8 ke Kelas 9
                </span>
                <p className="text-xs text-[var(--text-primary)] font-medium">
                  8A $\rightarrow$ 9A · 8B $\rightarrow$ 9B · 8C $\rightarrow$ 9C · 8D $\rightarrow$ 9D · 8E $\rightarrow$ 9E · 8F $\rightarrow$ 9F · 8G $\rightarrow$ 9G
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Memindahkan seluruh siswa aktif kelas 8 menjadi siswa kelas 9 angkatan baru.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] space-y-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                  Tahap 2: Kenaikan Kelas 7 ke Kelas 8
                </span>
                <p className="text-xs text-[var(--text-primary)] font-medium">
                  7A $\rightarrow$ 8A · 7B $\rightarrow$ 8B · 7C $\rightarrow$ 8C · 7D $\rightarrow$ 8D · 7E $\rightarrow$ 8E · 7F $\rightarrow$ 8F · 7G $\rightarrow$ 8G · 7H $\rightarrow$ 8A
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Memindahkan siswa kelas 7 ke kelas 8, dan mengosongkan rombel kelas 7 untuk siswa baru PPDB.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[var(--border-hairline)]">
              <div className="text-xs text-[var(--text-secondary)]">
                Siswa Ditandai Tinggal Kelas:{" "}
                <span className="font-bold text-amber-600">{retainedStudentIds.size} siswa</span>
              </div>
              <button
                type="button"
                onClick={handleExecutePromotion}
                disabled={isPromoting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isPromoting ? "animate-spin" : ""}`} />
                Eksekusi Kenaikan Kelas Paralel
              </button>
            </div>
          </div>

          {/* Filter & Tabel Siswa untuk Menandai Siswa Tinggal Kelas */}
          <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Daftar Siswa (Centang jika Siswa Tinggal Kelas / Tidak Naik)
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Secara default seluruh siswa naik kelas. Jika ada siswa yang tinggal kelas, centang kotak di kolom "Tinggal Kelas".
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[var(--surface-recessed)] p-1 rounded-xl border border-[var(--border-hairline)]">
                  <button
                    type="button"
                    onClick={() => setPromotionFilterGrade("7")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      promotionFilterGrade === "7"
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    Angkatan Kelas 7
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromotionFilterGrade("8")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      promotionFilterGrade === "8"
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    Angkatan Kelas 8
                  </button>
                </div>
              </div>
            </div>

            {/* Input Pencarian Siswa */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={promotionSearchQuery}
                onChange={(e) => setPromotionSearchQuery(e.target.value)}
                placeholder="Cari nama atau NIS siswa..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            {/* Tabel Siswa */}
            <div className="max-h-80 overflow-y-auto border border-[var(--border-hairline)] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-recessed)] sticky top-0 border-b border-[var(--border-hairline)]">
                  <tr className="text-[var(--text-secondary)] font-semibold">
                    <th className="py-2.5 px-3">Kelas Asal</th>
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                    <th className="py-2.5 px-3 text-center">Status Naik / Tinggal Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {studentsForPromotionTab.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[var(--text-secondary)]">
                        Tidak ada siswa pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    studentsForPromotionTab.map(({ student, className }) => {
                      const isRetained = retainedStudentIds.has(student.id);
                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-[var(--surface-recessed)]/50 transition-colors ${
                            isRetained ? "bg-amber-500/5" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-[var(--text-primary)]">
                            Kelas {className}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[var(--text-secondary)]">
                            {student.nis || "-"}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">
                            {student.fullName}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={isRetained}
                                onChange={() => handleToggleRetained(student.id)}
                                className="rounded accent-amber-600 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className={isRetained ? "text-amber-600 font-bold" : "text-emerald-600"}>
                                {isRetained ? "Tinggal Kelas" : "Naik Kelas"}
                              </span>
                            </label>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* KONTEN TAB 3: KELULUSAN KELAS 9 (ALUMNI) */}
      {/* ==================================================================== */}
      {activeTab === "graduation" && (
        <div className="space-y-6">
          <div className="bg-[var(--surface-card)] p-5 md:p-6 rounded-2xl border border-[var(--border-hairline)] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold mb-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Pelepasan Angkatan & Arsip Alumni
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Kelulusan Siswa Tingkat Akhir (Kelas 9A s.d. 9G)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed mt-1">
                  Proses kelulusan akan mengubah status seluruh siswa kelas 9 menjadi Alumni resmi sekolah. Rombel kelas 9 akan dikosongkan untuk menyambut kenaikan siswa dari kelas 8, sementara buku nilai dan riwayat raport mereka tetap tersimpan abadi di arsip digital.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExecuteGraduation}
                disabled={isGraduating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                Proses Kelulusan Kelas 9
              </button>
            </div>
          </div>

          {/* Tabel Arsip Alumni Sekolah */}
          <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Archive className="w-4 h-4 text-purple-600" />
                  Buku Induk Alumni SMP Negeri 3 Cibungbulang
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Total Alumni Terdaftar: <strong>{alumniList.length} orang</strong>
                </p>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto border border-[var(--border-hairline)] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-recessed)] sticky top-0 border-b border-[var(--border-hairline)]">
                  <tr className="text-[var(--text-secondary)] font-semibold">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">Nama Alumni</th>
                    <th className="py-2.5 px-3 text-center">L/P</th>
                    <th className="py-2.5 px-3">Tahun Lulus</th>
                    <th className="py-2.5 px-3">Kelas Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {alumniList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                        Belum ada siswa yang diluluskan menjadi alumni.
                      </td>
                    </tr>
                  ) : (
                    alumniList.map((alumni, idx) => (
                      <tr key={alumni.id} className="hover:bg-[var(--surface-recessed)]/50">
                        <td className="py-2.5 px-3 font-mono text-[var(--text-tertiary)]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[var(--text-primary)]">{alumni.nis}</td>
                        <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">{alumni.name}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[10px]">{alumni.gender}</td>
                        <td className="py-2.5 px-3 font-mono text-[var(--text-secondary)]">{alumni.graduationYear}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[var(--text-primary)]">Kelas {alumni.lastClass}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
