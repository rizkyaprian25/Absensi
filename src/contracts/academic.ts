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
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format surel tidak valid").optional().nullable(),
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
  { id: "sub-bk", code: "BK", name: "Bimbingan dan Konseling (BK)", defaultKkm: 80, category: "UMUM_B" },
];

// ============================================================================
// DATA PENGGUNA AWAL (USERS SSOT)
// ============================================================================

export const DEFAULT_USERS: AppUser[] = [
  {
    id: "user-admin",
    username: "admin",
    email: "admin@smpn3cibungbulang.sch.id",
    fullName: "Administrator Kurikulum & TU",
    nip: "19800101 200501 1 001",
    role: "ADMIN",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-juwariyah",
    username: "juwariyah",
    email: "juwariyah@smpn3cibungbulang.sch.id",
    fullName: "Dra. Juwariyah, M.Pd",
    nip: "196904041997022002",
    role: "ADMIN",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-aini-supiyah",
    username: "aini.supiyah",
    email: "aini.supiyah@smpn3cibungbulang.sch.id",
    fullName: "Aini Supiyah, S.Pd, MM",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-lilis-yuliati",
    username: "lilis.yuliati",
    email: "lilis.yuliati@smpn3cibungbulang.sch.id",
    fullName: "Lilis Yuliati, M.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-heny-susana",
    username: "heny.susana",
    email: "heny.susana@smpn3cibungbulang.sch.id",
    fullName: "Hj. Heny Susana, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-dewi-nurhandayani",
    username: "dewi.nurhandayani",
    email: "dewi.nurhandayani@smpn3cibungbulang.sch.id",
    fullName: "Dewi Nurhandayani, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-mohamad-reza",
    username: "mohamad.reza",
    email: "mohamad.reza@smpn3cibungbulang.sch.id",
    fullName: "Mohamad Reza Septiyani, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-wilda-fajaratu",
    username: "wilda.fajaratu",
    email: "wilda.fajaratu@smpn3cibungbulang.sch.id",
    fullName: "Wilda Fajaratu Rahmi A, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-nika-musrifah",
    username: "nika.musrifah",
    email: "nika.musrifah@smpn3cibungbulang.sch.id",
    fullName: "Nika Musrifah, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-wiwin-djueriah",
    username: "wiwin.djueriah",
    email: "wiwin.djueriah@smpn3cibungbulang.sch.id",
    fullName: "Wiwin Djueriah, S.Pd, M.Han",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-reza-kusnendar",
    username: "reza.kusnendar",
    email: "reza.kusnendar@smpn3cibungbulang.sch.id",
    fullName: "Reza Kusnendar, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-acip-sulaeman",
    username: "acip.sulaeman",
    email: "acip.sulaeman@smpn3cibungbulang.sch.id",
    fullName: "Acip Sulaeman, S.Pd I",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-awaliyatussadah",
    username: "awaliyatussadah",
    email: "awaliyatussadah@smpn3cibungbulang.sch.id",
    fullName: "Awaliyatussa'dah M, S.Pd.I",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-saherudin",
    username: "saherudin",
    email: "saherudin@smpn3cibungbulang.sch.id",
    fullName: "Saherudin, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-anwar-sanusi",
    username: "anwar.sanusi",
    email: "anwar.sanusi@smpn3cibungbulang.sch.id",
    fullName: "Anwar Sanusi, M.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-siti-mariam",
    username: "siti.mariam",
    email: "siti.mariam@smpn3cibungbulang.sch.id",
    fullName: "Siti Mariam Ulfah, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-iip-latifah",
    username: "iip.latifah",
    email: "iip.latifah@smpn3cibungbulang.sch.id",
    fullName: "Iip Latifah, S.Pd.I",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-adam-yahya",
    username: "adam.yahya",
    email: "adam.yahya@smpn3cibungbulang.sch.id",
    fullName: "Adam Yahya, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-siti-maesaroh",
    username: "siti.maesaroh",
    email: "siti.maesaroh@smpn3cibungbulang.sch.id",
    fullName: "Siti Maesaroh, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-taufik-zulkarnaen",
    username: "taufik.zulkarnaen",
    email: "taufik.zulkarnaen@smpn3cibungbulang.sch.id",
    fullName: "Taufik Zulkarnaen, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-imas-masitoh",
    username: "imas.masitoh",
    email: "imas.masitoh@smpn3cibungbulang.sch.id",
    fullName: "Imas Masitoh, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-nia-kurniawati",
    username: "nia.kurniawati",
    email: "nia.kurniawati@smpn3cibungbulang.sch.id",
    fullName: "Nia Kurniawati, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-dian-permatasari",
    username: "dian.permatasari",
    email: "dian.permatasari@smpn3cibungbulang.sch.id",
    fullName: "Dian Permatasari, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-aisyah-nurul",
    username: "aisyah.nurul",
    email: "aisyah.nurul@smpn3cibungbulang.sch.id",
    fullName: "Aisyah Nurul Amini, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-ainun-fitri",
    username: "ainun.fitri",
    email: "ainun.fitri@smpn3cibungbulang.sch.id",
    fullName: "Ainun Fitri, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-sofiyah",
    username: "sofiyah",
    email: "sofiyah@smpn3cibungbulang.sch.id",
    fullName: "Sofiyah, S.Sos",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-fingkan-ellita",
    username: "fingkan.ellita",
    email: "fingkan.ellita@smpn3cibungbulang.sch.id",
    fullName: "Fingkan Ellita, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-lucky-aditya",
    username: "lucky.aditya",
    email: "lucky.aditya@smpn3cibungbulang.sch.id",
    fullName: "Lucky Aditya Putra, S.Kom",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-fauzi-rahman",
    username: "fauzi.rahman",
    email: "fauzi.rahman@smpn3cibungbulang.sch.id",
    fullName: "Mohammad Fauzi Rahman, M.I.Kom",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-rizky",
    username: "rizky",
    email: "rizky@smpn3cibungbulang.sch.id",
    fullName: "Muhamad Rizky Aprian, S.Kom",
    nip: "19940825 202221 1 004",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-wikrama-wardana",
    username: "wikrama.wardana",
    email: "wikrama.wardana@smpn3cibungbulang.sch.id",
    fullName: "Wikrama Wardana, S.Pd",
    role: "GURU",
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

// ============================================================================
// SKEMA IMPOR SISWA BARU PPDB (XLSX ENGINE)
// ============================================================================

export const StudentPpdbImportRowSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  nisn: z.string().min(10, "NISN minimal 10 digit").max(10, "NISN maksimal 10 digit").optional().nullable(),
  fullName: z.string().min(1, "Nama lengkap siswa wajib diisi"),
  gender: z.enum(["L", "P"]),
  targetClass: z.string().optional().nullable(), // Contoh: "7A", "7B", atau null untuk auto-alokasi
  birthPlace: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianPhone: z.string().optional().nullable(),
});

export type StudentPpdbImportRow = z.infer<typeof StudentPpdbImportRowSchema>;

export const StudentPpdbImportResultSchema = z.object({
  totalRows: z.number().int(),
  validCount: z.number().int(),
  errorCount: z.number().int(),
  skippedCount: z.number().int(),
  importedStudents: z.array(
    z.object({
      id: z.string(),
      nis: z.string(),
      fullName: z.string(),
      classId: z.string(),
      className: z.string(),
    })
  ),
  errors: z.array(
    z.object({
      rowNumber: z.number().int(),
      identifier: z.string(),
      message: z.string(),
    })
  ),
});

export type StudentPpdbImportResult = z.infer<typeof StudentPpdbImportResultSchema>;


