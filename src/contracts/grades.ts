import { z } from "zod";

// ============================================================================
// KONSTANTA & ENUM PENILAIAN SISWA (SSOT)
// ============================================================================

/** Batas KKM default mata pelajaran Informatika SMPN 3 Cibungbulang */
export const DEFAULT_KKM = 75;

/**
 * Tipe / Kategori Asesmen Pembelajaran
 * Mendukung: Tugas, Ulangan Harian (Formatif), Quiz, UTS (PTS), UAS (PAS), Praktik, & Lainnya
 */
export const AssessmentTypeSchema = z.enum([
  "TUGAS",
  "UH",
  "QUIZ",
  "UTS",
  "UAS",
  "PRAKTIK",
  "LAINNYA",
]);

export type AssessmentType = z.infer<typeof AssessmentTypeSchema>;

/**
 * Metadata & label representasi visual untuk setiap kategori penilaian
 */
export interface AssessmentTypeMeta {
  type: AssessmentType;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  defaultWeight: number; // Bobot persentase kalkulasi nilai akhir
}

export const ASSESSMENT_TYPE_METAS: Record<AssessmentType, AssessmentTypeMeta> = {
  TUGAS: {
    type: "TUGAS",
    label: "Tugas Mandiri / Kelompok",
    shortLabel: "Tugas",
    description: "Tugas latihan, pekerjaan rumah (PR), lembar kerja siswa (LKS)",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    defaultWeight: 20,
  },
  UH: {
    type: "UH",
    label: "Ulangan Harian (Formatif)",
    shortLabel: "UH",
    description: "Evaluasi bab/materi kompetensi harian",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    defaultWeight: 20,
  },
  QUIZ: {
    type: "QUIZ",
    label: "Kuis Cepat",
    shortLabel: "Kuis",
    description: "Uji pemahaman kilat di awal / akhir pembelajaran",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    defaultWeight: 10,
  },
  UTS: {
    type: "UTS",
    label: "Penilaian Tengah Semester (PTS)",
    shortLabel: "UTS",
    description: "Asesmen sumatif tengah semester ganjil/genap",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    defaultWeight: 25,
  },
  UAS: {
    type: "UAS",
    label: "Penilaian Akhir Semester (PAS)",
    shortLabel: "UAS",
    description: "Asesmen sumatif akhir semester",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    defaultWeight: 25,
  },
  PRAKTIK: {
    type: "PRAKTIK",
    label: "Praktik Komputer / Proyek",
    shortLabel: "Praktik",
    description: "Praktikum laboratorium komputer, coding, proyek pembuatan dokumen/presentasi",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    defaultWeight: 20,
  },
  LAINNYA: {
    type: "LAINNYA",
    label: "Penilaian Lainnya",
    shortLabel: "Lainnya",
    description: "Portofolio, keaktifan kelas, unjuk kerja, remedial, atau asesmen kustom",
    badgeClass: "bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
    defaultWeight: 10,
  },
};

// ============================================================================
// SKEMA & PREDIKAT NILAI SIKAP SISWA (BURUK, KURANG BAIK, BAIK, SANGAT BAIK)
// ============================================================================

/**
 * Tipe Predikat Nilai Sikap Siswa
 * Ketentuan: Sangat Baik, Baik, Kurang Baik, Buruk
 */
export const AttitudeGradeSchema = z.enum([
  "SANGAT_BAIK",
  "BAIK",
  "KURANG_BAIK",
  "BURUK",
]);

export type AttitudeGrade = z.infer<typeof AttitudeGradeSchema>;

export interface AttitudeGradeMeta {
  code: AttitudeGrade;
  label: string; // "Sangat Baik", "Baik", "Kurang Baik", "Buruk"
  shortLabel: string; // "SB", "B", "KB", "BR"
  predicate: string; // "A", "B", "C", "D"
  description: string;
  badgeClass: string;
  color: string;
}

export const ATTITUDE_GRADE_METAS: Record<AttitudeGrade, AttitudeGradeMeta> = {
  SANGAT_BAIK: {
    code: "SANGAT_BAIK",
    label: "Sangat Baik",
    shortLabel: "SB",
    predicate: "A",
    description: "Menunjukkan sikap dan perilaku yang sangat teladan, santun, serta disiplin tinggi",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    color: "#059669",
  },
  BAIK: {
    code: "BAIK",
    label: "Baik",
    shortLabel: "B",
    predicate: "B",
    description: "Menunjukkan sikap dan perilaku yang baik, tertib, dan menghargai lingkungan sekolah",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    color: "#2563EB",
  },
  KURANG_BAIK: {
    code: "KURANG_BAIK",
    label: "Kurang Baik",
    shortLabel: "KB",
    predicate: "C",
    description: "Perlu bimbingan dan pembinaan dalam kedisiplinan atau keaktifan belajar",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    color: "#D97706",
  },
  BURUK: {
    code: "BURUK",
    label: "Buruk",
    shortLabel: "BR",
    predicate: "D",
    description: "Menunjukkan perilaku indisipliner berulang yang memerlukan koordinasi wali kelas / BP",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800",
    color: "#DC2626",
  },
};

/** Nilai sikap default bagi seluruh siswa */
export const DEFAULT_ATTITUDE_GRADE: AttitudeGrade = "BAIK";

/**
 * Memformat label nilai sikap ke string representatif
 */
export function formatAttitudeLabel(grade?: AttitudeGrade | null): string {
  if (!grade) return "-";
  return ATTITUDE_GRADE_METAS[grade]?.label ?? String(grade);
}

/**
 * Mengurai string nilai sikap secara toleran (misal dari input teks atau impor)
 */
export function parseAttitudeGrade(val: string | null | undefined): AttitudeGrade | null {
  if (!val) return null;
  const clean = val.trim().toUpperCase();
  if (clean === "SANGAT_BAIK" || clean === "SANGAT BAIK" || clean === "SB" || clean === "A") {
    return "SANGAT_BAIK";
  }
  if (clean === "BAIK" || clean === "B") {
    return "BAIK";
  }
  if (clean === "KURANG_BAIK" || clean === "KURANG BAIK" || clean === "KB" || clean === "CUP" || clean === "C") {
    return "KURANG_BAIK";
  }
  if (clean === "BURUK" || clean === "BR" || clean === "D") {
    return "BURUK";
  }
  return null;
}

// ============================================================================
// SKEMA DATA PENILAIAN & NILAI SISWA
// ============================================================================

export const AssessmentItemSchema = z.object({
  id: z.string().min(1),
  classId: z.string().min(1),
  subject: z.string().default("Informatika"),
  subjectId: z.string().optional(),
  type: AssessmentTypeSchema,
  title: z.string().min(1, "Judul penilaian wajib diisi"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  maxScore: z.number().min(1).default(100),
  weight: z.number().min(0).default(1),
  createdAt: z.string(),
});

export type AssessmentItem = z.infer<typeof AssessmentItemSchema>;

export const StudentScoreRecordSchema = z.object({
  id: z.string().min(1),
  assessmentId: z.string().min(1),
  studentId: z.string().min(1),
  score: z.number().min(0).max(100).nullable(),
  feedback: z.string().optional(),
  updatedAt: z.string(),
});

export type StudentScoreRecord = z.infer<typeof StudentScoreRecordSchema>;

/**
 * Ringkasan Nilai Siswa untuk Rekap & Buku Nilai Raport
 */
export interface StudentGradeSummary {
  studentId: string;
  studentName: string;
  nis?: string | null;
  gender?: "L" | "P" | null;
  scores: Record<string, number | null>; // assessmentId -> score
  categoryAverages: Record<AssessmentType, number | null>;
  finalScore: number | null; // Nilai Rata-rata Akhir (0-100)
  predicate: "A" | "B" | "C" | "D" | "-";
  attitudeGrade?: AttitudeGrade; // Nilai Sikap: SANGAT_BAIK | BAIK | KURANG_BAIK | BURUK
  isPassed: boolean; // true jika finalScore >= KKM
  gradedCount: number; // Jumlah tugas yang telah memiliki nilai
  totalCount: number; // Total tugas di kelas
}

/** Daftar angkatan standar SMP */
export const DEFAULT_GRADE_LEVELS = ["7", "8", "9"] as const;
export type GradeLevel = (typeof DEFAULT_GRADE_LEVELS)[number];

/** Peta KKM per angkatan kelas */
export type GradeLevelKkmMap = Record<string, number>;

/** Nilai default KKM per angkatan (Informatika SMPN 3 Cibungbulang) */
export const DEFAULT_KKM_BY_GRADE: GradeLevelKkmMap = {
  "7": 82,
  "8": 83,
  "9": 84,
};

/**
 * Mengekstrak tingkat / angkatan kelas dari nama kelas
 * Contoh: "7A" -> "7", "8B" -> "8", "Kelas 9A" -> "9", "VII-A" -> "7"
 */
export function extractGradeLevel(classNameOrGrade?: string | null): string {
  if (!classNameOrGrade) return "7";
  const str = classNameOrGrade.trim().toUpperCase();

  // Deteksi angka langsung (7, 8, 9)
  const matchNum = str.match(/\b(7|8|9)\b/) || str.match(/^(7|8|9)/) || str.match(/(?:KELAS\s*|TINGKAT\s*)?(7|8|9)/);
  if (matchNum) return matchNum[1];

  // Deteksi Romawi (VII, VIII, IX)
  if (str.includes("VIII") || str.startsWith("8")) return "8";
  if (str.includes("VII") || str.startsWith("7")) return "7";
  if (str.includes("IX") || str.startsWith("9")) return "9";

  return "7";
}

/**
 * Predikat Nilai SMP Berdasarkan KKM Angkatan:
 * - Skor < KKM: D (Perlu Bimbingan / Remedial)
 * - Skor >= 90: A (Sangat Baik)
 * - Skor >= 80: B (Baik)
 * - Skor >= KKM: C (Cukup / Tuntas)
 */
export function getGradePredicate(score: number | null, kkm: number = DEFAULT_KKM): "A" | "B" | "C" | "D" | "-" {
  if (score === null || isNaN(score)) return "-";
  if (score < kkm) return "D";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  return "C";
}
