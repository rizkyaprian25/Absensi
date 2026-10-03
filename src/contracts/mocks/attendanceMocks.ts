import {
  Class,
  Student,
  AttendanceSession,
  AttendanceRecord,
  MonthlyClassRecap,
} from "../attendance";

// ============================================================================
// DATA GURU & SEKOLAH
// ============================================================================

export const MOCK_TEACHER_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
export const MOCK_TEACHER_NAME = "Muhamad Rizky Aprian, S.Kom";
export const MOCK_TEACHER_NIP = "19940825 202221 1 004";
export const MOCK_SCHOOL_NAME = "SMP Negeri 3 Cibungbulang";
export const MOCK_SUBJECT = "Informatika";

// ============================================================================
// JADWAL MENGAJAR RESMI (SMP NEGERI 3 CIBUNGBULANG)
// Sesuai jadwal aSc Timetables Muhamad Rizky Aprian, S.Kom (14/07/2026)
// ============================================================================

export const MOCK_CLASSES: Class[] = [
  // SENIN
  {
    id: "class-7a",
    teacherId: MOCK_TEACHER_ID,
    name: "7A",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Senin",
    schedulePeriod: "Jam Ke 1–3",
    scheduleTime: "08:00 – 09:45",
    subject: "Informatika",
  },
  {
    id: "class-7d",
    teacherId: MOCK_TEACHER_ID,
    name: "7D",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Senin",
    schedulePeriod: "Jam Ke 4–6",
    scheduleTime: "10:10 – 11:55",
    subject: "Informatika",
  },

  // SELASA
  {
    id: "class-8b",
    teacherId: MOCK_TEACHER_ID,
    name: "8B",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Selasa",
    schedulePeriod: "Jam Ke 1–3",
    scheduleTime: "07:30 – 09:15",
    subject: "Informatika",
  },
  {
    id: "class-7b",
    teacherId: MOCK_TEACHER_ID,
    name: "7B",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Selasa",
    schedulePeriod: "Jam Ke 4–6",
    scheduleTime: "09:15 – 11:25",
    subject: "Informatika",
  },

  // RABU
  {
    id: "class-7f",
    teacherId: MOCK_TEACHER_ID,
    name: "7F",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Rabu",
    schedulePeriod: "Jam Ke 1–3",
    scheduleTime: "07:30 – 09:15",
    subject: "Informatika",
  },
  {
    id: "class-7e",
    teacherId: MOCK_TEACHER_ID,
    name: "7E",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Rabu",
    schedulePeriod: "Jam Ke 4–6",
    scheduleTime: "09:15 – 11:25",
    subject: "Informatika",
  },

  // KAMIS
  {
    id: "class-8a",
    teacherId: MOCK_TEACHER_ID,
    name: "8A",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Kamis",
    schedulePeriod: "Jam Ke 1–3",
    scheduleTime: "07:30 – 09:15",
    subject: "Informatika",
  },
  {
    id: "class-7h",
    teacherId: MOCK_TEACHER_ID,
    name: "7H",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Kamis",
    schedulePeriod: "Jam Ke 4–6",
    scheduleTime: "09:15 – 11:25",
    subject: "Informatika",
  },

  // JUMAT
  {
    id: "class-7g",
    teacherId: MOCK_TEACHER_ID,
    name: "7G",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Jumat",
    schedulePeriod: "Jam Ke 1–2",
    scheduleTime: "08:00 – 09:30",
    subject: "Informatika",
  },
  {
    id: "class-7c",
    teacherId: MOCK_TEACHER_ID,
    name: "7C",
    academicYear: "2026/2027",
    semester: 1,
    archivedAt: null,
    createdAt: "2026-07-15T00:00:00Z",
    scheduleDay: "Jumat",
    schedulePeriod: "Jam Ke 3–4",
    scheduleTime: "09:50 – 11:20",
    subject: "Informatika",
  },
];

// ============================================================================
// MOCK SISWA KELAS (34 SISWA NAMA INDONESIA REALISTIS)
// ============================================================================

export const MOCK_STUDENTS_8B: Student[] = [
  { id: "std-01", classId: "class-8b", nis: "260801", fullName: "Aisyah Putri Ramadhani", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-02", classId: "class-8b", nis: "260802", fullName: "Alif Fajar Hidayat", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-03", classId: "class-8b", nis: "260803", fullName: "Annisa Rahmawati", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-04", classId: "class-8b", nis: "260804", fullName: "Bagas Setiawan", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-05", classId: "class-8b", nis: "260805", fullName: "Bintang Pratama Wijaya", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-06", classId: "class-8b", nis: "260806", fullName: "Cantika Dewi Maharani", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-07", classId: "class-8b", nis: "260807", fullName: "Daffa Arya Permana", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-08", classId: "class-8b", nis: "260808", fullName: "Dimas Anggara", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-09", classId: "class-8b", nis: "260809", fullName: "Fadhil Nugroho", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-10", classId: "class-8b", nis: "260810", fullName: "Farhan Maulana", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-11", classId: "class-8b", nis: "260811", fullName: "Fatima Zahra", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-12", classId: "class-8b", nis: "260812", fullName: "Gilang Ramadhan", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-13", classId: "class-8b", nis: "260813", fullName: "Hafiz Kurniawan", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-14", classId: "class-8b", nis: "260814", fullName: "Indah Permatasari", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-15", classId: "class-8b", nis: "260815", fullName: "Kevin Aditya Putra", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-16", classId: "class-8b", nis: "260816", fullName: "Lestari Wulandari", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-17", classId: "class-8b", nis: "260817", fullName: "Muhammad Rizky Pratama", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-18", classId: "class-8b", nis: "260818", fullName: "Nabila Syahrani", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-19", classId: "class-8b", nis: "260819", fullName: "Nadia Kusuma Wardani", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-20", classId: "class-8b", nis: "260820", fullName: "Panji Satria Wicaksana", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-21", classId: "class-8b", nis: "260821", fullName: "Putri Ayu Ningrum", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-22", classId: "class-8b", nis: "260822", fullName: "Raditya Danendra", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-23", classId: "class-8b", nis: "260823", fullName: "Rafi Ahmad Fauzi", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-24", classId: "class-8b", nis: "260824", fullName: "Rania Salsabila", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-25", classId: "class-8b", nis: "260825", fullName: "Rayhan Saputra", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-26", classId: "class-8b", nis: "260826", fullName: "Reza Mahendra", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-27", classId: "class-8b", nis: "260827", fullName: "Rizka Amelia", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-28", classId: "class-8b", nis: "260828", fullName: "Salsabila Nur Azizah", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-29", classId: "class-8b", nis: "260829", fullName: "Satria Bagus Pambudi", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-30", classId: "class-8b", nis: "260830", fullName: "Siti Nurhaliza", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-31", classId: "class-8b", nis: "260831", fullName: "Tiara Melati", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-32", classId: "class-8b", nis: "260832", fullName: "Wahyu Tri Prabowo", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-33", classId: "class-8b", nis: "260833", fullName: "Yoga Pratama", gender: "L", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "std-34", classId: "class-8b", nis: "260834", fullName: "Zahra Aulia Citra", gender: "P", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
];

/**
 * Mendapatkan daftar siswa untuk suatu kelas
 */
export function getStudentsForClass(classId: string): Student[] {
  const cls = MOCK_CLASSES.find((c) => c.id === classId);
  const classPrefix = cls ? cls.name.replace(/[^0-9]/g, "") : "7";

  return MOCK_STUDENTS_8B.map((student, idx) => ({
    ...student,
    id: `std-${classId}-${idx + 1}`,
    classId: classId,
    nis: `260${classPrefix}${String(idx + 1).padStart(2, "0")}`,
  }));
}

// ============================================================================
// MOCK SESI & CATATAN ABSENSI HARI INI
// ============================================================================

export const MOCK_SESSION_TODAY: AttendanceSession = {
  id: "session-today-8b",
  classId: "class-8b",
  sessionDate: "2026-09-29",
  slot: 0,
  subject: "Informatika",
  note: null,
  clientRequestId: "e3a89e02-4217-48f8-b4b1-91d1e4e6cf10",
  createdAt: "2026-09-29T07:15:00Z",
  updatedAt: "2026-09-29T07:15:00Z",
};

/** Catatan absensi */
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
  classId: "class-8b",
  className: "8B",
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
