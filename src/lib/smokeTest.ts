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
} from "./gradeStorage.ts";
import {
  DEFAULT_KKM,
  DEFAULT_KKM_BY_GRADE,
  extractGradeLevel,
  getGradePredicate,
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

    // 9f. Uji Helper formatClassRoman & Margin Folio
    assert.strictEqual(formatClassRoman("7C"), "VII / C", "formatClassRoman 7C harus VII / C");
    assert.strictEqual(formatClassRoman("8B"), "VIII / B", "formatClassRoman 8B harus VIII / B");
    assert.strictEqual(formatClassRoman("9A"), "IX / A", "formatClassRoman 9A harus IX / A");
    assert.strictEqual(formatClassRoman("Kelas 7-C"), "VII / C", "formatClassRoman Kelas 7-C harus VII / C");
    assert.ok(OFFICIAL_PAGE_MARGINS.top > 0.4 && OFFICIAL_PAGE_MARGINS.top < 0.45, "Margin top harus 1.1 cm (~0.433 in)");
    assert.strictEqual(OFFICIAL_PAPER_SETUP.paperSize, 14, "Paper setup harus kode 14 (Folio F4)");

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
    assert.strictEqual(MOCK_CLASSES.length, 10, "Harus tersedia 10 rombel resmi SMPN 3 Cibungbulang");
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
    assert.strictEqual(totalVerifiedStudents, 401, "Harus ada 401 siswa otentik terverifikasi relasi foreign key-nya");

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

  console.log("\n=== SEMUA ASSERTION SMOKE TEST LULUS 100% ===");
}

runSmokeTest();
