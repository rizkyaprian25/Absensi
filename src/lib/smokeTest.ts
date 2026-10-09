import assert from "node:assert";
import {
  calculateAttendanceRate,
  isAttendanceNeedingAttention,
  parseCsvStudents,
  upsertSessionIdempotent,
} from "./attendanceUtils.ts";
import type { AttendanceSession } from "../contracts/attendance.ts";
import {
  DEFAULT_HOLIDAYS,
  findHolidayByDate,
  isDateHoliday,
  getDateForWeekday,
  addOrUpdateSpecialPeriod,
} from "./calendarUtils.ts";
import { generatePastTeachingDates } from "./attendanceStorage.ts";
import {
  calculateStudentGradeSummary,
  calculateClassGradeStats,
  exportGradesToCSV,
} from "./gradeStorage.ts";
import {
  DEFAULT_KKM,
  getGradePredicate,
  type AssessmentItem,
  type StudentScoreRecord,
} from "../contracts/grades.ts";
import {
  AttendanceStatusSchema,
  HolidayCategorySchema,
  type Student,
  type Class,
  type StudentMonthlyRecap,
} from "../contracts/attendance.ts";
import {
  generateAttendanceCsvWithKop,
  generateAttendanceExcelHtmlWithKop,
  generateGradesExcelHtmlWithKop,
  generateGradesCsvWithKop,
} from "./exportUtils.ts";

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

  // 8. Pengujian Status Kehadiran DISPEN & Agenda Khusus (Minggu UTS, UAS, Kokurikuler)
  {
    console.log("[TEST 8] Menguji status kehadiran DISPEN & penetapan agenda pekan (UTS, UAS, Kokurikuler)...");

    // Validasi skema enum
    assert.strictEqual(AttendanceStatusSchema.parse("DISPEN"), "DISPEN", "Status DISPEN harus valid dalam skema");
    assert.strictEqual(HolidayCategorySchema.parse("UTS"), "UTS", "Kategori UTS harus valid");
    assert.strictEqual(HolidayCategorySchema.parse("UAS"), "UAS", "Kategori UAS harus valid");
    assert.strictEqual(HolidayCategorySchema.parse("KOKURIKULER"), "KOKURIKULER", "Kategori KOKURIKULER harus valid");

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

    console.log("✓ LULUS: Status DISPEN dan manajemen pekan UTS, UAS, Kokurikuler terverifikasi sempurna.");
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
    assert.ok(attendanceCsv.includes("DAFTAR HADIR SISWA KELAS 7A"), "Kop harus memuat judul daftar hadir kelas");
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
    assert.ok(attendanceExcel.includes("DAFTAR HADIR SISWA KELAS 7A"), "Excel harus memuat Kop baris 1");
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
    assert.ok(gradesExcel.includes("REKAPITULASI DAFTAR NILAI SISWA KELAS 7A"), "Kop nilai Excel harus sesuai");
    assert.ok(gradesExcel.includes("SMP NEGERI 3 CIBUNGBULANG"), "Nama sekolah di kop nilai harus sesuai");

    const gradesCsv = generateGradesCsvWithKop(
      "7A",
      mockAssessments,
      mockSummaries,
      DEFAULT_KKM
    );
    assert.ok(gradesCsv.startsWith("\uFEFF"), "CSV Nilai harus diawali UTF-8 BOM");
    assert.ok(gradesCsv.includes("REKAPITULASI DAFTAR NILAI SISWA KELAS 7A"), "Kop nilai CSV harus sesuai");

    console.log("✓ LULUS: Ekspor berkas presensi dan nilai dengan Kop Surat resmi SMPN 3 Cibungbulang terverifikasi 100%.");
  }

  console.log("\n=== SEMUA ASSERTION SMOKE TEST LULUS 100% ===");
}



runSmokeTest();
