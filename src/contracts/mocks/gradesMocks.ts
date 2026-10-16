import type { AssessmentItem, StudentScoreRecord } from "../grades";

// ============================================================================
// DATA AWAL PENILAIAN SISWA KELAS 7
// Sesuai arahan guru Informatika: 4 asesmen baku disiapkan di seluruh kelas 7,
// KECUALI 7A dan 7D yang dikelola mandiri oleh guru.
// Nilai siswa dikosongkan terlebih dahulu (kosong secara default).
// ============================================================================

export interface Grade7TargetClassConfig {
  id: string;
  name: string;
  scheduleDay: string;
  dates: [string, string, string, string]; // Tugas 1, Tugas 2, Tugas 3, UH 1
}

/**
 * Daftar kelas 7 yang menerima template 4 penilaian baku.
 * Kelas 7A dan 7D sengaja dikecualikan sesuai instruksi guru.
 */
export const GRADE_7_TARGET_CLASSES: Grade7TargetClassConfig[] = [
  { id: "class-7b", name: "7B", scheduleDay: "Selasa", dates: ["2026-08-04", "2026-08-18", "2026-09-08", "2026-09-22"] },
  { id: "class-7c", name: "7C", scheduleDay: "Jumat", dates: ["2026-08-07", "2026-08-21", "2026-09-11", "2026-09-25"] },
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
 * Menghasilkan seluruh asesmen awal kelas 7 (7B, 7C, 7E, 7F, 7G, 7H)
 */
export function generateGrade7InitialAssessments(): AssessmentItem[] {
  const all: AssessmentItem[] = [];
  for (const item of GRADE_7_TARGET_CLASSES) {
    all.push(...generateAssessmentsForClass7(item.id, item.dates));
  }
  return all;
}

export const INITIAL_MOCK_ASSESSMENTS: AssessmentItem[] = generateGrade7InitialAssessments();

/**
 * Catatan nilai awal (kosong secara default sesuai arahan guru: "untuk nilainya kosongkan saja dulu")
 */
export function generateInitialMockScores(): StudentScoreRecord[] {
  return [];
}
