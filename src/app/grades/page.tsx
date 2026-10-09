"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Plus,
  Search,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ArrowUpDown,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Calendar,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Users,
  Download,
} from "lucide-react";

import {
  MOCK_CLASSES,
  getStudentsForClass,
} from "@/contracts/mocks/attendanceMocks";
import type { Student } from "@/contracts/attendance";
import type {
  AssessmentItem,
  AssessmentType,
  StudentGradeSummary,
} from "@/contracts/grades";
import {
  DEFAULT_KKM,
  ASSESSMENT_TYPE_METAS,
  getGradePredicate,
} from "@/contracts/grades";
import {
  getStoredAssessments,
  getStoredScores,
  getStoredKKM,
  saveStoredKKM,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  updateSingleScore,
  batchFillScores,
  calculateStudentGradeSummary,
  calculateClassGradeStats,
  exportGradesToCSV,
  clearAssessmentsForClass,
} from "@/lib/gradeStorage";
import {
  generateGradesExcelHtmlWithKop,
  generateGradesCsvWithKop,
  generateGradesXlsxWithKop,
  downloadXlsxFile,
} from "@/lib/exportUtils";

function GradesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. State Pilihan Kelas
  const initialClassId = searchParams.get("classId") || "class-7a";
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);

  // 2. Data Penilaian & Nilai
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [scores, setScores] = useState<ReturnType<typeof getStoredScores>>([]);
  const [kkm, setKkm] = useState<number>(DEFAULT_KKM);

  // 3. Filter & Pencarian
  const [categoryFilter, setCategoryFilter] = useState<AssessmentType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"absen" | "nama" | "nilai_desc" | "nilai_asc">("absen");

  // 4. Modal States
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentItem | null>(null);

  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickEntryAssessmentId, setQuickEntryAssessmentId] = useState<string>("");
  const [quickScores, setQuickScores] = useState<Record<string, string>>({});
  const [bulkValue, setBulkValue] = useState<string>("");
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>("");
  const [quickStatusFilter, setQuickStatusFilter] = useState<"ALL" | "UNGRADED" | "GRADED" | "REMEDIAL">("ALL");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isKkmModalOpen, setIsKkmModalOpen] = useState(false);
  const [tempKkm, setTempKkm] = useState<number>(DEFAULT_KKM);

  // 5. Active Inline Score Edit
  const [editingCell, setEditingCell] = useState<{ studentId: string; assessmentId: string } | null>(null);
  const [cellInputValue, setCellInputValue] = useState<string>("");

  // Muat data awal dari localStorage
  const refreshData = () => {
    setAssessments(getStoredAssessments());
    setScores(getStoredScores());
    const savedKkm = getStoredKKM();
    setKkm(savedKkm);
    setTempKkm(savedKkm);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update URL jika kelas diganti
  const handleSelectClass = (clsId: string) => {
    setSelectedClassId(clsId);
    router.replace(`/grades?classId=${clsId}`);
  };

  const currentClass = MOCK_CLASSES.find((c) => c.id === selectedClassId) ?? MOCK_CLASSES[0];
  const students: Student[] = useMemo(() => {
    return getStudentsForClass(selectedClassId);
  }, [selectedClassId]);

  // Asesmen untuk kelas yang dipilih
  const classAssessments = useMemo(() => {
    return assessments.filter((a) => a.classId === selectedClassId);
  }, [assessments, selectedClassId]);

  // Asesmen setelah difilter kategori
  const filteredAssessments = useMemo(() => {
    if (categoryFilter === "ALL") return classAssessments;
    return classAssessments.filter((a) => a.type === categoryFilter);
  }, [classAssessments, categoryFilter]);

  // Ringkasan nilai per siswa
  const studentSummaries: StudentGradeSummary[] = useMemo(() => {
    return students.map((student) =>
      calculateStudentGradeSummary(student, classAssessments, scores, kkm)
    );
  }, [students, classAssessments, scores, kkm]);

  // Statistik Kelas
  const stats = useMemo(() => {
    return calculateClassGradeStats(studentSummaries, kkm);
  }, [studentSummaries, kkm]);

  // Filter & Urutkan Siswa
  const sortedAndFilteredSummaries = useMemo(() => {
    let result = [...studentSummaries];

    // Filter pencarian nama/NIS
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          (s.nis && s.nis.toLowerCase().includes(q))
      );
    }

    // Pengurutan
    if (sortBy === "nama") {
      result.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else if (sortBy === "nilai_desc") {
      result.sort((a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1));
    } else if (sortBy === "nilai_asc") {
      result.sort((a, b) => (a.finalScore ?? 999) - (b.finalScore ?? 999));
    }
    // "absen" mengikuti urutan asli array students

    return result;
  }, [studentSummaries, searchQuery, sortBy]);

  // Daftar Siswa Terfilter untuk Modal Input Nilai Cepat (Pencarian Nama & Filter Status)
  const filteredQuickStudents = useMemo(() => {
    let list = students.map((s, originalIdx) => ({
      student: s,
      originalIndex: originalIdx + 1,
    }));

    if (quickSearchQuery.trim()) {
      const q = quickSearchQuery.toLowerCase().trim();
      list = list.filter(
        ({ student }) =>
          student.fullName.toLowerCase().includes(q) ||
          (student.nis && student.nis.toLowerCase().includes(q))
      );
    }

    if (quickStatusFilter !== "ALL") {
      list = list.filter(({ student }) => {
        const val = quickScores[student.id]?.trim();
        const num = val === "" || val === undefined ? null : Number(val);
        if (quickStatusFilter === "UNGRADED") return num === null;
        if (quickStatusFilter === "GRADED") return num !== null;
        if (quickStatusFilter === "REMEDIAL") return num !== null && num < kkm;
        return true;
      });
    }

    return list;
  }, [students, quickSearchQuery, quickStatusFilter, quickScores, kkm]);

  // Statistik status penilaian pada modal cepat
  const quickCounts = useMemo(() => {
    let ungraded = 0;
    let graded = 0;
    let remedial = 0;

    students.forEach((s) => {
      const val = quickScores[s.id]?.trim();
      const num = val === "" || val === undefined ? null : Number(val);
      if (num === null) {
        ungraded++;
      } else {
        graded++;
        if (num < kkm) remedial++;
      }
    });

    return { ungraded, graded, remedial };
  }, [students, quickScores, kkm]);

  // Simpan Penilaian Baru atau Perbarui
  const handleSaveAssessment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string).trim();
    const type = formData.get("type") as AssessmentType;
    const date = formData.get("date") as string;
    const maxScore = Number(formData.get("maxScore")) || 100;
    const weight = Number(formData.get("weight")) || 1;
    const description = (formData.get("description") as string)?.trim() || "";

    if (!title || !date) return;

    if (editingAssessment) {
      updateAssessment(editingAssessment.id, {
        title,
        type,
        date,
        maxScore,
        weight,
        description,
      });
    } else {
      createAssessment({
        classId: selectedClassId,
        subject: currentClass.subject || "Informatika",
        title,
        type,
        date,
        maxScore,
        weight,
        description,
      });
    }

    refreshData();
    setIsAssessmentModalOpen(false);
    setEditingAssessment(null);
  };

  // Hapus Penilaian
  const handleDeleteAssessment = (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus penilaian "${title}"? Seluruh nilai siswa pada penilaian ini akan ikut terhapus.`)) {
      deleteAssessment(id);
      refreshData();
    }
  };

  // Mulai Edit Nilai Inline Cell
  const handleStartCellEdit = (studentId: string, assessmentId: string, currentScore: number | null) => {
    setEditingCell({ studentId, assessmentId });
    setCellInputValue(currentScore !== null && currentScore !== undefined ? String(currentScore) : "");
  };

  // Simpan Edit Nilai Inline Cell
  const handleSaveCellEdit = () => {
    if (!editingCell) return;
    const val = cellInputValue.trim();
    const num = val === "" ? null : Number(val);

    if (num !== null && (isNaN(num) || num < 0 || num > 100)) {
      alert("Nilai harus berupa angka antara 0 sampai 100.");
      return;
    }

    updateSingleScore(editingCell.assessmentId, editingCell.studentId, num);
    refreshData();
    setEditingCell(null);
  };

  // Buka Modal Input Nilai Cepat
  const handleOpenQuickEntry = (asmtId?: string) => {
    const targetId = asmtId || (filteredAssessments[0]?.id ?? classAssessments[0]?.id ?? "");
    if (!targetId) {
      alert("Belum ada asesmen yang dibuat untuk kelas ini. Tambahkan asesmen terlebih dahulu.");
      return;
    }

    setQuickEntryAssessmentId(targetId);

    // Muat nilai saat ini ke form
    const currentScoresMap: Record<string, string> = {};
    students.forEach((s) => {
      const match = scores.find(
        (sc) => sc.assessmentId === targetId && sc.studentId === s.id
      );
      currentScoresMap[s.id] =
        match?.score !== null && match?.score !== undefined ? String(match.score) : "";
    });

    setQuickScores(currentScoresMap);
    setBulkValue("");
    setQuickSearchQuery(searchQuery.trim());
    setQuickStatusFilter("ALL");
    setIsQuickEntryOpen(true);
  };

  // Simpan Input Nilai Cepat
  const handleSaveQuickEntry = () => {
    if (!quickEntryAssessmentId) return;

    students.forEach((s) => {
      const val = quickScores[s.id]?.trim();
      const num = val === "" || val === undefined ? null : Number(val);
      if (num === null || (!isNaN(num) && num >= 0 && num <= 100)) {
        updateSingleScore(quickEntryAssessmentId, s.id, num);
      }
    });

    refreshData();
    setIsQuickEntryOpen(false);
    showToast(`Nilai berhasil disimpan untuk ${students.length} siswa.`);
  };

  // Terapkan Nilai Massal
  const handleApplyBulkScore = () => {
    const num = Number(bulkValue);
    if (isNaN(num) || num < 0 || num > 100) {
      alert("Masukkan nilai massal antara 0 sampai 100.");
      return;
    }

    const targetStudents =
      filteredQuickStudents.length < students.length
        ? filteredQuickStudents.map((f) => f.student)
        : students;

    const updated = { ...quickScores };
    targetStudents.forEach((s) => {
      updated[s.id] = String(num);
    });
    setQuickScores(updated);
    showToast(`Nilai massal ${num} diterapkan untuk ${targetStudents.length} siswa.`);
  };

  // Simpan Pengaturan KKM
  const handleSaveKkm = () => {
    if (tempKkm < 1 || tempKkm > 100) {
      alert("KKM harus berada di antara 1 sampai 100.");
      return;
    }
    saveStoredKKM(tempKkm);
    setKkm(tempKkm);
    setIsKkmModalOpen(false);
  };

  // Unduh Berkas Excel (.xlsx) Ber-Kop Resmi
  const handleDownloadExcel = () => {
    const xlsxBuffer = generateGradesXlsxWithKop(
      currentClass.name,
      classAssessments,
      studentSummaries,
      kkm
    );

    const filename = `Daftar_Nilai_Kelas_${currentClass.name}_Informatika_SMPN3Cibungbulang_${new Date().toISOString().slice(0, 10)}.xlsx`;
    downloadXlsxFile(xlsxBuffer, filename);

    setToastMessage(`Berkas Excel (.xlsx) Nilai Kelas ${currentClass.name} berhasil diunduh`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Unduh Berkas CSV Ber-Kop Resmi
  const handleDownloadCSV = () => {
    const csvContent = generateGradesCsvWithKop(
      currentClass.name,
      classAssessments,
      studentSummaries,
      kkm
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Daftar_Nilai_Kelas_${currentClass.name}_Informatika_SMPN3Cibungbulang_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Konfirmasi & Kosongkan Penilaian Kelas Terpilih
  const handleClearAssessments = () => {
    const isConfirm = window.confirm(
      `Apakah Anda yakin ingin mengosongkan seluruh penilaian dan nilai untuk Kelas ${currentClass.name}? Semua tugas, ulangan, dan nilai yang dibuat pada kelas ini akan dihapus bersih.`
    );
    if (!isConfirm) return;

    clearAssessmentsForClass(selectedClassId);
    refreshData();
  };

  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--status-hadir-fg)] text-white px-4 py-2.5 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-4 print:hidden">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Utama Buku Nilai */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-[6px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-semibold uppercase tracking-wider">
              Buku Nilai Digital
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              Tahun Ajaran 2026/2027 · Semester Ganjil
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Daftar Nilai &amp; Asesmen
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            SMP Negeri 3 Cibungbulang · Informatika · Guru: Muhamad Rizky Aprian, S.Kom
          </p>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsKkmModalOpen(true)}
            className="px-3 py-2 bg-[var(--surface-recessed)] hover:bg-[var(--surface-recessed)]/80 text-[var(--text-primary)] border border-[var(--border-hairline)] rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>KKM: <strong className="font-mono text-[var(--color-accent)]">{kkm}</strong></span>
          </button>

          {/* Tombol Ekspor Excel Ber-Kop */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
            title="Unduh berkas Excel (.xlsx) dengan Kop Surat Resmi SMPN 3 Cibungbulang"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          {/* Tombol Ekspor CSV Ber-Kop */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-3 py-2 bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--text-primary)] border border-[var(--border-hairline)] rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
            title="Unduh berkas CSV dengan format Kop Surat Resmi"
          >
            <Download className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Ekspor CSV</span>
          </button>

          {/* Tombol Kosongkan Nilai (Hanya muncul jika kelas memiliki asesmen) */}
          {classAssessments.length > 0 && (
            <button
              type="button"
              onClick={handleClearAssessments}
              className="px-3 py-2 bg-[var(--surface-card)] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 border border-[var(--border-hairline)] hover:border-rose-300 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Kosongkan seluruh penilaian dan nilai kelas ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosongkan Nilai</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingAssessment(null);
              setIsAssessmentModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-[var(--color-on-accent)] rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Penilaian</span>
          </button>
        </div>
      </div>

      {/* Pemilih Kelas (Rombel Switcher 7A-7H, 8A-8B) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Pilih Kelas Mengajar:</span>
          </label>
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            {students.length} Siswa Terdaftar
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MOCK_CLASSES.map((cls) => {
            const isSelected = cls.id === selectedClassId;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => handleSelectClass(cls.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-[10px] text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-xs scale-102"
                    : "bg-[var(--surface-card)] border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-accent)]/50"
                }`}
              >
                Kelas {cls.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kartu Ringkasan Metrik Kelas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[12px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
            <span>Rata-rata Kelas</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              {stats.classAverage > 0 ? stats.classAverage : "-"}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">/ 100</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
            Dari {stats.totalGradedStudents} siswa bernilai
          </p>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[12px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
            <span>Ketuntasan Belajar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.passingRate}%
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              ({stats.passedCount}/{stats.totalGradedStudents})
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
            Mencapai KKM ({kkm})
          </p>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[12px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
            <span>Perlu Remedial</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold font-mono ${stats.remedialCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-[var(--text-primary)]"}`}>
              {stats.remedialCount}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">Siswa</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
            Nilai di bawah {kkm}
          </p>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[12px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
            <span>Total Penilaian</span>
            <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              {classAssessments.length}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">Asesmen</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
            Tugas, UH, Quiz, UTS &amp; UAS
          </p>
        </div>
      </div>

      {/* Banner Penilaian Bersih / Kosong Sesuai Permintaan Guru */}
      {classAssessments.length === 0 && (
        <div className="bg-[var(--surface-card)] border-2 border-dashed border-[var(--border-hairline)] rounded-[16px] p-8 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Buku Nilai Kelas {currentClass.name} Masih Kosong
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mt-1 mb-4 leading-relaxed">
            Data penilaian tugas, ulangan harian, kuis, UTS, dan UAS telah dikosongkan. Anda dapat membuat penilaian mandiri sesuai jadwal dan materi ajar Anda.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingAssessment(null);
              setIsAssessmentModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-[var(--color-on-accent)] rounded-[10px] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Penilaian Pertama</span>
          </button>
        </div>
      )}

      {/* Filter Kategori Asesmen & Pencarian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--surface-card)] p-3 rounded-[12px] border border-[var(--border-hairline)]">
        {/* Filter Kategori Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold shrink-0 transition-colors ${
              categoryFilter === "ALL"
                ? "bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Semua ({classAssessments.length})
          </button>
          {(Object.keys(ASSESSMENT_TYPE_METAS) as AssessmentType[]).map((cat) => {
            const count = classAssessments.filter((a) => a.type === cat).length;
            const meta = ASSESSMENT_TYPE_METAS[cat];
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1.5 rounded-[8px] text-xs font-medium shrink-0 transition-colors flex items-center gap-1 ${
                  isSelected
                    ? "bg-[var(--text-primary)] text-[var(--surface-card)] font-bold"
                    : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>{meta.shortLabel}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Input Pencarian & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa atau NIS..."
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[8px] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[8px] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] shrink-0"
          >
            <option value="absen">Urut: No. Absen</option>
            <option value="nama">Urut: Nama A-Z</option>
            <option value="nilai_desc">Urut: Nilai Tertinggi</option>
            <option value="nilai_asc">Urut: Nilai Terendah</option>
          </select>

          {filteredAssessments.length > 0 && (
            <button
              type="button"
              onClick={() => handleOpenQuickEntry()}
              className="px-3 py-1.5 bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/25 rounded-[8px] text-xs font-semibold shrink-0 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Input Nilai Cepat</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabel Matriks Rekap Nilai Siswa (Apple HIG Ledger Style) */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full text-left border-collapse text-xs">
            {/* Header Tabel */}
            <thead className="bg-[var(--surface-recessed)] border-b border-[var(--border-hairline)] sticky top-0 z-20">
              <tr>
                <th className="py-3 px-2.5 text-center font-bold text-[var(--text-secondary)] w-10 sticky left-0 bg-[var(--surface-recessed)] z-20">
                  No
                </th>
                <th className="py-3 px-3 font-bold text-[var(--text-secondary)] min-w-[200px] sticky left-10 bg-[var(--surface-recessed)] z-20 border-r border-[var(--border-hairline)] shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                  Nama Siswa / NIS
                </th>

                {/* Kolom Tiap Asesmen */}
                {filteredAssessments.length === 0 ? (
                  <th className="py-2.5 px-4 font-normal text-[var(--text-secondary)] italic border-r border-[var(--border-hairline)] min-w-[220px]">
                    Belum ada penilaian dibuat
                  </th>
                ) : (
                  filteredAssessments.map((asmt) => {
                  const meta = ASSESSMENT_TYPE_METAS[asmt.type];
                  return (
                    <th
                      key={asmt.id}
                      className="py-2.5 px-3 min-w-[140px] max-w-[160px] border-r border-[var(--border-hairline)] align-top group"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${meta.badgeClass}`}>
                            {meta.shortLabel}
                          </span>
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAssessment(asmt);
                                setIsAssessmentModalOpen(true);
                              }}
                              title="Ubah Penilaian"
                              className="p-0.5 hover:text-[var(--color-accent)]"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssessment(asmt.id, asmt.title)}
                              title="Hapus Penilaian"
                              className="p-0.5 hover:text-rose-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="font-semibold text-xs text-[var(--text-primary)] leading-tight line-clamp-2" title={asmt.title}>
                          {asmt.title}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono pt-0.5">
                          <span>{asmt.date.slice(5)}</span>
                          <span>Max {asmt.maxScore}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenQuickEntry(asmt.id)}
                          className="mt-1 w-full py-1 px-1.5 rounded-[6px] bg-[var(--surface-card)] hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)] text-[var(--text-primary)] font-semibold text-[10px] flex items-center justify-center gap-1 transition-all border border-[var(--border-hairline)] shadow-2xs"
                          title={`Buka form input nilai untuk ${asmt.title}`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Beri Nilai</span>
                        </button>
                      </div>
                    </th>
                  );
                })
              )}

                {/* Kolom Hasil & KKM */}
                <th className="py-3 px-3 text-center font-bold text-[var(--text-secondary)] min-w-[90px] bg-[var(--surface-recessed)] border-r border-[var(--border-hairline)]">
                  Nilai Akhir
                </th>
                <th className="py-3 px-2.5 text-center font-bold text-[var(--text-secondary)] w-14 bg-[var(--surface-recessed)] border-r border-[var(--border-hairline)]">
                  Predikat
                </th>
                <th className="py-3 px-3 text-center font-bold text-[var(--text-secondary)] min-w-[95px] bg-[var(--surface-recessed)]">
                  Ket. KKM
                </th>
              </tr>
            </thead>

            {/* Isi Baris Siswa */}
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {sortedAndFilteredSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={filteredAssessments.length + 5}
                    className="py-12 text-center text-[var(--text-secondary)]"
                  >
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-sm">Tidak ada data siswa atau penilaian ditemukan</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau tambah penilaian baru</p>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredSummaries.map((summary, idx) => {
                  return (
                    <tr
                      key={summary.studentId}
                      className="hover:bg-[var(--surface-recessed)]/50 transition-colors"
                    >
                      {/* Nomor Urut */}
                      <td className="py-2.5 px-2.5 text-center font-mono text-[var(--text-secondary)] sticky left-0 bg-[var(--surface-card)] z-10">
                        {String(idx + 1).padStart(2, "0")}
                      </td>

                      {/* Nama & NIS Siswa */}
                      <td className="py-2.5 px-3 sticky left-10 bg-[var(--surface-card)] z-10 border-r border-[var(--border-hairline)] shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                        <div className="truncate">
                          <p className="font-semibold text-xs text-[var(--text-primary)] truncate">
                            {summary.studentName}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono truncate">
                            NIS {summary.nis ?? "-"} · {summary.gender === "L" ? "L" : "P"}
                          </p>
                        </div>
                      </td>

                      {/* Kolom Nilai Tiap Asesmen */}
                      {filteredAssessments.length === 0 ? (
                        <td className="py-2.5 px-4 text-center text-[var(--text-secondary)] italic border-r border-[var(--border-hairline)] text-[11px]">
                          -
                        </td>
                      ) : (
                        filteredAssessments.map((asmt) => {
                          const sc = summary.scores[asmt.id];
                          const isEditingThis =
                            editingCell?.studentId === summary.studentId &&
                            editingCell?.assessmentId === asmt.id;

                          const isUnderKkm = sc !== null && sc !== undefined && sc < kkm;

                          return (
                            <td
                              key={asmt.id}
                              className={`py-2 px-3 text-center border-r border-[var(--border-hairline)] font-mono transition-colors ${
                                isUnderKkm ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                              }`}
                            >
                              {isEditingThis ? (
                                <input
                                  autoFocus
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={cellInputValue}
                                  onChange={(e) => setCellInputValue(e.target.value)}
                                  onBlur={handleSaveCellEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveCellEdit();
                                    if (e.key === "Escape") setEditingCell(null);
                                  }}
                                  className="w-16 px-1.5 py-1 text-center font-mono text-xs bg-[var(--surface-card)] border-2 border-[var(--color-accent)] rounded outline-none shadow-xs"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStartCellEdit(summary.studentId, asmt.id, sc ?? null)
                                  }
                                  title="Klik untuk mengedit nilai"
                                  className={`w-full py-1 rounded text-xs transition-colors hover:bg-[var(--surface-recessed)] flex items-center justify-center gap-1 ${
                                    sc === null || sc === undefined
                                      ? "text-[var(--text-secondary)]/50"
                                      : isUnderKkm
                                      ? "text-amber-700 dark:text-amber-400 font-bold"
                                      : "text-[var(--text-primary)] font-semibold"
                                  }`}
                                >
                                  <span>{sc !== null && sc !== undefined ? sc : "-"}</span>
                                  {isUnderKkm && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })
                      )}

                      {/* Nilai Rata-rata Akhir */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-xs border-r border-[var(--border-hairline)] bg-[var(--surface-card)]">
                        <span
                          className={
                            summary.finalScore !== null && summary.finalScore < kkm
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-[var(--text-primary)]"
                          }
                        >
                          {summary.finalScore !== null ? summary.finalScore : "-"}
                        </span>
                      </td>

                      {/* Predikat Nilai */}
                      <td className="py-2.5 px-2.5 text-center font-bold text-xs border-r border-[var(--border-hairline)] font-mono">
                        <span
                          className={`inline-block w-5 h-5 rounded leading-5 text-[11px] ${
                            summary.predicate === "A"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : summary.predicate === "B"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : summary.predicate === "C"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                              : summary.predicate === "D"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          {summary.predicate}
                        </span>
                      </td>

                      {/* Keterangan KKM */}
                      <td className="py-2.5 px-3 text-center">
                        {summary.finalScore === null ? (
                          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                            Belum Ada Nilai
                          </span>
                        ) : summary.isPassed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--status-hadir-bg)] text-[var(--status-hadir-fg)]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tuntas</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--status-alpa-bg)] text-[var(--status-alpa-fg)]">
                            <AlertCircle className="w-3 h-3" />
                            <span>Remedial</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer Rata-rata Kelas */}
            {sortedAndFilteredSummaries.length > 0 && (
              <tfoot className="bg-[var(--surface-recessed)] border-t-2 border-[var(--border-hairline)] font-bold text-xs sticky bottom-0 z-20">
                <tr>
                  <td className="py-2.5 px-2.5 text-center sticky left-0 bg-[var(--surface-recessed)] z-20">
                    Σ
                  </td>
                  <td className="py-2.5 px-3 sticky left-10 bg-[var(--surface-recessed)] z-20 border-r border-[var(--border-hairline)] shadow-[2px_0_4px_rgba(0,0,0,0.02)] uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                    Rata-rata Kelas
                  </td>

                  {filteredAssessments.map((asmt) => {
                    const valid = sortedAndFilteredSummaries
                      .map((s) => s.scores[asmt.id])
                      .filter((sc): sc is number => typeof sc === "number" && !isNaN(sc));
                    const avg =
                      valid.length > 0
                        ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10
                        : "-";

                    return (
                      <td
                        key={asmt.id}
                        className="py-2.5 px-3 text-center font-mono border-r border-[var(--border-hairline)] text-[var(--text-primary)]"
                      >
                        {avg}
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-3 text-center font-mono text-emerald-700 dark:text-emerald-400 border-r border-[var(--border-hairline)]">
                    {stats.classAverage > 0 ? stats.classAverage : "-"}
                  </td>
                  <td className="py-2.5 px-2.5 text-center border-r border-[var(--border-hairline)]">
                    -
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[var(--text-secondary)]">
                    {stats.passingRate}% Tuntas
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* MODAL: Tambah / Ubah Penilaian */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] shadow-xl p-5 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">
                    {editingAssessment ? "Ubah Penilaian" : "Tambah Penilaian Baru"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Kelas {currentClass.name} · {currentClass.subject || "Informatika"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAssessmentModalOpen(false);
                  setEditingAssessment(null);
                }}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Kategori Penilaian
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(ASSESSMENT_TYPE_METAS) as AssessmentType[]).map((cat) => {
                    const meta = ASSESSMENT_TYPE_METAS[cat];
                    return (
                      <label
                        key={cat}
                        className="flex items-center gap-2 p-2 border border-[var(--border-hairline)] rounded-[8px] cursor-pointer hover:bg-[var(--surface-recessed)] has-checked:border-[var(--color-accent)] has-checked:bg-[var(--color-accent)]/10"
                      >
                        <input
                          type="radio"
                          name="type"
                          value={cat}
                          defaultChecked={editingAssessment ? editingAssessment.type === cat : cat === "TUGAS"}
                          className="accent-[var(--color-accent)]"
                        />
                        <span className="text-xs font-medium text-[var(--text-primary)]">
                          {meta.shortLabel}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Judul Penilaian / Materi Pokok *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Misal: Tugas 1: Algoritma dan Flowchart"
                  defaultValue={editingAssessment?.title || ""}
                  className="w-full px-3 py-2 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[8px] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Tanggal Penilaian
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={editingAssessment?.date || new Date().toISOString().slice(0, 10)}
                    className="w-full px-3 py-2 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[8px] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Nilai Maksimum
                  </label>
                  <input
                    type="number"
                    name="maxScore"
                    min={10}
                    max={100}
                    defaultValue={editingAssessment?.maxScore || 100}
                    className="w-full px-3 py-2 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[8px] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Bobot Penilaian
                  </label>
                  <input
                    type="number"
                    name="weight"
                    min={1}
                    max={100}
                    defaultValue={editingAssessment?.weight || 1}
                    className="w-full px-3 py-2 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[8px] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Deskripsi / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Tambahkan detail kompetensi dasar atau instruksi tugas..."
                  defaultValue={editingAssessment?.description || ""}
                  className="w-full px-3 py-2 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[8px] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssessmentModalOpen(false);
                    setEditingAssessment(null);
                  }}
                  className="px-3.5 py-2 rounded-[8px] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-[8px] text-xs font-semibold hover:bg-[var(--color-accent)]/90 shadow-xs"
                >
                  {editingAssessment ? "Simpan Perubahan" : "Buat Penilaian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Input Nilai Cepat (Quick Entry Drawer/Modal) */}
      {isQuickEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header Modal Input Cepat */}
            <div className="p-4 border-b border-[var(--border-hairline)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">
                    Input Nilai Cepat Berurutan
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Kelas {currentClass.name} · {students.length} Siswa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickEntryOpen(false)}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kontrol Penilaian & Nilai Massal */}
            <div className="p-4 bg-[var(--surface-recessed)]/50 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Pilih Penilaian yang Dinilai:
                </label>
                <select
                  value={quickEntryAssessmentId}
                  onChange={(e) => handleOpenQuickEntry(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[8px] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                >
                  {classAssessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.type}] {a.title} ({a.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2 shrink-0">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Isi Massal Semua:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    placeholder="Nilai (0-100)"
                    className="w-24 px-2 py-1.5 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[8px] text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyBulkScore}
                  className="px-3 py-1.5 bg-[var(--surface-recessed)] hover:bg-[var(--surface-recessed)]/80 text-[var(--text-primary)] border border-[var(--border-hairline)] rounded-[8px] text-xs font-semibold transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>

            {/* Toolbar Pencarian Siswa & Filter Status */}
            <div className="p-3 bg-[var(--surface-card)] border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredQuickStudents.length > 0) {
                      e.preventDefault();
                      const firstStudent = filteredQuickStudents[0];
                      document.getElementById(`quick-score-${firstStudent.student.id}`)?.focus();
                    }
                  }}
                  placeholder="Ketik nama siswa atau NIS untuk mencari..."
                  className="w-full pl-9 pr-8 py-2 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                {quickSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setQuickSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    title="Hapus kata kunci pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] shrink-0">
                <button
                  type="button"
                  onClick={() => setQuickStatusFilter("ALL")}
                  className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors shrink-0 ${
                    quickStatusFilter === "ALL"
                      ? "bg-[var(--text-primary)] text-[var(--surface-card)] font-bold"
                      : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Semua ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickStatusFilter("UNGRADED")}
                  className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors shrink-0 ${
                    quickStatusFilter === "UNGRADED"
                      ? "bg-amber-500 text-white font-bold"
                      : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Belum Dinilai ({quickCounts.ungraded})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickStatusFilter("GRADED")}
                  className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors shrink-0 ${
                    quickStatusFilter === "GRADED"
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Sudah Dinilai ({quickCounts.graded})
                </button>
                {quickCounts.remedial > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuickStatusFilter("REMEDIAL")}
                    className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors shrink-0 ${
                      quickStatusFilter === "REMEDIAL"
                        ? "bg-rose-600 text-white font-bold"
                        : "bg-[var(--surface-recessed)] text-[var(--status-alpa-fg)] hover:text-[var(--status-alpa-fg)]"
                    }`}
                  >
                    Remedial ({quickCounts.remedial})
                  </button>
                )}
              </div>
            </div>

            {/* Indikator Hasil Pencarian jika ada query atau filter */}
            {(quickSearchQuery || quickStatusFilter !== "ALL") && (
              <div className="px-4 py-1.5 bg-[var(--surface-recessed)]/60 border-b border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between shrink-0">
                <span>
                  Menampilkan <strong>{filteredQuickStudents.length}</strong> dari {students.length} siswa
                  {quickSearchQuery && <> dengan kata kunci &quot;<strong>{quickSearchQuery}</strong>&quot;</>}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQuickSearchQuery("");
                    setQuickStatusFilter("ALL");
                  }}
                  className="text-[var(--color-accent)] hover:underline font-semibold"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Daftar Siswa & Input Nilai (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-[var(--border-hairline)]">
              {filteredQuickStudents.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-secondary)] flex flex-col items-center justify-center">
                  <Search className="w-8 h-8 opacity-30 mb-2" />
                  <p className="font-semibold text-xs text-[var(--text-primary)]">
                    Tidak ada siswa yang sesuai pencarian
                  </p>
                  <p className="text-[11px] mt-1 text-[var(--text-secondary)] max-w-xs">
                    {quickSearchQuery ? `Tidak ada siswa dengan nama "${quickSearchQuery}".` : "Tidak ada siswa dalam kategori ini."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSearchQuery("");
                      setQuickStatusFilter("ALL");
                    }}
                    className="mt-3 px-3 py-1.5 rounded-[8px] bg-[var(--surface-recessed)] text-[var(--color-accent)] text-xs font-semibold hover:bg-[var(--border-hairline)] transition-colors"
                  >
                    Tampilkan Semua Siswa
                  </button>
                </div>
              ) : (
                filteredQuickStudents.map(({ student, originalIndex }, idx) => {
                  const currentVal = quickScores[student.id] ?? "";
                  const numVal = currentVal === "" ? null : Number(currentVal);
                  const isUnderKkm = numVal !== null && numVal < kkm;

                  return (
                    <div
                      key={student.id}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-[var(--surface-recessed)]/40 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs text-[var(--text-secondary)] w-7 text-center shrink-0 font-semibold">
                          #{String(originalIndex).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-[var(--text-primary)] truncate">
                            {student.fullName}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                            NIS {student.nis ?? "-"} · {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {numVal !== null ? (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono ${
                              isUnderKkm
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {isUnderKkm ? "Remedial" : "Tuntas"}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium font-mono text-[var(--text-secondary)] bg-[var(--surface-recessed)] border border-[var(--border-hairline)]/50">
                            Kosong
                          </span>
                        )}
                        <input
                          id={`quick-score-${student.id}`}
                          type="number"
                          min={0}
                          max={100}
                          value={currentVal}
                          placeholder="0-100"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const next = filteredQuickStudents[idx + 1];
                              if (next) {
                                document.getElementById(`quick-score-${next.student.id}`)?.focus();
                              } else {
                                handleSaveQuickEntry();
                              }
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuickScores((prev) => ({
                              ...prev,
                              [student.id]: val,
                            }));
                          }}
                          className={`w-20 px-2.5 py-1.5 text-center font-mono text-xs border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
                            isUnderKkm
                              ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-[var(--text-primary)]"
                              : "border-[var(--border-hairline)] bg-[var(--surface-card)] text-[var(--text-primary)]"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal Input Cepat */}
            <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--surface-recessed)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-[var(--text-secondary)]">
                Ketik nama di pencarian &rarr; Tekan <strong>Enter</strong> atau <strong>Tab</strong> untuk mengisi nilai berurutan
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsQuickEntryOpen(false)}
                  className="px-3.5 py-2 rounded-[8px] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-card)]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickEntry}
                  className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-[8px] text-xs font-semibold hover:bg-[var(--color-accent)]/90 shadow-xs"
                >
                  Simpan Seluruh Nilai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pengaturan KKM */}
      {isKkmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] shadow-xl p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--color-accent)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Kriteria Ketuntasan Minimal (KKM)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKkmModalOpen(false)}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Nilai standar ketuntasan belajar siswa untuk mata pelajaran Informatika SMPN 3 Cibungbulang.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Batas Nilai KKM (0 - 100)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={tempKkm}
                onChange={(e) => setTempKkm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[8px] font-mono text-base font-bold text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsKkmModalOpen(false)}
                className="px-3.5 py-2 rounded-[8px] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveKkm}
                className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-[8px] text-xs font-semibold hover:bg-[var(--color-accent)]/90 shadow-xs"
              >
                Terapkan KKM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GradesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-[var(--text-secondary)]">Memuat buku nilai...</div>}>
      <GradesPageContent />
    </Suspense>
  );
}
