import type {
  AttendanceStatus,
  CsvStudentRow,
  CsvValidationResult,
  AttendanceSession,
} from "../contracts/attendance.ts";
import { MAX_IMPORT_ROWS } from "../contracts/attendance.ts";

/**
 * Menghitung persentase kehadiran siswa secara akurat (skala 0 - 100 dengan 1 desimal)
 * Sesuai PRD §5 FR-7
 */
export function calculateAttendanceRate(hadir: number, totalHari: number): number {
  if (totalHari <= 0) return 100.0;
  const rate = (hadir / totalHari) * 100;
  return Number(rate.toFixed(1));
}

/**
 * Menentukan apakah siswa membutuhkan perhatian wali kelas/BK (< 85% kehadiran)
 */
export function isAttendanceNeedingAttention(percentage: number): boolean {
  return percentage < 85.0;
}

/**
 * Mem-parsing berkas teks CSV dan memvalidasi setiap baris
 * Mencegah nama kosong dan duplikasi NIS dalam satu kelas (PRD §5 FR-3)
 */
export function parseCsvStudents(
  csvText: string,
  existingNisList: string[] = []
): {
  valid: CsvStudentRow[];
  invalid: CsvValidationResult[];
} {
  const lines = csvText
    .replace(/^\uFEFF/, "") // Hapus BOM jika ada
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const valid: CsvStudentRow[] = [];
  const invalid: CsvValidationResult[] = [];

  if (lines.length <= 1) {
    return { valid, invalid };
  }

  // Baris pertama diasumsikan sebagai header: nis,nama,jk
  const dataRows = lines.slice(1, MAX_IMPORT_ROWS + 1);
  const seenNis = new Set<string>(existingNisList.filter(Boolean));

  dataRows.forEach((rowStr, idx) => {
    const rowNumber = idx + 2; // Mengingat baris 1 adalah header
    const cols = rowStr.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const nis = cols[0] || undefined;
    const nama = cols[1] || "";
    const jkRaw = cols[2]?.toUpperCase();
    const jk = jkRaw === "L" || jkRaw === "P" ? (jkRaw as "L" | "P") : undefined;

    const rowErrors: string[] = [];

    if (!nama) {
      rowErrors.push("Nama siswa tidak boleh kosong");
    }

    if (nis) {
      if (seenNis.has(nis)) {
        rowErrors.push(`NIS ${nis} sudah terdaftar atau duplikat`);
      } else {
        seenNis.add(nis);
      }
    }

    if (rowErrors.length > 0) {
      invalid.push({
        rowNumber,
        data: { nis, nama, jk },
        isValid: false,
        errors: rowErrors,
      });
    } else {
      valid.push({ nis, nama, jk });
    }
  });

  return { valid, invalid };
}

/**
 * Menyimpan sesi secara idempoten berbasis clientRequestId dan kunci unik (classId, sessionDate, slot)
 * Mengirim request 2x dengan kunci yang sama tidak akan menduplikasi sesi (PRD §5 FR-10)
 */
export function upsertSessionIdempotent(
  existingSessions: AttendanceSession[],
  incomingSession: AttendanceSession
): {
  sessions: AttendanceSession[];
  isDuplicateRequest: boolean;
} {
  // Cek apakah clientRequestId sudah pernah diproses
  const duplicateById = existingSessions.find(
    (s) => s.clientRequestId === incomingSession.clientRequestId
  );
  if (duplicateById) {
    return { sessions: existingSessions, isDuplicateRequest: true };
  }

  // Cek apakah sesi dengan slot tanggal yang sama sudah ada (upsert)
  const existingIdx = existingSessions.findIndex(
    (s) =>
      s.classId === incomingSession.classId &&
      s.sessionDate === incomingSession.sessionDate &&
      s.slot === incomingSession.slot
  );

  if (existingIdx >= 0) {
    const updated = [...existingSessions];
    updated[existingIdx] = {
      ...incomingSession,
      id: existingSessions[existingIdx].id, // Pertahankan primary key sesi
      createdAt: existingSessions[existingIdx].createdAt,
    };
    return { sessions: updated, isDuplicateRequest: false };
  }

  return { sessions: [...existingSessions, incomingSession], isDuplicateRequest: false };
}
