import type {
  AssessmentItem,
  AssessmentType,
  StudentScoreRecord,
  StudentGradeSummary,
} from "../contracts/grades";
import { DEFAULT_KKM, getGradePredicate } from "../contracts/grades";
import type { Student } from "../contracts/attendance";
import {
  INITIAL_MOCK_ASSESSMENTS,
  generateInitialMockScores,
} from "../contracts/mocks/gradesMocks";

export const STORAGE_KEY_ASSESSMENTS = "absensi_grade_assessments_v1";
export const STORAGE_KEY_SCORES = "absensi_student_scores_v1";
export const STORAGE_KEY_KKM = "absensi_grade_kkm_v1";

// ============================================================================
// AKSES PENYIMPANAN LOKAL (LOCALSTORAGE OFFLINE-FIRST)
// ============================================================================

/**
 * Mengambil daftar seluruh penilaian (asesmen) yang tersimpan
 */
export function getStoredAssessments(): AssessmentItem[] {
  if (typeof window === "undefined") {
    return INITIAL_MOCK_ASSESSMENTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSESSMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(INITIAL_MOCK_ASSESSMENTS));
      return INITIAL_MOCK_ASSESSMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MOCK_ASSESSMENTS;
  } catch (err) {
    console.warn("Gagal membaca daftar asesmen dari localStorage:", err);
    return INITIAL_MOCK_ASSESSMENTS;
  }
}

/**
 * Menyimpan seluruh daftar penilaian ke localStorage
 */
export function saveStoredAssessments(assessments: AssessmentItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(assessments));
  } catch (err) {
    console.error("Gagal menyimpan daftar asesmen ke localStorage:", err);
  }
}

/**
 * Mengambil seluruh catatan nilai siswa yang tersimpan
 */
export function getStoredScores(): StudentScoreRecord[] {
  if (typeof window === "undefined") {
    return generateInitialMockScores();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCORES);
    if (!raw) {
      const initial = generateInitialMockScores();
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : generateInitialMockScores();
  } catch (err) {
    console.warn("Gagal membaca catatan nilai dari localStorage:", err);
    return generateInitialMockScores();
  }
}

/**
 * Menyimpan seluruh catatan nilai siswa ke localStorage
 */
export function saveStoredScores(scores: StudentScoreRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
  } catch (err) {
    console.error("Gagal menyimpan catatan nilai ke localStorage:", err);
  }
}

/**
 * Mengambil nilai KKM yang disetel atau default 75
 */
export function getStoredKKM(): number {
  if (typeof window === "undefined") return DEFAULT_KKM;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KKM);
    if (!raw) return DEFAULT_KKM;
    const parsed = Number(raw);
    return isNaN(parsed) || parsed < 0 || parsed > 100 ? DEFAULT_KKM : parsed;
  } catch {
    return DEFAULT_KKM;
  }
}

/**
 * Menyimpan nilai KKM
 */
export function saveStoredKKM(kkm: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_KKM, String(kkm));
  } catch (err) {
    console.error("Gagal menyimpan KKM:", err);
  }
}

// ============================================================================
// FUNGSI CRUD & OPERASIONAL PENILAIAN
// ============================================================================

/**
 * Mengambil asesmen berdasarkan ID kelas tertentu
 */
export function getAssessmentsByClass(classId: string): AssessmentItem[] {
  const all = getStoredAssessments();
  return all
    .filter((a) => a.classId === classId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Membuat item asesmen baru
 */
export function createAssessment(data: Omit<AssessmentItem, "id" | "createdAt">): AssessmentItem {
  const newItem: AssessmentItem = {
    ...data,
    id: `asmt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const existing = getStoredAssessments();
  const updated = [...existing, newItem];
  saveStoredAssessments(updated);

  return newItem;
}

/**
 * Memperbarui item asesmen yang ada
 */
export function updateAssessment(id: string, updates: Partial<AssessmentItem>): AssessmentItem | null {
  const existing = getStoredAssessments();
  const index = existing.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const updatedItem: AssessmentItem = {
    ...existing[index],
    ...updates,
  };

  existing[index] = updatedItem;
  saveStoredAssessments(existing);
  return updatedItem;
}

/**
 * Menghapus asesmen dan seluruh nilai siswa terkait
 */
export function deleteAssessment(id: string): void {
  const existingAssessments = getStoredAssessments();
  const filteredAssessments = existingAssessments.filter((a) => a.id !== id);
  saveStoredAssessments(filteredAssessments);

  // Bersihkan nilai siswa yang terasosiasi
  const existingScores = getStoredScores();
  const filteredScores = existingScores.filter((s) => s.assessmentId !== id);
  saveStoredScores(filteredScores);
}

/**
 * Mengambil seluruh nilai siswa untuk satu asesmen tertentu
 */
export function getScoresForAssessment(assessmentId: string): StudentScoreRecord[] {
  const scores = getStoredScores();
  return scores.filter((s) => s.assessmentId === assessmentId);
}

/**
 * Memperbarui atau menyimpan satu nilai siswa
 */
export function updateSingleScore(
  assessmentId: string,
  studentId: string,
  score: number | null,
  feedback?: string
): void {
  const existingScores = getStoredScores();
  const index = existingScores.findIndex(
    (s) => s.assessmentId === assessmentId && s.studentId === studentId
  );

  const now = new Date().toISOString();

  if (index >= 0) {
    existingScores[index] = {
      ...existingScores[index],
      score,
      feedback: feedback !== undefined ? feedback : existingScores[index].feedback,
      updatedAt: now,
    };
  } else {
    existingScores.push({
      id: `scr-${assessmentId}-${studentId}`,
      assessmentId,
      studentId,
      score,
      feedback,
      updatedAt: now,
    });
  }

  saveStoredScores(existingScores);
}

/**
 * Mengisi nilai massal (batch fill) untuk seluruh siswa pada satu asesmen
 */
export function batchFillScores(assessmentId: string, studentIds: string[], score: number): void {
  const existingScores = getStoredScores();
  const now = new Date().toISOString();

  const scoreMap = new Map<string, StudentScoreRecord>();
  existingScores.forEach((s) => {
    scoreMap.set(`${s.assessmentId}:${s.studentId}`, s);
  });

  studentIds.forEach((studentId) => {
    const key = `${assessmentId}:${studentId}`;
    const existing = scoreMap.get(key);
    if (existing) {
      existing.score = score;
      existing.updatedAt = now;
    } else {
      scoreMap.set(key, {
        id: `scr-${assessmentId}-${studentId}`,
        assessmentId,
        studentId,
        score,
        updatedAt: now,
      });
    }
  });

  saveStoredScores(Array.from(scoreMap.values()));
}

// ============================================================================
// KALKULASI NILAI AKHIR, KKM, & STATISTIK KELAS
// ============================================================================

/**
 * Menghitung ringkasan nilai dan rata-rata untuk seorang siswa
 */
export function calculateStudentGradeSummary(
  student: Student,
  assessments: AssessmentItem[],
  allScores: StudentScoreRecord[],
  kkm: number = DEFAULT_KKM
): StudentGradeSummary {
  const studentScores = allScores.filter((s) => s.studentId === student.id);
  const scoreMap: Record<string, number | null> = {};
  
  studentScores.forEach((s) => {
    scoreMap[s.assessmentId] = s.score;
  });

  // Hitung rata-rata per kategori
  const categories: AssessmentType[] = ["TUGAS", "UH", "QUIZ", "UTS", "UAS", "PRAKTIK", "LAINNYA"];
  const categoryAverages: Record<AssessmentType, number | null> = {
    TUGAS: null,
    UH: null,
    QUIZ: null,
    UTS: null,
    UAS: null,
    PRAKTIK: null,
    LAINNYA: null,
  };

  categories.forEach((cat) => {
    const catAssessments = assessments.filter((a) => a.type === cat);
    const validScores = catAssessments
      .map((a) => scoreMap[a.id])
      .filter((sc): sc is number => typeof sc === "number" && !isNaN(sc));

    if (validScores.length > 0) {
      const sum = validScores.reduce((acc, curr) => acc + curr, 0);
      categoryAverages[cat] = Math.round((sum / validScores.length) * 10) / 10;
    }
  });

  // Hitung Nilai Akhir Berbobot (atau rata-rata nilai valid)
  let totalScoreWeight = 0;
  let totalWeight = 0;
  let simpleSum = 0;
  let simpleCount = 0;

  assessments.forEach((asmt) => {
    const sc = scoreMap[asmt.id];
    if (typeof sc === "number" && !isNaN(sc)) {
      const weight = asmt.weight || 1;
      totalScoreWeight += sc * weight;
      totalWeight += weight;
      simpleSum += sc;
      simpleCount += 1;
    }
  });

  let finalScore: number | null = null;
  if (totalWeight > 0) {
    finalScore = Math.round((totalScoreWeight / totalWeight) * 10) / 10;
  } else if (simpleCount > 0) {
    finalScore = Math.round((simpleSum / simpleCount) * 10) / 10;
  }

  const isPassed = finalScore !== null ? finalScore >= kkm : false;
  const predicate = getGradePredicate(finalScore, kkm);

  return {
    studentId: student.id,
    studentName: student.fullName,
    nis: student.nis ?? null,
    gender: (student.gender as "L" | "P") ?? null,
    scores: scoreMap,
    categoryAverages,
    finalScore,
    predicate,
    isPassed,
    gradedCount: simpleCount,
    totalCount: assessments.length,
  };
}

export interface ClassGradeStats {
  classAverage: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
  remedialCount: number;
  passingRate: number; // Persentase ketuntasan
  totalGradedStudents: number;
}

/**
 * Menghitung metrik statistik kelas
 */
export function calculateClassGradeStats(
  summaries: StudentGradeSummary[],
  kkm: number = DEFAULT_KKM
): ClassGradeStats {
  const validScores = summaries
    .map((s) => s.finalScore)
    .filter((sc): sc is number => typeof sc === "number" && !isNaN(sc));

  if (validScores.length === 0) {
    return {
      classAverage: 0,
      highestScore: 0,
      lowestScore: 0,
      passedCount: 0,
      remedialCount: 0,
      passingRate: 0,
      totalGradedStudents: 0,
    };
  }

  const totalSum = validScores.reduce((acc, curr) => acc + curr, 0);
  const classAverage = Math.round((totalSum / validScores.length) * 10) / 10;
  const highestScore = Math.max(...validScores);
  const lowestScore = Math.min(...validScores);

  const passedCount = validScores.filter((sc) => sc >= kkm).length;
  const remedialCount = validScores.filter((sc) => sc < kkm).length;
  const passingRate = Math.round((passedCount / validScores.length) * 100);

  return {
    classAverage,
    highestScore,
    lowestScore,
    passedCount,
    remedialCount,
    passingRate,
    totalGradedStudents: validScores.length,
  };
}

// ============================================================================
// EKSPOR REKAP NILAI KE CSV (STANDAR EXCEL DENGAN BOM UTF-8)
// ============================================================================

export function exportGradesToCSV(
  className: string,
  assessments: AssessmentItem[],
  summaries: StudentGradeSummary[],
  kkm: number = DEFAULT_KKM
): string {
  const headerCols = ["No", "NIS", "Nama Siswa", "L/P"];
  assessments.forEach((a) => {
    headerCols.push(`"${a.title.replace(/"/g, '""')} (${a.type})"`);
  });
  headerCols.push("Nilai Akhir", "Predikat", "Keterangan KKM");

  const rows: string[] = [];
  rows.push(`"REKAPITULASI DAFTAR NILAI SISWA"`);
  rows.push(`"Kelas: ${className} | Mata Pelajaran: Informatika | KKM: ${kkm}"`);
  rows.push(`"Guru Pengampu: Muhamad Rizky Aprian, S.Kom | Tanggal Unduh: ${new Date().toLocaleDateString("id-ID")}"`);
  rows.push("");
  rows.push(headerCols.join(","));

  summaries.forEach((s, idx) => {
    const rowCols: string[] = [
      String(idx + 1),
      `"${s.nis ?? "-"}"`,
      `"${s.studentName.replace(/"/g, '""')}"`,
      s.gender ?? "-",
    ];

    assessments.forEach((a) => {
      const val = s.scores[a.id];
      rowCols.push(val !== null && val !== undefined ? String(val) : '""');
    });

    rowCols.push(
      s.finalScore !== null ? String(s.finalScore) : '""',
      `"${s.predicate}"`,
      `"${s.isPassed ? "Tuntas" : "Remedial"}"`
    );

    rows.push(rowCols.join(","));
  });

  // Baris Rata-rata Kelas
  const stats = calculateClassGradeStats(summaries, kkm);
  const avgRowCols: string[] = ["", "", '"RATA-RATA KELAS"', ""];
  assessments.forEach((a) => {
    const asmtScores = summaries
      .map((s) => s.scores[a.id])
      .filter((sc): sc is number => typeof sc === "number" && !isNaN(sc));
    if (asmtScores.length > 0) {
      const sum = asmtScores.reduce((acc, c) => acc + c, 0);
      avgRowCols.push(String(Math.round((sum / asmtScores.length) * 10) / 10));
    } else {
      avgRowCols.push('""');
    }
  });
  avgRowCols.push(String(stats.classAverage), "", "");
  rows.push(avgRowCols.join(","));

  // Awali dengan UTF-8 BOM (\uFEFF)
  return "\uFEFF" + rows.join("\r\n");
}
