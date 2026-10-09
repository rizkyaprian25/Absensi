import type {
  Class,
  HolidayItem,
  StudentMonthlyRecap,
  AttendanceSession,
} from "../contracts/attendance";
import type {
  AssessmentItem,
  StudentGradeSummary,
} from "../contracts/grades";
import { formatIndonesianDate, getCategoryLabel } from "./calendarUtils";
import {
  MOCK_TEACHER_NAME,
  MOCK_TEACHER_NIP,
  MOCK_SCHOOL_NAME,
  MOCK_SUBJECT,
} from "../contracts/mocks/attendanceMocks";

export interface SchoolExportMetadata {
  schoolName?: string;
  teacherName?: string;
  teacherNip?: string;
  subject?: string;
  location?: string;
  dateStr?: string;
}

const DEFAULT_EXPORT_META: Required<SchoolExportMetadata> = {
  schoolName: MOCK_SCHOOL_NAME,
  teacherName: MOCK_TEACHER_NAME,
  teacherNip: MOCK_TEACHER_NIP,
  subject: MOCK_SUBJECT,
  location: "Cibungbulang",
  dateStr: new Date().toISOString().slice(0, 10),
};

// ============================================================================
// 1. EKSPOR REKAP PRESENSI KELAS (DENGAN KOP SURAT RESMI SEKOLAH)
// ============================================================================

/**
 * Menghasilkan konten CSV Presensi Bulanan dengan Kop Surat Resmi
 */
export function generateAttendanceCsvWithKop(
  currentClass: Class,
  monthLabel: string,
  effectiveDates: string[],
  students: StudentMonthlyRecap[],
  holidays: HolidayItem[] = [],
  meta: SchoolExportMetadata = {},
  sessions: AttendanceSession[] = []
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const holidayDatesMap = new Map(holidays.map((h) => [h.date, h]));

  const rows: string[] = [];

  // --- KOP SURAT RESMI SEKOLAH ---
  rows.push(`"DAFTAR HADIR SISWA KELAS ${currentClass.name.toUpperCase()}"`);
  rows.push(`"${mergedMeta.schoolName.toUpperCase()} KABUPATEN BOGOR"`);
  rows.push(`"TAHUN PELAJARAN ${currentClass.academicYear}"`);
  rows.push(`"Mata Pelajaran: ${currentClass.subject || mergedMeta.subject} | Semester: ${currentClass.semester ?? 1}"`);
  rows.push(`"Bulan: ${monthLabel.toUpperCase()}"`);
  rows.push("");

  // --- HEADER KOLOM ---
  const headerCols: string[] = [
    "No",
    "NIPD / NIS",
    "Nama Siswa",
    "L/P",
    ...effectiveDates.map((d) => {
      const hol = holidayDatesMap.get(d);
      return hol ? `"${d.slice(8)} (${hol.category === "UTS" ? "UTS" : hol.category === "UAS" ? "UAS" : hol.category === "KOKURIKULER" ? "P5" : "L"})"` : `"${d.slice(8)}"`;
    }),
    "Hadir",
    "Sakit",
    "Izin",
    "Alpa",
    "Dispen",
    "Total Pertemuan",
    "% Kehadiran",
  ];
  rows.push(headerCols.join(","));

  // --- BARIS DATA SISWA ---
  let countL = 0;
  let countP = 0;
  let totalHadirAll = 0;
  let totalSakitAll = 0;
  let totalIzinAll = 0;
  let totalAlpaAll = 0;
  let totalDispenAll = 0;

  students.forEach((s, idx) => {
    // Estimasi jenis kelamin dari data atau nama jika tidak ada
    const dailyCols = effectiveDates.map((date) => {
      const raw = String(s.dailyStatus[date] ?? "-");
      if (raw === "HADIR") return "H";
      if (raw === "SAKIT") return "S";
      if (raw === "IZIN") return "I";
      if (raw === "ALPA") return "A";
      if (raw === "DISPEN") return "D";
      if (raw === "TERLAMBAT") return "T";
      return raw;
    });

    totalHadirAll += s.hadir;
    totalSakitAll += s.sakit;
    totalIzinAll += s.izin;
    totalAlpaAll += s.alpa;
    totalDispenAll += s.dispen ?? 0;

    const rowCols = [
      String(idx + 1),
      `"${s.nis ?? "-"}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.gender ?? "-"}"`,
      ...dailyCols.map((c) => `"${c}"`),
      String(s.hadir),
      String(s.sakit),
      String(s.izin),
      String(s.alpa),
      String(s.dispen ?? 0),
      String(s.totalHari),
      `"${s.persentaseKehadiran}%"`,
    ];
    rows.push(rowCols.join(","));
  });

  // --- REKAPITULASI BAWAH ---
  rows.push("");
  const totalStudents = students.length;
  const avgAttendance =
    totalStudents > 0
      ? (
          students.reduce((acc, curr) => acc + curr.persentaseKehadiran, 0) /
          totalStudents
        ).toFixed(1)
      : "100.0";

  rows.push(`"","","JUMLAH TOTAL","","${effectiveDates.map(() => '""').join(",")}",${totalHadirAll},${totalSakitAll},${totalIzinAll},${totalAlpaAll},${totalDispenAll},"${totalStudents} Siswa","${avgAttendance}%"`);
  rows.push("");

  // --- TITIMANGSA & BLOK TANDA TANGAN ---
  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);
  rows.push(`"Mengetahui,","","","","${effectiveDates.map(() => '""').join(",")}"`);
  rows.push(`"Kepala Sekolah,","","","","${effectiveDates.map(() => '""').join(",")}","${mergedMeta.location}, ${formattedToday}"`);
  rows.push(`"","","","","${effectiveDates.map(() => '""').join(",")}","Guru Mata Pelajaran,"`);
  rows.push(`""`);
  rows.push(`""`);
  rows.push(`"( ............................................ )","","","","${effectiveDates.map(() => '""').join(",")}","${mergedMeta.teacherName}"`);
  rows.push(`"NIP. ........................................","","","","${effectiveDates.map(() => '""').join(",")}","NIP. ${mergedMeta.teacherNip}"`);

  // --- JURNAL AGENDA PEMBELAJARAN (KBM) ---
  if (sessions && sessions.length > 0) {
    rows.push("");
    rows.push("");
    rows.push(`"JURNAL AGENDA PEMBELAJARAN (KBM) - KELAS ${currentClass.name.toUpperCase()}"`);
    rows.push(`"Bulan: ${monthLabel.toUpperCase()}"`);
    rows.push(`"No.","Hari / Tanggal","Status / Kategori","Materi / Pokok Bahasan","Uraian Kegiatan & Catatan Guru"`);

    effectiveDates.forEach((d, idx) => {
      const sess = sessions.find((s) => s.classId === currentClass.id && s.sessionDate === d);
      const hol = holidayDatesMap.get(d);
      let statusStr = "KBM Aktif";
      if (hol) {
        statusStr = hol.category === "UTS" ? "Pekan UTS" : hol.category === "UAS" ? "Pekan UAS" : hol.category === "KOKURIKULER" ? "Kokurikuler (P5)" : `Libur: ${hol.name}`;
      }
      const topicStr = sess?.topic ? sess.topic.replace(/"/g, '""') : "-";
      const actStr = sess?.learningActivities ? sess.learningActivities.replace(/"/g, '""') : "-";
      rows.push(`"${idx + 1}","${formatIndonesianDate(d)}","${statusStr}","${topicStr}","${actStr}"`);
    });
  }

  return "\uFEFF" + rows.join("\r\n");
}

/**
 * Menghasilkan berkas Excel (.xls) terformat dengan Kop Surat, border, warna sel, dan tanda tangan
 */
export function generateAttendanceExcelHtmlWithKop(
  currentClass: Class,
  monthLabel: string,
  effectiveDates: string[],
  students: StudentMonthlyRecap[],
  holidays: HolidayItem[] = [],
  meta: SchoolExportMetadata = {},
  sessions: AttendanceSession[] = []
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const holidayDatesMap = new Map(holidays.map((h) => [h.date, h]));
  const totalCols = 4 + effectiveDates.length + 7;

  let totalHadirAll = 0;
  let totalSakitAll = 0;
  let totalIzinAll = 0;
  let totalAlpaAll = 0;
  let totalDispenAll = 0;

  const studentRowsHtml = students
    .map((s, idx) => {
      totalHadirAll += s.hadir;
      totalSakitAll += s.sakit;
      totalIzinAll += s.izin;
      totalAlpaAll += s.alpa;
      totalDispenAll += s.dispen ?? 0;

      const dailyCells = effectiveDates
        .map((date) => {
          const raw = String(s.dailyStatus[date] ?? "-");
          let code = raw;
          if (raw === "HADIR") code = "H";
          else if (raw === "SAKIT") code = "S";
          else if (raw === "IZIN") code = "I";
          else if (raw === "ALPA") code = "A";
          else if (raw === "DISPEN") code = "D";
          else if (raw === "TERLAMBAT") code = "T";

          let cellStyle = "text-align: center; font-weight: bold;";
          if (code === "H") cellStyle += " background-color: #E2EFDA; color: #146C43;";
          else if (code === "S") cellStyle += " background-color: #DDEBF7; color: #1F5A9E;";
          else if (code === "I") cellStyle += " background-color: #FFF2CC; color: #8F5A0C;";
          else if (code === "A") cellStyle += " background-color: #F8CBAD; color: #A82A24;";
          else if (code === "D") cellStyle += " background-color: #E8D5F5; color: #4F46E5;";
          else if (code === "L") cellStyle += " background-color: #F2F2F2; color: #595959;";
          else cellStyle += " color: #999999;";

          return `<td style="${cellStyle}">${code}</td>`;
        })
        .join("");

      return `<tr>
        <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="text-align: center; font-family: monospace;">${s.nis ?? "-"}</td>
        <td style="text-align: left; font-weight: 500;">${s.fullName}</td>
        <td style="text-align: center;">${s.gender ?? "-"}</td>
        ${dailyCells}
        <td style="text-align: center; font-weight: bold; background-color: #F0FDF4;">${s.hadir}</td>
        <td style="text-align: center; font-weight: bold; background-color: #EFF6FF;">${s.sakit}</td>
        <td style="text-align: center; font-weight: bold; background-color: #FEFCE8;">${s.izin}</td>
        <td style="text-align: center; font-weight: bold; background-color: #FEF2F2;">${s.alpa}</td>
        <td style="text-align: center; font-weight: bold; background-color: #EEF2FF;">${s.dispen ?? 0}</td>
        <td style="text-align: center; font-weight: bold;">${s.totalHari}</td>
        <td style="text-align: center; font-weight: bold; ${s.needsAttention ? "color: #A82A24; background-color: #FEE2E2;" : "color: #146C43;"}">${s.persentaseKehadiran}%</td>
      </tr>`;
    })
    .join("");

  const avgAttendance =
    students.length > 0
      ? (
          students.reduce((acc, curr) => acc + curr.persentaseKehadiran, 0) /
          students.length
        ).toFixed(1)
      : "100.0";

  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);

  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Absen Kelas ${currentClass.name}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1B1F1D; }
    table { border-collapse: collapse; width: 100%; }
    .kop-1 { font-size: 14pt; font-weight: bold; text-align: center; }
    .kop-2 { font-size: 12pt; font-weight: bold; text-align: center; }
    .kop-3 { font-size: 11pt; font-weight: bold; text-align: center; }
    .kop-info { font-size: 10pt; text-align: center; color: #4B5563; }
    th { border: 1px solid #333333; background-color: #E2EFDA; padding: 6px 4px; font-size: 9pt; font-weight: bold; text-align: center; }
    td { border: 1px solid #666666; padding: 4px 6px; font-size: 9pt; vertical-align: middle; }
    .no-border { border: none !important; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="${totalCols}" class="kop-1 no-border">DAFTAR HADIR SISWA KELAS ${currentClass.name.toUpperCase()}</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-2 no-border">${mergedMeta.schoolName.toUpperCase()} KABUPATEN BOGOR</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-3 no-border">TAHUN PELAJARAN ${currentClass.academicYear}</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-info no-border">
        Mata Pelajaran: <strong>${currentClass.subject || mergedMeta.subject}</strong> | Semester: <strong>${currentClass.semester ?? 1} (Ganjil)</strong> | Bulan: <strong>${monthLabel}</strong>
      </td>
    </tr>
    <tr><td colspan="${totalCols}" class="no-border" style="height: 12px;"></td></tr>

    <thead>
      <tr>
        <th style="width: 35px;">NO</th>
        <th style="width: 100px;">NIPD / NIS</th>
        <th style="width: 220px; text-align: left; padding-left: 8px;">NAMA SISWA</th>
        <th style="width: 40px;">L/P</th>
        ${effectiveDates
          .map((d) => {
            const hol = holidayDatesMap.get(d);
            const isSpecial = hol?.category === "UTS" || hol?.category === "UAS" || hol?.category === "KOKURIKULER";
            const label = hol
              ? `${d.slice(8)}<br/><span style="font-size: 7pt; color: ${isSpecial ? "#6B21A8" : "#A82A24"};">${hol.category === "UTS" ? "UTS" : hol.category === "UAS" ? "UAS" : hol.category === "KOKURIKULER" ? "P5" : "LIBUR"}</span>`
              : d.slice(8);
            const bgCol = hol ? (isSpecial ? "#F3E8FF" : "#FEE2E2") : "#E2EFDA";
            return `<th style="width: 32px; background-color: ${bgCol};">${label}</th>`;
          })
          .join("")}
        <th style="width: 32px; background-color: #D1FAE5; color: #065F46;">H</th>
        <th style="width: 32px; background-color: #DBEAFE; color: #1E40AF;">S</th>
        <th style="width: 32px; background-color: #FEF3C7; color: #92400E;">I</th>
        <th style="width: 32px; background-color: #FEE2E2; color: #991B1B;">A</th>
        <th style="width: 32px; background-color: #EDE9FE; color: #5B21B6;">D</th>
        <th style="width: 45px; background-color: #F3F4F6;">JML</th>
        <th style="width: 55px; background-color: #F3F4F6;">%</th>
      </tr>
    </thead>
    <tbody>
      ${studentRowsHtml}
      <tr style="background-color: #F9FAFB; font-weight: bold;">
        <td colspan="4" style="text-align: center;">JUMLAH TOTAL REKAPITULASI</td>
        <td colspan="${effectiveDates.length}" style="text-align: center; color: #6B7280; font-size: 8pt;">-</td>
        <td style="text-align: center; color: #065F46;">${totalHadirAll}</td>
        <td style="text-align: center; color: #1E40AF;">${totalSakitAll}</td>
        <td style="text-align: center; color: #92400E;">${totalIzinAll}</td>
        <td style="text-align: center; color: #991B1B;">${totalAlpaAll}</td>
        <td style="text-align: center; color: #5B21B6;">${totalDispenAll}</td>
        <td style="text-align: center;">${students.length}</td>
        <td style="text-align: center; color: #065F46;">${avgAttendance}%</td>
      </tr>
    </tbody>
  </table>

  <br/><br/>

  <!-- BLOK TANDA TANGAN (KOP BAWAH) -->
  <table style="width: 100%; border: none;">
    <tr>
      <td colspan="4" class="no-border" style="width: 50%; text-align: left; padding-left: 20px;">
        Mengetahui,<br/>
        Kepala ${mergedMeta.schoolName}<br/><br/><br/><br/>
        <strong>( ............................................................ )</strong><br/>
        NIP. ........................................................
      </td>
      <td colspan="${Math.max(1, totalCols - 4)}" class="no-border" style="width: 50%; text-align: right; padding-right: 30px;">
        ${mergedMeta.location}, ${formattedToday}<br/>
        Guru Mata Pelajaran Informatika,<br/><br/><br/><br/>
        <strong><u>${mergedMeta.teacherName}</u></strong><br/>
        NIP. ${mergedMeta.teacherNip}
      </td>
    </tr>
  </table>

  ${sessions && sessions.length > 0 ? `
  <br/><br/>
  <!-- JURNAL AGENDA PEMBELAJARAN (KBM) -->
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <th colspan="5" style="background-color: #0D9488; color: #FFFFFF; font-size: 11pt; padding: 8px; text-align: left;">
        JURNAL AGENDA PEMBELAJARAN (KBM) - KELAS ${currentClass.name.toUpperCase()} (BULAN ${monthLabel.toUpperCase()})
      </th>
    </tr>
    <tr>
      <th style="width: 40px; background-color: #CCFBF1; color: #0F766E;">NO</th>
      <th style="width: 130px; background-color: #CCFBF1; color: #0F766E;">HARI &amp; TANGGAL</th>
      <th style="width: 130px; background-color: #CCFBF1; color: #0F766E;">STATUS / KEGIATAN</th>
      <th style="width: 260px; background-color: #CCFBF1; color: #0F766E;">MATERI / POKOK BAHASAN</th>
      <th style="background-color: #CCFBF1; color: #0F766E;">URAIAN KEGIATAN &amp; CATATAN GURU</th>
    </tr>
    ${effectiveDates
      .map((d, idx) => {
        const sess = sessions.find((s) => s.classId === currentClass.id && s.sessionDate === d);
        const hol = holidayDatesMap.get(d);
        const isSpecial = hol?.category === "UTS" || hol?.category === "UAS" || hol?.category === "KOKURIKULER";
        let statusBadge = "KBM Normal";
        let statusStyle = "color: #065F46; font-weight: bold;";
        if (hol) {
          if (isSpecial) {
            statusBadge = hol.category === "UTS" ? "Pekan UTS" : hol.category === "UAS" ? "Pekan UAS" : "Kokurikuler (P5)";
            statusStyle = "color: #6B21A8; font-weight: bold;";
          } else {
            statusBadge = `Libur: ${hol.name}`;
            statusStyle = "color: #991B1B; font-weight: bold;";
          }
        }
        const topicText = sess?.topic || `<span style="color: #9CA3AF; font-style: italic;">Belum ada catatan materi</span>`;
        const actText = sess?.learningActivities || `<span style="color: #9CA3AF; font-style: italic;">-</span>`;

        return `<tr>
          <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
          <td style="text-align: center;">${formatIndonesianDate(d)}</td>
          <td style="${statusStyle}">${statusBadge}</td>
          <td style="font-weight: 500;">${topicText}</td>
          <td style="color: #374151;">${actText}</td>
        </tr>`;
      })
      .join("")}
  </table>
  ` : ""}
</body>
</html>
`;
}

// ============================================================================
// 2. EKSPOR BUKU NILAI & ASESMEN (DENGAN KOP SURAT RESMI SEKOLAH)
// ============================================================================

/**
 * Menghasilkan berkas Excel (.xls) terformat untuk Rekap Nilai Siswa
 */
export function generateGradesExcelHtmlWithKop(
  className: string,
  assessments: AssessmentItem[],
  summaries: StudentGradeSummary[],
  kkm: number,
  meta: SchoolExportMetadata = {}
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const totalCols = 4 + assessments.length + 3;

  const studentRowsHtml = summaries
    .map((s, idx) => {
      const scoreCells = assessments
        .map((a) => {
          const sc = s.scores[a.id];
          const isUnderKkm = sc !== null && sc !== undefined && sc < kkm;
          return `<td style="text-align: center; font-family: monospace; ${
            isUnderKkm ? "background-color: #FEF3C7; color: #B45309; font-weight: bold;" : ""
          }">${sc !== null && sc !== undefined ? sc : "-"}</td>`;
        })
        .join("");

      return `<tr>
        <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="text-align: center; font-family: monospace;">${s.nis ?? "-"}</td>
        <td style="text-align: left; font-weight: 500;">${s.studentName}</td>
        <td style="text-align: center;">${s.gender ?? "-"}</td>
        ${scoreCells}
        <td style="text-align: center; font-weight: bold; font-family: monospace; ${
          s.finalScore !== null && s.finalScore < kkm ? "color: #B45309;" : "color: #146C43;"
        }">${s.finalScore !== null ? s.finalScore : "-"}</td>
        <td style="text-align: center; font-weight: bold;">${s.predicate}</td>
        <td style="text-align: center; font-weight: bold; ${
          s.isPassed ? "color: #146C43; background-color: #F0FDF4;" : "color: #B45309; background-color: #FEF3C7;"
        }">${s.isPassed ? "Tuntas" : "Remedial"}</td>
      </tr>`;
    })
    .join("");

  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);

  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1B1F1D; }
    table { border-collapse: collapse; width: 100%; }
    .kop-1 { font-size: 14pt; font-weight: bold; text-align: center; }
    .kop-2 { font-size: 12pt; font-weight: bold; text-align: center; }
    .kop-3 { font-size: 11pt; font-weight: bold; text-align: center; }
    .kop-info { font-size: 10pt; text-align: center; color: #4B5563; }
    th { border: 1px solid #333333; background-color: #E2EFDA; padding: 6px 4px; font-size: 9pt; font-weight: bold; text-align: center; }
    td { border: 1px solid #666666; padding: 4px 6px; font-size: 9pt; vertical-align: middle; }
    .no-border { border: none !important; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="${totalCols}" class="kop-1 no-border">REKAPITULASI DAFTAR NILAI SISWA KELAS ${className.toUpperCase()}</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-2 no-border">${mergedMeta.schoolName.toUpperCase()} KABUPATEN BOGOR</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-3 no-border">TAHUN PELAJARAN 2026/2027</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-info no-border">
        Mata Pelajaran: <strong>${mergedMeta.subject}</strong> | KKM Standar: <strong>${kkm}</strong>
      </td>
    </tr>
    <tr><td colspan="${totalCols}" class="no-border" style="height: 12px;"></td></tr>

    <thead>
      <tr>
        <th style="width: 35px;">NO</th>
        <th style="width: 100px;">NIS</th>
        <th style="width: 220px; text-align: left; padding-left: 8px;">NAMA SISWA</th>
        <th style="width: 40px;">L/P</th>
        ${assessments
          .map(
            (a) =>
              `<th style="width: 70px;">${a.title}<br/><span style="font-size: 8pt; color: #4B5563;">[${a.type}]</span></th>`
          )
          .join("")}
        <th style="width: 60px; background-color: #D1FAE5; color: #065F46;">NILAI AKHIR</th>
        <th style="width: 50px; background-color: #F3F4F6;">PREDIKAT</th>
        <th style="width: 75px; background-color: #F3F4F6;">STATUS KKM</th>
      </tr>
    </thead>
    <tbody>
      ${studentRowsHtml}
    </tbody>
  </table>

  <br/><br/>

  <table style="width: 100%; border: none;">
    <tr>
      <td colspan="4" class="no-border" style="width: 50%; text-align: left; padding-left: 20px;">
        Mengetahui,<br/>
        Kepala ${mergedMeta.schoolName}<br/><br/><br/><br/>
        <strong>( ............................................................ )</strong><br/>
        NIP. ........................................................
      </td>
      <td colspan="${Math.max(1, totalCols - 4)}" class="no-border" style="width: 50%; text-align: right; padding-right: 30px;">
        ${mergedMeta.location}, ${formattedToday}<br/>
        Guru Mata Pelajaran Informatika,<br/><br/><br/><br/>
        <strong><u>${mergedMeta.teacherName}</u></strong><br/>
        NIP. ${mergedMeta.teacherNip}
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Menghasilkan berkas CSV terformat dengan Kop Surat Resmi untuk Rekap Nilai Siswa
 */
export function generateGradesCsvWithKop(
  className: string,
  assessments: AssessmentItem[],
  summaries: StudentGradeSummary[],
  kkm: number,
  meta: SchoolExportMetadata = {}
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const rows: string[] = [];

  // Kop Surat Resmi Sekolah
  rows.push(`"REKAPITULASI DAFTAR NILAI SISWA KELAS ${className.toUpperCase()}"`);
  rows.push(`"${mergedMeta.schoolName.toUpperCase()} KABUPATEN BOGOR"`);
  rows.push(`"TAHUN PELAJARAN 2026/2027"`);
  rows.push(`"Mata Pelajaran: ${mergedMeta.subject} | KKM Standar: ${kkm}"`);
  rows.push("");

  // Header Kolom
  const headerCols = ["No", "NIS", "Nama Siswa", "L/P"];
  assessments.forEach((a) => {
    headerCols.push(`"${a.title.replace(/"/g, '""')} (${a.type})"`);
  });
  headerCols.push("Nilai Akhir", "Predikat", "Status KKM");
  rows.push(headerCols.join(","));

  // Baris Siswa
  summaries.forEach((s, idx) => {
    const rowCols: string[] = [
      String(idx + 1),
      `"${s.nis ?? "-"}"`,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.gender ?? "-"}"`,
    ];

    assessments.forEach((a) => {
      const val = s.scores[a.id];
      rowCols.push(val !== null && val !== undefined ? String(val) : '""');
    });

    rowCols.push(s.finalScore !== null && s.finalScore !== undefined ? String(s.finalScore) : '""');
    rowCols.push(`"${s.predicate}"`);
    rowCols.push(s.isPassed ? '"Tuntas"' : '"Remedial"');

    rows.push(rowCols.join(","));
  });

  // Titimangsa & Blok Tanda Tangan
  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);
  rows.push("");
  rows.push(`"Mengetahui,","","","","${assessments.map(() => '""').join(",")}"`);
  rows.push(`"Kepala Sekolah,","","","","${assessments.map(() => '""').join(",")}","${mergedMeta.location}, ${formattedToday}"`);
  rows.push(`"","","","","${assessments.map(() => '""').join(",")}","Guru Mata Pelajaran,"`);
  rows.push(`""`);
  rows.push(`""`);
  rows.push(`"( ............................................ )","","","","${assessments.map(() => '""').join(",")}","${mergedMeta.teacherName}"`);
  rows.push(`"NIP. ........................................","","","","${assessments.map(() => '""').join(",")}","NIP. ${mergedMeta.teacherNip}"`);

  return "\uFEFF" + rows.join("\r\n");
}

