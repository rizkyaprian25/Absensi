import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  ScheduleDay,
  HolidayItem,
  HolidayCategory,
} from "../contracts/attendance.ts";
import {
  findHolidayByDate,
  getStoredHolidays,
  isRealHoliday,
  isActiveSchoolEvent,
} from "./calendarUtils.ts";
import { MOCK_SESSION_TODAY, MOCK_RECORDS_TODAY } from "../contracts/mocks/attendanceMocks.ts";

export const STORAGE_KEY_SESSIONS = "absensi_saved_sessions_v1";
export const STORAGE_KEY_RECORDS = "absensi_saved_records_v1";

/** Tanggal mulai tahun ajaran 2026/2027 Semester Ganjil */
export const SEMESTER_START_DATE = "2026-07-13";

/**
 * Mengambil seluruh sesi absensi yang tersimpan di penyimpanan lokal
 */
export function getSavedSessions(): AttendanceSession[] {
  if (typeof window === "undefined") {
    return [MOCK_SESSION_TODAY];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) {
      const initial = [MOCK_SESSION_TODAY];
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [MOCK_SESSION_TODAY];
  } catch (err) {
    console.warn("Gagal membaca sesi lokal:", err);
    return [MOCK_SESSION_TODAY];
  }
}

/**
 * Mengambil seluruh catatan absensi siswa yang tersimpan di penyimpanan lokal
 */
export function getSavedRecords(): AttendanceRecord[] {
  if (typeof window === "undefined") {
    return MOCK_RECORDS_TODAY;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(MOCK_RECORDS_TODAY));
      return MOCK_RECORDS_TODAY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : MOCK_RECORDS_TODAY;
  } catch (err) {
    console.warn("Gagal membaca catatan presensi lokal:", err);
    return MOCK_RECORDS_TODAY;
  }
}

/**
 * Mengambil sesi dan catatan presensi untuk kelas dan tanggal tertentu
 */
export function getSessionAndRecords(
  classId: string,
  sessionDate: string
): { session: AttendanceSession | null; records: AttendanceRecord[] } {
  const sessions = getSavedSessions();
  const records = getSavedRecords();

  const session =
    sessions.find(
      (s) => s.classId === classId && s.sessionDate === sessionDate
    ) ?? null;

  if (!session) {
    return { session: null, records: [] };
  }

  const sessionRecords = records.filter((r) => r.sessionId === session.id);
  return { session, records: sessionRecords };
}

/**
 * Menyimpan sesi dan catatan presensi (idempoten berdasarkan classId + sessionDate)
 */
export function saveSessionAndRecords(
  session: AttendanceSession,
  records: AttendanceRecord[]
): void {
  if (typeof window === "undefined") return;

  try {
    const sessions = getSavedSessions();
    const existingRecords = getSavedRecords();

    // Perbarui atau tambahkan sesi
    const otherSessions = sessions.filter(
      (s) => !(s.classId === session.classId && s.sessionDate === session.sessionDate)
    );
    const updatedSessions = [...otherSessions, session];
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));

    // Perbarui catatan siswa untuk sesi ini
    const otherRecords = existingRecords.filter((r) => r.sessionId !== session.id);
    const updatedRecords = [...otherRecords, ...records];
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updatedRecords));
  } catch (err) {
    console.error("Gagal menyimpan presensi lokal:", err);
  }
}

export interface PastTeachingDateInfo {
  date: string;
  dayName: ScheduleDay;
  isHoliday: boolean; // Hanya true untuk hari libur murni (siswa bebas absen)
  holidayName?: string;
  isSpecialAgenda?: boolean; // True jika pekan UTS, UAS, atau Kokurikuler (sekolah masuk & tetap ada absensi)
  agendaCategory?: HolidayCategory;
  agendaName?: string;
  topic?: string | null; // Materi / Topik Bahasan Pembelajaran KBM
  learningActivities?: string | null; // Agenda / Uraian Aktivitas Belajar
  sessionNote?: string | null; // Catatan khusus KBM / refleksi kelas
  isFilled: boolean;
  isPast: boolean;
  isToday: boolean;
  hadirCount?: number;
  totalStudents?: number;
}

/**
 * Menghasilkan daftar tanggal KBM lampau untuk rombel tertentu sejak awal semester
 */
export function generatePastTeachingDates(
  scheduleDay: ScheduleDay,
  classId: string,
  startDateStr: string = SEMESTER_START_DATE,
  endDate: Date = new Date(),
  holidays: HolidayItem[] = []
): PastTeachingDateInfo[] {
  const dayIndexMap: Record<ScheduleDay, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
  };

  const targetDayIndex = dayIndexMap[scheduleDay] ?? 1;
  const sessions = getSavedSessions();
  const records = getSavedRecords();

  const result: PastTeachingDateInfo[] = [];

  const [startY, startM, startD] = startDateStr.split("-").map(Number);
  const cur = new Date(startY, startM - 1, startD);
  cur.setHours(0, 0, 0, 0);

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(endDate);

  const endLimit = new Date(endDate);
  endLimit.setHours(23, 59, 59, 999);

  while (cur <= endLimit) {
    if (cur.getDay() === targetDayIndex) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const calItem = findHolidayByDate(dateStr, holidays);
      // Hanya benar-benar libur jika kategori libur murni (NASIONAL, CUTI_BERSAMA, SEKOLAH, KHUSUS)
      const isHoliday = Boolean(calItem && isRealHoliday(calItem.category));
      // Jika UTS, UAS, atau Kokurikuler: sekolah masuk & tetap wajib ada absensi
      const isSpecialAgenda = Boolean(calItem && isActiveSchoolEvent(calItem.category));

      const session = sessions.find(
        (s) => s.classId === classId && s.sessionDate === dateStr
      );
      const isFilled = Boolean(session);
      const sessionRecs = session
        ? records.filter((r) => r.sessionId === session.id)
        : [];
      const hadirCount = sessionRecs.filter((r) => r.status === "HADIR").length;

      result.push({
        date: dateStr,
        dayName: scheduleDay,
        isHoliday,
        holidayName: isHoliday ? calItem?.name : undefined,
        isSpecialAgenda,
        agendaCategory: isSpecialAgenda ? calItem?.category : undefined,
        agendaName: isSpecialAgenda ? calItem?.name : undefined,
        topic: session?.topic ?? null,
        learningActivities: session?.learningActivities ?? null,
        sessionNote: session?.note ?? null,
        isFilled,
        isPast: dateStr < todayStr,
        isToday: dateStr === todayStr,
        hadirCount: isFilled ? hadirCount : undefined,
        totalStudents: isFilled ? sessionRecs.length : undefined,
      });
    }
    cur.setDate(cur.getDate() + 1);
  }

  // Urutkan dari tanggal terbaru ke terlama agar guru mudah melihat riwayat
  return result.reverse();
}

/**
 * Memperbarui atau menyimpan agenda materi pembelajaran untuk sesi tertentu
 */
export function updateSessionAgenda(
  classId: string,
  sessionDate: string,
  topic: string,
  learningActivities?: string,
  note?: string
): AttendanceSession {
  const sessions = getSavedSessions();
  const existingIdx = sessions.findIndex(
    (s) => s.classId === classId && s.sessionDate === sessionDate
  );

  let updatedSession: AttendanceSession;

  if (existingIdx !== -1) {
    updatedSession = {
      ...sessions[existingIdx],
      topic: topic.trim() || null,
      learningActivities: learningActivities?.trim() || null,
      note: note?.trim() || sessions[existingIdx].note,
      updatedAt: new Date().toISOString(),
    };
    sessions[existingIdx] = updatedSession;
  } else {
    updatedSession = {
      id: `session-${classId}-${sessionDate}`,
      classId,
      sessionDate,
      slot: 0,
      subject: "Informatika",
      topic: topic.trim() || null,
      learningActivities: learningActivities?.trim() || null,
      note: note?.trim() || null,
      clientRequestId: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.push(updatedSession);
  }

  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error("Gagal memperbarui agenda KBM lokal:", err);
  }

  return updatedSession;
}
