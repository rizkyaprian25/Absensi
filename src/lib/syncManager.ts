import { supabase, isSupabaseConfigured } from "./supabaseClient.ts";
import type {
  AttendanceSession,
  AttendanceRecord,
  HolidayItem,
  Student,
} from "../contracts/attendance.ts";
import type {
  AssessmentItem,
  StudentScoreRecord,
} from "../contracts/grades.ts";
import {
  MOCK_CLASSES,
  ALL_STUDENTS_BY_CLASS,
} from "../contracts/mocks/attendanceMocks.ts";
import {
  getSavedSessions,
  getSavedRecords,
  STORAGE_KEY_SESSIONS,
  STORAGE_KEY_RECORDS,
} from "./attendanceStorage.ts";
import {
  getStoredAssessments,
  getStoredScores,
  getStoredKKM,
  STORAGE_KEY_ASSESSMENTS,
  STORAGE_KEY_SCORES,
} from "./gradeStorage.ts";
import {
  getStoredHolidays,
  STORAGE_KEY_HOLIDAYS,
} from "./calendarUtils.ts";
import {
  createFullBackupPayload,
  applyBackupPayloadToLocalStorage,
  getStoredCustomStudents,
  triggerAutoSnapshot,
  type AppBackupPayload,
} from "./backupManager.ts";

export const STORAGE_KEY_LAST_CLOUD_SYNC = "absensi_last_cloud_sync_timestamp_v1";

/**
 * Mengambil waktu terakhir sinkronisasi cloud dilakukan
 */
export function getLastCloudSyncTime(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_CLOUD_SYNC);
  } catch {
    return null;
  }
}

/**
 * Menyimpan waktu terakhir sinkronisasi cloud
 */
export function setLastCloudSyncTime(isoString: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_LAST_CLOUD_SYNC, isoString);
  } catch (err) {
    console.warn("Gagal menyimpan timestamp sinkronisasi cloud:", err);
  }
}

export interface SyncResult {
  success: boolean;
  message: string;
  syncedAt?: string;
  details?: {
    classesCount?: number;
    studentsCount?: number;
    sessionsCount?: number;
    recordsCount?: number;
    assessmentsCount?: number;
    scoresCount?: number;
    holidaysCount?: number;
    totalSessions?: number;
    totalRecords?: number;
    totalAssessments?: number;
    totalScores?: number;
    totalHolidays?: number;
  };
  error?: string;
}

/**
 * Mendorong (Push) seluruh data presensi, nilai, kalender, dan snapshot lokal ke Supabase PostgreSQL
 */
export async function syncLocalDataToCloud(): Promise<SyncResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: "Supabase belum dikonfigurasi. Periksa NEXT_PUBLIC_SUPABASE_URL dan KEY di .env.local",
    };
  }

  try {
    const payload = createFullBackupPayload();
    const nowIso = new Date().toISOString();

    // 1. Cadangkan snapshot komprehensif ke tabel app_snapshots (Disaster Recovery Tier-1)
    // Berisi seluruh state lokal termasuk kkmByGrade dan customStudents secara utuh
    const { error: snapshotError } = await supabase.from("app_snapshots").upsert({
      id: `cloud-snap-${Date.now()}`,
      timestamp: nowIso,
      trigger: "Sinkronisasi Cloud Manual / Otomatis",
      checksum: payload.checksum,
      payload: payload,
      stats: payload.stats,
    });

    if (snapshotError) {
      // Jika tabel belum dibuat, beritahu guru dengan jelas
      if (
        snapshotError.code === "42P01" ||
        snapshotError.message.includes("relation") ||
        snapshotError.message.includes("does not exist")
      ) {
        return {
          success: false,
          message:
            "Tabel belum dibuat di Supabase. Silakan jalankan script schema.sql di SQL Editor Supabase terlebih dahulu.",
          error: snapshotError.message,
        };
      }
      throw new Error(`Gagal menyimpan snapshot ke cloud: ${snapshotError.message}`);
    }

    // 2. Sinkronkan Tabel Induk: Rombel / Kelas (classes)
    // Wajib di-upsert sebelum tabel anak (sessions, assessments, students) untuk memenuhi relasi Foreign Key
    const classRows = MOCK_CLASSES.map((c) => ({
      id: c.id,
      teacher_id: c.teacherId,
      name: c.name,
      academic_year: c.academicYear,
      semester: c.semester,
      archived_at: c.archivedAt,
      created_at: c.createdAt,
      schedule_day: c.scheduleDay,
      schedule_time: c.scheduleTime,
      schedule_period: c.schedulePeriod,
      subject: c.subject || "Informatika",
    }));
    const { error: clsErr } = await supabase
      .from("classes")
      .upsert(classRows, { onConflict: "id" });
    if (clsErr) console.warn("Peringatan sinkronisasi classes:", clsErr.message);

    const validClassIds = new Set(MOCK_CLASSES.map((c) => c.id));

    // 3. Sinkronkan Tabel Induk: Siswa (students)
    // Gabungkan siswa resmi SMPN 3 Cibungbulang dan siswa kustom lokal
    const studentMap = new Map<string, Student>();
    Object.values(ALL_STUDENTS_BY_CLASS).forEach((list) => {
      list.forEach((s) => studentMap.set(s.id, s));
    });
    if (payload.data.customStudents) {
      Object.values(payload.data.customStudents).forEach((list) => {
        list.forEach((s) => studentMap.set(s.id, s));
      });
    }

    const studentList = Array.from(studentMap.values()).filter(
      (s) => s.classId && validClassIds.has(s.classId)
    );
    const BATCH_SIZE = 200;
    for (let i = 0; i < studentList.length; i += BATCH_SIZE) {
      const batch = studentList.slice(i, i + BATCH_SIZE).map((s) => ({
        id: s.id,
        class_id: s.classId,
        nis: s.nis || null,
        full_name: s.fullName,
        gender: s.gender === "P" ? "P" : "L",
        is_active: s.isActive ?? true,
        created_at: s.createdAt || nowIso,
      }));
      const { error: stdErr } = await supabase
        .from("students")
        .upsert(batch, { onConflict: "id" });
      if (stdErr) console.warn("Peringatan sinkronisasi students batch:", stdErr.message);
    }

    const validStudentIds = new Set(studentList.map((s) => s.id));

    // 4. Sinkronkan Hari Libur / Agenda Kalender (holidays)
    const holidays = payload.data.holidays || [];
    if (holidays.length > 0) {
      const holidayRows = holidays.map((h) => ({
        id: h.id,
        date: h.date,
        name: h.name,
        category: h.category,
        description: h.description || null,
      }));
      const { error: hErr } = await supabase
        .from("holidays")
        .upsert(holidayRows, { onConflict: "id" });
      if (hErr) console.warn("Peringatan sinkronisasi holidays:", hErr.message);
    }

    // 5. Sinkronkan Sesi Presensi (attendance_sessions)
    const rawSessions = payload.data.sessions || [];
    const validSessions = rawSessions.filter(
      (s) => s.classId && validClassIds.has(s.classId)
    );

    const syncedSessionIds = new Set<string>();
    if (validSessions.length > 0) {
      const sessionRows = validSessions.map((s) => ({
        id: s.id,
        class_id: s.classId,
        session_date: s.sessionDate,
        slot: s.slot ?? 0,
        subject: s.subject || "Informatika",
        topic: s.topic || null,
        learning_activities: s.learningActivities || null,
        note: s.note || null,
        client_request_id: s.clientRequestId,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
      }));
      const { error: sErr } = await supabase
        .from("attendance_sessions")
        .upsert(sessionRows, { onConflict: "id" });

      if (sErr) {
        console.warn("Peringatan sinkronisasi attendance_sessions:", sErr.message);
      } else {
        validSessions.forEach((s) => syncedSessionIds.add(s.id));
      }
    }

    // 6. Sinkronkan Rekaman Kehadiran Siswa (attendance_records)
    // Proteksi Integritas FK: Hanya dorong rekaman yang sesi dan siswanya valid di Supabase
    const rawRecords = payload.data.records || [];
    const validRecords = rawRecords.filter(
      (r) => syncedSessionIds.has(r.sessionId) && validStudentIds.has(r.studentId)
    );

    if (rawRecords.length > validRecords.length) {
      console.info(
        `Menyaring ${rawRecords.length - validRecords.length} rekaman presensi yatim/usang agar integritas foreign key di Supabase tetap terjaga.`
      );
    }

    if (validRecords.length > 0) {
      for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
        const batch = validRecords.slice(i, i + BATCH_SIZE).map((r) => ({
          id: r.id,
          session_id: r.sessionId,
          student_id: r.studentId,
          status: r.status,
          late_minutes: r.lateMinutes ?? null,
          note: r.note || null,
        }));
        const { error: rErr } = await supabase
          .from("attendance_records")
          .upsert(batch, { onConflict: "id" });
        if (rErr) console.warn("Peringatan sinkronisasi attendance_records batch:", rErr.message);
      }
    }

    // 7. Sinkronkan Asesmen / Tugas Nilai (assessments)
    const rawAssessments = payload.data.assessments || [];
    const validAssessments = rawAssessments.filter(
      (a) => a.classId && validClassIds.has(a.classId)
    );

    const syncedAssessmentIds = new Set<string>();
    if (validAssessments.length > 0) {
      const assessmentRows = validAssessments.map((a) => ({
        id: a.id,
        class_id: a.classId,
        subject: a.subject,
        type: a.type,
        title: a.title,
        description: a.description || null,
        date: a.date,
        max_score: a.maxScore,
        weight: a.weight,
        created_at: a.createdAt,
      }));
      const { error: aErr } = await supabase
        .from("assessments")
        .upsert(assessmentRows, { onConflict: "id" });

      if (aErr) {
        console.warn("Peringatan sinkronisasi assessments:", aErr.message);
      } else {
        validAssessments.forEach((a) => syncedAssessmentIds.add(a.id));
      }
    }

    // 8. Sinkronkan Nilai Siswa (student_scores)
    // Proteksi Integritas FK: Hanya dorong nilai yang asesmen dan siswanya valid di Supabase
    const rawScores = payload.data.scores || [];
    const validScores = rawScores.filter(
      (sc) => syncedAssessmentIds.has(sc.assessmentId) && validStudentIds.has(sc.studentId)
    );

    if (rawScores.length > validScores.length) {
      console.info(
        `Menyaring ${rawScores.length - validScores.length} data nilai siswa yatim agar integritas foreign key di Supabase tetap terjaga.`
      );
    }

    if (validScores.length > 0) {
      for (let i = 0; i < validScores.length; i += BATCH_SIZE) {
        const batch = validScores.slice(i, i + BATCH_SIZE).map((sc) => ({
          id: sc.id,
          assessment_id: sc.assessmentId,
          student_id: sc.studentId,
          score: sc.score,
          feedback: sc.feedback || null,
          updated_at: sc.updatedAt,
        }));
        const { error: scErr } = await supabase
          .from("student_scores")
          .upsert(batch, { onConflict: "id" });
        if (scErr) console.warn("Peringatan sinkronisasi student_scores batch:", scErr.message);
      }
    }

    // Simpan timestamp keberhasilan
    setLastCloudSyncTime(nowIso);

    return {
      success: true,
      message: "Seluruh data dan cadangan berhasil disinkronkan ke Supabase Cloud (PostgreSQL)!",
      syncedAt: nowIso,
      details: {
        classesCount: classRows.length,
        studentsCount: studentList.length,
        sessionsCount: validSessions.length,
        recordsCount: validRecords.length,
        assessmentsCount: validAssessments.length,
        scoresCount: validScores.length,
        holidaysCount: holidays.length,
      },
    };
  } catch (err: any) {
    console.error("Gagal sinkronisasi data ke cloud:", err);
    return {
      success: false,
      message: `Sinkronisasi gagal: ${err?.message || "Kesalahan jaringan atau server."}`,
      error: err?.message,
    };
  }
}

/**
 * Menarik (Pull) data terbaru dari Supabase PostgreSQL dan memulihkannya ke penyimpanan lokal
 */
export async function syncCloudDataToLocal(): Promise<SyncResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: "Supabase belum dikonfigurasi. Periksa kredensial di .env.local",
    };
  }

  try {
    // 1. Ambil snapshot cadangan terbaru dari app_snapshots
    const { data: snapshotRows, error: snapErr } = await supabase
      .from("app_snapshots")
      .select("payload, timestamp")
      .order("timestamp", { ascending: false })
      .limit(1);

    if (snapErr) {
      if (snapErr.code === "42P01" || snapErr.message.includes("relation") || snapErr.message.includes("does not exist")) {
        return {
          success: false,
          message: "Tabel belum dibuat di Supabase. Silakan jalankan script schema.sql di SQL Editor Supabase.",
          error: snapErr.message,
        };
      }
      throw new Error(`Gagal mengambil snapshot dari cloud: ${snapErr.message}`);
    }

    if (snapshotRows && snapshotRows.length > 0 && snapshotRows[0].payload) {
      const cloudPayload = snapshotRows[0].payload as AppBackupPayload;

      // Ambil snapshot keselamatan lokal sebelum menimpa data
      triggerAutoSnapshot("Sebelum Penarikan Data dari Cloud");

      // Terapkan data dari cloud ke LocalStorage & IndexedDB
      applyBackupPayloadToLocalStorage(cloudPayload);

      const nowIso = new Date().toISOString();
      setLastCloudSyncTime(nowIso);

      // Siarkan event reaktif ke seluruh antarmuka aplikasi
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("absensi-data-changed", {
            detail: { source: "cloud-pull", timestamp: nowIso },
          })
        );
      }

      return {
        success: true,
        message: "Data berhasil ditarik dari Supabase Cloud dan diterapkan ke penyimpanan lokal!",
        syncedAt: nowIso,
        details: cloudPayload.stats,
      };
    }

    // Jika belum ada snapshot di cloud, periksa apakah tabel granular berisi data
    const { data: sessData } = await supabase.from("attendance_sessions").select("*");
    const { data: recData } = await supabase.from("attendance_records").select("*");
    const { data: assData } = await supabase.from("assessments").select("*");
    const { data: scData } = await supabase.from("student_scores").select("*");
    const { data: holData } = await supabase.from("holidays").select("*");

    if (
      (!sessData || sessData.length === 0) &&
      (!recData || recData.length === 0) &&
      (!assData || assData.length === 0)
    ) {
      return {
        success: false,
        message: "Database Supabase masih kosong. Silakan gunakan tombol 'Cadangkan ke Cloud' untuk mengirim data pertama kali.",
      };
    }

    // Bentuk payload dari tabel relasional
    const reconstructedPayload: AppBackupPayload = {
      version: 2,
      app: "Buku Presensi Digital SMPN 3 Cibungbulang",
      exportedAt: new Date().toISOString(),
      checksum: "chk-cloud-reconstruct",
      stats: {
        totalSessions: sessData?.length ?? 0,
        totalRecords: recData?.length ?? 0,
        totalAssessments: assData?.length ?? 0,
        totalScores: scData?.length ?? 0,
        totalHolidays: holData?.length ?? 0,
      },
      data: {
        sessions: (sessData ?? []).map((s: any) => ({
          id: s.id,
          classId: s.class_id,
          sessionDate: s.session_date,
          slot: s.slot,
          subject: s.subject,
          topic: s.topic,
          learningActivities: s.learning_activities,
          note: s.note,
          clientRequestId: s.client_request_id || `req-${s.id}`,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        })),
        records: (recData ?? []).map((r: any) => ({
          id: r.id,
          sessionId: r.session_id,
          studentId: r.student_id,
          status: r.status,
          lateMinutes: r.late_minutes,
          note: r.note,
        })),
        assessments: (assData ?? []).map((a: any) => ({
          id: a.id,
          classId: a.class_id,
          subject: a.subject,
          type: a.type,
          title: a.title,
          description: a.description,
          date: a.date,
          maxScore: Number(a.max_score),
          weight: Number(a.weight),
          createdAt: a.created_at,
        })),
        scores: (scData ?? []).map((sc: any) => ({
          id: sc.id,
          assessmentId: sc.assessment_id,
          studentId: sc.student_id,
          score: sc.score !== null ? Number(sc.score) : null,
          feedback: sc.feedback,
          updatedAt: sc.updated_at,
        })),
        holidays: (holData ?? []).map((h: any) => ({
          id: h.id,
          date: h.date,
          name: h.name,
          category: h.category,
          description: h.description,
        })),
        kkm: getStoredKKM(),
        customStudents: getStoredCustomStudents(),
      },
    };

    triggerAutoSnapshot("Sebelum Penarikan Data dari Cloud");
    applyBackupPayloadToLocalStorage(reconstructedPayload);

    const nowIso = new Date().toISOString();
    setLastCloudSyncTime(nowIso);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("absensi-data-changed", {
          detail: { source: "cloud-pull", timestamp: nowIso },
        })
      );
    }

    return {
      success: true,
      message: "Data relasional berhasil ditarik dari Supabase Cloud dan diterapkan ke penyimpanan lokal!",
      syncedAt: nowIso,
      details: reconstructedPayload.stats,
    };
  } catch (err: any) {
    console.error("Gagal menarik data dari cloud:", err);
    return {
      success: false,
      message: `Gagal menarik data dari cloud: ${err?.message || "Kesalahan jaringan."}`,
      error: err?.message,
    };
  }
}

/**
 * Sinkronisasi otomatis di latar belakang (Silent Fire-and-Forget)
 * Dipicu setiap kali guru menyimpan sesi absensi, asesmen, atau nilai siswa
 */
let debounceTimeout: any = null;

export function triggerBackgroundCloudSync(): void {
  if (typeof window === "undefined" || !isSupabaseConfigured) return;

  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  // Debounce 3 detik untuk menghemat panggilan API saat guru menginput beruntun
  debounceTimeout = setTimeout(() => {
    syncLocalDataToCloud().catch((err) => {
      console.warn("Sinkronisasi otomatis cloud di latar belakang tertunda (offline):", err);
    });
  }, 3000);
}

// Inisialisasi pendengar event snapshot lokal untuk memicu sinkronisasi cloud otomatis
if (typeof window !== "undefined") {
  window.addEventListener("absensi-snapshot-saved", () => {
    triggerBackgroundCloudSync();
  });
}


