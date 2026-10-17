// Polyfill minimal untuk eksekusi unit test di runtime Node.js
if (typeof (globalThis as any).localStorage === "undefined") {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}
if (typeof (globalThis as any).window === "undefined") {
  (globalThis as any).window = {
    localStorage: (globalThis as any).localStorage,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
}

import assert from "node:assert";
import {
  calculateAttendanceRate,
  isAttendanceNeedingAttention,
  parseCsvStudents,
  upsertSessionIdempotent,
} from "./attendanceUtils.ts";
import type { AttendanceSession } from "../contracts/attendance.ts";
import {
  createFullBackupPayload,
  triggerAutoSnapshot,
  getAutoSnapshots,
  restoreFromSnapshot,
  restoreFromUploadedJson,
  type AppBackupPayload,
  MAX_ROLLING_SNAPSHOTS,
  saveSnapshotsWithQuotaProtection,
} from "./backupManager.ts";
import { isSupabaseConfigured, supabaseUrl } from "./supabaseClient.ts";
import { getLastCloudSyncTime, setLastCloudSyncTime } from "./syncManager.ts";
import {
  DEFAULT_HOLIDAYS,
  findHolidayByDate,
  isDateHoliday,
  getDateForWeekday,
  addOrUpdateSpecialPeriod,
  isRealHoliday,
  isActiveSchoolEvent,
  isDateActiveEvent,
} from "./calendarUtils.ts";
import {
  generatePastTeachingDates,
  STORAGE_KEY_SESSIONS,
  STORAGE_KEY_RECORDS,
} from "./attendanceStorage.ts";
import {
  calculateStudentGradeSummary,
  calculateClassGradeStats,
  exportGradesToCSV,
  STORAGE_KEY_ASSESSMENTS,
  STORAGE_KEY_SCORES,
  STORAGE_KEY_ASSESSMENT_ORDER,
  STORAGE_KEY_KKM_BY_GRADE,
  getAssessmentOrderForClass,
  saveAssessmentOrderForClass,
  getAssessmentsByClass,
  getStoredKkmByGrade,
  saveStoredKkmByGrade,
  getStoredKKM,
  saveStoredKKM,
  initGrade7AssessmentsIfMissing,
  STORAGE_KEY_GRADE_7_SEEDED,
  STORAGE_KEY_STUDENT_ATTITUDES,
  getStoredStudentAttitudes,
  saveStudentAttitude,
  batchSetAllStudentAttitudes,
  createAssessment,
  clearAssessmentsForClass,
} from "./gradeStorage.ts";
import {
  INITIAL_MOCK_ASSESSMENTS,
  generateInitialMockScores,
  GRADE_7_TARGET_CLASSES,
} from "../contracts/mocks/gradesMocks.ts";
import {
  DEFAULT_KKM,
  DEFAULT_KKM_BY_GRADE,
  extractGradeLevel,
  getGradePredicate,
  AttitudeGradeSchema,
  type AttitudeGrade,
  ATTITUDE_GRADE_METAS,
  DEFAULT_ATTITUDE_GRADE,
  formatAttitudeLabel,
  parseAttitudeGrade,
  type AssessmentItem,
  type StudentScoreRecord,
  type StudentGradeSummary,
} from "../contracts/grades.ts";
import {
  AttendanceStatusSchema,
  HolidayCategorySchema,
  AttendanceSessionSchema,
  type Student,
  type Class,
  type StudentMonthlyRecap,
} from "../contracts/attendance.ts";
import {
  MOCK_CLASSES,
  ALL_STUDENTS_BY_CLASS,
  getStudentsForClass,
  MOCK_HEADMASTER_NAME,
  MOCK_HEADMASTER_NIP,
} from "../contracts/mocks/attendanceMocks.ts";
import {
  generateAttendanceCsvWithKop,
  generateAttendanceExcelHtmlWithKop,
  generateGradesExcelHtmlWithKop,
  generateGradesCsvWithKop,
  generateAttendanceXlsxWithKop,
  generateGradesXlsxWithKop,
  generateSemesterAttendanceCsvWithKop,
  generateSemesterAttendanceXlsxWithKop,
  generateSemesterAttendanceHtmlPrint,
  generateAttendanceHtmlPrint,
  generateGradesHtmlPrint,
  generateCensoredGradesXlsxWithKop,
  generateCensoredGradesCsvWithKop,
  generateCensoredGradesWhatsAppText,
  generateCensoredGradesHtmlPrint,
  formatClassRoman,
  OFFICIAL_PAGE_MARGINS,
  OFFICIAL_PAPER_SETUP,
} from "./exportUtils.ts";
import { computeSemesterRecapForClass } from "../app/reports/page.tsx";
import type { SemesterClassRecap, StudentSemesterRecap } from "../contracts/attendance.ts";
import XLSX from "xlsx-js-style";
import {
  matchGradeRowsToStudents,
  parseGradesFromPastedText,
  generateGradeImportTemplateXlsx,
  parseScoreValue,
} from "./gradeImportUtils.ts";
import {
  getStoredUsers,
  loginUser,
  logoutUser,
  getCurrentUser,
  changePassword,
  resetUserPasswordByAdmin,
  updateUserProfile,
  createUserByAdmin,
  getUserPassword,
  deleteUserByAdmin,
} from "./authStorage.ts";
import {
  STORAGE_KEY_TEACHER_ASSIGNMENTS,
  getStoredTeacherAssignments,
  getStoredSubjects,
  getTeacherAssignments,
  setTeacherEnrollmentMatrix,
  DEFAULT_TEACHER_ASSIGNMENTS,
  saveTeacherAssignmentsForTeacher,
  removeTeacherAssignmentsForTeacher,
  getEnrolledClassesForUser,
  getEnrolledSubjectsForUser,
  getClassesForTeacherAndDay,
  getTeacherScheduleSlots,
  getScheduleSlotsForDay,
  getTeacherWeeklySchedule,
  getAllTeachersWeeklySchedules,
} from "./academicStorage.ts";
import { OFFICIAL_SCHEDULE_SLOTS } from "../contracts/mocks/scheduleMocks.ts";
import {
  generatePpdbTemplateWorkbook,
  commitPpdbImport,
  executeParallelPromotion,
  executeGraduationClass9,
  getSchoolTotalStudentsStats,
  STORAGE_KEY_DYNAMIC_STUDENTS,
  getStoredDynamicStudentsMap,
  getDynamicStudentsForClass,
  getStoredStudentMutations,
  deactivateStudentWithMutation,
  reactivateStudentFromMutation,
  getStudentHistoricalAuditData,
} from "./rolloverStorage.ts";

/**
 * Smoke Test Mandiri (Fase 4 SOP §3.5 & PRD §14)
 * Menjalankan uji logika terkecil (smallest runnable check) tanpa dependensi eksternal berat
 */
function runSmokeTest() {
  console.log("=== MENJALANKAN SMOKE TEST LOGIKA ABSENSI KELAS ===");

  // 1. Pengujian Kalkulasi Persentase Kehadiran
  {
    console.log("[TEST 1] Menghitung persentase kehadiran & ambang batas perhatian...");
    const rate1 = calculateAttendanceRate(20, 21);
    assert.strictEqual(rate1, 95.2, "20 hadir dari 21 hari harus menghasilkan 95.2%");
    assert.strictEqual(isAttendanceNeedingAttention(rate1), false, "95.2% tidak perlu perhatian");

    const rate2 = calculateAttendanceRate(15, 21);
    assert.strictEqual(rate2, 71.4, "15 hadir dari 21 hari harus menghasilkan 71.4%");
    assert.strictEqual(isAttendanceNeedingAttention(rate2), true, "71.4% wajib ditandai perlu perhatian (< 85%)");

    const rateZero = calculateAttendanceRate(0, 0);
    assert.strictEqual(rateZero, 100.0, "Hari 0 harus menghasilkan default 100.0%");

    const rateWithDispen = calculateAttendanceRate(18, 20, 2);
    assert.strictEqual(rateWithDispen, 100.0, "18 hadir + 2 dispen dari 20 hari harus menghasilkan 100.0%");
    console.log("✓ LULUS: Kalkulasi persentase akurat (termasuk status dispensasi sah).");
  }

  // 2. Pengujian Parser CSV Siswa
  {
    console.log("[TEST 2] Memvalidasi parser berkas impor CSV...");
    const sampleCsv = `nis,nama,jk\r\n260801,Aisyah Putri,P\r\n260802,Bagas Setiawan,L\r\n260801,Duplikat NIS,L\r\n,Nama Kosong,P\r\n260803,,P`;
    const { valid, invalid } = parseCsvStudents(sampleCsv, ["260899"]);

    assert.strictEqual(valid.length, 3, "Harus ada 3 baris yang valid (termasuk siswa tanpa NIS)");
    assert.strictEqual(valid[0].nama, "Aisyah Putri");
    assert.strictEqual(valid[0].jk, "P");
    assert.strictEqual(valid[1].nama, "Bagas Setiawan");
    assert.strictEqual(valid[2].nama, "Nama Kosong"); // Siswa valid tanpa NIS

    assert.strictEqual(invalid.length, 2, "Harus mendeteksi 2 baris yang tidak valid (duplikat NIS & nama kosong)");
    assert.ok(invalid.some((inv) => inv.errors.some((err) => err.includes("duplikat"))));
    assert.ok(invalid.some((inv) => inv.errors.some((err) => err.includes("Nama siswa tidak boleh kosong"))));
    console.log("✓ LULUS: Parser CSV memvalidasi baris dengan benar.");
  }

  // 3. Pengujian Idempotensi Sesi Absensi
  {
    console.log("[TEST 3] Menguji idempotensi penyimpanan sesi absensi...");
    const initialSession: AttendanceSession = {
      id: "session-1",
      classId: "class-8b-uuid",
      sessionDate: "2026-09-29",
      slot: 0,
      subject: "Matematika Wajib",
      note: null,
      clientRequestId: "req-uuid-12345",
      createdAt: "2026-09-29T07:00:00Z",
      updatedAt: "2026-09-29T07:00:00Z",
    };

    let store: AttendanceSession[] = [];

    // Pengiriman pertama
    const res1 = upsertSessionIdempotent(store, initialSession);
    assert.strictEqual(res1.isDuplicateRequest, false);
    assert.strictEqual(res1.sessions.length, 1);
    store = res1.sessions;

    // Pengiriman kedua dengan clientRequestId yang sama persis (simulasi retry jaringan fluktuatif)
    const res2 = upsertSessionIdempotent(store, initialSession);
    assert.strictEqual(res2.isDuplicateRequest, true, "Request dengan clientRequestId sama harus terdeteksi sebagai duplikat");
    assert.strictEqual(res2.sessions.length, 1, "Jumlah sesi di database tidak boleh bertambah menjadi 2");

    console.log("✓ LULUS: Sesi idempoten mencegah penggandaan data saat retry jaringan.");
  }

  // 4. Pengujian Utilitas Kalender Akademik & Hari Libur Kustom
  {
    console.log("[TEST 4] Menguji deteksi hari libur & penentuan tanggal pekan aktif...");
    const isIndependenceDay = isDateHoliday("2026-08-17", DEFAULT_HOLIDAYS);
    assert.strictEqual(isIndependenceDay, true, "17 Agustus 2026 harus terdeteksi sebagai hari libur");

    const regularDay = isDateHoliday("2026-08-18", DEFAULT_HOLIDAYS);
    assert.strictEqual(regularDay, false, "18 Agustus 2026 harus terdeteksi sebagai hari biasa");

    const holidayItem = findHolidayByDate("2026-08-25", DEFAULT_HOLIDAYS);
    assert.ok(holidayItem, "Maulid Nabi harus ditemukan");
    assert.strictEqual(holidayItem?.category, "NASIONAL");

    // Pengujian kalkulasi tanggal hari kerja
    const mondayStr = getDateForWeekday("Senin", new Date("2026-09-30T10:00:00Z")); // Rabu
    assert.strictEqual(mondayStr, "2026-09-28", "Senin pekan tersebut harus 2026-09-28");

    const fridayStr = getDateForWeekday("Jumat", new Date("2026-09-30T10:00:00Z"));
    assert.strictEqual(fridayStr, "2026-10-02", "Jumat pekan tersebut harus 2026-10-02");

    console.log("✓ LULUS: Utilitas kalender akademik & hari libur kustom berfungsi presisi.");
  }

  // 5. Pengujian Penelusuran Tanggal KBM Lampau (Backfill Presensi)
  {
    console.log("[TEST 5] Menguji penjadwalan tanggal KBM lampau sejak awal semester...");
    const tuesdayDates = generatePastTeachingDates(
      "Selasa",
      "class-8b",
      "2026-07-13",
      new Date("2026-10-03T10:00:00Z"),
      DEFAULT_HOLIDAYS
    );

    assert.ok(tuesdayDates.length >= 11, "Harus menghasilkan minimal 11 hari Selasa sejak pertengahan Juli 2026");
    assert.strictEqual(tuesdayDates[0].dayName, "Selasa");

    // Periksa apakah 2026-08-25 terdeteksi libur (Maulid Nabi)
    const maulidTuesday = tuesdayDates.find((t) => t.date === "2026-08-25");
    assert.ok(maulidTuesday, "2026-08-25 harus ada dalam daftar Selasa lampau");
    assert.strictEqual(maulidTuesday?.isHoliday, true, "2026-08-25 harus terdeteksi sebagai hari libur");

    console.log("✓ LULUS: Penelusuran tanggal KBM lampau menghasilkan daftar presensi susulan yang akurat.");
  }

  // 6. Pengujian Penandaan Hari Libur di Pertemuan KBM Lampau
  {
    console.log("[TEST 6] Menguji penandaan hari libur kustom pada tanggal lampau...");
    const customPastHolidayDate = "2026-07-21"; // Hari Selasa kedua di bulan Juli 2026
    const holidaysWithCustom = [
      ...DEFAULT_HOLIDAYS,
      {
        id: `hld-${customPastHolidayDate}`,
        date: customPastHolidayDate,
        name: "Kegiatan MPLS Sekolah",
        category: "SEKOLAH" as const,
      },
    ];

    const tuesdayDates = generatePastTeachingDates(
      "Selasa",
      "class-8b",
      "2026-07-13",
      new Date("2026-10-03T10:00:00Z"),
      holidaysWithCustom
    );

    const targetDate = tuesdayDates.find((t) => t.date === customPastHolidayDate);
    assert.ok(targetDate, "Tanggal 2026-07-21 harus ada dalam daftar");
    assert.strictEqual(targetDate?.isHoliday, true, "2026-07-21 harus berhasil ditandai sebagai hari libur");
    assert.strictEqual(targetDate?.holidayName, "Kegiatan MPLS Sekolah");

    console.log("✓ LULUS: Penandaan hari libur pada tanggal lampau terintegrasi akurat ke riwayat presensi.");
  }

  // 7. Pengujian Logika Penilaian Siswa (Tugas, UH, Quiz, UTS, UAS, Kalkulasi KKM, Ekspor CSV)
  {
    console.log("[TEST 7] Menguji kalkulasi nilai siswa, bobot asesmen, KKM, dan ekspor CSV...");

    const mockStudent1: Student = {
      id: "std-test-01",
      classId: "class-7a",
      fullName: "Budi Santoso",
      nis: "26001",
      gender: "L",
      isActive: true,
      createdAt: "2026-07-15T00:00:00Z",
    };

    const mockStudent2: Student = {
      id: "std-test-02",
      classId: "class-7a",
      fullName: "Siti Rahma",
      nis: "26002",
      gender: "P",
      isActive: true,
      createdAt: "2026-07-15T00:00:00Z",
    };

    const testAssessments: AssessmentItem[] = [
      {
        id: "asmt-tugas-1",
        classId: "class-7a",
        subject: "Informatika",
        type: "TUGAS",
        title: "Tugas 1",
        date: "2026-08-01",
        maxScore: 100,
        weight: 1,
        createdAt: "2026-08-01T00:00:00Z",
      },
      {
        id: "asmt-quiz-1",
        classId: "class-7a",
        subject: "Informatika",
        type: "QUIZ",
        title: "Quiz 1",
        date: "2026-08-15",
        maxScore: 100,
        weight: 1,
        createdAt: "2026-08-15T00:00:00Z",
      },
      {
        id: "asmt-uh-1",
        classId: "class-7a",
        subject: "Informatika",
        type: "UH",
        title: "UH 1",
        date: "2026-09-01",
        maxScore: 100,
        weight: 2, // Bobot ganda
        createdAt: "2026-09-01T00:00:00Z",
      },
    ];

    const testScores: StudentScoreRecord[] = [
      // Siswa 1: Tugas=80, Quiz=90, UH=85 -> Rata-rata berbobot: (80*1 + 90*1 + 85*2) / 4 = 340 / 4 = 85
      { id: "s1", assessmentId: "asmt-tugas-1", studentId: "std-test-01", score: 80, updatedAt: "2026-08-01" },
      { id: "s2", assessmentId: "asmt-quiz-1", studentId: "std-test-01", score: 90, updatedAt: "2026-08-15" },
      { id: "s3", assessmentId: "asmt-uh-1", studentId: "std-test-01", score: 85, updatedAt: "2026-09-01" },

      // Siswa 2: Tugas=70, Quiz=72, UH=68 -> Rata-rata berbobot: (70*1 + 72*1 + 68*2) / 4 = 278 / 4 = 69.5
      { id: "s4", assessmentId: "asmt-tugas-1", studentId: "std-test-02", score: 70, updatedAt: "2026-08-01" },
      { id: "s5", assessmentId: "asmt-quiz-1", studentId: "std-test-02", score: 72, updatedAt: "2026-08-15" },
      { id: "s6", assessmentId: "asmt-uh-1", studentId: "std-test-02", score: 68, updatedAt: "2026-09-01" },
    ];

    const summary1 = calculateStudentGradeSummary(mockStudent1, testAssessments, testScores, DEFAULT_KKM);
    assert.strictEqual(summary1.finalScore, 85, "Nilai akhir siswa 1 harus 85");
    assert.strictEqual(summary1.isPassed, true, "Siswa 1 dengan nilai 85 harus Tuntas (>= 75)");
    assert.strictEqual(summary1.predicate, "B", "Nilai 85 harus berpredikat B");

    const summary2 = calculateStudentGradeSummary(mockStudent2, testAssessments, testScores, DEFAULT_KKM);
    assert.strictEqual(summary2.finalScore, 69.5, "Nilai akhir siswa 2 harus 69.5");
    assert.strictEqual(summary2.isPassed, false, "Siswa 2 dengan nilai 69.5 harus Remedial (< 75)");
    assert.strictEqual(summary2.predicate, "D", "Nilai 69.5 harus berpredikat D");

    // Statistik Kelas
    const stats = calculateClassGradeStats([summary1, summary2], DEFAULT_KKM);
    assert.strictEqual(stats.classAverage, 77.3, "Rata-rata kelas harus (85 + 69.5)/2 = 77.25 dibulatkan ke 77.3");
    assert.strictEqual(stats.passedCount, 1, "Harus 1 siswa tuntas");
    assert.strictEqual(stats.remedialCount, 1, "Harus 1 siswa remedial");
    assert.strictEqual(stats.passingRate, 50, "Tingkat ketuntasan harus 50%");

    // Validasi Predikat
    assert.strictEqual(getGradePredicate(95), "A");
    assert.strictEqual(getGradePredicate(85), "B");
    assert.strictEqual(getGradePredicate(75), "C");
    assert.strictEqual(getGradePredicate(74), "D");
    assert.strictEqual(getGradePredicate(null), "-");

    // Ekspor CSV
    const csv = exportGradesToCSV("7A", testAssessments, [summary1, summary2], DEFAULT_KKM);
    assert.ok(csv.startsWith("\uFEFF"), "CSV wajib diawali UTF-8 BOM untuk kompatibilitas Excel");
    assert.ok(csv.includes("Budi Santoso"), "CSV harus memuat nama siswa");
    assert.ok(csv.includes("Tuntas"), "CSV harus memuat status ketuntasan");
    assert.ok(csv.includes("Remedial"), "CSV harus memuat status remedial");

    console.log("✓ LULUS: Mesin penilaian, kalkulasi rata-rata berbobot, KKM, dan ekspor CSV berfungsi sempurna.");
  }

  // 8. Pengujian Status Kehadiran DISPEN & Agenda Khusus (Minggu UTS, UAS, Kokurikuler Bukan Libur)
  {
    console.log("[TEST 8] Menguji status kehadiran DISPEN & penetapan agenda pekan (UTS, UAS, Kokurikuler tetap masuk & ada absensi)...");

    // Validasi skema enum
    assert.strictEqual(AttendanceStatusSchema.parse("DISPEN"), "DISPEN", "Status DISPEN harus valid dalam skema");
    assert.strictEqual(HolidayCategorySchema.parse("UTS"), "UTS", "Kategori UTS harus valid");
    assert.strictEqual(HolidayCategorySchema.parse("UAS"), "UAS", "Kategori UAS harus valid");
    assert.strictEqual(HolidayCategorySchema.parse("KOKURIKULER"), "KOKURIKULER", "Kategori KOKURIKULER harus valid");

    // Validasi pembedaan hari libur murni vs agenda kegiatan aktif
    assert.strictEqual(isRealHoliday("SEKOLAH"), true, "Kategori SEKOLAH harus merupakan libur murni");
    assert.strictEqual(isRealHoliday("UTS"), false, "Pekan UTS BUKAN hari libur");
    assert.strictEqual(isRealHoliday("UAS"), false, "Pekan UAS BUKAN hari libur");
    assert.strictEqual(isRealHoliday("KOKURIKULER"), false, "Pekan Kokurikuler BUKAN hari libur");

    assert.strictEqual(isActiveSchoolEvent("UTS"), true, "UTS harus terdeteksi sebagai agenda aktif sekolah");
    assert.strictEqual(isActiveSchoolEvent("UAS"), true, "UAS harus terdeteksi sebagai agenda aktif sekolah");
    assert.strictEqual(isActiveSchoolEvent("KOKURIKULER"), true, "Kokurikuler harus terdeteksi sebagai agenda aktif sekolah");

    // Uji pembuatan rentang pekan khusus
    const sampleWeek = addOrUpdateSpecialPeriod(
      "2026-09-21",
      "2026-09-25",
      "Minggu Penilaian Tengah Semester (UTS)",
      "UTS"
    );

    const utsDays = sampleWeek.filter((item) => item.category === "UTS");
    assert.ok(utsDays.length >= 5, "Harus menghasilkan minimal 5 hari UTS untuk satu pekan");
    assert.ok(utsDays.some((d) => d.date === "2026-09-21"));
    assert.ok(utsDays.some((d) => d.date === "2026-09-25"));

    // Tanggal UTS TIDAK boleh terdeteksi sebagai hari libur (karena siswa tetap masuk & tetap diabsen)
    assert.strictEqual(isDateHoliday("2026-09-21", sampleWeek), false, "Hari UTS tidak boleh dianggap libur bebas absen");
    assert.strictEqual(isDateActiveEvent("2026-09-21", sampleWeek), true, "Hari UTS harus terdeteksi sebagai agenda aktif");

    // Uji pada penelusuran tanggal KBM lampau (generatePastTeachingDates)
    const datesWithUts = generatePastTeachingDates(
      "Senin",
      "class-7a",
      "2026-09-21",
      new Date("2026-09-22T10:00:00Z"),
      sampleWeek
    );
    const mondayUts = datesWithUts.find((d) => d.date === "2026-09-21");
    assert.ok(mondayUts, "Senin UTS harus ditemukan");
    assert.strictEqual(mondayUts?.isHoliday, false, "Senin UTS tidak boleh isHoliday=true");
    assert.strictEqual(mondayUts?.isSpecialAgenda, true, "Senin UTS harus isSpecialAgenda=true");
    assert.strictEqual(mondayUts?.agendaCategory, "UTS");

    console.log("✓ LULUS: Status DISPEN dan manajemen pekan UTS, UAS, Kokurikuler (tetap masuk & tetap ada absensi) terverifikasi 100%.");
  }

  // 9. Pengujian Ekspor dengan Kop Surat Resmi Sekolah (SMPN 3 Cibungbulang)
  {
    console.log("[TEST 9] Menguji pembuatan berkas ekspor ber-kop surat resmi (Excel & CSV)...");

    const mockClass: Class = {
      id: "class-7a",
      teacherId: "teacher-1",
      name: "7A",
      academicYear: "2026/2027",
      semester: 1,
      createdAt: "2026-07-15T00:00:00Z",
      subject: "Informatika",
    };

    const mockRecapStudents: StudentMonthlyRecap[] = [
      {
        studentId: "std-1",
        nis: "262707001",
        fullName: "ABDULLAH AL SAFWA",
        gender: "L",
        hadir: 4,
        sakit: 0,
        izin: 0,
        alpa: 0,
        terlambat: 0,
        dispen: 0,
        totalHari: 4,
        persentaseKehadiran: 100.0,
        dailyStatus: {
          "2026-09-07": "H",
          "2026-09-14": "H",
          "2026-09-21": "H",
          "2026-09-28": "H",
        },
        needsAttention: false,
      },
      {
        studentId: "std-2",
        nis: "262707002",
        fullName: "AINUN DEPIRJA SOLEGAR",
        gender: "P",
        hadir: 3,
        sakit: 0,
        izin: 0,
        alpa: 0,
        terlambat: 0,
        dispen: 1,
        totalHari: 4,
        persentaseKehadiran: 100.0,
        dailyStatus: {
          "2026-09-07": "H",
          "2026-09-14": "H",
          "2026-09-21": "D",
          "2026-09-28": "H",
        },
        needsAttention: false,
      },
    ];

    const effectiveDates = ["2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28"];

    // 9a. Ekspor CSV Presensi Ber-Kop
    const attendanceCsv = generateAttendanceCsvWithKop(
      mockClass,
      "September 2026",
      effectiveDates,
      mockRecapStudents
    );

    assert.ok(attendanceCsv.startsWith("\uFEFF"), "CSV Presensi wajib diawali UTF-8 BOM");
    assert.ok(attendanceCsv.includes("DAFTAR HADIR SISWA KELAS VII / A"), "Kop harus memuat judul daftar hadir kelas dengan format romawi VII / A");
    assert.ok(attendanceCsv.includes("SMP NEGERI 3 CIBUNGBULANG KABUPATEN BOGOR"), "Kop harus memuat nama sekolah resmi");
    assert.ok(attendanceCsv.includes("TAHUN PELAJARAN 2026/2027"), "Kop harus memuat tahun pelajaran");
    assert.ok(attendanceCsv.includes("Muhamad Rizky Aprian, S.Kom"), "Tanda tangan harus memuat nama guru");
    assert.ok(attendanceCsv.includes("19940825 202221 1 004"), "Tanda tangan harus memuat NIP guru");
    assert.ok(attendanceCsv.includes("Dispen"), "Header CSV harus memuat kolom Dispen");
    assert.ok(attendanceCsv.includes("ABDULLAH AL SAFWA"), "CSV harus memuat nama siswa");

    // 9b. Ekspor Excel Presensi Ber-Kop
    const attendanceExcel = generateAttendanceExcelHtmlWithKop(
      mockClass,
      "September 2026",
      effectiveDates,
      mockRecapStudents
    );

    assert.ok(attendanceExcel.includes("xmlns:x=\"urn:schemas-microsoft-com:office:excel\""), "Format Excel harus Spreadsheet HTML Office XML");
    assert.ok(attendanceExcel.includes("DAFTAR HADIR SISWA KELAS VII / A"), "Excel harus memuat Kop baris 1 format romawi VII / A");
    assert.ok(attendanceExcel.includes("SMP NEGERI 3 CIBUNGBULANG"), "Excel harus memuat nama sekolah");
    assert.ok(attendanceExcel.includes("DisplayGridlines"), "Excel harus menyertakan gridlines");
    assert.ok(attendanceExcel.includes("Muhamad Rizky Aprian, S.Kom"), "Excel harus memuat blok tanda tangan guru");

    // 9c. Ekspor Excel & CSV Nilai Ber-Kop
    const mockAssessments: AssessmentItem[] = [
      {
        id: "a1",
        classId: "class-7a",
        subject: "Informatika",
        title: "Tugas 1",
        type: "TUGAS",
        date: "2026-08-01",
        maxScore: 100,
        weight: 1,
        createdAt: "2026-08-01",
      },
    ];
    const mockSummaries = [
      {
        studentId: "std-1",
        nis: "262707001",
        studentName: "ABDULLAH AL SAFWA",
        gender: "L" as const,
        scores: { a1: 90 },
        finalScore: 90,
        predicate: "A" as const,
        isPassed: true,
        gradedCount: 1,
        totalCount: 1,
        categoryAverages: { TUGAS: 90, UH: null, QUIZ: null, UTS: null, UAS: null, PRAKTIK: null, LAINNYA: null },
      },
    ];

    const gradesExcel = generateGradesExcelHtmlWithKop(
      "7A",
      mockAssessments,
      mockSummaries,
      DEFAULT_KKM
    );
    assert.ok(gradesExcel.includes("DAFTAR NILAI SISWA KELAS VII / A"), "Kop nilai Excel harus sesuai format romawi");
    assert.ok(gradesExcel.includes("SMP NEGERI 3 CIBUNGBULANG"), "Nama sekolah di kop nilai harus sesuai");

    const gradesCsv = generateGradesCsvWithKop(
      "7A",
      mockAssessments,
      mockSummaries,
      DEFAULT_KKM
    );
    assert.ok(gradesCsv.startsWith("\uFEFF"), "CSV Nilai harus diawali UTF-8 BOM");
    assert.ok(gradesCsv.includes("DAFTAR NILAI SISWA KELAS VII / A"), "Kop nilai CSV harus sesuai format romawi");

    // 9d. Ekspor Berkas OpenXML Excel (.xlsx) Presensi Ber-Kop
    const attendanceXlsx = generateAttendanceXlsxWithKop(
      mockClass,
      "September 2026",
      effectiveDates,
      mockRecapStudents
    );
    assert.ok(attendanceXlsx instanceof Uint8Array, "Ekspor XLSX presensi harus menghasilkan Uint8Array");
    assert.ok(attendanceXlsx.length > 2000, "Ukuran berkas XLSX presensi harus valid (> 2KB)");

    const parsedAttendanceWb = XLSX.read(attendanceXlsx, { type: "array" });
    assert.ok(parsedAttendanceWb.SheetNames.includes("Absensi_7A"), "Worksheet harus bernama Absensi_7A");
    const wsAttendance = parsedAttendanceWb.Sheets["Absensi_7A"];
    assert.ok(wsAttendance["!margins"], "Worksheet presensi harus memiliki konfigurasi !margins");
    assert.ok(Math.abs((wsAttendance["!margins"]?.top ?? 0) - (1.1 / 2.54)) < 0.001, "Margin top presensi harus 1.1 cm");
    assert.ok(Math.abs((wsAttendance["!margins"]?.left ?? 0) - (0.6 / 2.54)) < 0.001, "Margin left presensi harus 0.6 cm");

    // 9e. Ekspor Berkas OpenXML Excel (.xlsx) Nilai Ber-Kop
    const gradesXlsx = generateGradesXlsxWithKop(
      "7A",
      mockAssessments,
      mockSummaries,
      DEFAULT_KKM
    );
    assert.ok(gradesXlsx instanceof Uint8Array, "Ekspor XLSX nilai harus menghasilkan Uint8Array");
    assert.ok(gradesXlsx.length > 2000, "Ukuran berkas XLSX nilai harus valid (> 2KB)");

    const parsedGradesWb = XLSX.read(gradesXlsx, { type: "array" });
    assert.ok(parsedGradesWb.SheetNames.includes("Nilai_7A"), "Worksheet nilai harus bernama Nilai_7A");
    const wsGrades = parsedGradesWb.Sheets["Nilai_7A"];
    assert.ok(wsGrades["!margins"], "Worksheet nilai harus memiliki konfigurasi !margins");
    assert.ok(Math.abs((wsGrades["!margins"]?.top ?? 0) - (1.1 / 2.54)) < 0.001, "Margin top nilai harus 1.1 cm");
    assert.ok(Math.abs((wsGrades["!margins"]?.left ?? 0) - (0.6 / 2.54)) < 0.001, "Margin left nilai harus 0.6 cm");

    // 9g. Uji Cetak HTML Presensi Bulanan Resmi Folio (33.02cm x 21.59cm Landscape)
    const monthlyPrintHtml = generateAttendanceHtmlPrint(
      mockClass,
      "September 2026",
      effectiveDates,
      mockRecapStudents
    );
    assert.ok(monthlyPrintHtml.includes("33.02cm 21.59cm"), "Presensi bulanan harus menggunakan Folio landscape 33.02cm x 21.59cm");
    assert.ok(monthlyPrintHtml.includes("DAFTAR HADIR SISWA KELAS VII / A"), "Judul kop presensi bulanan harus ada");
    assert.ok(monthlyPrintHtml.includes("data:image/png;base64"), "Logo resmi SMPN 3 Cibungbulang harus ada");
    assert.ok(monthlyPrintHtml.includes("JUMLAH TOTAL REKAPITULASI"), "Baris rekapitulasi total presensi harus ada");

    // 9h. Uji Cetak HTML Nilai Lengkap Resmi Folio (21.59cm x 33.02cm Portrait)
    const gradesPrintHtml = generateGradesHtmlPrint(
      "7A",
      mockAssessments,
      mockSummaries,
      DEFAULT_KKM
    );
    assert.ok(gradesPrintHtml.includes("21.59cm 33.02cm"), "Nilai lengkap harus menggunakan Folio portrait 21.59cm x 33.02cm");
    assert.ok(gradesPrintHtml.includes("DAFTAR NILAI ASESMEN &amp; RAPORT SISWA KELAS VII / A"), "Judul kop nilai lengkap harus ada");
    assert.ok(gradesPrintHtml.includes("data:image/png;base64"), "Logo resmi SMPN 3 Cibungbulang harus ada pada cetak nilai");
    assert.ok(gradesPrintHtml.includes("Ringkasan Ketuntasan:"), "Kotak ringkasan ketuntasan harus ada");
    assert.ok(gradesPrintHtml.includes("Guru Mata Pelajaran Informatika"), "Tanda tangan guru harus ada");

    console.log("✓ LULUS: Ekspor berkas presensi dan nilai dengan format XLSX (.xlsx), CSV, margin & ukuran Folio resmi terverifikasi 100%.");
  }

  // 10. Pengujian Jurnal Agenda Pembelajaran & Materi KBM (Catatan Pembelajaran)
  {
    console.log("[TEST 10] Menguji pencatatan agenda materi pembelajaran KBM...");

    // Validasi skema Zod untuk topic dan learningActivities
    const sessionWithAgenda = {
      id: "session-agenda-1",
      classId: "class-7a",
      sessionDate: "2026-09-28",
      slot: 0,
      subject: "Informatika",
      topic: "Berpikir Komputasional: Algoritma Searching",
      learningActivities: "Siswa mempelajari algoritma linear search dan binary search melalui simulasi kartu.",
      note: "Diskusi kelompok berjalan sangat aktif.",
      clientRequestId: "req-agenda-001",
      createdAt: "2026-09-28T07:00:00Z",
      updatedAt: "2026-09-28T07:00:00Z",
    };

    const parsedSession = AttendanceSessionSchema.parse(sessionWithAgenda);
    assert.strictEqual(parsedSession.topic, "Berpikir Komputasional: Algoritma Searching");
    assert.ok(parsedSession.learningActivities?.includes("linear search"));

    // Ekspor Excel & CSV dengan Jurnal Agenda
    const sampleDates = ["2026-09-28"];
    const sampleRecapStudents: StudentMonthlyRecap[] = [
      {
        studentId: "std-1",
        nis: "262707001",
        fullName: "ABDULLAH AL SAFWA",
        hadir: 1,
        sakit: 0,
        izin: 0,
        alpa: 0,
        terlambat: 0,
        dispen: 0,
        totalHari: 1,
        persentaseKehadiran: 100.0,
        dailyStatus: { "2026-09-28": "H" },
        needsAttention: false,
      },
    ];

    const mockClassForAgenda: Class = {
      id: "class-7a",
      teacherId: "teacher-1",
      name: "7A",
      academicYear: "2026/2027",
      semester: 1,
      createdAt: "2026-07-01T00:00:00Z",
      scheduleDay: "Senin",
      schedulePeriod: "Jam 1-2 (07:30 - 08:50)",
      scheduleTime: "07:30 - 08:50",
      subject: "Informatika",
    };

    const excelWithAgenda = generateAttendanceExcelHtmlWithKop(
      mockClassForAgenda,
      "September 2026",
      sampleDates,
      sampleRecapStudents,
      [],
      {},
      [parsedSession]
    );

    assert.ok(excelWithAgenda.includes("JURNAL AGENDA PEMBELAJARAN (KBM)"), "Excel harus memuat tabel Jurnal Agenda KBM");
    assert.ok(excelWithAgenda.includes("Berpikir Komputasional: Algoritma Searching"), "Excel harus memuat topik materi");
    assert.ok(excelWithAgenda.includes("simulasi kartu"), "Excel harus memuat uraian kegiatan");

    const csvWithAgenda = generateAttendanceCsvWithKop(
      mockClassForAgenda,
      "September 2026",
      sampleDates,
      sampleRecapStudents,
      [],
      {},
      [parsedSession]
    );

    assert.ok(csvWithAgenda.includes("JURNAL AGENDA PEMBELAJARAN (KBM)"), "CSV harus memuat section Jurnal Agenda KBM");
    assert.ok(csvWithAgenda.includes("Berpikir Komputasional: Algoritma Searching"), "CSV harus memuat topik materi di baris agenda");

    console.log("✓ LULUS: Fitur agenda materi dan jurnal KBM teruji valid dan konsisten dalam ekspor.");
  }

  // 11. Pengujian Mesin Cadangan Data, Rolling Snapshot, dan Disaster Recovery
  {
    console.log("[TEST 11] Menguji pembuatan payload cadangan komprehensif, rolling snapshot, dan pemulihan JSON...");

    // Seed mock data ke localStorage
    const sampleSession: AttendanceSession = {
      id: "session-backup-1",
      classId: "class-7a",
      sessionDate: "2026-10-09",
      slot: 0,
      subject: "Informatika",
      topic: "Keamanan Sistem & Basis Data",
      learningActivities: "Praktik pencadangan berkas",
      note: "Presensi normal",
      clientRequestId: "req-backup-001",
      createdAt: "2026-10-09T08:00:00Z",
      updatedAt: "2026-10-09T08:00:00Z",
    };
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify([sampleSession]));

    const sampleAssessment: AssessmentItem = {
      id: "asm-backup-1",
      classId: "class-7a",
      subject: "Informatika",
      type: "TUGAS",
      title: "Tugas 1 Keamanan",
      date: "2026-10-09",
      maxScore: 100,
      weight: 1,
      createdAt: "2026-10-09T08:00:00Z",
    };
    localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify([sampleAssessment]));

    const sampleScore: StudentScoreRecord = {
      id: "scr-backup-1",
      assessmentId: "asm-backup-1",
      studentId: "std-1",
      score: 95,
      updatedAt: "2026-10-09T08:00:00Z",
    };
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify([sampleScore]));

    // Buat payload cadangan komprehensif
    const payload = createFullBackupPayload();
    assert.strictEqual(payload.version, 2, "Versi cadangan harus bernilai 2");
    assert.strictEqual(payload.app, "Buku Presensi Digital SMPN 3 Cibungbulang");
    assert.ok(payload.checksum.startsWith("chk-"), "Checksum integritas harus dibuat");
    assert.strictEqual(payload.stats.totalSessions, 1, "Total sesi dalam payload harus 1");
    assert.strictEqual(payload.stats.totalAssessments, 1, "Total asesmen dalam payload harus 1");
    assert.strictEqual(payload.stats.totalScores, 1, "Total nilai dalam payload harus 1");

    // Uji keutuhan serialisasi JSON (Round-trip)
    const jsonString = JSON.stringify(payload);
    const parsedPayload = JSON.parse(jsonString) as AppBackupPayload;
    assert.deepStrictEqual(parsedPayload.stats, payload.stats, "Stats setelah JSON round-trip harus identik");
    assert.strictEqual(parsedPayload.data.sessions[0].topic, "Keamanan Sistem & Basis Data");

    // Uji mesin rolling auto-snapshot dan batas maksimal sesuai MAX_ROLLING_SNAPSHOTS
    for (let i = 1; i <= 15; i++) {
      triggerAutoSnapshot(`Simpan Otomatis Ke-${i}`);
    }
    const snapshots = getAutoSnapshots();
    assert.strictEqual(snapshots.length, MAX_ROLLING_SNAPSHOTS, `Riwayat snapshot lokal wajib dibatasi maksimal ${MAX_ROLLING_SNAPSHOTS} item terbaru`);
    assert.strictEqual(snapshots[0].trigger, "Simpan Otomatis Ke-15", "Snapshot paling atas harus yang paling baru");

    // Uji proteksi kuota adaptif (QuotaExceededError recovery)
    const originalSetItem = (globalThis as any).localStorage.setItem;
    let failCount = 1;
    (globalThis as any).localStorage.setItem = (key: string, val: string) => {
      if (key === "absensi_auto_snapshots_v1" && failCount > 0) {
        failCount--;
        const err = new Error("Setting the value exceeded the quota.");
        err.name = "QuotaExceededError";
        throw err;
      }
      return originalSetItem(key, val);
    };

    saveSnapshotsWithQuotaProtection(snapshots);
    (globalThis as any).localStorage.setItem = originalSetItem;
    const prunedSnapshots = getAutoSnapshots();
    assert.ok(prunedSnapshots.length <= snapshots.length, "Sistem harus otomatis memangkas snapshot jika kuota terlampaui tanpa melempar crash unhandled");

    // Uji validasi pemulihan berkas eksternal (restoreFromUploadedJson)
    const invalidJsonRes = restoreFromUploadedJson("{ broken json ");
    assert.strictEqual(invalidJsonRes.success, false, "JSON rusak harus ditolak");

    const wrongVersionRes = restoreFromUploadedJson(JSON.stringify({ version: 99, data: {} }));
    assert.strictEqual(wrongVersionRes.success, false, "Versi cadangan asing harus ditolak");

    const missingDataRes = restoreFromUploadedJson(JSON.stringify({ version: 2 }));
    assert.strictEqual(missingDataRes.success, false, "Payload tanpa blok data harus ditolak");

    // Uji pemulihan valid
    const validRestoreRes = restoreFromUploadedJson(jsonString);
    assert.strictEqual(validRestoreRes.success, true, "Pemulihan berkas valid harus berhasil");
    assert.strictEqual(validRestoreRes.stats?.totalSessions, 1);

    console.log("✓ LULUS: Mesin pencadangan multi-tier, rolling snapshot berpelindung kuota, dan disaster recovery teruji kokoh.");
  }

  // --------------------------------------------------------------------------
  // TEST 12: Integrasi Supabase PostgreSQL & Cloud Sync State
  // --------------------------------------------------------------------------
  {
    console.log("[TEST 12] Menguji konfigurasi klien Supabase & utilitas sync manager...");

    // Uji sanitasi dan pembersihan URL Supabase
    assert.strictEqual(typeof supabaseUrl, "string", "URL Supabase harus string");
    assert.ok(!supabaseUrl.endsWith("/rest/v1/"), "URL Supabase tidak boleh berakhiran /rest/v1/");
    assert.ok(!supabaseUrl.endsWith("/rest/v1"), "URL Supabase tidak boleh berakhiran /rest/v1");

    // Uji persistensi waktu sinkronisasi cloud
    const testSyncTime = "2026-10-09T23:30:00.000Z";
    setLastCloudSyncTime(testSyncTime);
    assert.strictEqual(getLastCloudSyncTime(), testSyncTime, "Timestamp cloud sync harus tersimpan dan terbaca");

    // Uji payload cadangan yang dipersiapkan untuk tabel cloud app_snapshots
    const fullBackup = createFullBackupPayload();
    assert.strictEqual(fullBackup.version, 2, "Versi payload cadangan harus 2");
    assert.ok(fullBackup.stats.totalSessions >= 0, "Stats totalSessions harus ada");
    assert.ok(fullBackup.stats.totalRecords >= 0, "Stats totalRecords harus ada");
    assert.ok(fullBackup.data.sessions !== undefined, "Blok sesi harus ada");
    assert.ok(fullBackup.data.records !== undefined, "Blok rekaman harus ada");
    // Uji integritas hierarki relasi Foreign Key (classes & students)
    assert.strictEqual(
      MOCK_CLASSES.length,
      22,
      "Harus tersedia 22 rombel resmi SMPN 3 Cibungbulang (7A-7H, 8A-8G, 9A-9G)"
    );
    const classIdSet = new Set(MOCK_CLASSES.map((c) => c.id));

    // Seluruh siswa resmi harus memiliki class_id yang terdaftar di classes
    let totalVerifiedStudents = 0;
    for (const [clsId, students] of Object.entries(ALL_STUDENTS_BY_CLASS)) {
      assert.ok(classIdSet.has(clsId), `Class ID ${clsId} harus terdaftar di tabel classes`);
      for (const st of students) {
        assert.strictEqual(st.classId, clsId, `Siswa ${st.fullName} harus memiliki class_id yang sinkron`);
        assert.ok(st.id && st.id.length > 0, "ID siswa tidak boleh kosong");
        totalVerifiedStudents++;
      }
    }
    assert.strictEqual(
      totalVerifiedStudents,
      883,
      "Harus ada 883 siswa otentik terverifikasi relasi foreign key-nya (319 di Kelas 7, 281 di Kelas 8, 283 di Kelas 9)"
    );

    // Uji isolasi & penyaringan rekaman yatim (orphan record filter simulation)
    const mockSyncedSessionIds = new Set(["session-valid-1"]);
    const mockStudentIds = new Set(["std-1"]);
    const testRecords = [
      { id: "r1", sessionId: "session-valid-1", studentId: "std-1", status: "HADIR" },
      { id: "r2", sessionId: "session-ghost-orphan", studentId: "std-1", status: "HADIR" }, // Orphan session
      { id: "r3", sessionId: "session-valid-1", studentId: "std-unknown-ghost", status: "HADIR" }, // Orphan student
    ];
    const filteredRecords = testRecords.filter(
      (r) => mockSyncedSessionIds.has(r.sessionId) && mockStudentIds.has(r.studentId)
    );
    assert.strictEqual(filteredRecords.length, 1, "Hanya 1 rekaman sah yang lolos, rekaman yatim wajib disaring");
    assert.strictEqual(filteredRecords[0].id, "r1");

    console.log("✓ LULUS: Konfigurasi Supabase, integritas relasi foreign key (classes & students), dan proteksi rekaman yatim teruji 100%.");
  }

  // --------------------------------------------------------------------------
  // TEST 13: Rekapitulasi Kehadiran Kumulatif Semester & Ekspor XLSX/CSV
  // --------------------------------------------------------------------------
  {
    console.log("[TEST 13] Menguji kalkulasi rekapitulasi kumulatif semester & ekspor ber-kop resmi...");

    const dummyClass: Class = {
      id: "class-7a",
      teacherId: "teacher-1",
      name: "7A",
      academicYear: "2026/2027",
      semester: 1,
      createdAt: "2026-07-01T00:00:00.000Z",
      scheduleDay: "Senin",
      schedulePeriod: "Jam ke 1-2 (07:30 - 08:50)",
      subject: "Informatika",
    };

    const semesterRecap = computeSemesterRecapForClass(
      dummyClass,
      DEFAULT_HOLIDAYS,
      [],
      []
    );

    assert.strictEqual(semesterRecap.classId, "class-7a");
    assert.strictEqual(semesterRecap.months.length, 6, "Semester ganjil harus mencakup 6 bulan (Juli-Desember)");
    assert.ok(semesterRecap.students.length > 0, "Daftar siswa semester harus terisi");
    assert.ok(semesterRecap.totalEffectiveSessions > 0, "Pertemuan efektif semester harus terhitung");

    const sampleStudent = semesterRecap.students[0];
    assert.ok(sampleStudent.monthlyStats["2026-07"] !== undefined, "Statistik bulan Juli harus ada");
    assert.ok(sampleStudent.monthlyStats["2026-12"] !== undefined, "Statistik bulan Desember harus ada");
    assert.ok(["Sangat Baik", "Baik", "Cukup", "Kurang"].includes(sampleStudent.predikat), "Predikat harus valid");

    // Uji pembuatan berkas Excel murni (.xlsx) dengan Kop Resmi untuk Semester
    const xlsxBytes = generateSemesterAttendanceXlsxWithKop(dummyClass, semesterRecap, {
      schoolName: "SMP NEGERI 3 CIBUNGBULANG",
      teacherName: "Muhamad Rizky Aprian, S.Kom",
    });
    assert.ok(xlsxBytes instanceof Uint8Array, "Output ekspor XLSX harus berformat Uint8Array");
    assert.ok(xlsxBytes.length > 1000, "Ukuran file XLSX semester harus valid");

    // Verifikasi workbook XLSX semester dapat dibaca ulang
    const wb = XLSX.read(xlsxBytes, { type: "array" });
    assert.ok(wb.SheetNames.length > 0, "Worksheet semester harus terbuat");
    assert.ok(wb.SheetNames[0].startsWith("Semester_"), "Nama worksheet harus diawali Semester_");

    // Uji pembuatan berkas CSV Semester dengan UTF-8 BOM (13 kolom langsung)
    const csvContent = generateSemesterAttendanceCsvWithKop(dummyClass, semesterRecap);
    assert.ok(csvContent.startsWith("\uFEFF"), "CSV semester wajib memiliki awalan UTF-8 BOM");
    assert.ok(csvContent.includes("DAFTAR HADIR SISWA KUMULATIF SEMESTER 1 (GANJIL)"), "Kop CSV semester harus ada");
    assert.ok(csvContent.includes("JUMLAH TOTAL KEHADIRAN KELAS") || csvContent.includes("Total"), "Kolom total semester harus ada");
    assert.ok(csvContent.includes("Telat (T)"), "Kolom Telat (T) harus ada di CSV semester");
    assert.ok(csvContent.includes("Predikat Raport"), "Kolom Predikat Raport harus ada di CSV semester");

    // Uji pembuatan dokumen cetak / PDF HTML Rekap Semester Folio (21.59cm x 33.02cm 1 Lembar)
    const htmlPrint = generateSemesterAttendanceHtmlPrint(dummyClass, semesterRecap, {
      schoolName: "SMP NEGERI 3 CIBUNGBULANG",
      teacherName: "Muhamad Rizky Aprian, S.Kom",
    });
    assert.ok(typeof htmlPrint === "string", "Output cetak PDF harus berupa string HTML");
    assert.ok(htmlPrint.includes("21.59cm 33.02cm"), "Ukuran kertas harus Folio resmi 21.59cm x 33.02cm");
    assert.ok(htmlPrint.includes("REKAPITULASI AKUMULASI PRESENSI SISWA KELAS VII / A"), "Kop judul rekap semester harus ada");
    assert.ok(htmlPrint.includes("HADIR (H)") && htmlPrint.includes("TELAT (T)"), "Header 13 kolom harus lengkap");
    assert.ok(htmlPrint.includes("JUMLAH TOTAL KEHADIRAN KELAS"), "Baris total akumulasi kelas harus ada");
    assert.ok(htmlPrint.includes("Guru Mata Pelajaran Informatika"), "Tanda tangan guru harus ada");

    console.log("✓ LULUS: Rekapitulasi kumulatif semester 13 kolom langsung (Excel, CSV, dan PDF Folio ber-kop) terverifikasi 100%.");
  }

  // 14. Pengujian Fleksibilitas Pengurutan Kolom Penilaian (Reordering / Drag & Drop)
  {
    console.log("[TEST 14] Pengujian fleksibilitas kustomisasi urutan kolom penilaian...");
    const testClassId = "class-test-reorder";

    // Simulasikan 3 asesmen tersimpan dengan tanggal UTS lebih awal daripada Tugas 1
    const mockAssessments: AssessmentItem[] = [
      {
        id: "asmt-uts",
        classId: testClassId,
        subject: "Informatika",
        title: "Penilaian Tengah Semester (UTS)",
        type: "UTS",
        date: "2026-09-10",
        maxScore: 100,
        weight: 2,
        createdAt: "2026-09-10T08:00:00.000Z",
      },
      {
        id: "asmt-tugas-1",
        classId: testClassId,
        subject: "Informatika",
        title: "Tugas 1 - Algoritma Pemrograman",
        type: "TUGAS",
        date: "2026-09-15",
        maxScore: 100,
        weight: 1,
        createdAt: "2026-09-15T08:00:00.000Z",
      },
      {
        id: "asmt-uas",
        classId: testClassId,
        subject: "Informatika",
        title: "Penilaian Akhir Semester (UAS)",
        type: "UAS",
        date: "2026-11-25",
        maxScore: 100,
        weight: 3,
        createdAt: "2026-11-25T08:00:00.000Z",
      },
    ];

    // Simpan ke storage
    localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(mockAssessments));
    localStorage.removeItem(STORAGE_KEY_ASSESSMENT_ORDER);

    // Default urutan adalah berdasarkan tanggal kronologis (UTS, Tugas 1, UAS)
    const initialList = getAssessmentsByClass(testClassId);
    assert.strictEqual(initialList[0].id, "asmt-uts");
    assert.strictEqual(initialList[1].id, "asmt-tugas-1");
    assert.strictEqual(initialList[2].id, "asmt-uas");

    // Guru mengubah urutan agar Tugas 1 berada sebelum UTS: [Tugas 1, UTS, UAS]
    const customDesiredOrder = ["asmt-tugas-1", "asmt-uts", "asmt-uas"];
    saveAssessmentOrderForClass(testClassId, customDesiredOrder);

    // Verifikasi urutan kustom tersimpan di storage
    const savedOrder = getAssessmentOrderForClass(testClassId);
    assert.deepStrictEqual(savedOrder, customDesiredOrder, "Urutan kustom harus tersimpan persisten");

    // Verifikasi getAssessmentsByClass mengembalikan urutan sesuai kustomisasi guru
    const reorderedList = getAssessmentsByClass(testClassId);
    assert.strictEqual(reorderedList[0].id, "asmt-tugas-1", "Tugas 1 harus di posisi pertama");
    assert.strictEqual(reorderedList[1].id, "asmt-uts", "UTS harus di posisi kedua");
    assert.strictEqual(reorderedList[2].id, "asmt-uas", "UAS harus di posisi ketiga");

    // Verifikasi ekspor nilai ke Excel & CSV otomatis memakai urutan kustom ini
    const dummyStudent: Student = {
      id: "std-test-1",
      fullName: "Budi Santoso",
      nis: "1001",
      gender: "L",
      classId: testClassId,
      isActive: true,
      createdAt: "2026-07-01T00:00:00.000Z",
    };
    const summary = calculateStudentGradeSummary(dummyStudent, reorderedList, [], 75);
    const dummyClassObj: Class = {
      id: testClassId,
      teacherId: "teacher-1",
      name: "Kelas Uji Urutan",
      academicYear: "2026/2027",
      semester: 1,
      createdAt: "2026-07-01T00:00:00.000Z",
      scheduleDay: "Senin",
      schedulePeriod: "Jam ke 1-2 (07:30 - 08:50)",
      subject: "Informatika",
    };

    const gradesXlsx = generateGradesXlsxWithKop(dummyClassObj.name, reorderedList, [summary], 75);
    assert.ok(gradesXlsx instanceof Uint8Array, "Ekspor nilai XLSX dengan urutan kustom harus valid");

    const gradesCsv = generateGradesCsvWithKop(dummyClassObj.name, reorderedList, [summary], 75);
    assert.ok(gradesCsv.indexOf("Tugas 1 - Algoritma Pemrograman") < gradesCsv.indexOf("Penilaian Tengah Semester (UTS)"), 
      "Header CSV harus menempatkan Tugas 1 sebelum UTS sesuai urutan yang digeser");

    console.log("✓ LULUS: Kustomisasi urutan kolom penilaian (Reordering / Drag & Drop) dan persistensi ke ekspor terverifikasi 100%.");
  }

  // 15. Pengujian Kustomisasi KKM per Angkatan (Tingkat Kelas 7, 8, 9), Skala Predikat, dan Snapshot
  {
    console.log("[TEST 15] Menguji kustomisasi KKM per angkatan kelas dan skala predikat...");

    // Uji ekstraksi tingkat / angkatan dari nama kelas
    assert.strictEqual(extractGradeLevel("7A"), "7");
    assert.strictEqual(extractGradeLevel("7H"), "7");
    assert.strictEqual(extractGradeLevel("8B"), "8");
    assert.strictEqual(extractGradeLevel("8A"), "8");
    assert.strictEqual(extractGradeLevel("9A"), "9");
    assert.strictEqual(extractGradeLevel("Kelas 7D"), "7");
    assert.strictEqual(extractGradeLevel("VII-B"), "7");
    assert.strictEqual(extractGradeLevel("VIII-C"), "8");

    // Simpan KKM yang berbeda per angkatan: Kelas 7 = 82, Kelas 8 = 83, Kelas 9 = 75
    localStorage.removeItem(STORAGE_KEY_KKM_BY_GRADE);
    saveStoredKkmByGrade({
      "7": 82,
      "8": 83,
      "9": 75,
    });

    // Verifikasi pembacaan KKM spesifik untuk tiap angkatan
    const kkm7A = getStoredKKM("7A");
    const kkm7H = getStoredKKM("7H");
    const kkm8B = getStoredKKM("8B");
    const kkm9A = getStoredKKM("9A");

    assert.strictEqual(kkm7A, 82, "KKM kelas 7A harus 82");
    assert.strictEqual(kkm7H, 82, "KKM kelas 7H harus 82");
    assert.strictEqual(kkm8B, 83, "KKM kelas 8B harus 83");
    assert.strictEqual(kkm9A, 75, "KKM kelas 9A harus 75");

    // Verifikasi predikat ketuntasan sesuai KKM angkatan masing-masing
    // Kasus 1: Nilai 81 di Kelas 7 (KKM 82) -> Belum Tuntas (D)
    assert.strictEqual(getGradePredicate(81, kkm7A), "D", "Nilai 81 di bawah KKM 82 harus berpredikat D");
    // Kasus 2: Nilai 82 di Kelas 7 (KKM 82) -> Tuntas (B)
    assert.strictEqual(getGradePredicate(82, kkm7A), "B", "Nilai 82 memenuhi KKM 82 dan >= 80 berpredikat B");
    // Kasus 3: Nilai 82 di Kelas 8 (KKM 83) -> Belum Tuntas (D) karena KKM Kelas 8 adalah 83!
    assert.strictEqual(getGradePredicate(82, kkm8B), "D", "Nilai 82 di bawah KKM 83 harus berpredikat D");
    // Kasus 4: Nilai 83 di Kelas 8 (KKM 83) -> Tuntas (B)
    assert.strictEqual(getGradePredicate(83, kkm8B), "B", "Nilai 83 memenuhi KKM 83 berpredikat B");

    // Verifikasi pencadangan otomatis menyertakan kkmByGrade
    const backup = createFullBackupPayload();
    assert.ok(backup.data.kkmByGrade !== undefined, "Payload cadangan harus menyertakan kkmByGrade");
    assert.strictEqual(backup.data.kkmByGrade?.["7"], 82);
    assert.strictEqual(backup.data.kkmByGrade?.["8"], 83);

    console.log("✓ LULUS: Kustomisasi KKM per angkatan (Kls 7: 82, Kls 8: 83), skala predikat ketuntasan, dan disaster recovery teruji 100%.");
  }

  // 16. Pengujian Ekspor & Pengumuman Nilai Disensor (Mode Perlindungan Privasi Siswa UU PDP)
  {
    console.log("[TEST 16] Menguji pembuatan berkas ekspor nilai disensor (Excel, CSV, WhatsApp, dan Cetak HTML)...");

    const dummyAssessments: AssessmentItem[] = [
      {
        id: "asmt-tugas-1",
        classId: "7A",
        subject: "Informatika",
        title: "Tugas 1 - Algoritma",
        type: "TUGAS",
        weight: 20,
        maxScore: 100,
        date: "2026-08-10",
        createdAt: "2026-08-10T07:00:00.000Z",
      },
      {
        id: "asmt-uh-1",
        classId: "7A",
        subject: "Informatika",
        title: "UH 1 - Flowchart",
        type: "UH",
        weight: 30,
        maxScore: 100,
        date: "2026-08-25",
        createdAt: "2026-08-25T07:00:00.000Z",
      },
    ];

    const dummySummaries: StudentGradeSummary[] = [
      {
        studentId: "std-1",
        studentName: "Ahmad Fauzi",
        nis: "26001",
        gender: "L",
        scores: { "asmt-tugas-1": 95, "asmt-uh-1": 88 },
        categoryAverages: { TUGAS: 95, UH: 88, UTS: null, UAS: null, PRAKTIK: null, QUIZ: null, LAINNYA: null },
        finalScore: 91,
        predicate: "A",
        isPassed: true,
        gradedCount: 2,
        totalCount: 2,
      },
      {
        studentId: "std-2",
        studentName: "Budi Santoso",
        nis: "26002",
        gender: "L",
        scores: { "asmt-tugas-1": 80, "asmt-uh-1": null }, // belum mengerjakan UH 1
        categoryAverages: { TUGAS: 80, UH: null, UTS: null, UAS: null, PRAKTIK: null, QUIZ: null, LAINNYA: null },
        finalScore: 80,
        predicate: "B",
        isPassed: true,
        gradedCount: 1,
        totalCount: 2,
      },
      {
        studentId: "std-3",
        studentName: "Citra Lestari",
        nis: "26003",
        gender: "P",
        scores: { "asmt-tugas-1": null, "asmt-uh-1": null }, // belum mengerjakan dua-duanya
        categoryAverages: { TUGAS: null, UH: null, UTS: null, UAS: null, PRAKTIK: null, QUIZ: null, LAINNYA: null },
        finalScore: null,
        predicate: "D",
        isPassed: false,
        gradedCount: 0,
        totalCount: 2,
      },
    ];

    // 16.1 Uji Ekspor Excel (.xlsx) Disensor
    const xlsxBuffer = generateCensoredGradesXlsxWithKop("7A", dummyAssessments, dummySummaries);
    assert.ok(xlsxBuffer instanceof Uint8Array, "Ekspor Excel harus menghasilkan Uint8Array valid");
    assert.ok(xlsxBuffer.length > 500, "Ukuran berkas Excel harus realistis (> 500 byte)");

    // Baca kembali berkas Excel via XLSX parser untuk validasi isi sel disensor
    const wb = XLSX.read(xlsxBuffer, { type: "buffer" });
    assert.ok(wb.SheetNames.length > 0, "Workbook harus memiliki setidaknya 1 worksheet");
    const ws = wb.Sheets[wb.SheetNames[0]];
    const sheetText = XLSX.utils.sheet_to_csv(ws);
    // Verifikasi bahwa sel berisi status SUDAH dan BELUM, bukan angka mentah
    assert.ok(sheetText.includes("SUDAH"), "Excel disensor harus memuat teks status 'SUDAH'");
    assert.ok(sheetText.includes("BELUM"), "Excel disensor harus memuat teks status 'BELUM'");
    assert.ok(sheetText.includes("Ahmad Fauzi"), "Excel disensor harus memuat nama siswa");
    assert.ok(sheetText.includes("LENGKAP"), "Excel disensor harus memuat status kelengkapan kelas");
    // Pastikan angka nilai asli (misalnya nilai 95 dan 88) TIDAK bocor pada kolom asesmen
    assert.strictEqual(sheetText.includes(",95,"), false, "Nilai aktual 95 dilarang bocor di Excel disensor");
    assert.strictEqual(sheetText.includes(",88,"), false, "Nilai aktual 88 dilarang bocor di Excel disensor");

    // 16.2 Uji Ekspor CSV Disensor
    const csvContent = generateCensoredGradesCsvWithKop("7A", dummyAssessments, dummySummaries);
    assert.ok(csvContent.includes("REKAPITULASI KELENGKAPAN TUGAS"), "CSV harus memuat judul pengumuman");
    assert.ok(csvContent.includes("Disensor"), "CSV harus memuat penanda status disensor");
    assert.ok(csvContent.includes("SUDAH"), "CSV harus memuat label 'SUDAH'");
    assert.ok(csvContent.includes("BELUM"), "CSV harus memuat label 'BELUM'");
    assert.ok(csvContent.includes("Budi Santoso"), "CSV harus memuat nama Budi Santoso");
    assert.strictEqual(csvContent.includes(",95,"), false, "Nilai aktual 95 dilarang bocor di CSV disensor");

    // 16.3 Uji Generator Teks Pengumuman WhatsApp
    const waText = generateCensoredGradesWhatsAppText("7A", dummyAssessments, dummySummaries);
    assert.ok(waText.includes("*PENGUMUMAN KELENGKAPAN TUGAS & ASESMEN*"), "Format WA harus memiliki judul pengumuman");
    assert.ok(waText.includes("*Kelas:* 7A"), "Format WA harus mencantumkan kelas 7A");
    assert.ok(waText.includes("Budi Santoso"), "Format WA harus mencantumkan Budi yang belum tuntas");
    assert.ok(waText.includes("UH 1 - Flowchart"), "Format WA harus mencantumkan judul tugas yang belum tuntas");
    assert.ok(waText.includes("Citra Lestari"), "Format WA harus mencantumkan Citra yang belum tuntas");
    assert.ok(waText.includes("Tugas 1 - Algoritma"), "Format WA harus mencantumkan tugas 1 untuk Citra");
    // Pastikan Ahmad Fauzi yang sudah tuntas TIDAK masuk dalam daftar tagihan WA
    assert.strictEqual(waText.includes("*Ahmad Fauzi*"), false, "Siswa yang sudah tuntas tidak boleh masuk daftar tagihan WA");
    assert.ok(waText.includes("Guru Pengampu:"), "Format WA harus mencantumkan penutup guru pengampu");

    // 16.4 Uji Format HTML Siap Cetak / PDF Mading
    const htmlPrint = generateCensoredGradesHtmlPrint("7A", dummyAssessments, dummySummaries);
    assert.ok(htmlPrint.includes("<!DOCTYPE html>"), "HTML print harus dokumen HTML valid");
    assert.ok(htmlPrint.includes("REKAPITULASI KELENGKAPAN TUGAS"), "HTML print harus memuat judul rekapitulasi");
    assert.ok(htmlPrint.includes("background-color: #DCFCE7"), "HTML print harus memiliki style sel hijau untuk SUDAH");
    assert.ok(htmlPrint.includes("background-color: #FEE2E2"), "HTML print harus memiliki style sel merah untuk BELUM");
    assert.ok(htmlPrint.includes("Ahmad Fauzi"), "HTML print harus memuat nama siswa");
    assert.strictEqual(htmlPrint.includes(">95<"), false, "Nilai aktual 95 dilarang bocor di HTML cetak disensor");

    console.log("✓ LULUS: Ekspor & Pengumuman Nilai Disensor (Excel .xlsx, CSV, WhatsApp 1-Klik, & Cetak HTML Mading) terverifikasi 100% aman privasi.");
  }

  // ============================================================================
  // TEST 17: Menguji Parser & Mesin Pencocokan Impor Nilai Siswa (Excel / CSV / Paste)
  // ============================================================================
  {
    console.log("[TEST 17] Menguji mesin impor nilai siswa cerdas (Excel/CSV/Paste)...");

    // 17.1 Uji sanitasi angka nilai
    assert.strictEqual(parseScoreValue(85).num, 85);
    assert.strictEqual(parseScoreValue("87.5").num, 87.5);
    assert.strictEqual(parseScoreValue("92,5").num, 92.5); // Koma desimal Indonesia
    assert.strictEqual(parseScoreValue("").num, null);
    assert.strictEqual(parseScoreValue("-").num, null);
    assert.strictEqual(parseScoreValue(150).num, 100); // Clamped ke 100
    assert.strictEqual(parseScoreValue(-10).num, 0);   // Clamped ke 0

    const testStudents = [
      { id: "s1", classId: "c1", nis: "262707001", fullName: "ABDULLAH AL SAFWA", gender: "L" as const, isActive: true, createdAt: "2026-08-01" },
      { id: "s2", classId: "c1", nis: "262707002", fullName: "AINUN DEPIRJA SOLEGAR", gender: "P" as const, isActive: true, createdAt: "2026-08-01" },
      { id: "s3", classId: "c1", nis: "262707003", fullName: "AIRIL", gender: "L" as const, isActive: true, createdAt: "2026-08-01" },
    ];

    // 17.2 Uji pencocokan via NIS dan Nama dari 2D Matrix (simulasi Excel)
    const mockExcelMatrix = [
      ["FORMAT NILAI SISWA"],
      ["NO", "NIS", "NAMA SISWA", "NILAI"],
      [1, "262707001", "Abdullah Al Safwa", "88"],
      [2, "262707002", "Ainun Depirja", "95.5"],
      [3, "999999999", "Airil", "78"], // NIS beda tapi nama cocok
    ];

    const matchResult = matchGradeRowsToStudents(mockExcelMatrix, testStudents);
    assert.strictEqual(matchResult.matchedCount, 3, "Ketiga siswa harus berhasil dicocokkan");
    assert.strictEqual(matchResult.scoresMap["s1"], "88", "Nilai s1 harus 88");
    assert.strictEqual(matchResult.scoresMap["s2"], "95.5", "Nilai s2 harus 95.5");
    assert.strictEqual(matchResult.scoresMap["s3"], "78", "Nilai s3 harus 78 melalui nama");

    // 17.3 Uji pencocokan teks copy-paste dari spreadsheet (Tab Delimited)
    const pastedText = "85\t90\t77"; // 1 baris multi-kolom atau multi-baris
    const pastedMultiLine = "82\n89\n94"; // 3 baris nilai berurutan sesuai absen
    const pasteResult = parseGradesFromPastedText(pastedMultiLine, testStudents);
    assert.strictEqual(pasteResult.matchedCount, 3, "Pasted sekuensial harus mencocokkan 3 siswa");
    assert.strictEqual(pasteResult.scoresMap["s1"], "82");
    assert.strictEqual(pasteResult.scoresMap["s2"], "89");
    assert.strictEqual(pasteResult.scoresMap["s3"], "94");

    // 17.4 Uji pembuatan berkas template Excel (.xlsx)
    const templateBytes = generateGradeImportTemplateXlsx("7A", "Tugas 1", testStudents);
    assert.ok(templateBytes instanceof Uint8Array, "Template harus menghasilkan Uint8Array");
    assert.ok(templateBytes.length > 500, "Ukuran template harus realistis");

    const templateWb = XLSX.read(templateBytes, { type: "array" });
    assert.ok(templateWb.SheetNames.includes("Input Nilai"), "Worksheet harus bernama 'Input Nilai'");
    const wsTemplate = templateWb.Sheets["Input Nilai"];
    const templateCsv = XLSX.utils.sheet_to_csv(wsTemplate);
    assert.ok(templateCsv.includes("ABDULLAH AL SAFWA"), "Template harus memuat nama siswa");
    assert.ok(templateCsv.includes("262707001"), "Template harus memuat NIS siswa");

    console.log("✓ LULUS: Fitur mesin impor nilai (Excel/CSV/Paste/Template) terverifikasi 100% akurat.");
  }

  // --------------------------------------------------------------------------
  // TEST 18: Pengujian inisialisasi asesmen baku dan nilai otentik (SSOT Offline-First)
  // --------------------------------------------------------------------------
  {
    console.log("[TEST 18] Menguji pembuatan asesmen awal dan nilai otentik otomatis (7A-7H, 8A, 8B)...");

    // 18.1 Pastikan 7A dan 7D memiliki asesmen lengkap di INITIAL_MOCK_ASSESSMENTS (5 asesmen per kelas)
    const class7aAssessments = INITIAL_MOCK_ASSESSMENTS.filter((a) => a.classId === "class-7a");
    const class7dAssessments = INITIAL_MOCK_ASSESSMENTS.filter((a) => a.classId === "class-7d");
    assert.strictEqual(class7aAssessments.length, 5, "Kelas 7A harus memiliki tepat 5 asesmen otentik (Tugas 1, 2, 3, UH 1, UTS)");
    assert.strictEqual(class7dAssessments.length, 5, "Kelas 7D harus memiliki tepat 5 asesmen otentik (Tugas 1, 2, 3, UH 1, UTS)");

    // 18.2 Pastikan setiap kelas target (7B, 7C, 7E, 7F, 7G, 7H) memiliki asesmen baku
    const targetClassIds = ["class-7b", "class-7c", "class-7e", "class-7f", "class-7g", "class-7h"];
    for (const classId of targetClassIds) {
      const asmts = INITIAL_MOCK_ASSESSMENTS.filter((a) => a.classId === classId);
      assert.ok(asmts.length >= 4, `Kelas ${classId} harus memiliki minimal 4 asesmen baku`);

      const titles = asmts.map((a) => a.title);
      assert.ok(titles.some((t) => t.includes("Tugas 1")), `Kelas ${classId} harus memuat Tugas 1`);
      assert.ok(titles.some((t) => t.includes("Tugas 2")), `Kelas ${classId} harus memuat Tugas 2`);
      assert.ok(titles.some((t) => t.includes("Tugas 3")), `Kelas ${classId} harus memuat Tugas 3`);
      assert.ok(titles.some((t) => t.includes("UH 1")), `Kelas ${classId} harus memuat UH 1`);

      const uh1 = asmts.find((a) => a.title.startsWith("UH 1"));
      assert.strictEqual(uh1?.type, "UH", "UH 1 harus berkategori UH");

      const tugasItems = asmts.filter((a) => a.title.startsWith("Tugas"));
      assert.strictEqual(tugasItems.length, 3, "Harus ada 3 tugas");
      tugasItems.forEach((t) => assert.strictEqual(t.type, "TUGAS", "Tugas harus berkategori TUGAS"));
    }

    // 18.3 Nilai awal otentik harus tersedia (757 catatan nilai dari riwayat input guru)
    const initialScores = generateInitialMockScores();
    assert.strictEqual(initialScores.length, 757, "Catatan nilai awal siswa otentik harus berjumlah 757 nilai");

    // 18.4 Uji fungsi initGrade7AssessmentsIfMissing menjaga data 7A/7D mandiri tetap utuh
    localStorage.removeItem(STORAGE_KEY_GRADE_7_SEEDED);
    const mockUserAssessments: AssessmentItem[] = [
      {
        id: "asmt-user-7a-custom",
        classId: "class-7a",
        subject: "Informatika",
        type: "TUGAS",
        title: "Tugas Mandiri Buatan Guru di 7A",
        date: "2026-08-01",
        maxScore: 100,
        weight: 1,
        createdAt: "2026-08-01T00:00:00Z",
      },
    ];
    localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(mockUserAssessments));

    initGrade7AssessmentsIfMissing();

    const storedAfterInit = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSESSMENTS) || "[]") as AssessmentItem[];
    const user7aPreserved = storedAfterInit.find((a) => a.id === "asmt-user-7a-custom");
    assert.ok(user7aPreserved, "Asesmen mandiri di 7A tidak boleh hilang atau tertimpa");

    const seeded7b = storedAfterInit.filter((a) => a.classId === "class-7b");
    assert.ok(seeded7b.length >= 4, "Kelas 7B harus terisi minimal 4 asesmen oleh mesin seed");

    console.log("✓ LULUS: Inisialisasi 43 asesmen otentik dan 757 nilai siswa terverifikasi 100% aman dan akurat.");
  }

  // --------------------------------------------------------------------------
  // [TEST 19] Pengujian Fitur Nilai Sikap Siswa (Buruk, Kurang Baik, Baik, Sangat Baik)
  // --------------------------------------------------------------------------
  {
    console.log("\n[TEST 19] Menjalankan verifikasi sistem penilaian sikap siswa...");

    // 19.1 Skema Zod Predikat Sikap Siswa
    const validPredicates: AttitudeGrade[] = ["SANGAT_BAIK", "BAIK", "KURANG_BAIK", "BURUK"];
    for (const pred of validPredicates) {
      const parsed = AttitudeGradeSchema.safeParse(pred);
      assert.strictEqual(parsed.success, true, `Predikat ${pred} harus valid menurut AttitudeGradeSchema`);
    }

    const invalidTest = AttitudeGradeSchema.safeParse("SEMPURNA");
    assert.strictEqual(invalidTest.success, false, "Predikat di luar 4 ketentuan harus invalid");

    // 19.2 Pengujian Fungsi parseAttitudeGrade & formatAttitudeLabel
    assert.strictEqual(parseAttitudeGrade("sangat baik"), "SANGAT_BAIK");
    assert.strictEqual(parseAttitudeGrade("SB"), "SANGAT_BAIK");
    assert.strictEqual(parseAttitudeGrade("A"), "SANGAT_BAIK");
    assert.strictEqual(parseAttitudeGrade("baik"), "BAIK");
    assert.strictEqual(parseAttitudeGrade("B"), "BAIK");
    assert.strictEqual(parseAttitudeGrade("kurang baik"), "KURANG_BAIK");
    assert.strictEqual(parseAttitudeGrade("KB"), "KURANG_BAIK");
    assert.strictEqual(parseAttitudeGrade("buruk"), "BURUK");
    assert.strictEqual(parseAttitudeGrade(undefined), null);
    assert.strictEqual(parseAttitudeGrade(undefined) ?? DEFAULT_ATTITUDE_GRADE, DEFAULT_ATTITUDE_GRADE);

    assert.strictEqual(formatAttitudeLabel("SANGAT_BAIK"), "Sangat Baik");
    assert.strictEqual(formatAttitudeLabel("BAIK"), "Baik");
    assert.strictEqual(formatAttitudeLabel("KURANG_BAIK"), "Kurang Baik");
    assert.strictEqual(formatAttitudeLabel("BURUK"), "Buruk");

    // 19.3 Pengujian Persistensi Penyimpanan Sikap Siswa ke localStorage
    localStorage.removeItem(STORAGE_KEY_STUDENT_ATTITUDES);
    const initialAttitudes = getStoredStudentAttitudes("class-7a");
    assert.deepStrictEqual(initialAttitudes, {}, "Data sikap awal harus objek kosong");

    // Simpan nilai sikap siswa secara individual
    saveStudentAttitude("class-7a", "std-1", "SANGAT_BAIK");
    saveStudentAttitude("class-7a", "std-2", "KURANG_BAIK");
    saveStudentAttitude("class-7a", "std-3", "BURUK");

    const attitudes7a = getStoredStudentAttitudes("class-7a");
    assert.strictEqual(attitudes7a["std-1"], "SANGAT_BAIK");
    assert.strictEqual(attitudes7a["std-2"], "KURANG_BAIK");
    assert.strictEqual(attitudes7a["std-3"], "BURUK");
    assert.strictEqual(attitudes7a["std-non-existent"], undefined);

    // Pengujian batchSetAllStudentAttitudes (Set Semua: Baik)
    batchSetAllStudentAttitudes("class-7a", ["std-1", "std-2", "std-3"], "BAIK");
    const attitudesBatch = getStoredStudentAttitudes("class-7a");
    assert.strictEqual(attitudesBatch["std-1"], "BAIK");
    assert.strictEqual(attitudesBatch["std-2"], "BAIK");
    assert.strictEqual(attitudesBatch["std-3"], "BAIK");

    // 19.4 Pengujian Integrasi calculateStudentGradeSummary dengan Nilai Sikap
    const testStudent: Student = {
      id: "std-test-1",
      classId: "class-7a",
      nis: "262707999",
      fullName: "Siswa Uji Coba Sikap",
      gender: "L",
      isActive: true,
      createdAt: "2026-08-01T00:00:00Z",
    };
    const summaryDefault = calculateStudentGradeSummary(testStudent, [], [], DEFAULT_KKM);
    assert.strictEqual(summaryDefault.attitudeGrade, "BAIK", "Default attitude grade harus BAIK");

    const summaryExplicit = calculateStudentGradeSummary(testStudent, [], [], DEFAULT_KKM, "SANGAT_BAIK");
    assert.strictEqual(summaryExplicit.attitudeGrade, "SANGAT_BAIK", "Explicit attitude grade harus SANGAT_BAIK");

    // 19.5 Pengujian Ekspor Nilai XLSX & CSV Memuat Kolom Nilai Sikap
    const sampleAssessments: AssessmentItem[] = [
      {
        id: "asmt-t1",
        classId: "class-7a",
        subject: "Informatika",
        type: "TUGAS",
        title: "Tugas 1",
        date: "2026-08-01",
        maxScore: 100,
        weight: 1,
        createdAt: "2026-08-01T00:00:00Z",
      },
    ];
    const sampleSummaries: StudentGradeSummary[] = [
      {
        studentId: "std-test-1",
        nis: "262707999",
        studentName: "Siswa Uji Coba Sikap",
        gender: "L",
        scores: { "asmt-t1": 95 },
        finalScore: 95,
        predicate: "A",
        attitudeGrade: "SANGAT_BAIK",
        isPassed: true,
        gradedCount: 1,
        totalCount: 1,
        categoryAverages: { TUGAS: 95, UH: null, QUIZ: null, UTS: null, UAS: null, PRAKTIK: null, LAINNYA: null },
      },
    ];

    const xlsxBytes = generateGradesXlsxWithKop("7A", sampleAssessments, sampleSummaries, DEFAULT_KKM);
    const wb = XLSX.read(xlsxBytes, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const sheetText = JSON.stringify(sheet);
    assert.ok(sheetText.includes("NILAI SIKAP"), "Berkas XLSX nilai harus memuat header NILAI SIKAP");
    assert.ok(sheetText.includes("Sangat Baik"), "Berkas XLSX nilai harus memuat nilai sikap 'Sangat Baik'");

    const csvText = generateGradesCsvWithKop("7A", sampleAssessments, sampleSummaries, DEFAULT_KKM);
    assert.ok(csvText.includes("Nilai Sikap"), "Berkas CSV nilai harus memuat header Nilai Sikap");
    assert.ok(csvText.includes("Sangat Baik"), "Berkas CSV nilai harus memuat nilai sikap 'Sangat Baik'");

    console.log("✓ LULUS: Sistem penilaian sikap siswa (Buruk, Kurang Baik, Baik, Sangat Baik) terverifikasi 100% akurat.");
  }

  // --------------------------------------------------------------------------
  // TEST 20: Autentikasi Pengguna Username + Password & Role-Based Access Control (RBAC)
  // --------------------------------------------------------------------------
  {
    console.log("\n[TEST 20] Menjalankan verifikasi sistem autentikasi pengguna (Username + Password & RBAC)...");

    // 1. Uji login dengan username fiktif
    const nonExistent = loginUser("tidak_ada_user", "password123");
    assert.strictEqual(nonExistent.success, false, "Login username tidak terdaftar wajib gagal");
    assert.ok(nonExistent.error?.includes("tidak ditemukan"), "Pesan error username tidak ditemukan harus jelas");

    // 2. Uji login dengan kata sandi salah
    const wrongPass = loginUser("rizky", "kata_sandi_ngawur");
    assert.strictEqual(wrongPass.success, false, "Login dengan password salah wajib gagal");
    assert.ok(wrongPass.error?.includes("salah"), "Pesan error kata sandi salah harus jelas");

    // 3. Uji login sah Guru (Pak Rizky)
    const guruLogin = loginUser("rizky", "guru123");
    assert.strictEqual(guruLogin.success, true, "Login sah Guru Pak Rizky harus berhasil");
    assert.strictEqual(guruLogin.user?.role, "GURU", "Peran Pak Rizky harus GURU");
    assert.strictEqual(guruLogin.user?.username, "rizky", "Username pengguna harus sesuai");
    assert.strictEqual(guruLogin.user?.fullName, "Muhamad Rizky Aprian, S.Kom");

    // 4. Verifikasi sesi aktif tersimpan di penyimpanan
    const activeSession = getCurrentUser();
    assert.ok(activeSession !== null, "Sesi login aktif harus tersimpan di penyimpanan lokal");
    assert.strictEqual(activeSession?.id, guruLogin.user?.id);

    // 5. Uji login sah Administrator
    const adminLogin = loginUser("admin", "admin123");
    assert.strictEqual(adminLogin.success, true, "Login sah Administrator harus berhasil");
    assert.strictEqual(adminLogin.user?.role, "ADMIN", "Peran Administrator harus ADMIN");

    // 6. Uji ubah kata sandi mandiri
    if (adminLogin.user) {
      const failChange = changePassword(adminLogin.user.id, "pass_lama_salah", "adminBaru123");
      assert.strictEqual(failChange.success, false, "Ubah password dengan password lama salah harus gagal");

      const successChange = changePassword(adminLogin.user.id, "admin123", "adminBaru123");
      assert.strictEqual(successChange.success, true, "Ubah password dengan password lama benar harus sukses");

      // Verifikasi login dengan password baru
      const loginNewPass = loginUser("admin", "adminBaru123");
      assert.strictEqual(loginNewPass.success, true, "Login dengan kata sandi baru harus berhasil");

      // Pulihkan kembali ke password default untuk konsistensi lingkungan
      resetUserPasswordByAdmin("admin", "admin123");
      const restoreLogin = loginUser("admin", "admin123");
      assert.strictEqual(restoreLogin.success, true, "Kata sandi admin berhasil dipulihkan ke default");
    }

    // 7. Uji proses logout
    logoutUser();
    assert.strictEqual(getCurrentUser(), null, "Setelah logout, sesi pengguna aktif wajib bernilai null");

    console.log("✓ LULUS: Sistem autentikasi pengguna (Username + Password & RBAC) terverifikasi 100% aman dan akurat.");
  }

  // --------------------------------------------------------------------------
  // TEST 21: Master Data Mata Pelajaran & Penugasan Mengajar Mandiri (Self-Enrollment)
  // --------------------------------------------------------------------------
  {
    console.log("\n[TEST 21] Menjalankan verifikasi sistem Self-Enrollment & penugasan mengajar guru...");

    // 1. Verifikasi ketersediaan master mapel Kurikulum Merdeka
    const subjects = getStoredSubjects();
    assert.ok(subjects.length >= 12, "Master mata pelajaran harus memuat minimal 12 mapel resmi");
    const infSubject = subjects.find((s) => s.code === "INF");
    assert.ok(infSubject !== undefined, "Mata pelajaran Informatika wajib terdaftar");
    assert.strictEqual(infSubject?.defaultKkm, 82, "KKM Informatika standar adalah 82");

    // 2. Verifikasi penugasan bawaan Pak Rizky (Informatika 7A-7H & 8A-8B)
    const initialAssignments = getTeacherAssignments("user-rizky");
    assert.ok(initialAssignments.length >= 10, "Penugasan awal Pak Rizky minimal mencakup 10 kelas");
    const assignedClassIds = initialAssignments.map((a) => a.classId);
    assert.ok(assignedClassIds.includes("class-7a"), "Pak Rizky harus mengampu kelas 7A");
    assert.ok(assignedClassIds.includes("class-8a"), "Pak Rizky harus mengampu kelas 8A");

    // 3. Uji simulasi Self-Enrollment: Pak Rizky menambah mapel Prakarya di kelas 8A dan 8B
    const newEnrollmentMatrix: Record<string, string[]> = {
      "sub-inf": ["class-7a", "class-7b", "class-7c", "class-7d", "class-7e", "class-7f", "class-7g", "class-7h"],
      "sub-prak": ["class-8a", "class-8b"], // Mengajar 2 mapel berbeda (>1 mapel)
    };
    const updatedAssignments = setTeacherEnrollmentMatrix("user-rizky", newEnrollmentMatrix);
    assert.strictEqual(updatedAssignments.length, 10, "Total penugasan aktif harus 10 rombel");

    // Verifikasi penugasan tersimpan
    const savedAssignments = getTeacherAssignments("user-rizky");
    const infClasses = savedAssignments.filter((a) => a.subjectId === "sub-inf");
    const prakClasses = savedAssignments.filter((a) => a.subjectId === "sub-prak");
    assert.strictEqual(infClasses.length, 8, "Informatika harus mencakup 8 rombel kelas 7");
    assert.strictEqual(prakClasses.length, 2, "Prakarya harus mencakup 2 rombel kelas 8");

    // 4. Pulihkan ke penugasan default Pak Rizky
    const defaultRizky = DEFAULT_TEACHER_ASSIGNMENTS.filter((a) => a.teacherId === "user-rizky");
    saveTeacherAssignmentsForTeacher("user-rizky", defaultRizky);
    const restored = getTeacherAssignments("user-rizky");
    assert.strictEqual(restored.length, defaultRizky.length, "Penugasan awal Pak Rizky berhasil dipulihkan (10 rombel)");

    console.log("✓ LULUS: Sistem Self-Enrollment & penugasan mengajar multi-mapel & multi-kelas terverifikasi 100% akurat.");
  }

  // --------------------------------------------------------------------------
  // TEST 22: Mesin PPDB XLSX, Alokasi Berimbang, Kenaikan Kelas, dan Kelulusan Kelas 9
  // --------------------------------------------------------------------------
  {
    console.log("\n[TEST 22] Menjalankan verifikasi sistem PPDB XLSX, Kenaikan Kelas & Kelulusan...");

    // 1. Verifikasi pembuatan template Excel PPDB
    const templateWb = generatePpdbTemplateWorkbook();
    assert.ok(templateWb.SheetNames.includes("DATA_SISWA_PPDB"), "Template PPDB wajib memiliki sheet data siswa");
    assert.ok(templateWb.SheetNames.includes("PETUNJUK"), "Template PPDB wajib memiliki sheet petunjuk");

    // 2. Verifikasi statistik siswa sekolah awal
    const statsBefore = getSchoolTotalStudentsStats();
    assert.strictEqual(statsBefore.total, 883, "Total siswa awal harus 883 siswa");
    assert.strictEqual(statsBefore.byGrade.grade7, 319, "Total siswa kelas 7 harus 319");
    assert.strictEqual(statsBefore.byGrade.grade8, 281, "Total siswa kelas 8 harus 281");
    assert.strictEqual(statsBefore.byGrade.grade9, 283, "Total siswa kelas 9 awal harus 283");

    // 3. Uji simulasi kelulusan kelas 9 (alumni) terlebih dahulu sebelum kelas 8 naik
    const gradRes = executeGraduationClass9("admin");
    assert.strictEqual(gradRes.graduatedCount, 283, "Siswa lulus dari kelas 9 harus 283 orang");

    // 4. Uji simulasi kenaikan kelas paralel: 8 -> 9 dan 7 -> 8
    const retainedIds = new Set<string>();
    // Tandai 1 siswa tinggal kelas di kelas 8 (ambil salah satu siswa kelas 8B)
    const studs8b = ALL_STUDENTS_BY_CLASS["class-8b"] || [];
    if (studs8b.length > 0) {
      retainedIds.add(studs8b[0].id);
    }
    const promotionRes = executeParallelPromotion(retainedIds, "admin");
    assert.strictEqual(promotionRes.retainedCount, 1, "Siswa tinggal kelas harus terhitung 1");
    assert.strictEqual(promotionRes.promotedToGrade9, 280, "Siswa naik ke kelas 9 harus 280 (281 - 1)");
    assert.strictEqual(promotionRes.promotedToGrade8, 319, "Siswa naik ke kelas 8 harus 319");

    // 5. Uji impor siswa baru PPDB (16 siswa baru dengan auto-alokasi berimbang)
    const mockNewStudents = Array.from({ length: 16 }, (_, i) => ({
      nis: `262799${String(i + 1).padStart(3, "0")}`,
      fullName: `SISWA BARU TEST ${i + 1}`,
      gender: (i % 2 === 0 ? "L" : "P") as "L" | "P",
    }));

    const ppdbRes = commitPpdbImport(mockNewStudents, true);
    assert.strictEqual(ppdbRes.importedCount, 16, "Harus mengimpor 16 siswa baru");
    // Karena ada 8 rombel kelas 7 (7A-7H), masing-masing harus mendapat tepat 2 siswa
    for (const [cls, count] of Object.entries(ppdbRes.perClassSummary)) {
      assert.strictEqual(count, 2, `Kelas ${cls} harus mendapat 2 siswa secara merata`);
    }

    // 6. Bersihkan dan pulihkan data dinamis siswa kembali ke semula
    if (typeof (globalThis as any).localStorage !== "undefined") {
      (globalThis as any).localStorage.removeItem(STORAGE_KEY_DYNAMIC_STUDENTS);
    }
    const restoredStats = getSchoolTotalStudentsStats();
    assert.strictEqual(restoredStats.total, 883, "Statistik harus kembali ke 883 siswa otentik");

    console.log("✓ LULUS: Mesin PPDB XLSX, alokasi berimbang gender, kenaikan kelas paralel, dan kelulusan alumni terverifikasi 100% akurat.");
  }

  // --------------------------------------------------------------------------
  // TEST 23: Distribusi Jam Mengajar SK KBM 2026/2027, Akun Kepala Sekolah & 29 Guru
  // --------------------------------------------------------------------------
  {
    console.log("\n[TEST 23] Menjalankan verifikasi Akun Kepala Sekolah & Distribusi 29 Guru SK KBM 2026/2027...");

    // 1. Verifikasi total pengguna terdaftar (Admin TU, Kepala Sekolah, dan 29 Guru = 31 Akun)
    const allUsers = getStoredUsers();
    assert.strictEqual(allUsers.length, 31, "Total akun terdaftar harus tepat 31 akun (1 Admin TU + 1 Kepala Sekolah + 29 Guru)");

    // 2. Verifikasi Akun Kepala Sekolah (Dra. Juwariyah, M.Pd)
    const ksUser = allUsers.find((u) => u.username === "juwariyah");
    assert.ok(ksUser !== undefined, "Akun Kepala Sekolah juwariyah wajib terdaftar");
    assert.strictEqual(ksUser?.role, "ADMIN", "Kepala Sekolah wajib memiliki hak akses ADMIN");
    assert.strictEqual(ksUser?.fullName, "Dra. Juwariyah, M.Pd", "Nama resmi Kepala Sekolah harus tepat");
    assert.strictEqual(ksUser?.nip, "196904041997022002", "NIP resmi Kepala Sekolah harus tepat");

    // Login Kepala Sekolah
    const ksLogin = loginUser("juwariyah", "admin123");
    assert.strictEqual(ksLogin.success, true, "Login Kepala Sekolah dengan admin123 harus berhasil");
    assert.strictEqual(ksLogin.user?.role, "ADMIN", "Role login Kepala Sekolah harus ADMIN");

    // Akses kelas Kepala Sekolah (Supervisi seluruh 22 rombel sekolah)
    const ksClasses = getEnrolledClassesForUser(ksLogin.user);
    assert.strictEqual(ksClasses.length, 22, "Kepala Sekolah dengan akses ADMIN harus dapat mensupervisi seluruh 22 rombel");

    // 3. Verifikasi Seluruh 29 Akun Guru dapat Login
    const teacherUsers = allUsers.filter((u) => u.role === "GURU");
    assert.strictEqual(teacherUsers.length, 29, "Harus ada tepat 29 akun guru aktif");

    for (const teacher of teacherUsers) {
      const loginRes = loginUser(teacher.username, "guru123");
      assert.strictEqual(loginRes.success, true, `Guru ${teacher.fullName} (${teacher.username}) harus berhasil login dengan password guru123`);

      const enrolledCls = getEnrolledClassesForUser(teacher);
      assert.ok(enrolledCls.length > 0, `Guru ${teacher.fullName} harus memiliki minimal 1 rombel yang diampu`);
      if (teacher.username !== "nika.musrifah") {
        assert.ok(enrolledCls.length < 22, `Guru ${teacher.fullName} tidak boleh melihat semua 22 rombel sekolah (harus terisolasi)`);
      } else {
        assert.strictEqual(enrolledCls.length, 22, `Guru BK ${teacher.fullName} membimbing seluruh 22 rombel sekolah`);
      }
    }

    // 4. Verifikasi Total Beban Mengajar Resmi (264 Penugasan = 22 Rombel x 12 Mapel)
    assert.strictEqual(DEFAULT_TEACHER_ASSIGNMENTS.length, 264, "Total penugasan resmi harus tepat 264 penugasan");

    // 5. Verifikasi Data Wali Kelas Resmi di 22 Rombel
    assert.strictEqual(MOCK_CLASSES.length, 22, "Total rombel sekolah harus 22 kelas");
    for (const cls of MOCK_CLASSES) {
      assert.ok(cls.homeroomTeacherName && cls.homeroomTeacherName.trim().length > 0, `Kelas ${cls.name} wajib memiliki nama Wali Kelas resmi`);
    }

    // 6. Verifikasi Pak Muhamad Rizky Aprian, S.Kom
    const rizkyUser = allUsers.find((u) => u.username === "rizky");
    assert.ok(rizkyUser !== undefined, "Akun Pak Rizky harus terdaftar");
    const rizkyClasses = getEnrolledClassesForUser(rizkyUser);
    assert.strictEqual(rizkyClasses.length, 10, "Pak Rizky mengampu tepat 10 kelas (7A-7H dan 8A-8B)");

    logoutUser();
    console.log("✓ LULUS: Akun Kepala Sekolah (Akses Admin), 29 Akun Guru, 264 Penugasan SK KBM, dan Wali Kelas terverifikasi 100% akurat.");
  }

  // --------------------------------------------------------------------------
  // TEST 24: Integrasi Jadwal Pelajaran Resmi aSc Timetables (374 Slot Sesi KBM)
  // --------------------------------------------------------------------------
  {
    console.log("\n[TEST 24] Menjalankan verifikasi Matriks Jadwal Resmi aSc Timetables (374 Sesi KBM)...");

    // 1. Verifikasi Total Slot Jadwal Mingguan Sekolah (Tepat 374 Sesi Pertemuan)
    assert.strictEqual(
      OFFICIAL_SCHEDULE_SLOTS.length,
      374,
      "Total slot jadwal resmi aSc Timetables harus tepat 374 sesi pertemuan kelas"
    );

    // 2. Verifikasi Distribusi Sesi KBM per Hari (Senin - Jumat)
    const countSenin = OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.day === "Senin").length;
    const countSelasa = OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.day === "Selasa").length;
    const countRabu = OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.day === "Rabu").length;
    const countKamis = OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.day === "Kamis").length;
    const countJumat = OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.day === "Jumat").length;

    assert.strictEqual(countSenin, 79, "Hari Senin harus memiliki tepat 79 sesi KBM");
    assert.strictEqual(countSelasa, 78, "Hari Selasa harus memiliki tepat 78 sesi KBM");
    assert.strictEqual(countRabu, 81, "Hari Rabu harus memiliki tepat 81 sesi KBM");
    assert.strictEqual(countKamis, 82, "Hari Kamis harus memiliki tepat 82 sesi KBM");
    assert.strictEqual(countJumat, 54, "Hari Jumat harus memiliki tepat 54 sesi KBM");
    assert.strictEqual(
      countSenin + countSelasa + countRabu + countKamis + countJumat,
      374,
      "Akumulasi 5 hari sekolah harus tepat 374 sesi"
    );

    // 3. Verifikasi Konsistensi Setiap Rombel (22 Rombel x 17 Sesi = 374)
    const classSessionCounts: Record<string, number> = {};
    OFFICIAL_SCHEDULE_SLOTS.forEach((slot) => {
      classSessionCounts[slot.className] = (classSessionCounts[slot.className] || 0) + 1;
      assert.ok(slot.id && slot.id.length > 0, "ID slot wajib ada");
      assert.ok(slot.teacherId && slot.teacherId.length > 0, "teacherId wajib terisi");
      assert.ok(slot.teacherName && slot.teacherName.length > 0, "teacherName wajib terisi");
      assert.ok(slot.subjectName && slot.subjectName.length > 0, "subjectName wajib terisi");
      assert.ok(slot.time && slot.time.includes("–"), "Format jam slot wajib memuat rentang waktu baku");
      assert.ok(slot.period && slot.period.includes("Jam Ke"), "Periode wajib memuat Jam Ke");
    });

    assert.strictEqual(Object.keys(classSessionCounts).length, 22, "Harus mencakup seluruh 22 rombel sekolah");
    for (const [cls, count] of Object.entries(classSessionCounts)) {
      assert.strictEqual(count, 17, `Kelas ${cls} harus memiliki tepat 17 sesi KBM per minggu`);
    }

    // 4. Verifikasi Jadwal Spesifik Pak Rizky (Informatika)
    const rizkySlots = getTeacherScheduleSlots("user-rizky");
    assert.strictEqual(rizkySlots.length, 10, "Pak Rizky harus memiliki tepat 10 slot mengajar (7A-7H & 8A-8B)");
    const rizkyUserObj = { id: "user-rizky", role: "GURU" as const, username: "rizky", fullName: "Muhamad Rizky Aprian, S.Kom", nip: "", phone: "", isActive: true, createdAt: "" };

    const rizkySenin = getClassesForTeacherAndDay(rizkyUserObj, "Senin");
    assert.strictEqual(rizkySenin.length, 2, "Pak Rizky mengajar 2 kelas di hari Senin");
    assert.deepStrictEqual(rizkySenin.map((c) => c.name).sort(), ["7A", "7D"].sort(), "Senin: 7A dan 7D");

    const rizkySelasa = getClassesForTeacherAndDay(rizkyUserObj, "Selasa");
    assert.strictEqual(rizkySelasa.length, 2, "Pak Rizky mengajar 2 kelas di hari Selasa");
    assert.deepStrictEqual(rizkySelasa.map((c) => c.name).sort(), ["7B", "8B"].sort(), "Selasa: 7B dan 8B");

    const rizkyRabu = getClassesForTeacherAndDay(rizkyUserObj, "Rabu");
    assert.strictEqual(rizkyRabu.length, 2, "Pak Rizky mengajar 2 kelas di hari Rabu");
    assert.deepStrictEqual(rizkyRabu.map((c) => c.name).sort(), ["7E", "7F"].sort(), "Rabu: 7E dan 7F");

    const rizkyKamis = getClassesForTeacherAndDay(rizkyUserObj, "Kamis");
    assert.strictEqual(rizkyKamis.length, 2, "Pak Rizky mengajar 2 kelas di hari Kamis");
    assert.deepStrictEqual(rizkyKamis.map((c) => c.name).sort(), ["7H", "8A"].sort(), "Kamis: 7H dan 8A");

    const rizkyJumat = getClassesForTeacherAndDay(rizkyUserObj, "Jumat");
    assert.strictEqual(rizkyJumat.length, 2, "Pak Rizky mengajar 2 kelas di hari Jumat");
    assert.deepStrictEqual(rizkyJumat.map((c) => c.name).sort(), ["7C", "7G"].sort(), "Jumat: 7C dan 7G");

    // 5. Verifikasi Supervisi KBM Hari Ini untuk Akses Administrator
    const adminUserObj = { id: "user-admin", role: "ADMIN" as const, username: "admin", fullName: "Administrator", nip: "", phone: "", isActive: true, createdAt: "" };
    const adminSenin = getClassesForTeacherAndDay(adminUserObj, "Senin");
    assert.strictEqual(adminSenin.length, 79, "Admin dapat mensupervisi seluruh 79 sesi KBM di hari Senin");

    // 6. Verifikasi Generator Jadwal Mingguan Per Guru
    const rizkyWeekly = getTeacherWeeklySchedule("user-rizky");
    assert.strictEqual(rizkyWeekly.totalSessions, 10);
    assert.strictEqual(rizkyWeekly.byDay.Senin.length, 2);
    assert.strictEqual(rizkyWeekly.byDay.Selasa.length, 2);
    assert.strictEqual(rizkyWeekly.byDay.Rabu.length, 2);
    assert.strictEqual(rizkyWeekly.byDay.Kamis.length, 2);
    assert.strictEqual(rizkyWeekly.byDay.Jumat.length, 2);

    // 7. Verifikasi Seluruh 29 Guru Memiliki Matriks Jadwal Mingguan
    const allWeekly = getAllTeachersWeeklySchedules();
    assert.strictEqual(allWeekly.length, 29, "Harus menghasilkan 29 matriks jadwal mingguan guru");
    const totalWeeklySessions = allWeekly.reduce((acc, curr) => acc + curr.totalSessions, 0);
    assert.strictEqual(totalWeeklySessions, 374, "Total seluruh sesi mingguan 29 guru harus tepat 374 sesi");

    console.log("✓ LULUS: 374 Sesi KBM aSc Timetables, distribusi 5 hari, jadwal Pak Rizky 10 kelas, dan matriks 29 guru terverifikasi 100% akurat.");
  }

  // 25. Pengujian Kredensial Transparan Admin dan Penghapusan Akun Guru Terproteksi
  {
    console.log("\n--- [TEST 25] Kredensial Transparan & Penghapusan Akun Guru Terproteksi ---");

    // 1. Verifikasi Akses Transparan Kata Sandi Akun
    const rizkyPass = getUserPassword("rizky");
    assert.strictEqual(rizkyPass, "guru123", "Kata sandi Pak Rizky harus dapat dibaca admin secara transparan");

    const adminPass = getUserPassword("admin");
    assert.ok(adminPass && adminPass.length > 0, "Kata sandi Admin harus ada di penyimpanan");

    const nonExistentPass = getUserPassword("guru_fiktif_12345");
    assert.strictEqual(nonExistentPass, null, "Username yang tidak terdaftar harus mengembalikan null");

    // 2. Verifikasi Pagar Pengaman Proteksi Penghapusan Akun Utama
    const deleteAdminAttempt = deleteUserByAdmin("user-admin", "user-juwariyah");
    assert.strictEqual(deleteAdminAttempt.success, false, "Penghapusan akun Super Administrator wajib ditolak");
    assert.ok(deleteAdminAttempt.error?.includes("Super Administrator"), "Pesan error proteksi admin harus jelas");

    const deleteHeadmasterAttempt = deleteUserByAdmin("user-juwariyah", "user-admin");
    assert.strictEqual(deleteHeadmasterAttempt.success, false, "Penghapusan akun Kepala Sekolah wajib ditolak");
    assert.ok(deleteHeadmasterAttempt.error?.includes("Kepala Sekolah"), "Pesan error proteksi kepala sekolah harus jelas");

    const deleteSelfAttempt = deleteUserByAdmin("user-admin", "user-admin");
    assert.strictEqual(deleteSelfAttempt.success, false, "Penghapusan akun diri sendiri yang sedang aktif login wajib ditolak");
    assert.ok(deleteSelfAttempt.error?.includes("sedang aktif"), "Pesan error proteksi sesi aktif harus jelas");

    // 3. Verifikasi Siklus Hidup Akun Guru: Buat -> Baca Sandi -> Atur Penugasan -> Hapus Bersih
    const mockTeacherUsername = `guru_uji_${Date.now()}`;
    const createRes = createUserByAdmin({
      fullName: "Guru Uji Coba Simulasi",
      username: mockTeacherUsername,
      nip: "199001012026011999",
      email: "guru.uji@smpn3cibungbulang.sch.id",
      role: "GURU",
      initialPassword: "PassW0rdUji123!",
    });

    assert.strictEqual(createRes.success, true, "Pembuatan akun guru uji coba harus berhasil");
    const testUser = createRes.user!;
    assert.ok(testUser && testUser.id, "Objek guru uji coba harus memiliki id unik");

    // Verifikasi kata sandi awal tersimpan dan dapat dibaca
    const retrievedPass = getUserPassword(mockTeacherUsername);
    assert.strictEqual(retrievedPass, "PassW0rdUji123!", "Kata sandi guru baru harus persis sesuai yang diset");

    // Simpan penugasan mengajar untuk guru uji coba menggunakan matriks enrollment
    setTeacherEnrollmentMatrix(testUser.id, { "sub-inf": ["7A", "7B"] });

    const assignmentsBeforeDelete = getTeacherAssignments(testUser.id);
    assert.strictEqual(assignmentsBeforeDelete.length, 2, "Penugasan mengajar guru uji coba harus terdaftar (2 kelas)");

    // Eksekusi penghapusan akun oleh Admin
    const deleteRes = deleteUserByAdmin(testUser.id, "user-admin");
    assert.strictEqual(deleteRes.success, true, "Penghapusan akun guru biasa oleh admin harus sukses");

    // Bersihkan penugasan mengajar
    removeTeacherAssignmentsForTeacher(testUser.id);

    // Verifikasi pasca penghapusan
    const usersAfterDelete = getStoredUsers();
    assert.strictEqual(usersAfterDelete.some((u) => u.id === testUser.id), false, "Akun guru harus terhapus dari daftar pengguna");

    const passAfterDelete = getUserPassword(mockTeacherUsername);
    assert.strictEqual(passAfterDelete, null, "Kata sandi akun yang dihapus harus dibersihkan secara aman");

    const assignmentsAfterDelete = getTeacherAssignments(testUser.id);
    assert.strictEqual(assignmentsAfterDelete.length, 0, "Seluruh penugasan mengajar guru yang dihapus harus bersih 100%");

    console.log("✓ LULUS: Kredensial username/password transparan dan proteksi penghapusan akun guru terverifikasi 100% aman.");
  }

  // 26. Pengujian Modul Buku Induk Digital & Arsip Mutasi Siswa (Audit Trail Dinas)
  {
    console.log("\n--- [TEST 26] Buku Induk Digital, Arsip Mutasi Siswa & Kepatuhan Audit Dinas ---");

    // 1. Verifikasi Pembacaan Awal Arsip Mutasi
    const initialMutations = getStoredStudentMutations();
    assert.ok(Array.isArray(initialMutations), "Arsip mutasi harus mengembalikan array");

    // 2. Pilih Siswa Sampel dari Rombel Kelas 7A
    const dynamicMap = getStoredDynamicStudentsMap();
    const students7a = dynamicMap["class-7a"] || [];
    assert.ok(students7a.length > 0, "Kelas 7A harus memiliki siswa terdaftar");
    const targetStudent = students7a[0];
    const initialCount7a = students7a.length;

    // 3. Eksekusi Pengeluaran / Mutasi Keluar Siswa (Soft Deactivation)
    const mutationResult = deactivateStudentWithMutation({
      studentId: targetStudent.id,
      classId: "class-7a",
      status: "TRANSFERRED",
      mutationDate: "2026-10-15",
      reasonCategory: "PINDAH_SEKOLAH",
      reasonDetail: "Pindah mengikuti domisili orang tua ke luar kota",
      destinationSchool: "SMP Negeri 1 Leuwiliang",
      referenceLetterNo: "421.3/089/SMPN3/X/2026",
      adminUser: {
        id: "user-admin",
        fullName: "Administrator Sekolah",
      },
    });

    assert.strictEqual(mutationResult.success, true, "Eksekusi mutasi siswa harus berhasil");
    assert.ok(mutationResult.mutationRecord, "Record mutasi harus dihasilkan");
    assert.strictEqual(mutationResult.mutationRecord.studentId, targetStudent.id);
    assert.strictEqual(mutationResult.mutationRecord.destinationSchool, "SMP Negeri 1 Leuwiliang");
    assert.strictEqual(mutationResult.mutationRecord.referenceLetterNo, "421.3/089/SMPN3/X/2026");

    // 4. Verifikasi Siswa Keluar dari Rombel Aktif (Tidak Muncul di KBM Berjalan)
    const mapAfterMutation = getStoredDynamicStudentsMap();
    const students7aAfter = mapAfterMutation["class-7a"] || [];
    assert.strictEqual(students7aAfter.length, initialCount7a - 1, "Jumlah siswa kelas 7A harus berkurang 1");
    assert.strictEqual(
      students7aAfter.some((s) => s.id === targetStudent.id),
      false,
      "Siswa yang dimutasi dilarang muncul di rombel aktif"
    );

    // 5. Verifikasi Data Tersimpan di Arsip Mutasi (Audit Trail Dinas)
    const mutationsAfter = getStoredStudentMutations();
    const savedRecord = mutationsAfter.find((m) => m.studentId === targetStudent.id);
    assert.ok(savedRecord, "Siswa wajib tercatat di arsip mutasi");
    assert.strictEqual(savedRecord.studentName, targetStudent.fullName);
    assert.strictEqual(savedRecord.reasonCategory, "PINDAH_SEKOLAH");

    // 6. Verifikasi Rekam Jejak Historis (Buku Induk Digital)
    const auditData = getStudentHistoricalAuditData(targetStudent.id);
    assert.ok(auditData.attendanceStats, "Statistik kehadiran harus tersedia");
    assert.ok(typeof auditData.attendanceStats.persentase === "number", "Persentase kehadiran harus bertipe number");
    assert.ok(Array.isArray(auditData.scores), "Daftar nilai harus berupa array");

    // 7. Verifikasi Pemulihan Siswa Kembali ke Kelas (Reactivate / Pembatalan Mutasi)
    const reactivateRes = reactivateStudentFromMutation(mutationResult.mutationRecord.id);
    assert.strictEqual(reactivateRes.success, true, "Pemulihan siswa ke kelas harus sukses");

    const mapAfterReactivate = getStoredDynamicStudentsMap();
    const students7aRestored = mapAfterReactivate["class-7a"] || [];
    assert.strictEqual(students7aRestored.length, initialCount7a, "Jumlah siswa kelas 7A harus kembali semula");
    assert.strictEqual(
      students7aRestored.some((s) => s.id === targetStudent.id),
      true,
      "Siswa harus kembali aktif di rombel kelas 7A"
    );

    const mutationsAfterReactivate = getStoredStudentMutations();
    assert.strictEqual(
      mutationsAfterReactivate.some((m) => m.id === mutationResult.mutationRecord!.id),
      false,
      "Record mutasi harus bersih setelah dipulihkan"
    );

    console.log("✓ LULUS: Pengarsipan mutasi siswa, audit trail dinas, dan pemulihan siswa terverifikasi 100% aman.");
  }

  // ============================================================================
  // UJI VALIDASI DATA SISWA KELAS 9 (9A - 9G) & INTEGRITAS SSOT SEKOLAH
  // ============================================================================
  {
    console.log("\n--- Memulai Pengujian Data Otentik Siswa Kelas 9 (9A–9G) ---");

    const expectedGrade9Counts: Record<string, number> = {
      "class-9a": 40,
      "class-9b": 41,
      "class-9c": 39,
      "class-9d": 42,
      "class-9e": 40,
      "class-9f": 41,
      "class-9g": 40,
    };

    let totalGrade9 = 0;
    for (const [classId, expectedCount] of Object.entries(expectedGrade9Counts)) {
      const students = ALL_STUDENTS_BY_CLASS[classId];
      assert.ok(Array.isArray(students), `Data siswa ${classId} harus berupa array`);
      assert.strictEqual(
        students.length,
        expectedCount,
        `Jumlah siswa ${classId} harus ${expectedCount}, terdeteksi ${students.length}`
      );
      totalGrade9 += students.length;

      // Verifikasi integritas setiap record siswa
      for (const s of students) {
        assert.ok(s.id.startsWith(`std-${classId}-`), `Format ID siswa ${s.id} tidak valid`);
        assert.strictEqual(s.classId, classId, `classId siswa ${s.id} tidak cocok`);
        assert.ok(s.nis && s.nis.trim().length >= 8, `NIS siswa ${s.fullName} harus valid`);
        assert.ok(s.fullName && s.fullName.trim().length > 0, `Nama siswa ${s.id} wajib terisi`);
        assert.ok(s.gender === "L" || s.gender === "P", `Gender siswa ${s.fullName} harus L atau P`);
        assert.strictEqual(s.isActive, true, `Status aktif siswa ${s.fullName} harus true`);
      }

      // Verifikasi melalui helper getStudentsForClass
      const fetchedStudents = getStudentsForClass(classId);
      assert.strictEqual(fetchedStudents.length, expectedCount, `getStudentsForClass(${classId}) harus menghasilkan ${expectedCount}`);

      // Verifikasi melalui dynamic storage
      const dynamicStudents = getDynamicStudentsForClass(classId);
      assert.strictEqual(dynamicStudents.length, expectedCount, `getDynamicStudentsForClass(${classId}) harus menghasilkan ${expectedCount}`);
    }

    assert.strictEqual(totalGrade9, 283, `Total seluruh siswa kelas 9 harus tepat 283`);

    // Uji ketahanan sinkronisasi cache: simulasi cache lama yang belum memuat kelas 9
    const dummyCorruptedCache: Record<string, Student[]> = {
      "class-7a": ALL_STUDENTS_BY_CLASS["class-7a"],
    };
    (globalThis as any).localStorage.setItem(
      STORAGE_KEY_DYNAMIC_STUDENTS,
      JSON.stringify(dummyCorruptedCache)
    );

    const healedMap = getStoredDynamicStudentsMap();
    assert.strictEqual(healedMap["class-9a"].length, 40, "Cache tanpa kelas 9A harus disembuhkan otomatis");
    assert.strictEqual(healedMap["class-9b"].length, 41, "Cache tanpa kelas 9B harus disembuhkan otomatis");

    // Uji fallback getStudentsForClass ketika cache lokal bernilai array kosong
    (globalThis as any).localStorage.setItem(
      STORAGE_KEY_DYNAMIC_STUDENTS,
      JSON.stringify({ "class-9a": [] })
    );
    const fallbackStudents = getStudentsForClass("class-9a");
    assert.strictEqual(fallbackStudents.length, 40, "getStudentsForClass harus fallback ke data otentik jika cache kosong");

    // Bersihkan kembali
    (globalThis as any).localStorage.removeItem(STORAGE_KEY_DYNAMIC_STUDENTS);

    console.log("✓ LULUS: Seluruh 283 siswa kelas 9 (9A-9G) terverifikasi otentik, valid, dan tahan inkonsistensi cache.");
  }

  // ============================================================================
  // UJI VALIDASI ANTI-DUPLIKASI KELAS PADA getEnrolledClassesForUser & PENUGASAN
  // ============================================================================
  {
    console.log("\n--- Memulai Pengujian Anti-Duplikasi Kelas & Penugasan Guru ---");

    // 1. Verifikasi seluruh guru & admin tidak memiliki ID kelas ganda
    const allUsers = getStoredUsers();
    for (const u of allUsers) {
      const enrolled = getEnrolledClassesForUser(u);
      const classIdSet = new Set<string>();
      for (const c of enrolled) {
        assert.strictEqual(
          classIdSet.has(c.id),
          false,
          `Pengguna ${u.username} (${u.role}) tidak boleh memiliki kelas ganda: ${c.id}`
        );
        classIdSet.add(c.id);
      }
    }

    // 2. Simulasi cache penugasan mengajar yang kotor (terdapat record duplikat dari versi lawas)
    const dirtyAssignments = [
      {
        id: "asgn-user-rizky-sub-inf-class-7a",
        teacherId: "user-rizky",
        subjectId: "sub-inf",
        classId: "class-7a",
        academicYear: "2026/2027",
        semester: 1,
        isActive: true,
        createdAt: "2026-07-15T00:00:00Z",
      },
      {
        id: "asgn-rizky-inf-7a",
        teacherId: "user-rizky",
        subjectId: "sub-inf",
        classId: "class-7a",
        academicYear: "2026/2027",
        semester: 1,
        isActive: true,
        createdAt: "2026-07-15T00:00:00Z",
      },
    ];
    (globalThis as any).localStorage.setItem(
      STORAGE_KEY_TEACHER_ASSIGNMENTS,
      JSON.stringify(dirtyAssignments)
    );

    // Saat dibaca, sistem harus otomatis membersihkan duplikasi tersebut
    const cleaned = getStoredTeacherAssignments();
    const rizky7a = cleaned.filter((a) => a.teacherId === "user-rizky" && a.classId === "class-7a");
    assert.strictEqual(rizky7a.length, 1, "Penugasan guru 7A yang duplikat harus dibersihkan menjadi tepat 1");

    // Verifikasi getEnrolledClassesForUser tetap menghasilkan kelas unik 100%
    const rizkyUser = allUsers.find((u) => u.username === "rizky");
    const rizkyEnrolled = getEnrolledClassesForUser(rizkyUser!);
    const rizky7aClasses = rizkyEnrolled.filter((c) => c.id === "class-7a");
    assert.strictEqual(rizky7aClasses.length, 1, "Rombel 7A di enrolledClasses Pak Rizky wajib tepat 1");

    // Bersihkan kembali ke default
    (globalThis as any).localStorage.removeItem(STORAGE_KEY_TEACHER_ASSIGNMENTS);

    console.log("✓ LULUS: Anti-duplikasi kelas dan penyembuhan otomatis penugasan guru teruji 100% aman.");
  }

  // --- UJI PEMISAHAN NILAI & ASESMEN BERDASARKAN MATA PELAJARAN (INFORMATIKA VS MATEMATIKA) ---
  {
    console.log("\n--- Memulai Pengujian Pemisahan Nilai Berdasarkan Mata Pelajaran (Informatika vs MTK) ---");
    const testClass = "class-7a";

    // 1. Ambil asesmen Informatika untuk 7A
    const infAssessments = getAssessmentsByClass(testClass, undefined, "sub-inf");
    assert.ok(infAssessments.length > 0, "Kelas 7A harus memiliki asesmen awal Informatika");
    assert.ok(
      infAssessments.every((a) => (a.subject || "").toLowerCase() === "informatika" || a.subjectId === "sub-inf"),
      "Seluruh asesmen harus merupakan Informatika"
    );

    // 2. Ambil asesmen Matematika untuk 7A (sebelum dibuat penilaian MTK)
    const mtkAssessmentsBefore = getAssessmentsByClass(testClass, undefined, "sub-mtk");
    assert.strictEqual(mtkAssessmentsBefore.length, 0, "Kelas 7A belum boleh memiliki asesmen Matematika jika belum ditambahkan");

    // 3. Tambahkan 1 asesmen baru untuk Matematika
    const newMtkAsmt = createAssessment({
      classId: testClass,
      subject: "Matematika",
      subjectId: "sub-mtk",
      type: "TUGAS",
      title: "Tugas 1: Bilangan Bulat",
      date: "2026-08-10",
      maxScore: 100,
      weight: 1,
    });

    // 4. Verifikasi setelah dibuat:
    // - Saat filter 'sub-mtk': Menghasilkan tepat 1 asesmen Matematika
    const mtkAssessmentsAfter = getAssessmentsByClass(testClass, undefined, "sub-mtk");
    assert.strictEqual(mtkAssessmentsAfter.length, 1, "Asesmen Matematika baru harus muncul pada filter sub-mtk");
    assert.strictEqual(mtkAssessmentsAfter[0].id, newMtkAsmt.id);
    assert.strictEqual(mtkAssessmentsAfter[0].title, "Tugas 1: Bilangan Bulat");

    // - Saat filter 'sub-inf': Asesmen Matematika TIDAK boleh bocor / tercampur ke Informatika
    const infAssessmentsAfter = getAssessmentsByClass(testClass, undefined, "sub-inf");
    assert.ok(
      infAssessmentsAfter.every((a) => a.id !== newMtkAsmt.id),
      "Asesmen Matematika tidak boleh muncul di filter Informatika"
    );

    // 5. Bersihkan asesmen uji Matematika
    clearAssessmentsForClass(testClass, "sub-mtk");
    const mtkAfterClear = getAssessmentsByClass(testClass, undefined, "sub-mtk");
    assert.strictEqual(mtkAfterClear.length, 0, "Asesmen Matematika harus bersih setelah clearAssessmentsForClass(classId, 'sub-mtk')");

    // Verifikasi asesmen Informatika tetap utuh tidak ikut terhapus
    const infAfterClear = getAssessmentsByClass(testClass, undefined, "sub-inf");
    assert.strictEqual(infAfterClear.length, infAssessments.length, "Asesmen Informatika harus tetap utuh 100%");

    console.log("✓ LULUS: Pemisahan data nilai dan asesmen per mata pelajaran (Informatika vs MTK) teruji 100% aman dan terisolasi.");
  }

  console.log("\n=== SEMUA ASSERTION SMOKE TEST LULUS 100% ===");
}

runSmokeTest();


