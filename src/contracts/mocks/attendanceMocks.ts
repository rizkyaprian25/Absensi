import {
  Class,
  Student,
  AttendanceSession,
  AttendanceRecord,
  MonthlyClassRecap,
} from "../attendance";

// ============================================================================
// MOCK GURU & KELAS
// ============================================================================

export const MOCK_TEACHER_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";

export const MOCK_CLASSES: Class[] = [
  {
    id: "class-8a-uuid",
    teacherId: MOCK_TEACHER_ID,
    name: "VIII-A",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
  },
  {
    id: "class-8b-uuid",
    teacherId: MOCK_TEACHER_ID,
    name: "VIII-B",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
  },
  {
    id: "class-8d-uuid",
    teacherId: MOCK_TEACHER_ID,
    name: "VIII-D",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
  },
];

// ============================================================================
// MOCK SISWA KELAS VIII-B (34 SISWA NAMA INDONESIA REALISTIS)
// ============================================================================

export const MOCK_STUDENTS_8B: Student[] = [
  { id: "std-01", classId: "class-8b-uuid", nis: "260801", fullName: "Aisyah Putri Ramadhani", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-02", classId: "class-8b-uuid", nis: "260802", fullName: "Alif Fajar Hidayat", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-03", classId: "class-8b-uuid", nis: "260803", fullName: "Annisa Rahmawati", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-04", classId: "class-8b-uuid", nis: "260804", fullName: "Bagas Setiawan", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-05", classId: "class-8b-uuid", nis: "260805", fullName: "Bintang Pratama Wijaya", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-06", classId: "class-8b-uuid", nis: "260806", fullName: "Cantika Dewi Maharani", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-07", classId: "class-8b-uuid", nis: "260807", fullName: "Daffa Arya Permana", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-08", classId: "class-8b-uuid", nis: "260808", fullName: "Dimas Anggara", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-09", classId: "class-8b-uuid", nis: "260809", fullName: "Fadhil Nugroho", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-10", classId: "class-8b-uuid", nis: "260810", fullName: "Farhan Maulana", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-11", classId: "class-8b-uuid", nis: "260811", fullName: "Fatima Zahra", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-12", classId: "class-8b-uuid", nis: "260812", fullName: "Gilang Ramadhan", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-13", classId: "class-8b-uuid", nis: "260813", fullName: "Hafiz Kurniawan", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-14", classId: "class-8b-uuid", nis: "260814", fullName: "Indah Permatasari", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-15", classId: "class-8b-uuid", nis: "260815", fullName: "Kevin Aditya Putra", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-16", classId: "class-8b-uuid", nis: "260816", fullName: "Lestari Wulandari", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-17", classId: "class-8b-uuid", nis: "260817", fullName: "Muhammad Rizky Pratama", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-18", classId: "class-8b-uuid", nis: "260818", fullName: "Nabila Syahrani", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-19", classId: "class-8b-uuid", nis: "260819", fullName: "Nadia Kusuma Wardani", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-20", classId: "class-8b-uuid", nis: "260820", fullName: "Panji Satria Wicaksana", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-21", classId: "class-8b-uuid", nis: "260821", fullName: "Putri Ayu Ningrum", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-22", classId: "class-8b-uuid", nis: "260822", fullName: "Raditya Danendra", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-23", classId: "class-8b-uuid", nis: "260823", fullName: "Rafi Ahmad Fauzi", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-24", classId: "class-8b-uuid", nis: "260824", fullName: "Rania Salsabila", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-25", classId: "class-8b-uuid", nis: "260825", fullName: "Rayhan Saputra", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-26", classId: "class-8b-uuid", nis: "260826", fullName: "Reza Mahendra", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-27", classId: "class-8b-uuid", nis: "260827", fullName: "Rizka Amelia", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-28", classId: "class-8b-uuid", nis: "260828", fullName: "Salsabila Nur Azizah", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-29", classId: "class-8b-uuid", nis: "260829", fullName: "Satria Bagus Pambudi", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-30", classId: "class-8b-uuid", nis: "260830", fullName: "Siti Nurhaliza", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-31", classId: "class-8b-uuid", nis: "260831", fullName: "Tiara Melati", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-32", classId: "class-8b-uuid", nis: "260832", fullName: "Wahyu Tri Prabowo", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-33", classId: "class-8b-uuid", nis: "260833", fullName: "Yoga Pratama", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-34", classId: "class-8b-uuid", nis: "260834", fullName: "Zahra Aulia Citra", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
];

// ============================================================================
// MOCK SESI & CATATAN ABSENSI HARI INI (VIII-B)
// ============================================================================

export const MOCK_SESSION_TODAY: AttendanceSession = {
  id: "session-today-8b",
  classId: "class-8b-uuid",
  sessionDate: "2026-09-29",
  slot: 0,
  subject: "Matematika Wajib",
  note: null,
  clientRequestId: "e3a89e02-4217-48f8-b4b1-91d1e4e6cf10",
  createdAt: "2026-09-29T07:15:00Z",
  updatedAt: "2026-09-29T07:15:00Z",
};

/** Catatan absensi: 31 Hadir, 1 Sakit, 1 Izin, 1 Alpa */
export const MOCK_RECORDS_TODAY: AttendanceRecord[] = MOCK_STUDENTS_8B.map((student, idx) => {
  if (student.fullName === "Bagas Setiawan") {
    return {
      id: `rec-${idx + 1}`,
      sessionId: "session-today-8b",
      studentId: student.id,
      status: "SAKIT",
      lateMinutes: null,
      note: "Surat dokter terlampir",
    };
  }
  if (student.fullName === "Dimas Anggara") {
    return {
      id: `rec-${idx + 1}`,
      sessionId: "session-today-8b",
      studentId: student.id,
      status: "IZIN",
      lateMinutes: null,
      note: "Acara keluarga",
    };
  }
  if (student.fullName === "Farhan Maulana") {
    return {
      id: `rec-${idx + 1}`,
      sessionId: "session-today-8b",
      studentId: student.id,
      status: "ALPA",
      lateMinutes: null,
      note: "Tanpa keterangan",
    };
  }
  return {
    id: `rec-${idx + 1}`,
    sessionId: "session-today-8b",
    studentId: student.id,
    status: "HADIR",
    lateMinutes: null,
    note: null,
  };
});

// ============================================================================
// MOCK REKAPITULASI BULANAN (SEPTEMBER 2026)
// ============================================================================

export const MOCK_MONTHLY_RECAP_8B: MonthlyClassRecap = {
  classId: "class-8b-uuid",
  className: "VIII-B",
  academicYear: "2026/2027",
  month: "2026-09",
  effectiveDates: [
    "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04",
    "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11",
    "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18",
    "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25",
    "2026-09-28", "2026-09-29",
  ],
  averageAttendance: 94.8,
  students: MOCK_STUDENTS_8B.map((s, idx) => {
    // Siswa dengan kehadiran rendah untuk pengujian state "Perlu perhatian"
    const isProblematic = s.fullName === "Farhan Maulana";
    const hadir = isProblematic ? 15 : idx % 5 === 0 ? 19 : 20;
    const sakit = isProblematic ? 1 : idx % 5 === 0 ? 1 : 0;
    const izin = isProblematic ? 1 : 1;
    const alpa = isProblematic ? 4 : 0;
    const totalHari = 21;
    const persentase = Number(((hadir / totalHari) * 100).toFixed(1));

    return {
      studentId: s.id,
      nis: s.nis ?? null,
      fullName: s.fullName,
      hadir,
      sakit,
      izin,
      alpa,
      terlambat: 0,
      totalHari,
      persentaseKehadiran: persentase,
      dailyStatus: {},
      needsAttention: persentase < 85,
    };
  }),
};
