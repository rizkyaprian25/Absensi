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
// SKEMA DATA PENILAIAN & NILAI SISWA
// ============================================================================

export const AssessmentItemSchema = z.object({
  id: z.string().min(1),
  classId: z.string().min(1),
  subject: z.string().default("Informatika"),
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
  isPassed: boolean; // true jika finalScore >= KKM
  gradedCount: number; // Jumlah tugas yang telah memiliki nilai
  totalCount: number; // Total tugas di kelas
}

/**
 * Predikat Nilai SMP:
 * A (Sangat Baik): 90 - 100
 * B (Baik): 80 - 89
 * C (Cukup): 75 - 79 (KKM)
 * D (Perlu Bimbingan / Remedial): < 75
 */
export function getGradePredicate(score: number | null, kkm: number = DEFAULT_KKM): "A" | "B" | "C" | "D" | "-" {
  if (score === null || isNaN(score)) return "-";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= kkm) return "C";
  return "D";
}
