import { z } from "zod";

// ============================================================================
// KONSTANTA & BATASAN SISTEM
// ============================================================================

/** Panjang maksimum catatan absensi per siswa maupun catatan sesi */
export const MAX_NOTE_LENGTH = 200;

/** Batas maksimum baris dalam sekali unggah berkas impor CSV */
export const MAX_IMPORT_ROWS = 200;

/** Waktu jeda pencarian nama siswa (dalam milidetik) */
export const SEARCH_DEBOUNCE_MS = 300;

/** Jumlah percobaan maksimum pengiriman ulang saat jaringan bermasalah */
export const MAX_RETRY_ATTEMPTS = 3;

// ============================================================================
// ENUM STATUS KEHADIRAN (SINGLE SOURCE OF TRUTH)
// ============================================================================

/**
 * Status Kehadiran Siswa
 * TERLAMBAT disertakan sejak awal agar tidak memerlukan migrasi skema di masa depan.
 */
export const AttendanceStatusSchema = z.enum([
  "HADIR",
  "SAKIT",
  "IZIN",
  "ALPA",
  "TERLAMBAT",
  "DISPEN", // Dispensasi (Tugas resmi sekolah, lomba O2SN/FLS2N/OSN, OSIS, atau tugas kedinasan)
]);

export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

/** Jenis Kelamin Siswa */
export const GenderSchema = z.enum(["L", "P"]);
export type Gender = z.infer<typeof GenderSchema>;

// ============================================================================
// SKEMA PROFIL & AUTENTIKASI
// ============================================================================

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1, "Nama lengkap tidak boleh kosong"),
  nip: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ============================================================================
// SKEMA KELAS
// ============================================================================

export const ScheduleDaySchema = z.enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
export type ScheduleDay = z.infer<typeof ScheduleDaySchema>;

// ============================================================================
// SKEMA HARI LIBUR & KALENDER AKADEMIK
// ============================================================================

export const HolidayCategorySchema = z.enum([
  "NASIONAL",     // Libur Nasional / Tanggal Merah Resmi
  "CUTI_BERSAMA", // Cuti Bersama
  "SEKOLAH",      // Libur Khusus Sekolah / Kegiatan Sekolah
  "KHUSUS",       // Diliburkan Guru / Rapat Dinas / Acara Khusus
  "UTS",          // Minggu / Pekan Penilaian Tengah Semester (PTS / UTS)
  "UAS",          // Minggu / Pekan Penilaian Akhir Semester (PAS / UAS / SAS)
  "KOKURIKULER",  // Minggu / Kegiatan Kokurikuler / P5 / Classmeeting / Jeda Semester
]);

export type HolidayCategory = z.infer<typeof HolidayCategorySchema>;

export const HolidayItemSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  name: z.string().min(1, "Keterangan libur wajib diisi").max(100),
  category: HolidayCategorySchema.default("SEKOLAH"),
  description: z.string().max(200).optional(),
  createdAt: z.string().optional(),
});

export type HolidayItem = z.infer<typeof HolidayItemSchema>;

export const ClassSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  name: z.string().min(1, "Nama kelas wajib diisi").max(50),
  academicYear: z.string().min(4, "Tahun ajaran wajib diisi").max(20), // Contoh: "2026/2027"
  semester: z.number().int().min(1).max(2).optional(),
  archivedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  scheduleDay: ScheduleDaySchema.optional(),
  scheduleTime: z.string().optional(),
  schedulePeriod: z.string().optional(),
  subject: z.string().default("Informatika"),
});

export type Class = z.infer<typeof ClassSchema>;

export const CreateClassInputSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi").max(50),
  academicYear: z.string().min(4, "Tahun ajaran wajib diisi").max(20),
  semester: z.number().int().min(1).max(2).optional(),
});

export type CreateClassInput = z.infer<typeof CreateClassInputSchema>;

export const UpdateClassInputSchema = CreateClassInputSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export type UpdateClassInput = z.infer<typeof UpdateClassInputSchema>;

// ============================================================================
// SKEMA SISWA
// ============================================================================

export const StudentSchema = z.object({
  id: z.string(),
  classId: z.string(),
  nis: z.string().max(20).nullable().optional(),
  fullName: z.string().min(1, "Nama lengkap siswa wajib diisi").max(100),
  gender: GenderSchema.nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

export type Student = z.infer<typeof StudentSchema>;

export const CreateStudentInputSchema = z.object({
  nis: z.string().max(20).optional(),
  fullName: z.string().min(1, "Nama lengkap siswa wajib diisi").max(100),
  gender: GenderSchema.optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentInputSchema>;

export const UpdateStudentInputSchema = CreateStudentInputSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateStudentInput = z.infer<typeof UpdateStudentInputSchema>;

// ============================================================================
// SKEMA IMPOR CSV SISWA
// ============================================================================

export const CsvStudentRowSchema = z.object({
  nis: z.string().max(20).optional(),
  nama: z.string().min(1, "Nama siswa tidak boleh kosong").max(100),
  jk: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const upper = val.trim().toUpperCase();
      return upper === "L" || upper === "P" ? (upper as "L" | "P") : undefined;
    }),
});

export type CsvStudentRow = z.infer<typeof CsvStudentRowSchema>;

export interface CsvValidationResult {
  rowNumber: number;
  data: Partial<CsvStudentRow>;
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// SKEMA SESI & CATATAN KEHADIRAN (FITUR INTI)
// ============================================================================

export const AttendanceRecordInputSchema = z.object({
  studentId: z.string(),
  status: AttendanceStatusSchema,
  lateMinutes: z.number().int().min(1).max(240).optional(),
  note: z.string().max(MAX_NOTE_LENGTH).optional(),
});

export type AttendanceRecordInput = z.infer<typeof AttendanceRecordInputSchema>;

export const AttendanceRecordSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  studentId: z.string(),
  status: AttendanceStatusSchema,
  lateMinutes: z.number().int().nullable().optional(),
  note: z.string().max(MAX_NOTE_LENGTH).nullable().optional(),
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

export const AttendanceSessionSchema = z.object({
  id: z.string(),
  classId: z.string(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  slot: z.number().int().min(0).default(0), // 0 = absensi harian, >=1 = jam pelajaran ke-N
  subject: z.string().max(80).nullable().optional(),
  note: z.string().max(MAX_NOTE_LENGTH).nullable().optional(),
  clientRequestId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AttendanceSession = z.infer<typeof AttendanceSessionSchema>;

/** Skema input saat guru menekan tombol 'Simpan Absensi' */
export const SaveSessionInputSchema = z.object({
  records: z.array(AttendanceRecordInputSchema).min(1, "Minimal harus ada satu catatan kehadiran siswa"),
  subject: z.string().max(80).optional(),
  note: z.string().max(MAX_NOTE_LENGTH).optional(),
});

export type SaveSessionInput = z.infer<typeof SaveSessionInputSchema>;

// ============================================================================
// SKEMA REKAP & RINGKASAN
// ============================================================================

/** Ringkasan jumlah kehadiran secara langsung (Live Tally) */
export interface AttendanceTally {
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  terlambat: number;
  dispen: number;
  total: number;
}

/** Rekap kehadiran satu siswa dalam satu periode/bulan */
export interface StudentMonthlyRecap {
  studentId: string;
  nis: string | null;
  fullName: string;
  gender?: Gender | null;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  terlambat: number;
  dispen: number;
  totalHari: number;
  persentaseKehadiran: number; // Skala 0 - 100 dengan 1 desimal (contoh: 94.1)
  dailyStatus: Record<string, AttendanceStatus | "H" | "S" | "I" | "A" | "T" | "D" | "L" | "-" | string>; // Format key: "YYYY-MM-DD"
  needsAttention: boolean; // Flag jika kehadiran di bawah 85%
}

/** Rekapitulasi bulanan kelas */
export interface MonthlyClassRecap {
  classId: string;
  className: string;
  academicYear: string;
  month: string; // "YYYY-MM"
  effectiveDates: string[]; // Tanggal hari belajar yang memiliki sesi
  students: StudentMonthlyRecap[];
  averageAttendance: number; // Rata-rata kehadiran kelas (%)
}

// ============================================================================
// FORMAT RESPON & ERROR API STANDAR
// ============================================================================

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown[];
  };
}
