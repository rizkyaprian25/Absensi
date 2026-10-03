import type { AssessmentItem, StudentScoreRecord } from "../grades";
import { STUDENTS_CLASS_7A } from "./studentsData";

// ============================================================================
// DATA AWAL / MOCK PENILAIAN SISWA KELAS 7A & 8B
// ============================================================================

export const INITIAL_MOCK_ASSESSMENTS: AssessmentItem[] = [
  {
    id: "asmt-7a-tugas-1",
    classId: "class-7a",
    subject: "Informatika",
    type: "TUGAS",
    title: "Tugas 1: Algoritma & Berpikir Komputasional",
    description: "Membuat diagram alir (flowchart) proses kehidupan sehari-hari",
    date: "2026-08-04",
    maxScore: 100,
    weight: 20,
    createdAt: "2026-08-04T08:00:00Z",
  },
  {
    id: "asmt-7a-uh-1",
    classId: "class-7a",
    subject: "Informatika",
    type: "UH",
    title: "Ulangan Harian 1: Perangkat Keras & Lunak",
    description: "Evaluasi kompetensi sistem komputer dan komponen hardware",
    date: "2026-08-25",
    maxScore: 100,
    weight: 20,
    createdAt: "2026-08-25T08:00:00Z",
  },
  {
    id: "asmt-7a-quiz-1",
    classId: "class-7a",
    subject: "Informatika",
    type: "QUIZ",
    title: "Kuis 1: Jaringan Komputer & Internet",
    description: "Kuis pemahaman topologi jaringan dan keamanan data",
    date: "2026-09-08",
    maxScore: 100,
    weight: 10,
    createdAt: "2026-09-08T08:00:00Z",
  },
  {
    id: "asmt-7a-uts-1",
    classId: "class-7a",
    subject: "Informatika",
    type: "UTS",
    title: "Penilaian Tengah Semester (PTS) Ganjil",
    description: "Asesmen sumatif materi Bab 1 - Bab 3 Informatika Semester Ganjil",
    date: "2026-09-22",
    maxScore: 100,
    weight: 25,
    createdAt: "2026-09-22T08:00:00Z",
  },
  {
    id: "asmt-7a-praktik-1",
    classId: "class-7a",
    subject: "Informatika",
    type: "PRAKTIK",
    title: "Praktik Lab: Pembuatan Dokumen Digital",
    description: "Praktikum laboratorium komputer pengolahan kata dan tabel",
    date: "2026-09-29",
    maxScore: 100,
    weight: 25,
    createdAt: "2026-09-29T08:00:00Z",
  },
  // Contoh asesmen untuk Kelas 8B
  {
    id: "asmt-8b-tugas-1",
    classId: "class-8b",
    subject: "Informatika",
    type: "TUGAS",
    title: "Tugas 1: Analisis Data dengan Spreadsheet",
    description: "Formula dasar SUM, AVERAGE, dan IF pada Microsoft Excel / Google Sheets",
    date: "2026-08-05",
    maxScore: 100,
    weight: 20,
    createdAt: "2026-08-05T08:00:00Z",
  },
  {
    id: "asmt-8b-uh-1",
    classId: "class-8b",
    subject: "Informatika",
    type: "UH",
    title: "Ulangan Harian 1: Jaringan Komputer & Telekomunikasi",
    description: "Prinsip kerja IP Address, Router, dan Switch",
    date: "2026-08-26",
    maxScore: 100,
    weight: 25,
    createdAt: "2026-08-26T08:00:00Z",
  },
];

/**
 * Nilai dasar realistis untuk siswa Kelas 7A (menggunakan pola skor bervariasi)
 */
export function generateInitialMockScores(): StudentScoreRecord[] {
  const records: StudentScoreRecord[] = [];
  const baseScores = [88, 92, 85, 95, 78, 82, 90, 72, 86, 94, 80, 74, 89, 91, 84, 87, 96, 79, 83, 90, 75, 88, 70, 93, 85, 89, 92, 78, 86, 90, 84, 76, 88, 91, 87, 85];

  INITIAL_MOCK_ASSESSMENTS.filter((a) => a.classId === "class-7a").forEach((asmt, asmtIdx) => {
    STUDENTS_CLASS_7A.forEach((student, stdIdx) => {
      // Variasikan nilai berdasarkan indeks agar realistis
      const base = baseScores[stdIdx % baseScores.length];
      const delta = ((asmtIdx * 3 + stdIdx * 7) % 11) - 4; // Variasi -4 s.d. +6
      let score = Math.min(100, Math.max(68, base + delta));
      
      // Khusus tugas ke-5 (praktik), beberapa siswa belum dinilai (null)
      const finalScore = (asmtIdx === 4 && stdIdx > 32) ? null : score;

      records.push({
        id: `scr-${asmt.id}-${student.id}`,
        assessmentId: asmt.id,
        studentId: student.id,
        score: finalScore,
        feedback: finalScore !== null && finalScore < 75 ? "Perlu remedial materi ini" : undefined,
        updatedAt: asmt.createdAt,
      });
    });
  });

  return records;
}
