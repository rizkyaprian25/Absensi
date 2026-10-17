import type { Subject, TeacherAssignment, AppUser } from "../contracts/academic.ts";
import { DEFAULT_SUBJECTS } from "../contracts/academic.ts";
import type { Class, ScheduleDay } from "../contracts/attendance.ts";
import { MOCK_CLASSES } from "../contracts/mocks/attendanceMocks.ts";
import type { TeacherScheduleSlot, TeacherWeeklySchedule } from "../contracts/schedule.ts";
import { OFFICIAL_SCHEDULE_SLOTS } from "../contracts/mocks/scheduleMocks.ts";
import { getStoredUsers } from "./authStorage.ts";

export { OFFICIAL_SCHEDULE_SLOTS };
export type { TeacherScheduleSlot, TeacherWeeklySchedule };

// ============================================================================
// KUNCI PENYIMPANAN DATA AKADEMIK (LOCALSTORAGE SSOT)
// ============================================================================

export const STORAGE_KEY_SUBJECTS = "absensi_subjects_v1";
export const STORAGE_KEY_TEACHER_ASSIGNMENTS = "absensi_teacher_assignments_v1";
/**
 * Matriks Distribusi Resmi Pembagian Tugas Jam Mengajar Guru
 * SMP Negeri 3 Cibungbulang TP 2026/2027 (Surat Keputusan Kepala Sekolah)
 * Total Beban KBM: 924 Jam (Kelas VII: 336 Jam, Kelas VIII: 294 Jam, Kelas IX: 294 Jam)
 */
const OFFICIAL_TEACHING_DISTRIBUTION: { teacherId: string; subjectId: string; classes: string[] }[] = [
  // 1. Aini Supiyah, S.Pd, MM (IPS - 32 Jam)
  { teacherId: "user-aini-supiyah", subjectId: "sub-ips", classes: ["8g", "9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 2. Lilis Yuliati, M.Pd (IPA - 30 Jam)
  { teacherId: "user-lilis-yuliati", subjectId: "sub-ipa", classes: ["8a", "8b", "8c", "8d", "8e", "8f"] },

  // 3. Hj. Heny Susana, S.Pd (Pendidikan Pancasila - 33 Jam)
  { teacherId: "user-heny-susana", subjectId: "sub-ppkn", classes: ["7a", "7b", "7c", "7d", "7e", "7f", "7g", "7h", "9a", "9b", "9c"] },

  // 4. Dewi Nurhandayani, S.Pd (Bahasa Inggris - 28 Jam)
  { teacherId: "user-dewi-nurhandayani", subjectId: "sub-bing", classes: ["8a", "8b", "8c", "8d", "8e", "8f", "8g"] },

  // 5. Mohamad Reza Septiyani, S.Pd (PJOK - 33 Jam)
  { teacherId: "user-mohamad-reza", subjectId: "sub-pjok", classes: ["7a", "7b", "7c", "7d", "9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 6. Wilda Fajaratu Rahmi A, S.Pd (Bahasa Indonesia - 30 Jam)
  { teacherId: "user-wilda-fajaratu", subjectId: "sub-bind", classes: ["7a", "7b", "7c", "7d", "7e"] },

  // 7. Nika Musrifah, S.Pd (Bimbingan Konseling - 22 Jam)
  { teacherId: "user-nika-musrifah", subjectId: "sub-bk", classes: ["7a", "7b", "7c", "7d", "7e", "7f", "7g", "7h", "8a", "8b", "8c", "8d", "8e", "8f", "8g", "9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 8. Wiwin Djueriah, S.Pd, M.Han (Matematika - 35 Jam)
  { teacherId: "user-wiwin-djueriah", subjectId: "sub-mtk", classes: ["9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 9. Reza Kusnendar, S.Pd (Matematika - 35 Jam)
  { teacherId: "user-reza-kusnendar", subjectId: "sub-mtk", classes: ["7a", "7b", "7c", "7d", "7e", "7f", "7g"] },

  // 10. Acip Sulaeman, S.Pd I (IPS & PAIBP - 33 Jam)
  { teacherId: "user-acip-sulaeman", subjectId: "sub-ips", classes: ["7a", "7b", "7c"] },
  { teacherId: "user-acip-sulaeman", subjectId: "sub-pai", classes: ["9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 11. Awaliyatussa'dah M, S.Pd.I (PAIBP & Bahasa Sunda - 30 Jam)
  { teacherId: "user-awaliyatussadah", subjectId: "sub-pai", classes: ["7a", "7b", "7c", "7d", "7e", "7f", "7g", "7h"] },
  { teacherId: "user-awaliyatussadah", subjectId: "sub-snd", classes: ["9a", "9b", "9c"] },

  // 12. Saherudin, S.Pd (IPS - 32 Jam)
  { teacherId: "user-saherudin", subjectId: "sub-ips", classes: ["7g", "7h", "8a", "8b", "8c", "8d", "8e", "8f"] },

  // 13. Anwar Sanusi, M.Pd (Bahasa Indonesia - 30 Jam)
  { teacherId: "user-anwar-sanusi", subjectId: "sub-bind", classes: ["9a", "9b", "9c", "9d", "9e"] },

  // 14. Siti Mariam Ulfah, S.Pd (Bahasa Indonesia - 36 Jam)
  { teacherId: "user-siti-mariam", subjectId: "sub-bind", classes: ["7f", "7g", "7h", "8e", "8f", "8g"] },

  // 15. Iip Latifah, S.Pd.I (Prakarya & PAIBP - 33 Jam)
  { teacherId: "user-iip-latifah", subjectId: "sub-prak", classes: ["7e", "7f", "7g", "7h"] },
  { teacherId: "user-iip-latifah", subjectId: "sub-pai", classes: ["8a", "8b", "8c", "8d", "8e", "8f", "8g"] },

  // 16. Adam Yahya, S.Pd (PJOK - 33 Jam)
  { teacherId: "user-adam-yahya", subjectId: "sub-pjok", classes: ["7e", "7f", "7g", "7h", "8a", "8b", "8c", "8d", "8e", "8f", "8g"] },

  // 17. Siti Maesaroh, S.Pd (Bahasa Indonesia - 36 Jam)
  { teacherId: "user-siti-maesaroh", subjectId: "sub-bind", classes: ["8a", "8b", "8c", "8d", "9f", "9g"] },

  // 18. Taufik Zulkarnaen, S.Pd (Matematika & Bahasa Inggris - 33 Jam)
  { teacherId: "user-taufik-zulkarnaen", subjectId: "sub-mtk", classes: ["7h"] },
  { teacherId: "user-taufik-zulkarnaen", subjectId: "sub-bing", classes: ["9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 19. Imas Masitoh, S.Pd (Bahasa Inggris - 28 Jam)
  { teacherId: "user-imas-masitoh", subjectId: "sub-bing", classes: ["7a", "7b", "7c", "7d", "7e", "7f", "7g"] },

  // 20. Nia Kurniawati, S.Pd (IPA - 35 Jam)
  { teacherId: "user-nia-kurniawati", subjectId: "sub-ipa", classes: ["7a", "7b", "7c", "7d", "7e", "7f", "7g"] },

  // 21. Dian Permatasari, S.Pd (IPA - 35 Jam)
  { teacherId: "user-dian-permatasari", subjectId: "sub-ipa", classes: ["9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 22. Aisyah Nurul Amini, S.Pd (Matematika - 35 Jam)
  { teacherId: "user-aisyah-nurul", subjectId: "sub-mtk", classes: ["8a", "8b", "8c", "8d", "8e", "8f", "8g"] },

  // 23. Ainun Fitri, S.Pd (Prakarya - 33 Jam)
  { teacherId: "user-ainun-fitri", subjectId: "sub-prak", classes: ["7a", "7b", "7c", "7d", "9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 24. Sofiyah, S.Sos (Pendidikan Pancasila - 33 Jam)
  { teacherId: "user-sofiyah", subjectId: "sub-ppkn", classes: ["8a", "8b", "8c", "8d", "8e", "8f", "8g", "9d", "9e", "9f", "9g"] },

  // 25. Fingkan Ellita, S.Pd (IPS, Bahasa Inggris, Prakarya - 37 Jam)
  { teacherId: "user-fingkan-ellita", subjectId: "sub-ips", classes: ["7d", "7e", "7f"] },
  { teacherId: "user-fingkan-ellita", subjectId: "sub-bing", classes: ["7h"] },
  { teacherId: "user-fingkan-ellita", subjectId: "sub-prak", classes: ["8a", "8b", "8c", "8d", "8e", "8f", "8g"] },

  // 26. Lucky Aditya Putra, S.Kom (Informatika - 36 Jam)
  { teacherId: "user-lucky-aditya", subjectId: "sub-inf", classes: ["8c", "8d", "8e", "8f", "8g", "9a", "9b", "9c", "9d", "9e", "9f", "9g"] },

  // 27. Mohammad Fauzi Rahman, M.I.Kom (Bahasa Sunda - 38 Jam)
  { teacherId: "user-fauzi-rahman", subjectId: "sub-snd", classes: ["7a", "7b", "7c", "7d", "7e", "7f", "7g", "7h", "8a", "8b", "8c", "8d", "8e", "8f", "8g", "9d", "9e", "9f", "9g"] },

  // 28. Muhamad Rizky Aprian, S.Kom (Informatika - 30 Jam)
  { teacherId: "user-rizky", subjectId: "sub-inf", classes: ["7a", "7b", "7c", "7d", "7e", "7f", "7g", "7h", "8a", "8b"] },

  // 29. Wikrama Wardana, S.Pd (IPA - 10 Jam)
  { teacherId: "user-wikrama-wardana", subjectId: "sub-ipa", classes: ["7h", "8g"] },
];

export const DEFAULT_TEACHER_ASSIGNMENTS: TeacherAssignment[] = OFFICIAL_TEACHING_DISTRIBUTION.flatMap((d) =>
  d.classes.map((c) => {
    const classId = `class-${c}`;
    const matchingSlots = OFFICIAL_SCHEDULE_SLOTS.filter(
      (s) => s.teacherId === d.teacherId && s.classId === classId
    );
    const firstSlot = matchingSlots[0];
    return {
      id: `asgn-${d.teacherId.replace("user-", "")}-${d.subjectId.replace("sub-", "")}-${c}`,
      teacherId: d.teacherId,
      subjectId: d.subjectId,
      classId,
      academicYear: "2026/2027",
      semester: 1,
      scheduleDay: firstSlot?.day || null,
      schedulePeriod: firstSlot?.period || null,
      scheduleTime: firstSlot?.time || null,
      isActive: true,
      createdAt: "2026-07-15T00:00:00Z",
    };
  })
);

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
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Periksa apakah mata pelajaran BK sudah termuat
      const hasBk = parsed.some((s) => s.id === "sub-bk");
      if (!hasBk || parsed.length < DEFAULT_SUBJECTS.length) {
        const existingIds = new Set(parsed.map((s) => s.id));
        const missing = DEFAULT_SUBJECTS.filter((s) => !existingIds.has(s.id));
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return DEFAULT_SUBJECTS;
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
 * Otomatis menyinkronkan 264 penugasan resmi seluruh guru jika belum tersimpan
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
    if (Array.isArray(parsed)) {
      // Periksa apakah penugasan seluruh guru sekolah (29 Guru, 264 rombel-mapel) sudah termuat
      const hasLucky = parsed.some((a) => a.teacherId === "user-lucky-aditya");
      if (!hasLucky || parsed.length < DEFAULT_TEACHER_ASSIGNMENTS.length) {
        const existingIds = new Set(parsed.map((a) => a.id));
        const missingAssignments = DEFAULT_TEACHER_ASSIGNMENTS.filter((a) => !existingIds.has(a.id));
        const merged = [...parsed, ...missingAssignments];
        localStorage.setItem(STORAGE_KEY_TEACHER_ASSIGNMENTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return DEFAULT_TEACHER_ASSIGNMENTS;
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
    const rizkyIds = new Set(
      DEFAULT_TEACHER_ASSIGNMENTS.filter((a) => a.teacherId === "user-rizky").map((a) => a.classId)
    );
    return MOCK_CLASSES.filter((c) => rizkyIds.has(c.id));
  }

  // Admin memiliki akses supervisi ke seluruh rombel sekolah (22 kelas)
  if (user.role === "ADMIN") {
    return MOCK_CLASSES;
  }

  // Untuk Guru: Ambil penugasan mengajar aktif
  let assignments = getTeacherAssignments(user.id);
  if (assignments.length === 0) {
    assignments = DEFAULT_TEACHER_ASSIGNMENTS.filter((a) => a.teacherId === user.id);
  }

  // Filter berdasarkan mata pelajaran jika ditentukan
  if (subjectId) {
    assignments = assignments.filter((a) => a.subjectId === subjectId);
  }

  const allSubjects = getStoredSubjects();
  return assignments.map((asgn) => {
    const baseClass = MOCK_CLASSES.find((c) => c.id === asgn.classId);
    const subject = allSubjects.find((s) => s.id === asgn.subjectId);
    const slots = OFFICIAL_SCHEDULE_SLOTS.filter(
      (s) => s.teacherId === asgn.teacherId && s.classId === asgn.classId
    );

    let displayDay = asgn.scheduleDay || slots[0]?.day || baseClass?.scheduleDay;
    let displayTime = asgn.scheduleTime || slots[0]?.time || baseClass?.scheduleTime;
    let displayPeriod = asgn.schedulePeriod || slots[0]?.period || baseClass?.schedulePeriod;

    if (slots.length > 1) {
      displayDay = slots.map((s) => s.day).join(" & ") as any;
      displayTime = slots.map((s) => `${s.day}: ${s.time}`).join(" · ");
      displayPeriod = slots.map((s) => `${s.day}: ${s.period}`).join(" · ");
    }

    return {
      ...(baseClass || {
        id: asgn.classId,
        teacherId: asgn.teacherId,
        name: asgn.classId.replace("class-", "").toUpperCase(),
        academicYear: asgn.academicYear,
        semester: asgn.semester,
        createdAt: asgn.createdAt,
      }),
      teacherId: asgn.teacherId,
      subject: subject?.name || slots[0]?.subjectName || baseClass?.subject || "Mata Pelajaran",
      scheduleDay: displayDay,
      scheduleTime: displayTime,
      schedulePeriod: displayPeriod,
      homeroomTeacherName: baseClass?.homeroomTeacherName,
    };
  });
}

/**
 * Mengambil daftar rombel pelajaran spesifik untuk guru dan hari yang dipilih
 * Menggunakan data jadwal aSc Timetables resmi (374 sesi KBM)
 * - Jika Admin: Mengembalikan seluruh kelas yang ada KBM di hari tersebut
 * - Jika Guru: Mengembalikan rombel yang diampu guru pada hari tersebut lengkap dengan jam dan periodenya
 */
export function getClassesForTeacherAndDay(
  user: AppUser | null,
  day: ScheduleDay
): Class[] {
  const isUserAdmin = user?.role === "ADMIN";
  const teacherId = user?.id ?? "user-rizky";

  // Ambil slot jadwal resmi untuk hari tersebut
  const daySlots = OFFICIAL_SCHEDULE_SLOTS.filter((s) => {
    if (s.day !== day) return false;
    if (isUserAdmin) return true;
    return s.teacherId === teacherId;
  });

  return daySlots.map((slot) => {
    const baseClass = MOCK_CLASSES.find((c) => c.id === slot.classId);
    return {
      ...(baseClass || {
        id: slot.classId,
        teacherId: slot.teacherId,
        name: slot.className,
        academicYear: "2026/2027",
        semester: 1,
        createdAt: "2026-07-15T00:00:00Z",
      }),
      teacherId: slot.teacherId,
      subject: slot.subjectName,
      scheduleDay: slot.day,
      schedulePeriod: slot.period,
      scheduleTime: slot.time,
      homeroomTeacherName: baseClass?.homeroomTeacherName,
    };
  });
}

/**
 * Mengambil seluruh slot jadwal aSc Timetables (374 sesi KBM mingguan)
 * Jika teacherId diberikan, hanya mengembalikan slot milik guru tersebut
 */
export function getTeacherScheduleSlots(teacherId?: string): TeacherScheduleSlot[] {
  if (!teacherId || teacherId === "user-admin" || teacherId === "user-juwariyah") {
    return OFFICIAL_SCHEDULE_SLOTS;
  }
  return OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.teacherId === teacherId);
}

/**
 * Mengambil slot jadwal untuk hari tertentu (Senin - Jumat)
 * Mendukung filter spesifik per guru
 */
export function getScheduleSlotsForDay(
  day: ScheduleDay,
  teacherId?: string
): TeacherScheduleSlot[] {
  return OFFICIAL_SCHEDULE_SLOTS.filter((s) => {
    if (s.day !== day) return false;
    if (!teacherId || teacherId === "user-admin" || teacherId === "user-juwariyah") return true;
    return s.teacherId === teacherId;
  });
}

/**
 * Mengambil matriks jadwal mingguan seorang guru (Senin s.d. Jumat)
 */
export function getTeacherWeeklySchedule(teacherId: string): TeacherWeeklySchedule {
  const users = getStoredUsers();
  const teacher = users.find((u) => u.id === teacherId);
  const teacherSlots = OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.teacherId === teacherId);

  const byDay: Record<ScheduleDay, TeacherScheduleSlot[]> = {
    Senin: [],
    Selasa: [],
    Rabu: [],
    Kamis: [],
    Jumat: [],
  };

  teacherSlots.forEach((slot) => {
    if (byDay[slot.day]) {
      byDay[slot.day].push(slot);
    }
  });

  return {
    teacherId,
    teacherName: teacher?.fullName || "Guru Pengampu",
    totalSessions: teacherSlots.length,
    byDay,
  };
}

/**
 * Mengambil seluruh matriks jadwal mingguan 29 guru sekolah
 */
export function getAllTeachersWeeklySchedules(): TeacherWeeklySchedule[] {
  const users = getStoredUsers().filter((u) => u.role === "GURU");
  return users.map((u) => getTeacherWeeklySchedule(u.id));
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
  if (assignments.length === 0) {
    assignments = DEFAULT_TEACHER_ASSIGNMENTS.filter((a) => a.teacherId === user.id);
  }

  const enrolledSubjectIds = new Set(assignments.map((a) => a.subjectId));
  const filtered = allSubjects.filter((s) => enrolledSubjectIds.has(s.id));
  return filtered.length > 0 ? filtered : [allSubjects[0]];
}

