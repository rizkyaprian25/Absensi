import type { AssessmentItem, StudentScoreRecord } from "../grades";
import {
  AUTHENTIC_INITIAL_ASSESSMENTS,
  AUTHENTIC_INITIAL_SCORES,
} from "./authenticGradesData";

// ============================================================================
// DATA AWAL PENILAIAN SISWA KELAS 7, 8 & 9 (SSOT OFFLINE-FIRST)
// Memuat 43 asesmen lengkap (7A-7H, 8A, 8B) dan 757 nilai otentik siswa.
// Memastikan saat dibuka di peramban baru atau mode Incognito, seluruh data
// penilaian dan nilai siswa langsung otomatis tampil 100% tanpa perlu tindakan manual.
// ============================================================================

export interface Grade7TargetClassConfig {
  id: string;
  name: string;
  scheduleDay: string;
  dates: [string, string, string, string]; // Tugas 1, Tugas 2, Tugas 3, UH 1
}

/**
 * Daftar kelas 7 dan tanggal default untuk template asesmen
 */
export const GRADE_7_TARGET_CLASSES: Grade7TargetClassConfig[] = [
  { id: "class-7a", name: "7A", scheduleDay: "Senin", dates: ["2026-08-03", "2026-08-17", "2026-09-07", "2026-09-21"] },
  { id: "class-7b", name: "7B", scheduleDay: "Selasa", dates: ["2026-08-04", "2026-08-18", "2026-09-08", "2026-09-22"] },
  { id: "class-7c", name: "7C", scheduleDay: "Jumat", dates: ["2026-08-07", "2026-08-21", "2026-09-11", "2026-09-25"] },
  { id: "class-7d", name: "7D", scheduleDay: "Senin", dates: ["2026-08-03", "2026-08-17", "2026-09-07", "2026-09-21"] },
  { id: "class-7e", name: "7E", scheduleDay: "Rabu", dates: ["2026-08-05", "2026-08-19", "2026-09-09", "2026-09-23"] },
  { id: "class-7f", name: "7F", scheduleDay: "Rabu", dates: ["2026-08-05", "2026-08-19", "2026-09-09", "2026-09-23"] },
  { id: "class-7g", name: "7G", scheduleDay: "Jumat", dates: ["2026-08-07", "2026-08-21", "2026-09-11", "2026-09-25"] },
  { id: "class-7h", name: "7H", scheduleDay: "Kamis", dates: ["2026-08-06", "2026-08-20", "2026-09-10", "2026-09-24"] },
];

/**
 * Menghasilkan daftar 4 asesmen baku (Tugas 1, Tugas 2, Tugas 3, UH 1) untuk satu kelas 7
 */
export function generateAssessmentsForClass7(
  classId: string,
  dates: [string, string, string, string]
): AssessmentItem[] {
  return [
    {
      id: `asmt-${classId}-tugas-1`,
      classId,
      subject: "Informatika",
      type: "TUGAS",
      title: "Tugas 1 : Algoritma",
      description: "Pemahaman konsep dasar algoritma dan berpikir komputasional",
      date: dates[0],
      maxScore: 100,
      weight: 1,
      createdAt: "2026-07-15T00:00:00.000Z",
    },
    {
      id: `asmt-${classId}-tugas-2`,
      classId,
      subject: "Informatika",
      type: "TUGAS",
      title: "Tugas 2 : Optimasi",
      description: "Optimasi penjadwalan dan efisiensi langkah kerja komputasi",
      date: dates[1],
      maxScore: 100,
      weight: 1,
      createdAt: "2026-07-15T00:00:00.000Z",
    },
    {
      id: `asmt-${classId}-tugas-3`,
      classId,
      subject: "Informatika",
      type: "TUGAS",
      title: "Tugas 3 : Penjelasan Data",
      description: "Analisis dan penjelasan representasi data digital",
      date: dates[2],
      maxScore: 100,
      weight: 1,
      createdAt: "2026-07-15T00:00:00.000Z",
    },
    {
      id: `asmt-${classId}-uh-1`,
      classId,
      subject: "Informatika",
      type: "UH",
      title: "UH 1 : Data dan Fungsi Tombol Keyboard",
      description: "Ulangan harian evaluasi materi data dan fungsi tombol keyboard komputer",
      date: dates[3],
      maxScore: 100,
      weight: 1,
      createdAt: "2026-07-15T00:00:00.000Z",
    },
  ];
}

/**
 * Menghasilkan seluruh asesmen awal kelas 7 (7A-7H)
 */
export function generateGrade7InitialAssessments(): AssessmentItem[] {
  const all: AssessmentItem[] = [];
  for (const item of GRADE_7_TARGET_CLASSES) {
    all.push(...generateAssessmentsForClass7(item.id, item.dates));
  }
  return all;
}

/**
 * Seluruh data asesmen otentik awal (43 asesmen: 7A, 7B, 7C, 7D, 7E, 7F, 7G, 7H, 8A, 8B)
 */
export const INITIAL_MOCK_ASSESSMENTS: AssessmentItem[] = AUTHENTIC_INITIAL_ASSESSMENTS;

/**
 * Seluruh catatan nilai otentik awal siswa (757 catatan nilai dari riwayat input guru)
 */
export function generateInitialMockScores(): StudentScoreRecord[] {
  return [...AUTHENTIC_INITIAL_SCORES];
}
