import type { Subject, TeacherAssignment, AppUser } from "../contracts/academic.ts";
import { DEFAULT_SUBJECTS } from "../contracts/academic.ts";
import type { Class } from "../contracts/attendance.ts";
import { MOCK_CLASSES } from "../contracts/mocks/attendanceMocks.ts";

// ============================================================================
// KUNCI PENYIMPANAN DATA AKADEMIK (LOCALSTORAGE SSOT)
// ============================================================================

export const STORAGE_KEY_SUBJECTS = "absensi_subjects_v1";
export const STORAGE_KEY_TEACHER_ASSIGNMENTS = "absensi_teacher_assignments_v1";

/**
 * Penugasan awal bawaan untuk Bapak Muhamad Rizky Aprian, S.Kom
 * Mengajar Informatika di seluruh kelas 7 (7A-7H) dan kelas 8 (8A-8B)
 */
export const DEFAULT_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
  // Kelas 7
  { id: "asgn-rizky-inf-7a", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-7a", academicYear: "2026/2027", semester: 1, scheduleDay: "Senin", scheduleTime: "08:00 – 09:45", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "asgn-rizky-inf-7b", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-7b", academicYear: "2026/2027", semester: 1, scheduleDay: "Selasa", scheduleTime: "09:15 – 11:25", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "asgn-rizky-inf-7c", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-7c", academicYear: "2026/2027", semester: 1, scheduleDay: "Kamis", scheduleTime: "09:15 – 11:25", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "asgn-rizky-inf-7d", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-7d", academicYear: "2026/2027", semester: 1, scheduleDay: "Senin", scheduleTime: "10:10 – 11:55", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "asgn-rizky-inf-7e", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-7e", academicYear: "2026/2027", semester: 1, scheduleDay: "Rabu", scheduleTime: "09:15 – 11:25", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "asgn-rizky-inf-7f", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-7f", academicYear: "2026/2027", semester: 1, scheduleDay: "Rabu", scheduleTime: "07:30 – 09:15", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "asgn-rizky-inf-7g", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-7g", academicYear: "2026/2027", semester: 1, scheduleDay: "Jumat", scheduleTime: "08:50 – 10:35", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "asgn-rizky-inf-7h", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-7h", academicYear: "2026/2027", semester: 1, scheduleDay: "Jumat", scheduleTime: "07:00 – 08:45", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  // Kelas 8
  { id: "asgn-rizky-inf-8a", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-8a", academicYear: "2026/2027", semester: 1, scheduleDay: "Kamis", scheduleTime: "07:30 – 09:15", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
  { id: "asgn-rizky-inf-8b", teacherId: "user-rizky", subjectId: "sub-inf", classId: "class-8b", academicYear: "2026/2027", semester: 1, scheduleDay: "Selasa", scheduleTime: "07:30 – 09:15", isActive: true, createdAt: "2026-07-15T00:00:00Z" },
];

/**
 * Mengambil daftar mata pelajaran dari penyimpanan lokal
 */
export function getStoredSubjects(): Subject[] {
  if (typeof window === "undefined") {
    return DEFAULT_SUBJECTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
      return DEFAULT_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUBJECTS;
  } catch (err) {
    console.warn("Gagal membaca daftar mata pelajaran:", err);
    return DEFAULT_SUBJECTS;
  }
}

/**
 * Menyimpan daftar mata pelajaran ke penyimpanan lokal
 */
export function saveStoredSubjects(subjects: Subject[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
  } catch (err) {
    console.warn("Gagal menyimpan mata pelajaran:", err);
  }
}

/**
 * Mengambil seluruh data penugasan mengajar guru dari penyimpanan lokal
 */
export function getStoredTeacherAssignments(): TeacherAssignment[] {
  if (typeof window === "undefined") {
    return DEFAULT_TEACHER_ASSIGNMENTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHER_ASSIGNMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TEACHER_ASSIGNMENTS, JSON.stringify(DEFAULT_TEACHER_ASSIGNMENTS));
      return DEFAULT_TEACHER_ASSIGNMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TEACHER_ASSIGNMENTS;
  } catch (err) {
    console.warn("Gagal membaca penugasan guru:", err);
    return DEFAULT_TEACHER_ASSIGNMENTS;
  }
}

/**
 * Menyimpan seluruh penugasan mengajar ke penyimpanan lokal
 */
export function saveAllTeacherAssignments(assignments: TeacherAssignment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_TEACHER_ASSIGNMENTS, JSON.stringify(assignments));
  } catch (err) {
    console.warn("Gagal menyimpan penugasan guru:", err);
  }
}

/**
 * Mengambil penugasan mengajar khusus untuk guru tertentu
 */
export function getTeacherAssignments(teacherId: string): TeacherAssignment[] {
  const all = getStoredTeacherAssignments();
  return all.filter((a) => a.teacherId === teacherId && a.isActive);
}

/**
 * Memperbarui penugasan mengajar untuk seorang guru (Fitur Self-Enrollment & Admin Assignment)
 * Menjaga penugasan guru lain tetap utuh
 */
export function saveTeacherAssignmentsForTeacher(
  teacherId: string,
  newAssignments: TeacherAssignment[]
): void {
  const all = getStoredTeacherAssignments();
  // Singkirkan penugasan lama untuk guru ini
  const others = all.filter((a) => a.teacherId !== teacherId);
  const merged = [...others, ...newAssignments];
  saveAllTeacherAssignments(merged);
}

/**
 * Fungsi helper Self-Enrollment: Mengatur penugasan mapel & kelas untuk seorang guru
 * @param teacherId ID Guru
 * @param enrollments Peta Subject ID -> Array Class ID yang dipilih
 */
export function setTeacherEnrollmentMatrix(
  teacherId: string,
  enrollments: Record<string, string[]> // subjectId -> classIds[]
): TeacherAssignment[] {
  const now = new Date().toISOString();
  const newAssignments: TeacherAssignment[] = [];

  for (const [subjectId, classIds] of Object.entries(enrollments)) {
    for (const classId of classIds) {
      newAssignments.push({
        id: `asgn-${teacherId}-${subjectId}-${classId}`,
        teacherId,
        subjectId,
        classId,
        academicYear: "2026/2027",
        semester: 1,
        isActive: true,
        createdAt: now,
      });
    }
  }

  saveTeacherAssignmentsForTeacher(teacherId, newAssignments);
  return newAssignments;
}

/**
 * Mengambil daftar kelas yang di-enroll oleh guru yang sedang aktif
 * - Jika peran ADMIN: Mengembalikan seluruh kelas (supervisi sekolah)
 * - Jika peran GURU: Hanya mengembalikan rombel kelas yang terdaftar pada penugasan guru
 */
export function getEnrolledClassesForUser(
  user: AppUser | null,
  subjectId?: string
): Class[] {
  if (!user) {
    // Fallback awal default untuk Pak Rizky (10 kelas: 7A-7H & 8A-8B)
    const defaultIds = new Set(DEFAULT_TEACHER_ASSIGNMENTS.map((a) => a.classId));
    return MOCK_CLASSES.filter((c) => defaultIds.has(c.id));
  }

  // Admin memiliki akses supervisi ke seluruh rombel sekolah (22 kelas)
  if (user.role === "ADMIN") {
    return MOCK_CLASSES;
  }

  // Untuk Guru: Ambil penugasan mengajar aktif
  let assignments = getTeacherAssignments(user.id);
  if (assignments.length === 0 && (user.username === "rizky" || user.id === "user-rizky")) {
    assignments = DEFAULT_TEACHER_ASSIGNMENTS;
  }

  // Filter berdasarkan mata pelajaran jika ditentukan
  if (subjectId) {
    assignments = assignments.filter((a) => a.subjectId === subjectId);
  }

  const assignedClassIds = new Set(assignments.map((a) => a.classId));
  return MOCK_CLASSES.filter((c) => assignedClassIds.has(c.id));
}

/**
 * Mengambil daftar mata pelajaran yang di-enroll oleh guru yang sedang aktif
 * - Jika peran ADMIN: Mengembalikan seluruh master mata pelajaran
 * - Jika peran GURU: Mengembalikan mata pelajaran unik yang diampu guru
 */
export function getEnrolledSubjectsForUser(user: AppUser | null): Subject[] {
  const allSubjects = getStoredSubjects();
  if (!user || user.role === "ADMIN") {
    return allSubjects;
  }

  let assignments = getTeacherAssignments(user.id);
  if (assignments.length === 0 && (user.username === "rizky" || user.id === "user-rizky")) {
    assignments = DEFAULT_TEACHER_ASSIGNMENTS;
  }

  const enrolledSubjectIds = new Set(assignments.map((a) => a.subjectId));
  const filtered = allSubjects.filter((s) => enrolledSubjectIds.has(s.id));
  return filtered.length > 0 ? filtered : [allSubjects[0]];
}

