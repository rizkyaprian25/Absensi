import type {
  AssessmentItem,
  AssessmentType,
  AttitudeGrade,
  StudentScoreRecord,
  StudentGradeSummary,
  GradeLevelKkmMap,
} from "../contracts/grades";
import {
  DEFAULT_KKM,
  DEFAULT_KKM_BY_GRADE,
  DEFAULT_ATTITUDE_GRADE,
  getGradePredicate,
  extractGradeLevel,
} from "../contracts/grades";
import type { Student } from "../contracts/attendance";
import {
  INITIAL_MOCK_ASSESSMENTS,
  GRADE_7_TARGET_CLASSES,
  generateAssessmentsForClass7,
  generateInitialMockScores,
} from "../contracts/mocks/gradesMocks";
import { triggerAutoSnapshot } from "./backupManager.ts";

export const STORAGE_KEY_ASSESSMENTS = "absensi_grade_assessments_v2";
export const STORAGE_KEY_SCORES = "absensi_student_scores_v2";
export const STORAGE_KEY_KKM = "absensi_grade_kkm_v1";
export const STORAGE_KEY_KKM_BY_GRADE = "absensi_grade_kkm_by_grade_v1";
export const STORAGE_KEY_ASSESSMENT_ORDER = "absensi_grade_assessment_order_v1";
export const STORAGE_KEY_GRADE_7_SEEDED = "absensi_grade_7_defaults_seeded_v1";
export const STORAGE_KEY_STUDENT_ATTITUDES = "absensi_student_attitudes_v1";

// ============================================================================
// AKSES PENYIMPANAN LOKAL (LOCALSTORAGE OFFLINE-FIRST)
// ============================================================================

/**
 * Membersihkan data mock lama (v1) dari browser pengguna jika ada
 */
function cleanupLegacyMockData(): void {
  if (typeof window === "undefined") return;
  try {
    if (
      localStorage.getItem("absensi_grade_assessments_v1") !== null ||
      localStorage.getItem("absensi_student_scores_v1") !== null
    ) {
      localStorage.removeItem("absensi_grade_assessments_v1");
      localStorage.removeItem("absensi_student_scores_v1");
      // Inisialisasi v2 dengan kondisi bersih/kosong
      if (localStorage.getItem(STORAGE_KEY_ASSESSMENTS) === null) {
        localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify([]));
      }
      if (localStorage.getItem(STORAGE_KEY_SCORES) === null) {
        localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify([]));
      }
    }
  } catch (err) {
    console.warn("Peringatan saat membersihkan sisa data mock v1:", err);
  }
}

/**
 * Menginisialisasi 4 penilaian baku untuk seluruh kelas 7 (kecuali 7A dan 7D yang dikelola mandiri oleh guru).
 * Dijalankan sekali saat inisialisasi agar browser guru yang sudah memiliki data 7A/7D langsung mendapatkan
 * 4 penilaian di kelas 7B, 7C, 7E, 7F, 7G, dan 7H tanpa menimpa data 7A dan 7D.
 */
export function initGrade7AssessmentsIfMissing(): void {
  if (typeof window === "undefined") return;

  try {
    const isSeeded = localStorage.getItem(STORAGE_KEY_GRADE_7_SEEDED) === "true";
    if (isSeeded) {
      return;
    }

    const existing = getStoredAssessments();
    let hasChanges = false;
    const result = [...existing];

    for (const target of GRADE_7_TARGET_CLASSES) {
      const existingForClass = result.filter((a) => a.classId === target.id);
      const defaults = generateAssessmentsForClass7(target.id, target.dates);

      for (const def of defaults) {
        const alreadyExists = existingForClass.some(
          (a) => a.id === def.id || a.title.trim().toLowerCase() === def.title.trim().toLowerCase()
        );
        if (!alreadyExists) {
          result.push(def);
          hasChanges = true;
        }
      }
    }

    localStorage.setItem(STORAGE_KEY_GRADE_7_SEEDED, "true");

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(result));
    }
  } catch (err) {
    console.warn("Gagal menginisialisasi asesmen kelas 7:", err);
  }
}

/**
 * Mengambil daftar seluruh penilaian (asesmen) yang tersimpan
 */
export function getStoredAssessments(): AssessmentItem[] {
  if (typeof window === "undefined") {
    return INITIAL_MOCK_ASSESSMENTS;
  }

  cleanupLegacyMockData();

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSESSMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(INITIAL_MOCK_ASSESSMENTS));
      localStorage.setItem(STORAGE_KEY_GRADE_7_SEEDED, "true");
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
    try {
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(assessments));
    } catch (saveErr: any) {
      const isQuotaError =
        saveErr?.name === "QuotaExceededError" ||
        saveErr?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        saveErr?.code === 22 ||
        (typeof saveErr?.message === "string" && saveErr.message.toLowerCase().includes("quota"));

      if (isQuotaError) {
        console.warn("Membebaskan ruang penyimpanan darurat untuk menyimpan asesmen...");
        try {
          localStorage.removeItem("absensi_auto_snapshots_v1");
        } catch {}
        localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(assessments));
      } else {
        throw saveErr;
      }
    }

    triggerAutoSnapshot("Pembaruan Data Asesmen");
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

  cleanupLegacyMockData();

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
    try {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
    } catch (saveErr: any) {
      const isQuotaError =
        saveErr?.name === "QuotaExceededError" ||
        saveErr?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        saveErr?.code === 22 ||
        (typeof saveErr?.message === "string" && saveErr.message.toLowerCase().includes("quota"));

      if (isQuotaError) {
        console.warn("Membebaskan ruang penyimpanan darurat untuk menyimpan nilai siswa...");
        try {
          localStorage.removeItem("absensi_auto_snapshots_v1");
        } catch {}
        localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
      } else {
        throw saveErr;
      }
    }

    triggerAutoSnapshot("Pemberian Nilai Siswa");
  } catch (err) {
    console.error("Gagal menyimpan catatan nilai ke localStorage:", err);
  }
}

/**
 * Mengosongkan seluruh penilaian dan nilai (baik untuk satu kelas atau seluruh kelas)
 */
export function clearAssessmentsForClass(classId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!classId) {
      saveStoredAssessments([]);
      saveStoredScores([]);
    } else {
      const allAssessments = getStoredAssessments();
      const removedIds = new Set(allAssessments.filter((a) => a.classId === classId).map((a) => a.id));
      const remainingAssessments = allAssessments.filter((a) => a.classId !== classId);
      const remainingScores = getStoredScores().filter((s) => !removedIds.has(s.assessmentId));
      saveStoredAssessments(remainingAssessments);
      saveStoredScores(remainingScores);
    }
    triggerAutoSnapshot("Pengosongan Penilaian Kelas");
  } catch (err) {
    console.error("Gagal mengosongkan data penilaian:", err);
  }
}

/**
 * Mengambil peta KKM seluruh angkatan (Kelas 7, 8, 9)
 */
export function getStoredKkmByGrade(): Record<string, number> {
  if (typeof window === "undefined") return { ...DEFAULT_KKM_BY_GRADE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KKM_BY_GRADE);
    if (!raw) {
      // Periksa apakah ada KKM global lama
      const legacyRaw = localStorage.getItem(STORAGE_KEY_KKM);
      const legacyVal = legacyRaw ? Number(legacyRaw) : DEFAULT_KKM;
      const validVal = isNaN(legacyVal) || legacyVal < 0 || legacyVal > 100 ? DEFAULT_KKM : legacyVal;
      return {
        "7": validVal,
        "8": validVal,
        "9": validVal,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      "7": typeof parsed?.["7"] === "number" && parsed["7"] >= 0 && parsed["7"] <= 100 ? parsed["7"] : DEFAULT_KKM,
      "8": typeof parsed?.["8"] === "number" && parsed["8"] >= 0 && parsed["8"] <= 100 ? parsed["8"] : DEFAULT_KKM,
      "9": typeof parsed?.["9"] === "number" && parsed["9"] >= 0 && parsed["9"] <= 100 ? parsed["9"] : DEFAULT_KKM,
    };
  } catch {
    return { ...DEFAULT_KKM_BY_GRADE };
  }
}

/**
 * Menyimpan peta KKM seluruh angkatan ke localStorage
 */
export function saveStoredKkmByGrade(kkmMap: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    const cleanMap: Record<string, number> = {
      "7": Number(kkmMap["7"]) || DEFAULT_KKM,
      "8": Number(kkmMap["8"]) || DEFAULT_KKM,
      "9": Number(kkmMap["9"]) || DEFAULT_KKM,
    };
    localStorage.setItem(STORAGE_KEY_KKM_BY_GRADE, JSON.stringify(cleanMap));

    // Sinkronkan juga ke key KKM global untuk kompatibilitas ke belakang
    localStorage.setItem(STORAGE_KEY_KKM, String(cleanMap["7"]));
    triggerAutoSnapshot("Pembaruan Nilai KKM per Angkatan");
  } catch (err) {
    console.error("Gagal menyimpan KKM per angkatan:", err);
  }
}

/**
 * Mengambil nilai KKM untuk kelas atau angkatan tertentu (atau default 75)
 * Jika gradeOrClassName diberikan (misal "7A", "8B", "7"), akan mengambil KKM spesifik angkatan tersebut.
 */
export function getStoredKKM(gradeOrClassName?: string): number {
  if (typeof window === "undefined") return DEFAULT_KKM;
  try {
    const map = getStoredKkmByGrade();
    if (gradeOrClassName) {
      const grade = extractGradeLevel(gradeOrClassName);
      return map[grade] ?? map["7"] ?? DEFAULT_KKM;
    }
    return map["7"] ?? DEFAULT_KKM;
  } catch {
    return DEFAULT_KKM;
  }
}

/**
 * Menyimpan nilai KKM (bisa global atau untuk angkatan tertentu)
 */
export function saveStoredKKM(kkm: number, gradeOrClassName?: string): void {
  if (typeof window === "undefined") return;
  try {
    const map = getStoredKkmByGrade();
    if (gradeOrClassName) {
      const grade = extractGradeLevel(gradeOrClassName);
      map[grade] = kkm;
    } else {
      map["7"] = kkm;
      map["8"] = kkm;
      map["9"] = kkm;
    }
    saveStoredKkmByGrade(map);
  } catch (err) {
    console.error("Gagal menyimpan KKM:", err);
  }
}

// ============================================================================
// PENGELOLAAN NILAI SIKAP SISWA (BURUK, KURANG BAIK, BAIK, SANGAT BAIK)
// ============================================================================

/**
 * Mengambil seluruh data nilai sikap siswa dari localStorage (peta classId -> { studentId -> AttitudeGrade })
 */
export function getAllStoredStudentAttitudes(): Record<string, Record<string, AttitudeGrade>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_ATTITUDES);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (err) {
    console.warn("Gagal membaca nilai sikap dari localStorage:", err);
    return {};
  }
}

/**
 * Mengambil nilai sikap seluruh siswa untuk satu kelas tertentu
 */
export function getStoredStudentAttitudes(classId: string): Record<string, AttitudeGrade> {
  const all = getAllStoredStudentAttitudes();
  return all[classId] ? { ...all[classId] } : {};
}

/**
 * Menyimpan nilai sikap untuk seorang siswa dalam kelas tertentu
 */
export function saveStudentAttitude(
  classId: string,
  studentId: string,
  attitude: AttitudeGrade
): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllStoredStudentAttitudes();
    if (!all[classId]) {
      all[classId] = {};
    }
    all[classId][studentId] = attitude;
    localStorage.setItem(STORAGE_KEY_STUDENT_ATTITUDES, JSON.stringify(all));
    triggerAutoSnapshot("Pembaruan Nilai Sikap Siswa");
  } catch (err) {
    console.error("Gagal menyimpan nilai sikap siswa:", err);
  }
}

/**
 * Menyimpan nilai sikap secara massal untuk satu kelas
 */
export function batchSaveStudentAttitudes(
  classId: string,
  attitudes: Record<string, AttitudeGrade>
): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllStoredStudentAttitudes();
    all[classId] = {
      ...(all[classId] || {}),
      ...attitudes,
    };
    localStorage.setItem(STORAGE_KEY_STUDENT_ATTITUDES, JSON.stringify(all));
    triggerAutoSnapshot("Pembaruan Massal Nilai Sikap");
  } catch (err) {
    console.error("Gagal menyimpan nilai sikap massal:", err);
  }
}

/**
 * Mengatur nilai sikap seragam untuk seluruh siswa dalam kelas (misal: Set Semua "BAIK")
 */
export function batchSetAllStudentAttitudes(
  classId: string,
  studentIds: string[],
  attitude: AttitudeGrade
): void {
  if (typeof window === "undefined") return;
  try {
    const newClassAttitudes: Record<string, AttitudeGrade> = {};
    studentIds.forEach((id) => {
      newClassAttitudes[id] = attitude;
    });
    batchSaveStudentAttitudes(classId, newClassAttitudes);
  } catch (err) {
    console.error("Gagal menetapkan nilai sikap seragam:", err);
  }
}

// ============================================================================
// FUNGSI CRUD & OPERASIONAL PENILAIAN
// ============================================================================

/**
 * Mengambil daftar ID urutan asesmen kustom untuk kelas tertentu
 */
export function getAssessmentOrderForClass(classId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSESSMENT_ORDER);
    if (!raw) return [];
    const map = JSON.parse(raw);
    return Array.isArray(map?.[classId]) ? map[classId] : [];
  } catch {
    return [];
  }
}

/**
 * Menyimpan daftar ID urutan asesmen kustom untuk kelas tertentu
 * dan menyinkronkan urutan item pada penyimpanan global
 */
export function saveAssessmentOrderForClass(classId: string, orderedIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSESSMENT_ORDER);
    const map = raw ? JSON.parse(raw) : {};
    map[classId] = orderedIds;
    localStorage.setItem(STORAGE_KEY_ASSESSMENT_ORDER, JSON.stringify(map));

    // Sinkronkan urutan daftar asesmen kelas pada penyimpanan utama
    const all = getStoredAssessments();
    const classItems = all.filter((a) => a.classId === classId);
    const otherItems = all.filter((a) => a.classId !== classId);

    const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
    classItems.sort((a, b) => {
      const idxA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
      const idxB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
      return idxA - idxB;
    });

    saveStoredAssessments([...otherItems, ...classItems]);
    triggerAutoSnapshot("Pembaruan Urutan Penilaian");
  } catch (err) {
    console.error("Gagal menyimpan urutan asesmen:", err);
  }
}

/**
 * Mengambil asesmen berdasarkan ID kelas tertentu (mempertimbangkan urutan kustom yang telah diatur)
 */
export function getAssessmentsByClass(
  classId: string,
  allAssessments?: AssessmentItem[]
): AssessmentItem[] {
  const all = allAssessments ?? getStoredAssessments();
  const classItems = all.filter((a) => a.classId === classId);
  const customOrder = getAssessmentOrderForClass(classId);

  if (customOrder.length > 0) {
    const orderMap = new Map(customOrder.map((id, idx) => [id, idx]));
    return classItems.sort((a, b) => {
      const idxA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
      const idxB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
      if (idxA !== idxB) return idxA - idxB;
      return a.date.localeCompare(b.date);
    });
  }

  return classItems.sort((a, b) => a.date.localeCompare(b.date));
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

  // Jika kelas memiliki urutan kustom, tambahkan item baru di urutan paling akhir
  const customOrder = getAssessmentOrderForClass(data.classId);
  if (customOrder.length > 0 && !customOrder.includes(newItem.id)) {
    saveAssessmentOrderForClass(data.classId, [...customOrder, newItem.id]);
  }

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
  const target = existingAssessments.find((a) => a.id === id);
  const filteredAssessments = existingAssessments.filter((a) => a.id !== id);
  saveStoredAssessments(filteredAssessments);

  if (target) {
    const customOrder = getAssessmentOrderForClass(target.classId);
    if (customOrder.includes(id)) {
      saveAssessmentOrderForClass(
        target.classId,
        customOrder.filter((item) => item !== id)
      );
    }
  }

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
  kkm: number = DEFAULT_KKM,
  attitudeGrade: AttitudeGrade = DEFAULT_ATTITUDE_GRADE
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
    attitudeGrade,
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
