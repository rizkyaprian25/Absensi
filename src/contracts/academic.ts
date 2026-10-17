import { z } from "zod";

// ============================================================================
// ENUM PERAN PENGGUNA (ROLE-BASED ACCESS CONTROL / RBAC)
// ============================================================================

/** Peran Pengguna Sistem: Admin (TU/Kepala Sekolah/Kurikulum) atau Guru */
export const UserRoleSchema = z.enum(["ADMIN", "GURU"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

/** Status Keberadaan / Keaktifan Siswa */
export const StudentAcademicStatusSchema = z.enum([
  "ACTIVE",      // Aktif belajar di kelas berjalan
  "GRADUATED",   // Lulus (Alumni)
  "PROMOTED",    // Naik kelas ke tingkat berikutnya
  "RETAINED",    // Tinggal kelas / tidak naik
  "TRANSFERRED", // Mutasi keluar / pindah sekolah
  "DROPPED",     // Keluar / putus sekolah
]);
export type StudentAcademicStatus = z.infer<typeof StudentAcademicStatusSchema>;

// ============================================================================
// SKEMA PENGGUNA (USER)
// ============================================================================

export const AppUserSchema = z.object({
  id: z.string(),
  email: z.string().email("Format surel tidak valid"),
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  nip: z.string().optional().nullable(),
  role: UserRoleSchema.default("GURU"),
  avatarUrl: z.string().optional().nullable(),
  signatureUrl: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional().nullable(),
});

export type AppUser = z.infer<typeof AppUserSchema>;

// ============================================================================
// SKEMA MATA PELAJARAN (SUBJECT)
// ============================================================================

export const SubjectSchema = z.object({
  id: z.string(),
  code: z.string().min(2).max(10), // Contoh: "INF", "MTK", "IPA"
  name: z.string().min(2).max(100), // Contoh: "Informatika"
  defaultKkm: z.number().min(0).max(100).default(75),
  description: z.string().optional().nullable(),
  category: z.enum(["UMUM_A", "UMUM_B", "MULOK"]).default("UMUM_A"),
});

export type Subject = z.infer<typeof SubjectSchema>;

// ============================================================================
// SKEMA PENUGASAN MENGAJAR GURU (TEACHING ASSIGNMENT / ENROLLMENT)
// ============================================================================

export const TeacherAssignmentSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  subjectId: z.string(),
  classId: z.string(),
  academicYear: z.string().min(4), // "2026/2027"
  semester: z.number().int().min(1).max(2).default(1),
  scheduleDay: z.enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]).optional().nullable(),
  scheduleTime: z.string().optional().nullable(),
  schedulePeriod: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

export type TeacherAssignment = z.infer<typeof TeacherAssignmentSchema>;

// ============================================================================
// SKEMA MANAJEMEN TAHUN AJARAN & TUTUP BUKU (ACADEMIC YEAR ROLLOVER)
// ============================================================================

export const AcademicYearStateSchema = z.object({
  id: z.string(),
  academicYear: z.string(), // "2026/2027"
  semester: z.number().int().min(1).max(2),
  label: z.string(), // "Tahun Ajaran 2026/2027 · Semester Ganjil"
  isActive: z.boolean().default(true),
  startedAt: z.string(),
  closedAt: z.string().optional().nullable(),
  closedBy: z.string().optional().nullable(),
});

export type AcademicYearState = z.infer<typeof AcademicYearStateSchema>;

/** Rekam Jejak Kenaikan Kelas / Riwayat Promosi Siswa */
export const StudentPromotionRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  fromClassId: z.string(),
  toClassId: z.string().optional().nullable(), // Null jika lulus menjadi alumni
  academicYear: z.string(), // Tahun ajaran saat kenaikan diputuskan
  semester: z.number().int(),
  status: StudentAcademicStatusSchema,
  notes: z.string().optional().nullable(),
  processedAt: z.string().datetime(),
  processedBy: z.string(), // ID Admin yang memproses
});

export type StudentPromotionRecord = z.infer<typeof StudentPromotionRecordSchema>;

// ============================================================================
// MASTER DATA BAKU MATA PELAJARAN SMP KURIKULUM MERDEKA
// ============================================================================

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "sub-inf", code: "INF", name: "Informatika", defaultKkm: 82, category: "UMUM_A" },
  { id: "sub-mtk", code: "MTK", name: "Matematika", defaultKkm: 80, category: "UMUM_A" },
  { id: "sub-ipa", code: "IPA", name: "Ilmu Pengetahuan Alam (IPA)", defaultKkm: 80, category: "UMUM_A" },
  { id: "sub-ips", code: "IPS", name: "Ilmu Pengetahuan Sosial (IPS)", defaultKkm: 80, category: "UMUM_A" },
  { id: "sub-bind", code: "BIND", name: "Bahasa Indonesia", defaultKkm: 82, category: "UMUM_A" },
  { id: "sub-bing", code: "BING", name: "Bahasa Inggris", defaultKkm: 80, category: "UMUM_A" },
  { id: "sub-ppkn", code: "PPKN", name: "Pendidikan Pancasila", defaultKkm: 82, category: "UMUM_A" },
  { id: "sub-pai", code: "PAI", name: "Pendidikan Agama & Budi Pekerti", defaultKkm: 85, category: "UMUM_A" },
  { id: "sub-pjok", code: "PJOK", name: "PJOK", defaultKkm: 82, category: "UMUM_B" },
  { id: "sub-sbk", code: "SBK", name: "Seni Budaya", defaultKkm: 82, category: "UMUM_B" },
  { id: "sub-prak", code: "PRAK", name: "Prakarya", defaultKkm: 82, category: "UMUM_B" },
  { id: "sub-snd", code: "SUNDA", name: "Bahasa Sunda (Mulok)", defaultKkm: 80, category: "MULOK" },
];

// ============================================================================
// DATA PENGGUNA AWAL (USERS SSOT)
// ============================================================================

export const DEFAULT_USERS: AppUser[] = [
  {
    id: "user-admin",
    email: "admin@smpn3cibungbulang.sch.id",
    fullName: "Administrator Kurikulum & TU",
    nip: "19800101 200501 1 001",
    role: "ADMIN",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-rizky",
    email: "rizky.aprian@smpn3cibungbulang.sch.id",
    fullName: "Muhamad Rizky Aprian, S.Kom",
    nip: "19940825 202221 1 004",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-guru-mtk",
    email: "guru.mtk@smpn3cibungbulang.sch.id",
    fullName: "Siti Rahmawati, S.Pd",
    nip: "19880412 201101 2 003",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-guru-ipa",
    email: "guru.ipa@smpn3cibungbulang.sch.id",
    fullName: "Budi Santoso, M.Pd",
    nip: "19820315 200801 1 005",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];
