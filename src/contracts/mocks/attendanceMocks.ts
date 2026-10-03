import {
  Class,
  Student,
  AttendanceSession,
  AttendanceRecord,
  MonthlyClassRecap,
} from "../attendance";
import { ALL_STUDENTS_BY_CLASS, STUDENTS_CLASS_8B } from "./studentsData";

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
// MOCK SISWA KELAS (MENGGUNAKAN DATA OTENTIK SMP NEGERI 3 CIBUNGBULANG)
// ============================================================================

export { ALL_STUDENTS_BY_CLASS };

/** Daftar siswa otentik kelas 8B */
export const MOCK_STUDENTS_8B: Student[] = STUDENTS_CLASS_8B;

/**
 * Mendapatkan daftar siswa otentik untuk suatu rombongan belajar (7A-7H, 8A-8B)
 */
export function getStudentsForClass(classId: string): Student[] {
  return ALL_STUDENTS_BY_CLASS[classId] ?? STUDENTS_CLASS_8B;
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

/** Catatan absensi hari ini dengan siswa otentik kelas 8B */
export const MOCK_RECORDS_TODAY: AttendanceRecord[] = MOCK_STUDENTS_8B.map((student, idx) => {
  if (idx === 2) {
    // Siswa ke-3 (ANDIKA): Sakit
    return {
      id: `rec-${idx + 1}`,
      sessionId: "session-today-8b",
      studentId: student.id,
      status: "SAKIT",
      lateMinutes: null,
      note: "Surat dokter terlampir",
    };
  }
  if (idx === 6) {
    // Siswa ke-7 (DIKTA ALFARIJI): Izin
    return {
      id: `rec-${idx + 1}`,
      sessionId: "session-today-8b",
      studentId: student.id,
      status: "IZIN",
      lateMinutes: null,
      note: "Acara keluarga",
    };
  }
  if (idx === 11) {
    // Siswa ke-12 (KHAERUL ILHAM): Alpa
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
  averageAttendance: 95.2,
  students: MOCK_STUDENTS_8B.map((s, idx) => {
    const isProblematic = idx === 11;
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
