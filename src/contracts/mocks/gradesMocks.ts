import type { AssessmentItem, StudentScoreRecord } from "../grades";

// ============================================================================
// DATA AWAL PENILAIAN SISWA (AWAL BERSIH / KOSONG SESUAI PERMINTAAN GURU)
// Guru dapat membuat penilaian sendiri secara mandiri dari antarmuka web.
// ============================================================================

export const INITIAL_MOCK_ASSESSMENTS: AssessmentItem[] = [];

/**
 * Catatan nilai awal (kosong secara default agar guru dapat menginput sendiri)
 */
export function generateInitialMockScores(): StudentScoreRecord[] {
  return [];
}

