import type {
  Class,
  HolidayItem,
  StudentMonthlyRecap,
  AttendanceSession,
  StudentSemesterRecap,
  SemesterClassRecap,
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
import XLSX from "xlsx-js-style";
import { LOGO_SMPN3_BASE64 } from "../assets/logoBase64";

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

/**
 * Mengubah nama kelas seperti "7C", "7 C", "Kelas 7-C", "8B", dsb.
 * menjadi format romawi resmi sekolah: "VII / C", "VIII / B", "IX / A".
 */
export function formatClassRoman(className: string): string {
  if (!className) return "";
  const cleaned = className.trim();

  // Jika sudah berformat "VII / C" atau sejenisnya
  const romanSlashMatch = cleaned.match(/^(?:kelas\s*)?([ivxlcdm]+)\s*\/\s*([a-zA-Z0-9]+)$/i);
  if (romanSlashMatch) {
    return `${romanSlashMatch[1].toUpperCase()} / ${romanSlashMatch[2].toUpperCase()}`;
  }

  // Tangkap angka (7-12) atau romawi, dan bagian rombel (A-Z, angka rombel, dsb.)
  const match = cleaned.match(/^(?:kelas\s*)?([0-9]+|[ivxlcdm]+)\s*[-_\s/]?\s*([a-zA-Z0-9]+)?$/i);
  if (!match) return cleaned.toUpperCase();

  let grade = match[1].toUpperCase();
  const section = (match[2] || "").toUpperCase();

  const romanMap: Record<string, string> = {
    "1": "I",
    "2": "II",
    "3": "III",
    "4": "IV",
    "5": "V",
    "6": "VI",
    "7": "VII",
    "8": "VIII",
    "9": "IX",
    "10": "X",
    "11": "XI",
    "12": "XII",
  };

  if (romanMap[grade]) {
    grade = romanMap[grade];
  }

  if (section) {
    return `${grade} / ${section}`;
  }
  return grade;
}

/**
 * Menstandarkan nama sekolah dan memastikan kabupaten tercantum resmi
 */
export function getSchoolNameWithKabupaten(schoolName?: string): string {
  const upper = (schoolName || MOCK_SCHOOL_NAME).toUpperCase().trim();
  if (upper.includes("KABUPATEN") || upper.includes("KAB.")) {
    return upper;
  }
  return `${upper} KABUPATEN BOGOR`;
}

/**
 * Pengaturan Margin Cetak Resmi (sesuai spesifikasi foto pengaturan halaman):
 * - Top: 1,1 cm (0.433 in)
 * - Bottom: 1,1 cm (0.433 in)
 * - Left: 0,6 cm (0.236 in)
 * - Right: 0,7 cm (0.276 in)
 * - Header: 0,8 cm (0.315 in)
 * - Footer: 0,8 cm (0.315 in)
 * Nilai disimpan dalam satuan inci (standar OpenXML / xlsx-js-style)
 */
export const OFFICIAL_PAGE_MARGINS = {
  top: 1.1 / 2.54,
  bottom: 1.1 / 2.54,
  left: 0.6 / 2.54,
  right: 0.7 / 2.54,
  header: 0.8 / 2.54,
  footer: 0.8 / 2.54,
};

/**
 * Pengaturan Format Kertas Resmi:
 * Ukuran: 21.59 cm x 33.02 cm (Folio / F4 / US Folio / OpenXML paperSize: 14)
 * Orientasi default: Landscape (horizontal untuk rekapitulasi data banyak kolom)
 */
export const OFFICIAL_PAPER_SETUP = {
  paperSize: 14, // 14 = Folio 8.5 x 13 inci (21.59 cm x 33.02 cm / F4)
  orientation: "landscape",
  fitToWidth: 1,
  fitToHeight: 1,
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
  rows.push(`"DAFTAR HADIR SISWA KELAS ${formatClassRoman(currentClass.name)}"`);
  rows.push(`"${getSchoolNameWithKabupaten(mergedMeta.schoolName)}"`);
  rows.push(`"TAHUN PELAJARAN ${currentClass.academicYear || "2026/2027"}"`);
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
    @page {
      size: 21.59cm 33.02cm landscape;
      margin: 1.1cm 0.7cm 1.1cm 0.6cm;
      mso-page-orientation: landscape;
      mso-header-margin: 0.315in;
      mso-footer-margin: 0.315in;
    }
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
      <td colspan="${totalCols}" class="kop-1 no-border">DAFTAR HADIR SISWA KELAS ${formatClassRoman(currentClass.name)}</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-2 no-border">${getSchoolNameWithKabupaten(mergedMeta.schoolName)}</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-3 no-border">TAHUN PELAJARAN ${currentClass.academicYear || "2026/2027"}</td>
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
// KONFIGURASI STYLE & PALET WARNA RESMI OPENXML SPREADSHEET (.XLSX)
// ============================================================================

const borderThin = {
  top: { style: "thin", color: { rgb: "C4C8D0" } },
  bottom: { style: "thin", color: { rgb: "C4C8D0" } },
  left: { style: "thin", color: { rgb: "C4C8D0" } },
  right: { style: "thin", color: { rgb: "C4C8D0" } },
};

const borderHeader = {
  top: { style: "thin", color: { rgb: "333333" } },
  bottom: { style: "medium", color: { rgb: "333333" } },
  left: { style: "thin", color: { rgb: "666666" } },
  right: { style: "thin", color: { rgb: "666666" } },
};

const styleKop1 = {
  font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "111827" } },
  alignment: { horizontal: "center", vertical: "center" },
};

const styleKop2 = {
  font: { name: "Calibri", sz: 12, bold: true, color: { rgb: "111827" } },
  alignment: { horizontal: "center", vertical: "center" },
};

const styleKop3 = {
  font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "374151" } },
  alignment: { horizontal: "center", vertical: "center" },
};

const styleKopInfo = {
  font: { name: "Calibri", sz: 10, italic: true, color: { rgb: "4B5563" } },
  alignment: { horizontal: "center", vertical: "center" },
};

const styleThDefault = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "111827" } },
  fill: { fgColor: { rgb: "E2EFDA" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleThSpecial = {
  font: { name: "Calibri", sz: 8, bold: true, color: { rgb: "581C87" } },
  fill: { fgColor: { rgb: "F3E8FF" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleThHoliday = {
  font: { name: "Calibri", sz: 8, bold: true, color: { rgb: "991B1B" } },
  fill: { fgColor: { rgb: "FEE2E2" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleCellText = {
  font: { name: "Calibri", sz: 9, color: { rgb: "111827" } },
  border: borderThin,
  alignment: { horizontal: "left", vertical: "center" },
};

const styleCellCenter = {
  font: { name: "Calibri", sz: 9, color: { rgb: "111827" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleCellCenterBold = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "111827" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleStatusH = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "166534" } },
  fill: { fgColor: { rgb: "DCFCE7" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleStatusS = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "1E40AF" } },
  fill: { fgColor: { rgb: "DBEAFE" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleStatusI = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "854D0E" } },
  fill: { fgColor: { rgb: "FEF9C3" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleStatusA = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "991B1B" } },
  fill: { fgColor: { rgb: "FEE2E2" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleStatusD = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "4338CA" } },
  fill: { fgColor: { rgb: "EEF2FF" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleStatusL = {
  font: { name: "Calibri", sz: 9, color: { rgb: "6B7280" } },
  fill: { fgColor: { rgb: "F3F4F6" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

/**
 * Menghasilkan berkas Excel murni (.xlsx) berstandar OpenXML terformat dengan Kop Surat Resmi,
 * warna sel status presensi, rekapitulasi siswa, dan jurnal agenda KBM.
 */
export function generateAttendanceXlsxWithKop(
  currentClass: Class,
  monthLabel: string,
  effectiveDates: string[],
  students: StudentMonthlyRecap[],
  holidays: HolidayItem[] = [],
  meta: SchoolExportMetadata = {},
  sessions: AttendanceSession[] = []
): Uint8Array {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const holidayDatesMap = new Map(holidays.map((h) => [h.date, h]));
  const totalCols = 4 + effectiveDates.length + 7;

  const rows: any[][] = [];
  const merges: any[] = [];

  // 1. KOP SURAT RESMI SEKOLAH
  rows.push([{ v: `DAFTAR HADIR SISWA KELAS ${formatClassRoman(currentClass.name)}`, t: "s", s: styleKop1 }]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  rows.push([{ v: getSchoolNameWithKabupaten(mergedMeta.schoolName), t: "s", s: styleKop2 }]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });

  rows.push([{ v: `TAHUN PELAJARAN ${currentClass.academicYear || "2026/2027"}`, t: "s", s: styleKop3 }]);
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } });

  rows.push([{
    v: `Mata Pelajaran: ${currentClass.subject || mergedMeta.subject} | Semester: ${currentClass.semester ?? 1} (Ganjil) | Bulan: ${monthLabel}`,
    t: "s",
    s: styleKopInfo,
  }]);
  merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } });

  rows.push([]); // Baris kosong pemisah

  // 2. HEADER TABEL PRESENSI
  const headerRow: any[] = [
    { v: "NO", t: "s", s: styleThDefault },
    { v: "NIPD / NIS", t: "s", s: styleThDefault },
    { v: "NAMA SISWA", t: "s", s: styleThDefault },
    { v: "L/P", t: "s", s: styleThDefault },
  ];

  effectiveDates.forEach((d) => {
    const hol = holidayDatesMap.get(d);
    if (hol) {
      const isSpecial = hol.category === "UTS" || hol.category === "UAS" || hol.category === "KOKURIKULER";
      const catLabel = hol.category === "UTS" ? "UTS" : hol.category === "UAS" ? "UAS" : hol.category === "KOKURIKULER" ? "P5" : "LIBUR";
      headerRow.push({
        v: `${d.slice(8)}\n(${catLabel})`,
        t: "s",
        s: isSpecial ? styleThSpecial : styleThHoliday,
      });
    } else {
      headerRow.push({
        v: d.slice(8),
        t: "s",
        s: styleThDefault,
      });
    }
  });

  headerRow.push(
    { v: "Hadir", t: "s", s: styleStatusH },
    { v: "Sakit", t: "s", s: styleStatusS },
    { v: "Izin", t: "s", s: styleStatusI },
    { v: "Alpa", t: "s", s: styleStatusA },
    { v: "Dispen", t: "s", s: styleStatusD },
    { v: "Total", t: "s", s: styleThDefault },
    { v: "% Hadir", t: "s", s: styleThDefault }
  );

  rows.push(headerRow);

  // 3. BARIS DATA KEHADIRAN SISWA
  let sumHadir = 0;
  let sumSakit = 0;
  let sumIzin = 0;
  let sumAlpa = 0;
  let sumDispen = 0;
  let sumTotal = 0;

  students.forEach((s, idx) => {
    sumHadir += s.hadir;
    sumSakit += s.sakit;
    sumIzin += s.izin;
    sumAlpa += s.alpa;
    sumDispen += s.dispen ?? 0;
    sumTotal += s.totalHari;

    const row: any[] = [
      { v: idx + 1, t: "n", s: styleCellCenter },
      { v: s.nis ?? "-", t: "s", s: styleCellCenter },
      { v: s.fullName, t: "s", s: styleCellText },
      { v: s.gender ?? "-", t: "s", s: styleCellCenter },
    ];

    effectiveDates.forEach((date) => {
      const raw = String(s.dailyStatus[date] ?? "-");
      let code = raw;
      if (raw === "HADIR") code = "H";
      else if (raw === "SAKIT") code = "S";
      else if (raw === "IZIN") code = "I";
      else if (raw === "ALPA") code = "A";
      else if (raw === "DISPEN") code = "D";
      else if (raw === "TERLAMBAT") code = "T";

      let style = styleCellCenter;
      if (code === "H") style = styleStatusH;
      else if (code === "S") style = styleStatusS;
      else if (code === "I") style = styleStatusI;
      else if (code === "A") style = styleStatusA;
      else if (code === "D") style = styleStatusD;
      else if (code === "L") style = styleStatusL;

      row.push({ v: code, t: "s", s: style });
    });

    row.push(
      { v: s.hadir, t: "n", s: styleStatusH },
      { v: s.sakit, t: "n", s: styleStatusS },
      { v: s.izin, t: "n", s: styleStatusI },
      { v: s.alpa, t: "n", s: styleStatusA },
      { v: s.dispen ?? 0, t: "n", s: styleStatusD },
      { v: s.totalHari, t: "n", s: styleCellCenterBold },
      {
        v: `${s.persentaseKehadiran}%`,
        t: "s",
        s: s.needsAttention
          ? { ...styleStatusA, font: { ...styleStatusA.font, bold: true } }
          : styleStatusH,
      }
    );

    rows.push(row);
  });

  // 4. BARIS REKAP TOTAL KEHADIRAN KELAS
  const summaryRowIndex = rows.length;
  const summaryRow: any[] = [
    { v: "TOTAL KEHADIRAN KELAS", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
  ];
  merges.push({ s: { r: summaryRowIndex, c: 0 }, e: { r: summaryRowIndex, c: 3 } });

  effectiveDates.forEach(() => {
    summaryRow.push({ v: "-", t: "s", s: styleCellCenter });
  });

  const avgAttendance =
    students.length > 0
      ? (
          students.reduce((acc, curr) => acc + curr.persentaseKehadiran, 0) /
          students.length
        ).toFixed(1)
      : "100.0";

  summaryRow.push(
    { v: sumHadir, t: "n", s: styleCellCenterBold },
    { v: sumSakit, t: "n", s: styleCellCenterBold },
    { v: sumIzin, t: "n", s: styleCellCenterBold },
    { v: sumAlpa, t: "n", s: styleCellCenterBold },
    { v: sumDispen, t: "n", s: styleCellCenterBold },
    { v: sumTotal, t: "n", s: styleCellCenterBold },
    { v: `${avgAttendance}%`, t: "s", s: styleCellCenterBold }
  );

  rows.push(summaryRow);

  // 5. JURNAL AGENDA PEMBELAJARAN (KBM) JIKA ADA
  if (sessions.length > 0 || effectiveDates.length > 0) {
    rows.push([]);
    const agendaHeaderRowIdx = rows.length;
    rows.push([{ v: "JURNAL AGENDA PEMBELAJARAN (KBM)", t: "s", s: styleKop2 }]);
    merges.push({ s: { r: agendaHeaderRowIdx, c: 0 }, e: { r: agendaHeaderRowIdx, c: totalCols - 1 } });

    const agendaTableHeaderIdx = rows.length;
    merges.push({ s: { r: agendaTableHeaderIdx, c: 1 }, e: { r: agendaTableHeaderIdx, c: 2 } });
    merges.push({ s: { r: agendaTableHeaderIdx, c: 3 }, e: { r: agendaTableHeaderIdx, c: 4 } });
    merges.push({ s: { r: agendaTableHeaderIdx, c: 5 }, e: { r: agendaTableHeaderIdx, c: totalCols - 1 } });

    rows.push([
      { v: "NO", t: "s", s: styleThDefault },
      { v: "TANGGAL KBM", t: "s", s: styleThDefault },
      { v: "", t: "s", s: styleThDefault },
      { v: "STATUS KBM", t: "s", s: styleThDefault },
      { v: "", t: "s", s: styleThDefault },
      { v: "MATERI POKOK & URAIAN AKTIVITAS BELAJAR (KBM)", t: "s", s: styleThDefault },
    ]);

    const sessionMap = new Map(sessions.map((sess) => [sess.sessionDate, sess]));

    effectiveDates.forEach((d, idx) => {
      const hol = holidayDatesMap.get(d);
      const sess = sessionMap.get(d);
      let statusStr = "KBM Normal";
      if (hol) {
        statusStr =
          hol.category === "UTS"
            ? "Pekan UTS"
            : hol.category === "UAS"
            ? "Pekan UAS"
            : hol.category === "KOKURIKULER"
            ? "Projek P5"
            : `Libur: ${hol.name}`;
      }

      const agendaRowIdx = rows.length;
      merges.push({ s: { r: agendaRowIdx, c: 1 }, e: { r: agendaRowIdx, c: 2 } });
      merges.push({ s: { r: agendaRowIdx, c: 3 }, e: { r: agendaRowIdx, c: 4 } });
      merges.push({ s: { r: agendaRowIdx, c: 5 }, e: { r: agendaRowIdx, c: totalCols - 1 } });

      const topicAndAct = sess
        ? `${sess.topic ? `Topik: ${sess.topic}` : ""}${sess.learningActivities ? ` | Agenda: ${sess.learningActivities}` : ""}`.trim() || "-"
        : "-";

      rows.push([
        { v: idx + 1, t: "n", s: styleCellCenter },
        { v: formatIndonesianDate(d), t: "s", s: styleCellCenter },
        { v: "", t: "s", s: styleCellCenter },
        { v: statusStr, t: "s", s: styleCellCenter },
        { v: "", t: "s", s: styleCellCenter },
        { v: topicAndAct, t: "s", s: styleCellText },
      ]);
    });
  }

  // 6. BLOK TANDA TANGAN
  rows.push([]);
  rows.push([]);
  const signRow1Idx = rows.length;
  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);
  const signColRight = Math.max(5, totalCols - 4);

  merges.push({ s: { r: signRow1Idx, c: 1 }, e: { r: signRow1Idx, c: 3 } });
  merges.push({ s: { r: signRow1Idx, c: signColRight }, e: { r: signRow1Idx, c: totalCols - 1 } });

  const signRow1: any[] = [
    { v: "", t: "s" },
    { v: `Mengetahui,\nKepala ${mergedMeta.schoolName}`, t: "s", s: { alignment: { horizontal: "center", wrapText: true } } },
    { v: "", t: "s" },
    { v: "", t: "s" },
  ];
  while (signRow1.length < signColRight) signRow1.push({ v: "", t: "s" });
  signRow1.push({
    v: `${mergedMeta.location}, ${formattedToday}\nGuru Mata Pelajaran Informatika,`,
    t: "s",
    s: { alignment: { horizontal: "center", wrapText: true } },
  });
  rows.push(signRow1);

  rows.push([]);
  rows.push([]);

  const signRow2Idx = rows.length;
  merges.push({ s: { r: signRow2Idx, c: 1 }, e: { r: signRow2Idx, c: 3 } });
  merges.push({ s: { r: signRow2Idx, c: signColRight }, e: { r: signRow2Idx, c: totalCols - 1 } });

  const signRow2: any[] = [
    { v: "", t: "s" },
    { v: "( ............................................................ )\nNIP. ........................................................", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center", wrapText: true } } },
    { v: "", t: "s" },
    { v: "", t: "s" },
  ];
  while (signRow2.length < signColRight) signRow2.push({ v: "", t: "s" });
  signRow2.push({
    v: `( ${mergedMeta.teacherName} )\nNIP. ${mergedMeta.teacherNip}`,
    t: "s",
    s: { font: { bold: true }, alignment: { horizontal: "center", wrapText: true } },
  });
  rows.push(signRow2);

  // Buat worksheet dan workbook
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"] = merges;

  // Lebar kolom
  ws["!cols"] = [
    { wch: 5 },  // No
    { wch: 14 }, // NIS
    { wch: 32 }, // Nama Siswa
    { wch: 5 },  // L/P
    ...effectiveDates.map(() => ({ wch: 7 })), // Tanggal
    { wch: 8 },  // Hadir
    { wch: 8 },  // Sakit
    { wch: 8 },  // Izin
    { wch: 8 },  // Alpa
    { wch: 8 },  // Dispen
    { wch: 8 },  // Total
    { wch: 10 }, // % Hadir
  ];

  // Atur margin dan ukuran kertas folio resmi (21.59 cm x 33.02 cm)
  ws["!margins"] = OFFICIAL_PAGE_MARGINS;
  ws["!pageSetup"] = { ...OFFICIAL_PAPER_SETUP, orientation: "landscape" };

  const wb = XLSX.utils.book_new();
  const safeClassName = currentClass.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
  XLSX.utils.book_append_sheet(wb, ws, `Absensi_${safeClassName}`);

  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(arrayBuffer);
}

// ============================================================================
// 1.B EKSPOR REKAPITULASI PRESENSI KUMULATIF SEMESTER (BUKU RAPORT & LEGER)
// ============================================================================

const stylePredikatSangatBaik = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "166534" } },
  fill: { fgColor: { rgb: "DCFCE7" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const stylePredikatBaik = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "1E40AF" } },
  fill: { fgColor: { rgb: "DBEAFE" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const stylePredikatCukup = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "854D0E" } },
  fill: { fgColor: { rgb: "FEF9C3" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const stylePredikatKurang = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "991B1B" } },
  fill: { fgColor: { rgb: "FEE2E2" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleStatusT = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "C2410C" } },
  fill: { fgColor: { rgb: "FFEDD5" } },
  border: borderThin,
  alignment: { horizontal: "center", vertical: "center" },
};

const styleThHadir = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "166534" } },
  fill: { fgColor: { rgb: "DCFCE7" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleThSakit = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "1E40AF" } },
  fill: { fgColor: { rgb: "DBEAFE" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleThIzin = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "854D0E" } },
  fill: { fgColor: { rgb: "FEF9C3" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleThAlpa = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "991B1B" } },
  fill: { fgColor: { rgb: "FEE2E2" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleThTelat = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "C2410C" } },
  fill: { fgColor: { rgb: "FFEDD5" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleThDispen = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "4338CA" } },
  fill: { fgColor: { rgb: "EEF2FF" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const styleThTotal = {
  font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "0369A1" } },
  fill: { fgColor: { rgb: "E0F2FE" } },
  border: borderHeader,
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

/**
 * Menghasilkan berkas Excel murni (.xlsx) berstandar OpenXML untuk Rekapitulasi Kumulatif Semester (Format Buku Raport SMP)
 * Memuat 13 kolom langsung: No, NIS / NIPD, Nama Lengkap Siswa, L/P, Hadir, Sakit, Izin, Alpa, Telat, Dispen, Total, % Hadir, Predikat Raport
 * dengan Kop Surat Resmi, format Folio (21.59cm x 33.02cm) portrait, dan tanda tangan resmi.
 */
export function generateSemesterAttendanceXlsxWithKop(
  currentClass: Class,
  semesterRecap: SemesterClassRecap,
  meta: SchoolExportMetadata = {}
): Uint8Array {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const totalCols = 13;

  const rows: any[][] = [];
  const merges: any[] = [];

  // 1. KOP SURAT RESMI SEKOLAH
  rows.push([{
    v: `DAFTAR HADIR SISWA KUMULATIF SEMESTER ${currentClass.semester ?? 1} (GANJIL) KELAS ${formatClassRoman(currentClass.name)}`,
    t: "s",
    s: styleKop1,
  }]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  rows.push([{
    v: getSchoolNameWithKabupaten(mergedMeta.schoolName),
    t: "s",
    s: styleKop2,
  }]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });

  rows.push([{
    v: `TAHUN PELAJARAN ${currentClass.academicYear || "2026/2027"}`,
    t: "s",
    s: styleKop3,
  }]);
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } });

  rows.push([{
    v: `Mata Pelajaran: ${currentClass.subject || mergedMeta.subject} | Semester: ${currentClass.semester ?? 1} (Ganjil) | Format: Buku Raport SMP`,
    t: "s",
    s: styleKopInfo,
  }]);
  merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } });

  rows.push([]); // Baris kosong pemisah

  // 2. HEADER TABEL (13 KOLOM LANGSUNG)
  const headerRow: any[] = [
    { v: "NO", t: "s", s: styleThDefault },
    { v: "NIS / NIPD", t: "s", s: styleThDefault },
    { v: "NAMA LENGKAP SISWA", t: "s", s: styleThDefault },
    { v: "L/P", t: "s", s: styleThDefault },
    { v: "HADIR (H)", t: "s", s: styleThHadir },
    { v: "SAKIT (S)", t: "s", s: styleThSakit },
    { v: "IZIN (I)", t: "s", s: styleThIzin },
    { v: "ALPA (A)", t: "s", s: styleThAlpa },
    { v: "TELAT (T)", t: "s", s: styleThTelat },
    { v: "DISPEN (D)", t: "s", s: styleThDispen },
    { v: "TOTAL", t: "s", s: styleThTotal },
    { v: "% HADIR", t: "s", s: styleThTotal },
    { v: "PREDIKAT RAPORT", t: "s", s: styleThTotal },
  ];
  rows.push(headerRow);

  // 3. BARIS DATA SISWA
  let sumHadirSem = 0;
  let sumSakitSem = 0;
  let sumIzinSem = 0;
  let sumAlpaSem = 0;
  let sumTelatSem = 0;
  let sumDispenSem = 0;
  let sumTotalSem = 0;

  semesterRecap.students.forEach((s, idx) => {
    sumHadirSem += s.totalHadir;
    sumSakitSem += s.totalSakit;
    sumIzinSem += s.totalIzin;
    sumAlpaSem += s.totalAlpa;
    sumTelatSem += s.totalTerlambat;
    sumDispenSem += s.totalDispen;
    sumTotalSem += s.totalHari;

    let predStyle = stylePredikatBaik;
    if (s.predikat === "Sangat Baik") predStyle = stylePredikatSangatBaik;
    else if (s.predikat === "Cukup") predStyle = stylePredikatCukup;
    else if (s.predikat === "Kurang") predStyle = stylePredikatKurang;

    const row: any[] = [
      { v: idx + 1, t: "n", s: styleCellCenter },
      { v: s.nis ?? "-", t: "s", s: styleCellCenter },
      { v: s.fullName, t: "s", s: styleCellText },
      { v: s.gender ?? "-", t: "s", s: styleCellCenter },
      { v: s.totalHadir, t: "n", s: styleStatusH },
      { v: s.totalSakit, t: "n", s: styleStatusS },
      { v: s.totalIzin, t: "n", s: styleStatusI },
      { v: s.totalAlpa, t: "n", s: styleStatusA },
      { v: s.totalTerlambat, t: "n", s: styleStatusT },
      { v: s.totalDispen, t: "n", s: styleStatusD },
      { v: s.totalHari, t: "n", s: styleCellCenterBold },
      {
        v: `${s.persentaseSemester}%`,
        t: "s",
        s: s.needsAttention
          ? { ...styleStatusA, font: { ...styleStatusA.font, bold: true } }
          : styleStatusH,
      },
      { v: s.predikat, t: "s", s: predStyle },
    ];

    rows.push(row);
  });

  // 4. BARIS TOTAL KEHADIRAN KELAS
  const summaryRowIdx = rows.length;
  const summaryRow: any[] = [
    { v: "JUMLAH TOTAL KEHADIRAN KELAS", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
    { v: sumHadirSem, t: "n", s: styleCellCenterBold },
    { v: sumSakitSem, t: "n", s: styleCellCenterBold },
    { v: sumIzinSem, t: "n", s: styleCellCenterBold },
    { v: sumAlpaSem, t: "n", s: styleCellCenterBold },
    { v: sumTelatSem, t: "n", s: styleCellCenterBold },
    { v: sumDispenSem, t: "n", s: styleCellCenterBold },
    { v: sumTotalSem, t: "n", s: styleCellCenterBold },
    { v: `${semesterRecap.averageAttendance}%`, t: "s", s: styleCellCenterBold },
    { v: "-", t: "s", s: styleCellCenterBold },
  ];
  merges.push({ s: { r: summaryRowIdx, c: 0 }, e: { r: summaryRowIdx, c: 3 } });
  rows.push(summaryRow);

  // 5. BLOK TANDA TANGAN RESMI
  rows.push([]);
  rows.push([]);
  const signRow1Idx = rows.length;
  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);

  merges.push({ s: { r: signRow1Idx, c: 1 }, e: { r: signRow1Idx, c: 3 } });
  merges.push({ s: { r: signRow1Idx, c: 8 }, e: { r: signRow1Idx, c: 12 } });

  const signRow1: any[] = [
    { v: "", t: "s" },
    { v: `Mengetahui,\nKepala ${mergedMeta.schoolName}`, t: "s", s: { alignment: { horizontal: "center", wrapText: true } } },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    {
      v: `${mergedMeta.location}, ${formattedToday}\nGuru Mata Pelajaran Informatika,`,
      t: "s",
      s: { alignment: { horizontal: "center", wrapText: true } },
    },
  ];
  rows.push(signRow1);

  rows.push([]);
  rows.push([]);

  const signRow2Idx = rows.length;
  merges.push({ s: { r: signRow2Idx, c: 1 }, e: { r: signRow2Idx, c: 3 } });
  merges.push({ s: { r: signRow2Idx, c: 8 }, e: { r: signRow2Idx, c: 12 } });

  const signRow2: any[] = [
    { v: "", t: "s" },
    { v: "( ............................................................ )\nNIP. ........................................................", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center", wrapText: true } } },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    { v: "", t: "s" },
    {
      v: `( ${mergedMeta.teacherName} )\nNIP. ${mergedMeta.teacherNip}`,
      t: "s",
      s: { font: { bold: true }, alignment: { horizontal: "center", wrapText: true } },
    },
  ];
  rows.push(signRow2);

  // Buat sheet dan workbook
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"] = merges;

  // Lebar Kolom
  ws["!cols"] = [
    { wch: 5 },  // No
    { wch: 14 }, // NIS / NIPD
    { wch: 32 }, // Nama Lengkap Siswa
    { wch: 6 },  // L/P
    { wch: 10 }, // Hadir (H)
    { wch: 9 },  // Sakit (S)
    { wch: 9 },  // Izin (I)
    { wch: 9 },  // Alpa (A)
    { wch: 9 },  // Telat (T)
    { wch: 10 }, // Dispen (D)
    { wch: 9 },  // Total
    { wch: 11 }, // % Hadir
    { wch: 16 }, // Predikat Raport
  ];

  // Atur margin dan ukuran kertas folio resmi (21.59 cm x 33.02 cm) portrait
  ws["!margins"] = OFFICIAL_PAGE_MARGINS;
  ws["!pageSetup"] = {
    ...OFFICIAL_PAPER_SETUP,
    orientation: "portrait",
    fitToWidth: 1,
    fitToHeight: 1,
  };

  const wb = XLSX.utils.book_new();
  const safeClassName = currentClass.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
  XLSX.utils.book_append_sheet(wb, ws, `Semester_${safeClassName}`);

  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(arrayBuffer);
}

/**
 * Menghasilkan konten CSV Rekapitulasi Kumulatif Semester dengan Kop Surat Resmi (13 kolom langsung)
 */
export function generateSemesterAttendanceCsvWithKop(
  currentClass: Class,
  semesterRecap: SemesterClassRecap,
  meta: SchoolExportMetadata = {}
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const rows: string[] = [];

  // --- KOP SURAT RESMI SEKOLAH ---
  rows.push(`"DAFTAR HADIR SISWA KUMULATIF SEMESTER ${currentClass.semester ?? 1} (GANJIL) KELAS ${formatClassRoman(currentClass.name)}"`);
  rows.push(`"${getSchoolNameWithKabupaten(mergedMeta.schoolName)}"`);
  rows.push(`"TAHUN PELAJARAN ${currentClass.academicYear || "2026/2027"}"`);
  rows.push(`"Mata Pelajaran: ${currentClass.subject || mergedMeta.subject} | Semester: ${currentClass.semester ?? 1} (Ganjil) | Format: Buku Raport SMP"`);
  rows.push("");

  // --- HEADER KOLOM ---
  const headerCols: string[] = [
    "No",
    "NIS / NIPD",
    "Nama Lengkap Siswa",
    "L/P",
    "Hadir (H)",
    "Sakit (S)",
    "Izin (I)",
    "Alpa (A)",
    "Telat (T)",
    "Dispen (D)",
    "Total",
    "% Hadir",
    "Predikat Raport",
  ];
  rows.push(headerCols.map((c) => `"${c}"`).join(","));

  // --- BARIS DATA SISWA ---
  let sumHadir = 0;
  let sumSakit = 0;
  let sumIzin = 0;
  let sumAlpa = 0;
  let sumTelat = 0;
  let sumDispen = 0;
  let sumTotal = 0;

  semesterRecap.students.forEach((s, idx) => {
    sumHadir += s.totalHadir;
    sumSakit += s.totalSakit;
    sumIzin += s.totalIzin;
    sumAlpa += s.totalAlpa;
    sumTelat += s.totalTerlambat;
    sumDispen += s.totalDispen;
    sumTotal += s.totalHari;

    const rowCols = [
      String(idx + 1),
      `"${s.nis ?? "-"}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.gender ?? "-"}"`,
      String(s.totalHadir),
      String(s.totalSakit),
      String(s.totalIzin),
      String(s.totalAlpa),
      String(s.totalTerlambat),
      String(s.totalDispen),
      String(s.totalHari),
      `"${s.persentaseSemester}%"`,
      `"${s.predikat}"`,
    ];

    rows.push(rowCols.join(","));
  });

  // --- REKAPITULASI BAWAH ---
  rows.push("");
  rows.push(
    `"","","JUMLAH TOTAL KEHADIRAN KELAS","",${sumHadir},${sumSakit},${sumIzin},${sumAlpa},${sumTelat},${sumDispen},${sumTotal},"${semesterRecap.averageAttendance}%","-"`
  );
  rows.push("");

  // --- TITIMANGSA & BLOK TANDA TANGAN ---
  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);
  rows.push(`"Mengetahui,","","","","","","","${mergedMeta.location}, ${formattedToday}"`);
  rows.push(`"Kepala Sekolah,","","","","","","","Guru Mata Pelajaran,"`);
  rows.push(`""`);
  rows.push(`""`);
  rows.push(`"( ............................................ )","","","","","","","${mergedMeta.teacherName}"`);
  rows.push(`"NIP. ........................................","","","","","","","NIP. ${mergedMeta.teacherNip}"`);

  return "\uFEFF" + rows.join("\r\n");
}

/**
 * Menghasilkan dokumen HTML cetak / PDF Rekapitulasi Kumulatif Semester (Format Buku Raport SMP)
 * Memuat Kop Resmi SMPN 3 Cibungbulang, logo base64, ukuran kertas Folio (21.59cm x 33.02cm),
 * layout adaptif vertikal untuk s.d 40 siswa dan tanda tangan kepala sekolah & guru dalam 1 lembar.
 */
export function generateSemesterAttendanceHtmlPrint(
  currentClass: Class,
  semesterRecap: SemesterClassRecap,
  meta: SchoolExportMetadata = {}
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const studentCount = semesterRecap.students.length;

  let sumHadir = 0;
  let sumSakit = 0;
  let sumIzin = 0;
  let sumAlpa = 0;
  let sumTelat = 0;
  let sumDispen = 0;
  let sumTotal = 0;
  let fullAttendanceCount = 0;
  let attentionCount = 0;

  semesterRecap.students.forEach((s) => {
    sumHadir += s.totalHadir;
    sumSakit += s.totalSakit;
    sumIzin += s.totalIzin;
    sumAlpa += s.totalAlpa;
    sumTelat += s.totalTerlambat;
    sumDispen += s.totalDispen;
    sumTotal += s.totalHari;
    if (s.totalHari > 0 && s.persentaseSemester === 100) fullAttendanceCount++;
    if (s.needsAttention) attentionCount++;
  });

  // 1. PARAMETER VERTIKAL ADAPTIF (Proporsional mengisi 1 lembar Folio 33.02cm untuk s.d 40+ siswa)
  let rowPaddingY = "3.9px";
  let tableFontSize = "8.5pt";
  let badgeFontSize = "8pt";
  let kopPaddingBottom = "6px";
  let kopMarginBottom = "8px";
  let tableMarginTop = "6px";
  let summaryMarginTop = "8px";
  let summaryPadding = "5px 8px";
  let summaryFontSize = "8pt";
  let signatureMarginTop = "20px";
  let signatureSpacer = "52px";
  let signatureFontSize = "8.5pt";

  if (studentCount <= 28) {
    rowPaddingY = "5.5px";
    tableFontSize = "9pt";
    badgeFontSize = "8.5pt";
    kopPaddingBottom = "8px";
    kopMarginBottom = "12px";
    tableMarginTop = "8px";
    summaryMarginTop = "12px";
    summaryPadding = "6px 10px";
    summaryFontSize = "8.5pt";
    signatureMarginTop = "32px";
    signatureSpacer = "68px";
    signatureFontSize = "9pt";
  } else if (studentCount <= 34) {
    rowPaddingY = "4.6px";
    tableFontSize = "8.5pt";
    badgeFontSize = "8pt";
    kopPaddingBottom = "7px";
    kopMarginBottom = "10px";
    tableMarginTop = "7px";
    summaryMarginTop = "10px";
    summaryPadding = "5px 9px";
    summaryFontSize = "8pt";
    signatureMarginTop = "26px";
    signatureSpacer = "60px";
    signatureFontSize = "8.5pt";
  } else if (studentCount <= 40) {
    // Standar 35 - 40 siswa (kasus utama): isi lembar proporsional & ruang paraf lapang
    rowPaddingY = "3.9px";
    tableFontSize = "8.5pt";
    badgeFontSize = "8pt";
    kopPaddingBottom = "6px";
    kopMarginBottom = "8px";
    tableMarginTop = "6px";
    summaryMarginTop = "8px";
    summaryPadding = "5px 8px";
    summaryFontSize = "8pt";
    signatureMarginTop = "20px";
    signatureSpacer = "52px";
    signatureFontSize = "8.5pt";
  } else if (studentCount <= 44) {
    rowPaddingY = "2.8px";
    tableFontSize = "8pt";
    badgeFontSize = "7.5pt";
    kopPaddingBottom = "5px";
    kopMarginBottom = "6px";
    tableMarginTop = "4px";
    summaryMarginTop = "6px";
    summaryPadding = "4px 8px";
    summaryFontSize = "7.5pt";
    signatureMarginTop = "14px";
    signatureSpacer = "40px";
    signatureFontSize = "8pt";
  } else {
    rowPaddingY = "1.8px";
    tableFontSize = "7pt";
    badgeFontSize = "6.5pt";
    kopPaddingBottom = "4px";
    kopMarginBottom = "5px";
    tableMarginTop = "3px";
    summaryMarginTop = "4px";
    summaryPadding = "3px 6px";
    summaryFontSize = "7pt";
    signatureMarginTop = "10px";
    signatureSpacer = "30px";
    signatureFontSize = "7.5pt";
  }

  // Margin horizontal adaptif yang nyaman untuk 13 kolom
  const marginX = "0.8cm";

  const rowsHtml = semesterRecap.students
    .map((s, idx) => {
      let predBg = "#DBEAFE";
      let predColor = "#1E40AF";
      if (s.predikat === "Sangat Baik") {
        predBg = "#DCFCE7";
        predColor = "#166534";
      } else if (s.predikat === "Cukup") {
        predBg = "#FEF9C3";
        predColor = "#854D0E";
      } else if (s.predikat === "Kurang") {
        predBg = "#FEE2E2";
        predColor = "#991B1B";
      }

      const percentBg = s.needsAttention ? "#FEE2E2" : "#DCFCE7";
      const percentColor = s.needsAttention ? "#991B1B" : "#166534";

      return `<tr>
        <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="text-align: center; font-family: monospace;">${s.nis ?? "-"}</td>
        <td style="text-align: left; padding-left: 6px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 210px;">${s.fullName}</td>
        <td style="text-align: center;">${s.gender ?? "-"}</td>
        <td style="text-align: center; font-family: monospace; font-weight: bold; color: #166534; ${s.totalHadir > 0 ? "background-color: #DCFCE7;" : ""}">${s.totalHadir}</td>
        <td style="text-align: center; font-family: monospace; font-weight: bold; color: #1E40AF; ${s.totalSakit > 0 ? "background-color: #DBEAFE;" : ""}">${s.totalSakit}</td>
        <td style="text-align: center; font-family: monospace; font-weight: bold; color: #854D0E; ${s.totalIzin > 0 ? "background-color: #FEF9C3;" : ""}">${s.totalIzin}</td>
        <td style="text-align: center; font-family: monospace; font-weight: bold; color: #991B1B; ${s.totalAlpa > 0 ? "background-color: #FEE2E2;" : ""}">${s.totalAlpa}</td>
        <td style="text-align: center; font-family: monospace; font-weight: bold; color: #C2410C; ${s.totalTerlambat > 0 ? "background-color: #FFEDD5;" : ""}">${s.totalTerlambat}</td>
        <td style="text-align: center; font-family: monospace; font-weight: bold; color: #4338CA; ${s.totalDispen > 0 ? "background-color: #EEF2FF;" : ""}">${s.totalDispen}</td>
        <td style="text-align: center; font-family: monospace; font-weight: bold;">${s.totalHari}</td>
        <td style="text-align: center; font-family: monospace; font-weight: bold; background-color: ${percentBg}; color: ${percentColor}; font-size: ${badgeFontSize};">${s.persentaseSemester}%</td>
        <td style="text-align: center; font-weight: bold; background-color: ${predBg}; color: ${predColor}; font-size: ${badgeFontSize};">${s.predikat}</td>
      </tr>`;
    })
    .join("");

  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Rekapitulasi Akumulasi Presensi Kelas ${currentClass.name}</title>
  <style>
    @page {
      size: 21.59cm 33.02cm;
      margin: 0.8cm ${marginX} 0.8cm ${marginX};
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: 'Calibri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: ${tableFontSize};
      line-height: 1.15;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet-wrapper {
      width: 100%;
      margin: 0 auto;
      padding: 0.4cm ${marginX};
    }
    .kop-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px solid #111827;
      padding-bottom: ${kopPaddingBottom};
      margin-bottom: ${kopMarginBottom};
    }
    .kop-title-1 { font-size: 10.5pt; font-weight: 800; letter-spacing: 0.2px; text-transform: uppercase; line-height: 1.15; }
    .kop-title-2 { font-size: 9.5pt; font-weight: 800; letter-spacing: 0.2px; text-transform: uppercase; line-height: 1.15; margin-top: 1px; }
    .kop-title-3 { font-size: 9pt; font-weight: 700; line-height: 1.15; margin-top: 1px; }
    .kop-info { font-size: 7.5pt; color: #4B5563; line-height: 1.15; margin-top: 2px; }
    table.data-table {
      border-collapse: collapse;
      width: 100%;
      table-layout: auto;
      margin-top: ${tableMarginTop};
    }
    table.data-table th {
      border: 1px solid #374151;
      padding: ${rowPaddingY} 2px;
      font-size: ${tableFontSize};
      font-weight: bold;
      text-align: center;
      line-height: 1.15;
    }
    table.data-table td {
      border: 1px solid #6B7280;
      padding: ${rowPaddingY} 3px;
      font-size: ${tableFontSize};
      vertical-align: middle;
      line-height: 1.15;
    }
    table.data-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .summary-box {
      margin-top: ${summaryMarginTop};
      font-size: ${summaryFontSize};
      line-height: 1.15;
      background: #F9FAFB;
      padding: ${summaryPadding};
      border: 1px solid #E5E7EB;
      border-radius: 3px;
    }
    .signature-table {
      width: 100%;
      border: none;
      margin-top: ${signatureMarginTop};
      font-size: ${signatureFontSize};
      line-height: 1.2;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .signature-table td {
      border: none !important;
      padding: 0;
    }
    .signature-spacer {
      height: ${signatureSpacer};
    }
    @media print {
      @page {
        size: 21.59cm 33.02cm;
        margin: 0.7cm ${marginX} 0.7cm ${marginX};
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .sheet-wrapper {
        padding: 0 !important;
        width: 100% !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="sheet-wrapper">
    <div class="kop-container">
      <img src="${LOGO_SMPN3_BASE64}" alt="Logo SMPN 3 Cibungbulang" style="width: 44px; height: auto; max-height: 54px; object-fit: contain; display: block;" />
      <div style="flex: 1; text-align: center; padding: 0 8px;">
        <div class="kop-title-1">REKAPITULASI AKUMULASI PRESENSI SISWA KELAS ${formatClassRoman(currentClass.name)}</div>
        <div class="kop-title-2">${getSchoolNameWithKabupaten(mergedMeta.schoolName)}</div>
        <div class="kop-title-3">SEMESTER ${currentClass.semester ?? 1} (GANJIL) TAHUN PELAJARAN ${currentClass.academicYear || "2026/2027"}</div>
        <div class="kop-info">Mata Pelajaran: <strong>${currentClass.subject || mergedMeta.subject}</strong> · Format: Buku Raport SMP · Periode: Juli - Desember 2026</div>
      </div>
      <div style="width: 44px;" aria-hidden="true"></div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 28px; background-color: #E2EFDA;">NO</th>
          <th style="width: 72px; background-color: #E2EFDA;">NIS / NIPD</th>
          <th style="text-align: left; padding-left: 6px; background-color: #E2EFDA;">NAMA LENGKAP SISWA</th>
          <th style="width: 28px; background-color: #E2EFDA;">L/P</th>
          <th style="width: 36px; background-color: #DCFCE7; color: #166534;">HADIR (H)</th>
          <th style="width: 34px; background-color: #DBEAFE; color: #1E40AF;">SAKIT (S)</th>
          <th style="width: 34px; background-color: #FEF9C3; color: #854D0E;">IZIN (I)</th>
          <th style="width: 34px; background-color: #FEE2E2; color: #991B1B;">ALPA (A)</th>
          <th style="width: 34px; background-color: #FFEDD5; color: #C2410C;">TELAT (T)</th>
          <th style="width: 36px; background-color: #EEF2FF; color: #4338CA;">DISPEN (D)</th>
          <th style="width: 38px; background-color: #E0F2FE; color: #0369A1;">TOTAL</th>
          <th style="width: 50px; background-color: #E0F2FE; color: #0369A1;">% HADIR</th>
          <th style="width: 80px; background-color: #E0F2FE; color: #0369A1;">PREDIKAT RAPORT</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="font-weight: bold; background-color: #F3F4F6;">
          <td colspan="4" style="text-align: center; font-weight: bold;">JUMLAH TOTAL KEHADIRAN KELAS</td>
          <td style="text-align: center; font-family: monospace; color: #166534;">${sumHadir}</td>
          <td style="text-align: center; font-family: monospace; color: #1E40AF;">${sumSakit}</td>
          <td style="text-align: center; font-family: monospace; color: #854D0E;">${sumIzin}</td>
          <td style="text-align: center; font-family: monospace; color: #991B1B;">${sumAlpa}</td>
          <td style="text-align: center; font-family: monospace; color: #C2410C;">${sumTelat}</td>
          <td style="text-align: center; font-family: monospace; color: #4338CA;">${sumDispen}</td>
          <td style="text-align: center; font-family: monospace;">${sumTotal}</td>
          <td style="text-align: center; font-family: monospace; color: #0369A1;">${semesterRecap.averageAttendance}%</td>
          <td style="text-align: center;">-</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-box">
      <strong>Ringkasan Semester:</strong> Total Siswa: ${studentCount} | Rata-rata Kehadiran: <strong>${semesterRecap.averageAttendance}%</strong> | Siswa 100% Hadir: <span style="color: #166534; font-weight: bold;">${fullAttendanceCount}</span> | Perlu Perhatian (&lt; 85%): <span style="color: #991B1B; font-weight: bold;">${attentionCount}</span>
    </div>

    <table class="signature-table">
      <tr>
        <td style="width: 50%; text-align: left; padding-left: 8px; vertical-align: top;">
          Mengetahui,<br/>
          Kepala ${mergedMeta.schoolName}<br/>
          <div class="signature-spacer"></div>
          <strong>( ............................................................ )</strong><br/>
          NIP. ........................................................
        </td>
        <td style="width: 50%; text-align: right; padding-right: 12px; vertical-align: top;">
          ${mergedMeta.location}, ${formattedToday}<br/>
          Guru Mata Pelajaran Informatika,<br/>
          <div class="signature-spacer"></div>
          <strong><u>${mergedMeta.teacherName}</u></strong><br/>
          NIP. ${mergedMeta.teacherNip}
        </td>
      </tr>
    </table>
  </div>
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
    @page {
      size: 21.59cm 33.02cm landscape;
      margin: 1.1cm 0.7cm 1.1cm 0.6cm;
      mso-page-orientation: landscape;
      mso-header-margin: 0.315in;
      mso-footer-margin: 0.315in;
    }
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
      <td colspan="${totalCols}" class="kop-1 no-border">DAFTAR NILAI SISWA KELAS ${formatClassRoman(className)}</td>
    </tr>
    <tr>
      <td colspan="${totalCols}" class="kop-2 no-border">${getSchoolNameWithKabupaten(mergedMeta.schoolName)}</td>
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
 * Menghasilkan berkas Excel murni (.xlsx) berstandar OpenXML terformat untuk Rekap Nilai Siswa
 * dengan Kop Surat Resmi, pewarnaan ketuntasan KKM, predikat, dan tanda tangan pengesahan.
 */
export function generateGradesXlsxWithKop(
  className: string,
  assessments: AssessmentItem[],
  summaries: StudentGradeSummary[],
  kkm: number,
  meta: SchoolExportMetadata = {}
): Uint8Array {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const totalCols = 4 + assessments.length + 3;

  const rows: any[][] = [];
  const merges: any[] = [];

  // 1. KOP SURAT RESMI
  rows.push([{ v: `DAFTAR NILAI SISWA KELAS ${formatClassRoman(className)}`, t: "s", s: styleKop1 }]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  rows.push([{ v: getSchoolNameWithKabupaten(mergedMeta.schoolName), t: "s", s: styleKop2 }]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });

  rows.push([{ v: "TAHUN PELAJARAN 2026/2027", t: "s", s: styleKop3 }]);
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } });

  rows.push([{
    v: `Mata Pelajaran: ${mergedMeta.subject} | KKM Standar: ${kkm}`,
    t: "s",
    s: styleKopInfo,
  }]);
  merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } });

  rows.push([]);

  // 2. HEADER TABEL NILAI
  const headerRow: any[] = [
    { v: "NO", t: "s", s: styleThDefault },
    { v: "NIS", t: "s", s: styleThDefault },
    { v: "NAMA SISWA", t: "s", s: styleThDefault },
    { v: "L/P", t: "s", s: styleThDefault },
  ];

  assessments.forEach((a) => {
    headerRow.push({
      v: `${a.title}\n[${a.type}]`,
      t: "s",
      s: styleThDefault,
    });
  });

  headerRow.push(
    { v: "NILAI AKHIR", t: "s", s: { ...styleThDefault, fill: { fgColor: { rgb: "D1FAE5" } } } },
    { v: "PREDIKAT", t: "s", s: styleThDefault },
    { v: "STATUS KKM", t: "s", s: styleThDefault }
  );

  rows.push(headerRow);

  // 3. BARIS DATA NILAI SISWA
  let passedCount = 0;
  let remedialCount = 0;
  let totalFinalScore = 0;
  let scoredStudentCount = 0;

  summaries.forEach((s, idx) => {
    if (s.isPassed) passedCount++;
    else remedialCount++;

    if (s.finalScore !== null && s.finalScore !== undefined) {
      totalFinalScore += s.finalScore;
      scoredStudentCount++;
    }

    const row: any[] = [
      { v: idx + 1, t: "n", s: styleCellCenter },
      { v: s.nis ?? "-", t: "s", s: styleCellCenter },
      { v: s.studentName, t: "s", s: styleCellText },
      { v: s.gender ?? "-", t: "s", s: styleCellCenter },
    ];

    assessments.forEach((a) => {
      const val = s.scores[a.id];
      if (val !== null && val !== undefined) {
        row.push({ v: val, t: "n", s: styleCellCenter });
      } else {
        row.push({ v: "-", t: "s", s: styleCellCenter });
      }
    });

    const finalVal = s.finalScore !== null && s.finalScore !== undefined ? s.finalScore : "-";
    const isPass = s.finalScore !== null && s.finalScore !== undefined && s.finalScore >= kkm;

    row.push(
      {
        v: finalVal,
        t: typeof finalVal === "number" ? "n" : "s",
        s: {
          ...styleCellCenterBold,
          font: { ...styleCellCenterBold.font, color: { rgb: isPass ? "166534" : "B45309" } },
        },
      },
      { v: s.predicate, t: "s", s: styleCellCenterBold },
      {
        v: s.isPassed ? "Tuntas" : "Remedial",
        t: "s",
        s: {
          ...styleCellCenterBold,
          fill: { fgColor: { rgb: s.isPassed ? "DCFCE7" : "FEF3C7" } },
          font: { ...styleCellCenterBold.font, color: { rgb: s.isPassed ? "166534" : "B45309" } },
        },
      }
    );

    rows.push(row);
  });

  // 4. BARIS RATA-RATA & STATISTIK KELAS
  const avgClassScore =
    scoredStudentCount > 0 ? (totalFinalScore / scoredStudentCount).toFixed(1) : "-";
  const summaryRowIdx = rows.length;
  merges.push({ s: { r: summaryRowIdx, c: 0 }, e: { r: summaryRowIdx, c: 3 } });

  const summaryRow: any[] = [
    { v: "RATA-RATA KELAS & KETUNTASAN", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
    { v: "", t: "s", s: styleCellCenterBold },
    ...Array(assessments.length).fill({ v: "-", t: "s", s: styleCellCenter }),
    { v: avgClassScore, t: "s", s: styleCellCenterBold },
    { v: `T:${passedCount}`, t: "s", s: styleCellCenterBold },
    { v: `R:${remedialCount}`, t: "s", s: styleCellCenterBold },
  ];
  rows.push(summaryRow);

  // 5. BLOK TANDA TANGAN
  rows.push([]);
  rows.push([]);
  const signRow1Idx = rows.length;
  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);
  const signColRight = Math.max(4, totalCols - 3);

  merges.push({ s: { r: signRow1Idx, c: 1 }, e: { r: signRow1Idx, c: 2 } });
  merges.push({ s: { r: signRow1Idx, c: signColRight }, e: { r: signRow1Idx, c: totalCols - 1 } });

  const signRow1: any[] = [
    { v: "", t: "s" },
    { v: `Mengetahui,\nKepala ${mergedMeta.schoolName}`, t: "s", s: { alignment: { horizontal: "center", wrapText: true } } },
    { v: "", t: "s" },
  ];
  while (signRow1.length < signColRight) signRow1.push({ v: "", t: "s" });
  signRow1.push({
    v: `${mergedMeta.location}, ${formattedToday}\nGuru Mata Pelajaran Informatika,`,
    t: "s",
    s: { alignment: { horizontal: "center", wrapText: true } },
  });
  rows.push(signRow1);

  rows.push([]);
  rows.push([]);

  const signRow2Idx = rows.length;
  merges.push({ s: { r: signRow2Idx, c: 1 }, e: { r: signRow2Idx, c: 2 } });
  merges.push({ s: { r: signRow2Idx, c: signColRight }, e: { r: signRow2Idx, c: totalCols - 1 } });

  const signRow2: any[] = [
    { v: "", t: "s" },
    { v: "( ............................................................ )\nNIP. ........................................................", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center", wrapText: true } } },
    { v: "", t: "s" },
  ];
  while (signRow2.length < signColRight) signRow2.push({ v: "", t: "s" });
  signRow2.push({
    v: `( ${mergedMeta.teacherName} )\nNIP. ${mergedMeta.teacherNip}`,
    t: "s",
    s: { font: { bold: true }, alignment: { horizontal: "center", wrapText: true } },
  });
  rows.push(signRow2);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"] = merges;

  const colWidths = [
    { wch: 5 },  // No
    { wch: 14 }, // NIS
    { wch: 32 }, // Nama Siswa
    { wch: 5 },  // L/P
    ...assessments.map(() => ({ wch: 13 })), // Asesmen
    { wch: 12 }, // Nilai Akhir
    { wch: 10 }, // Predikat
    { wch: 12 }, // Status KKM
  ];
  ws["!cols"] = colWidths;

  // Atur margin dan ukuran kertas folio resmi (21.59 cm x 33.02 cm)
  ws["!margins"] = OFFICIAL_PAGE_MARGINS;
  ws["!pageSetup"] = { ...OFFICIAL_PAPER_SETUP, orientation: "landscape" };

  const wb = XLSX.utils.book_new();
  const safeClassName = className.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
  XLSX.utils.book_append_sheet(wb, ws, `Nilai_${safeClassName}`);

  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(arrayBuffer);
}

/**
 * Memicu pengunduhan berkas binary XLSX di sisi peramban dengan MIME type OpenXML Spreadsheet
 */
export function downloadXlsxFile(buffer: Uint8Array | ArrayBuffer, filename: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([buffer as any], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  rows.push(`"DAFTAR NILAI SISWA KELAS ${formatClassRoman(className)}"`);
  rows.push(`"${getSchoolNameWithKabupaten(mergedMeta.schoolName)}"`);
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

// ============================================================================
// 6. EKSPOR REKAP PENGUMUMAN NILAI DISENSOR (STATUS KELENGKAPAN TUGAS / UH)
// Sesuai UU PDP: Nilai angka disamarkan, hanya menampilkan status Sudah / Belum
// ============================================================================

/**
 * Menghasilkan berkas Excel murni (.xlsx) mode Sensor untuk Pengumuman Publik
 * Nilai angka diganti dengan balok warna hijau (✓ SUDAH) dan merah (BELUM).
 */
export function generateCensoredGradesXlsxWithKop(
  className: string,
  assessments: AssessmentItem[],
  summaries: StudentGradeSummary[],
  meta: SchoolExportMetadata = {}
): Uint8Array {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const totalCols = 4 + assessments.length + 2;

  const rows: any[][] = [];
  const merges: any[] = [];

  // 1. KOP SURAT RESMI PENGUMUMAN
  rows.push([{ v: `REKAPITULASI KELENGKAPAN TUGAS & ASESMEN SISWA KELAS ${formatClassRoman(className)}`, t: "s", s: styleKop1 }]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  rows.push([{ v: getSchoolNameWithKabupaten(mergedMeta.schoolName), t: "s", s: styleKop2 }]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });

  rows.push([{ v: "TAHUN PELAJARAN 2026/2027 · SEMESTER GANJIL", t: "s", s: styleKop3 }]);
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } });

  rows.push([{
    v: `Mata Pelajaran: ${mergedMeta.subject} | Status: Nilai Angka Disensor (Privasi UU PDP) | Keterangan: [✓ SUDAH] = Tuntas Mengumpulkan, [BELUM] = Belum Mengerjakan`,
    t: "s",
    s: styleKopInfo,
  }]);
  merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } });

  rows.push([]);

  // 2. HEADER TABEL
  const headerRow: any[] = [
    { v: "NO", t: "s", s: styleThDefault },
    { v: "NIS", t: "s", s: styleThDefault },
    { v: "NAMA SISWA", t: "s", s: styleThDefault },
    { v: "L/P", t: "s", s: styleThDefault },
  ];

  assessments.forEach((a) => {
    headerRow.push({
      v: `${a.title}\n[${a.type}]`,
      t: "s",
      s: styleThDefault,
    });
  });

  headerRow.push(
    { v: "TOTAL TUNTAS", t: "s", s: { ...styleThDefault, fill: { fgColor: { rgb: "E0F2FE" } } } },
    { v: "STATUS KELENGKAPAN", t: "s", s: styleThDefault }
  );

  rows.push(headerRow);

  // 3. BARIS DATA SISWA DISENSOR
  let fullyCompletedCount = 0;
  let pendingStudentsCount = 0;
  const pendingPerAssessment: Record<string, number> = {};
  assessments.forEach((a) => { pendingPerAssessment[a.id] = 0; });

  summaries.forEach((s, idx) => {
    let completedCount = 0;

    const row: any[] = [
      { v: idx + 1, t: "n", s: styleCellCenter },
      { v: s.nis ?? "-", t: "s", s: styleCellCenter },
      { v: s.studentName, t: "s", s: styleCellText },
      { v: s.gender ?? "-", t: "s", s: styleCellCenter },
    ];

    assessments.forEach((a) => {
      const val = s.scores[a.id];
      if (val !== null && val !== undefined) {
        completedCount++;
        row.push({
          v: "✓ SUDAH",
          t: "s",
          s: styleStatusH, // Blok hijau tua dengan latar hijau muda
        });
      } else {
        pendingPerAssessment[a.id] = (pendingPerAssessment[a.id] || 0) + 1;
        row.push({
          v: "BELUM",
          t: "s",
          s: styleStatusA, // Blok merah dengan latar merah muda
        });
      }
    });

    const isAllDone = assessments.length > 0 && completedCount === assessments.length;
    if (isAllDone) fullyCompletedCount++;
    else pendingStudentsCount++;

    const pendingCount = assessments.length - completedCount;
    const statusText = isAllDone ? "LENGKAP" : `BELUM LENGKAP (${pendingCount} Tagihan)`;

    row.push(
      {
        v: `${completedCount} / ${assessments.length}`,
        t: "s",
        s: styleCellCenterBold,
      },
      {
        v: statusText,
        t: "s",
        s: isAllDone ? styleStatusH : styleStatusA,
      }
    );

    rows.push(row);
  });

  // 4. STATISTIK RINGKASAN DI BAWAH TABEL
  rows.push([]);
  const statsStartRow = rows.length;

  rows.push([
    { v: "RINGKASAN STATUS KELENGKAPAN KELAS:", t: "s", s: { font: { bold: true, sz: 10 } } },
  ]);
  merges.push({ s: { r: statsStartRow, c: 0 }, e: { r: statsStartRow, c: 3 } });

  rows.push([
    { v: `• Total Siswa Terdaftar: ${summaries.length} siswa`, t: "s", s: styleCellText },
  ]);
  merges.push({ s: { r: statsStartRow + 1, c: 0 }, e: { r: statsStartRow + 1, c: 3 } });

  rows.push([
    {
      v: `• Siswa Sudah Tuntas Seluruh Tugas: ${fullyCompletedCount} siswa (${summaries.length > 0 ? ((fullyCompletedCount / summaries.length) * 100).toFixed(0) : 0}%)`,
      t: "s",
      s: { ...styleCellText, font: { color: { rgb: "166534" }, bold: true } },
    },
  ]);
  merges.push({ s: { r: statsStartRow + 2, c: 0 }, e: { r: statsStartRow + 2, c: 4 } });

  rows.push([
    {
      v: `• Siswa Masih Ada Tagihan Tugas: ${pendingStudentsCount} siswa (${summaries.length > 0 ? ((pendingStudentsCount / summaries.length) * 100).toFixed(0) : 0}%)`,
      t: "s",
      s: { ...styleCellText, font: { color: { rgb: "991B1B" }, bold: true } },
    },
  ]);
  merges.push({ s: { r: statsStartRow + 3, c: 0 }, e: { r: statsStartRow + 3, c: 4 } });

  // 5. TITIMANGSA & BLOK TANDA TANGAN RESMI
  rows.push([]);
  rows.push([]);

  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);
  const signRow1Idx = rows.length;
  const signColRight = Math.max(3, totalCols - 3);

  merges.push({ s: { r: signRow1Idx, c: 1 }, e: { r: signRow1Idx, c: 2 } });
  merges.push({ s: { r: signRow1Idx, c: signColRight }, e: { r: signRow1Idx, c: totalCols - 1 } });

  const signRow1: any[] = [
    { v: "", t: "s" },
    { v: `Mengetahui,\nKepala ${mergedMeta.schoolName}`, t: "s", s: { alignment: { horizontal: "center", wrapText: true } } },
    { v: "", t: "s" },
  ];
  while (signRow1.length < signColRight) signRow1.push({ v: "", t: "s" });
  signRow1.push({
    v: `${mergedMeta.location}, ${formattedToday}\nGuru Mata Pelajaran Informatika,`,
    t: "s",
    s: { alignment: { horizontal: "center", wrapText: true } },
  });
  rows.push(signRow1);

  rows.push([]);
  rows.push([]);

  const signRow2Idx = rows.length;
  merges.push({ s: { r: signRow2Idx, c: 1 }, e: { r: signRow2Idx, c: 2 } });
  merges.push({ s: { r: signRow2Idx, c: signColRight }, e: { r: signRow2Idx, c: totalCols - 1 } });

  const signRow2: any[] = [
    { v: "", t: "s" },
    { v: "( ............................................................ )\nNIP. ........................................................", t: "s", s: { font: { bold: true }, alignment: { horizontal: "center", wrapText: true } } },
    { v: "", t: "s" },
  ];
  while (signRow2.length < signColRight) signRow2.push({ v: "", t: "s" });
  signRow2.push({
    v: `( ${mergedMeta.teacherName} )\nNIP. ${mergedMeta.teacherNip}`,
    t: "s",
    s: { font: { bold: true }, alignment: { horizontal: "center", wrapText: true } },
  });
  rows.push(signRow2);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"] = merges;

  const colWidths = [
    { wch: 5 },  // No
    { wch: 14 }, // NIS
    { wch: 32 }, // Nama Siswa
    { wch: 5 },  // L/P
    ...assessments.map(() => ({ wch: 16 })), // Asesmen disensor
    { wch: 14 }, // Total Tuntas
    { wch: 28 }, // Status Kelengkapan
  ];
  ws["!cols"] = colWidths;

  // Atur margin dan ukuran kertas folio resmi (21.59 cm x 33.02 cm)
  ws["!margins"] = OFFICIAL_PAGE_MARGINS;
  ws["!pageSetup"] = { ...OFFICIAL_PAPER_SETUP, orientation: "portrait", fitToWidth: 1, fitToHeight: 1 };

  const wb = XLSX.utils.book_new();
  const safeClassName = className.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
  XLSX.utils.book_append_sheet(wb, ws, `Pengumuman_${safeClassName}`);

  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(arrayBuffer);
}

/**
 * Menghasilkan berkas CSV terformat untuk Rekap Pengumuman Nilai Disensor
 */
export function generateCensoredGradesCsvWithKop(
  className: string,
  assessments: AssessmentItem[],
  summaries: StudentGradeSummary[],
  meta: SchoolExportMetadata = {}
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const rows: string[] = [];

  // Kop Surat Resmi
  rows.push(`"REKAPITULASI KELENGKAPAN TUGAS & ASESMEN SISWA KELAS ${formatClassRoman(className)}"`);
  rows.push(`"${getSchoolNameWithKabupaten(mergedMeta.schoolName)}"`);
  rows.push(`"TAHUN PELAJARAN 2026/2027 · SEMESTER GANJIL"`);
  rows.push(`"Mata Pelajaran: ${mergedMeta.subject} | Status: Nilai Angka Disensor (UU PDP) | [SUDAH] = Tuntas, [BELUM] = Belum Mengerjakan"`);
  rows.push("");

  // Header Kolom
  const headerCols = ["No", "NIS", "Nama Siswa", "L/P"];
  assessments.forEach((a) => {
    headerCols.push(`"${a.title.replace(/"/g, '""')} (${a.type})"`);
  });
  headerCols.push("Total Tuntas", "Status Kelengkapan");
  rows.push(headerCols.join(","));

  // Baris Siswa
  summaries.forEach((s, idx) => {
    let completedCount = 0;
    const rowCols: string[] = [
      String(idx + 1),
      `"${s.nis ?? "-"}"`,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.gender ?? "-"}"`,
    ];

    assessments.forEach((a) => {
      const val = s.scores[a.id];
      if (val !== null && val !== undefined) {
        completedCount++;
        rowCols.push('"SUDAH"');
      } else {
        rowCols.push('"BELUM"');
      }
    });

    const isAllDone = assessments.length > 0 && completedCount === assessments.length;
    const pendingCount = assessments.length - completedCount;
    rowCols.push(`"${completedCount} / ${assessments.length}"`);
    rowCols.push(isAllDone ? '"LENGKAP"' : `"BELUM LENGKAP (${pendingCount} Tagihan)"`);

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

/**
 * Menghasilkan teks ringkasan rapi siap salin (Copy-Paste) untuk diumumkan ke Grup WhatsApp Kelas
 * Otomatis mendata nama anak dan tugas apa saja yang belum dikumpulkan.
 */
export function generateCensoredGradesWhatsAppText(
  className: string,
  assessments: AssessmentItem[],
  summaries: StudentGradeSummary[],
  meta: SchoolExportMetadata = {}
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);

  const studentsWithPending: { name: string; pendingTitles: string[] }[] = [];
  let completeCount = 0;

  summaries.forEach((s) => {
    const pendingTitles: string[] = [];
    assessments.forEach((a) => {
      const val = s.scores[a.id];
      if (val === null || val === undefined) {
        pendingTitles.push(`${a.title} [${a.type}]`);
      }
    });

    if (pendingTitles.length > 0) {
      studentsWithPending.push({ name: s.studentName, pendingTitles });
    } else {
      completeCount++;
    }
  });

  const lines: string[] = [
    `📢 *PENGUMUMAN KELENGKAPAN TUGAS & ASESMEN*`,
    `*${mergedMeta.schoolName.toUpperCase()}*`,
    `*Kelas:* ${className} · *Mata Pelajaran:* ${mergedMeta.subject}`,
    `*Per Tanggal:* ${formattedToday}`,
    ``,
    `🔒 *Catatan Privasi:* Nilai angka dirahasiakan (disensor). Pengumuman ini hanya menampilkan status kelengkapan pengumpulan tugas/ulangan.`,
    ``,
    `📊 *Ringkasan Kelas:*`,
    `• Total Siswa: ${summaries.length} siswa`,
    `• Siswa Tugas Lengkap: ${completeCount} siswa ✅`,
    `• Siswa Memiliki Tagihan: ${studentsWithPending.length} siswa ⚠️`,
    ``,
  ];

  if (studentsWithPending.length === 0) {
    lines.push(`🎉 *Alhamdulillah! Seluruh siswa Kelas ${className} sudah menuntaskan seluruh tugas & asesmen.*`);
  } else {
    lines.push(`⚠️ *Daftar Siswa yang Masih Memiliki Tagihan Tugas / UH:*`);
    studentsWithPending.forEach((item, idx) => {
      lines.push(`${idx + 1}. *${item.name}*`);
      item.pendingTitles.forEach((t) => {
        lines.push(`   └ ❌ Belum: ${t}`);
      });
    });
    lines.push(``);
    lines.push(`_Bagi siswa yang namanya tercantum di atas, mohon segera menyelesaikan dan mengumpulkan tugas kepada guru pengampu._`);
  }

  lines.push(``);
  lines.push(`Guru Pengampu:`);
  lines.push(`*${mergedMeta.teacherName}*`);
  lines.push(`NIP. ${mergedMeta.teacherNip}`);

  return lines.join("\n");
}

/**
 * Menghasilkan dokumen HTML ber-KOP resmi untuk Pratinjau Cetak / Simpan PDF Pengumuman Disensor
 */
export function generateCensoredGradesHtmlPrint(
  className: string,
  assessments: AssessmentItem[],
  summaries: StudentGradeSummary[],
  meta: SchoolExportMetadata = {}
): string {
  const mergedMeta = { ...DEFAULT_EXPORT_META, ...meta };
  const totalCols = 4 + assessments.length + 2;

  let completeCount = 0;
  let pendingCount = 0;

  const studentCount = summaries.length;
  const numAssessments = assessments.length;

  // 1. PARAMETER VERTIKAL ADAPTIF (Proporsional mengisi 1 lembar Folio 33.02cm untuk s.d 40+ siswa)
  let rowPaddingY = "3.9px";
  let tableFontSize = "8.5pt";
  let statusFontSize = "8pt";
  let kopPaddingBottom = "6px";
  let kopMarginBottom = "8px";
  let tableMarginTop = "6px";
  let summaryMarginTop = "8px";
  let summaryPadding = "5px 8px";
  let summaryFontSize = "8pt";
  let signatureMarginTop = "20px";
  let signatureSpacer = "52px";
  let signatureFontSize = "8.5pt";

  if (studentCount <= 28) {
    rowPaddingY = "5.5px";
    tableFontSize = "9pt";
    statusFontSize = "8.5pt";
    kopPaddingBottom = "8px";
    kopMarginBottom = "12px";
    tableMarginTop = "8px";
    summaryMarginTop = "12px";
    summaryPadding = "6px 10px";
    summaryFontSize = "8.5pt";
    signatureMarginTop = "32px";
    signatureSpacer = "68px";
    signatureFontSize = "9pt";
  } else if (studentCount <= 34) {
    rowPaddingY = "4.6px";
    tableFontSize = "8.5pt";
    statusFontSize = "8pt";
    kopPaddingBottom = "7px";
    kopMarginBottom = "10px";
    tableMarginTop = "7px";
    summaryMarginTop = "10px";
    summaryPadding = "5px 9px";
    summaryFontSize = "8pt";
    signatureMarginTop = "26px";
    signatureSpacer = "60px";
    signatureFontSize = "8.5pt";
  } else if (studentCount <= 40) {
    // Standar 35 - 40 siswa (kasus utama): isi lembar secara proporsional & ruang paraf lapang
    rowPaddingY = "3.9px";
    tableFontSize = "8.5pt";
    statusFontSize = "8pt";
    kopPaddingBottom = "6px";
    kopMarginBottom = "8px";
    tableMarginTop = "6px";
    summaryMarginTop = "8px";
    summaryPadding = "5px 8px";
    summaryFontSize = "8pt";
    signatureMarginTop = "20px";
    signatureSpacer = "52px";
    signatureFontSize = "8.5pt";
  } else if (studentCount <= 44) {
    rowPaddingY = "2.8px";
    tableFontSize = "8pt";
    statusFontSize = "7.5pt";
    kopPaddingBottom = "5px";
    kopMarginBottom = "6px";
    tableMarginTop = "4px";
    summaryMarginTop = "6px";
    summaryPadding = "4px 8px";
    summaryFontSize = "7.5pt";
    signatureMarginTop = "14px";
    signatureSpacer = "40px";
    signatureFontSize = "8pt";
  } else {
    rowPaddingY = "1.8px";
    tableFontSize = "7pt";
    statusFontSize = "6.5pt";
    kopPaddingBottom = "4px";
    kopMarginBottom = "5px";
    tableMarginTop = "3px";
    summaryMarginTop = "4px";
    summaryPadding = "3px 6px";
    summaryFontSize = "7pt";
    signatureMarginTop = "10px";
    signatureSpacer = "30px";
    signatureFontSize = "7.5pt";
  }

  // 2. PARAMETER HORIZONTAL ADAPTIF (Berdasarkan situasi jumlah kolom asesmen)
  let marginX = "1.2cm";
  let colWidthNo = "32px";
  let colWidthNis = "85px";
  let colWidthLp = "34px";
  let colWidthTotal = "56px";
  let colWidthStatus = "88px";
  let asmtMinWidth = "70px";
  let asmtHeaderFont = "8pt";
  let asmtCellFont = "7.5pt";
  let asmtPadX = "6px";
  let nameMaxWidth = "none";

  if (numAssessments <= 2) {
    // Situasi kolom sedikit (1 - 2 asesmen, misal hanya UTS): space kanan-kiri lebih lega agar tidak melar kosong
    marginX = "1.2cm";
    colWidthNo = "32px";
    colWidthNis = "85px";
    colWidthLp = "34px";
    colWidthTotal = "56px";
    colWidthStatus = "88px";
    asmtMinWidth = "70px";
    asmtHeaderFont = "8pt";
    asmtCellFont = "7.5pt";
    asmtPadX = "6px";
    nameMaxWidth = "none";
  } else if (numAssessments <= 4) {
    // Situasi kolom sedang (3 - 4 asesmen)
    marginX = "0.9cm";
    colWidthNo = "28px";
    colWidthNis = "76px";
    colWidthLp = "28px";
    colWidthTotal = "48px";
    colWidthStatus = "78px";
    asmtMinWidth = "52px";
    asmtHeaderFont = "7.5pt";
    asmtCellFont = "7pt";
    asmtPadX = "4px";
    nameMaxWidth = "200px";
  } else if (numAssessments <= 7) {
    // Situasi kolom banyak (5 - 7 asesmen)
    marginX = "0.6cm";
    colWidthNo = "24px";
    colWidthNis = "68px";
    colWidthLp = "24px";
    colWidthTotal = "44px";
    colWidthStatus = "72px";
    asmtMinWidth = "40px";
    asmtHeaderFont = "7pt";
    asmtCellFont = "6.5pt";
    asmtPadX = "2px";
    nameMaxWidth = "175px";
  } else {
    // Situasi kolom sangat banyak (8+ asesmen)
    marginX = "0.45cm";
    colWidthNo = "22px";
    colWidthNis = "62px";
    colWidthLp = "22px";
    colWidthTotal = "40px";
    colWidthStatus = "66px";
    asmtMinWidth = "32px";
    asmtHeaderFont = "6.5pt";
    asmtCellFont = "6pt";
    asmtPadX = "1px";
    nameMaxWidth = "150px";
  }

  const rowsHtml = summaries
    .map((s, idx) => {
      let done = 0;
      const cells = assessments
        .map((a) => {
          const sc = s.scores[a.id];
          if (sc !== null && sc !== undefined) {
            done++;
            return `<td style="text-align: center; font-weight: bold; font-size: ${asmtCellFont}; padding: ${rowPaddingY} ${asmtPadX}; background-color: #DCFCE7; color: #166534; white-space: nowrap;">✓ SUDAH</td>`;
          }
          return `<td style="text-align: center; font-weight: bold; font-size: ${asmtCellFont}; padding: ${rowPaddingY} ${asmtPadX}; background-color: #FEE2E2; color: #991B1B; white-space: nowrap;">BELUM</td>`;
        })
        .join("");

      const isAll = assessments.length > 0 && done === assessments.length;
      if (isAll) completeCount++;
      else pendingCount++;

      const pendingTagihan = assessments.length - done;

      return `<tr>
        <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="text-align: center; font-family: monospace;">${s.nis ?? "-"}</td>
        <td style="text-align: left; padding-left: 6px; font-weight: 500; ${
          nameMaxWidth !== "none" ? `white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: ${nameMaxWidth};` : ""
        }">${s.studentName}</td>
        <td style="text-align: center;">${s.gender ?? "-"}</td>
        ${cells}
        <td style="text-align: center; font-weight: bold; font-family: monospace; font-size: ${statusFontSize};">${done} / ${assessments.length}</td>
        <td style="text-align: center; font-weight: bold; font-size: ${statusFontSize}; ${
          isAll ? "background-color: #DCFCE7; color: #166534;" : "background-color: #FEE2E2; color: #991B1B;"
        }">${isAll ? "LENGKAP" : `BELUM (${pendingTagihan})`}</td>
      </tr>`;
    })
    .join("");

  const formattedToday = formatIndonesianDate(mergedMeta.dateStr);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Pengumuman Kelengkapan Tugas Kelas ${className}</title>
  <style>
    @page {
      size: 21.59cm 33.02cm;
      margin: 0.8cm ${marginX} 0.8cm ${marginX};
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: 'Calibri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: ${tableFontSize};
      line-height: 1.15;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet-wrapper {
      width: 100%;
      margin: 0 auto;
      padding: 0.4cm ${marginX};
    }
    .kop-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px solid #111827;
      padding-bottom: ${kopPaddingBottom};
      margin-bottom: ${kopMarginBottom};
    }
    .kop-title-1 { font-size: 10.5pt; font-weight: 800; letter-spacing: 0.2px; text-transform: uppercase; line-height: 1.15; }
    .kop-title-2 { font-size: 9.5pt; font-weight: 800; letter-spacing: 0.2px; text-transform: uppercase; line-height: 1.15; margin-top: 1px; }
    .kop-title-3 { font-size: 9pt; font-weight: 700; line-height: 1.15; margin-top: 1px; }
    .kop-info { font-size: 7.5pt; color: #4B5563; line-height: 1.15; margin-top: 2px; }
    table.data-table {
      border-collapse: collapse;
      width: 100%;
      table-layout: auto;
      margin-top: ${tableMarginTop};
    }
    table.data-table th {
      border: 1px solid #374151;
      background-color: #E2EFDA;
      padding: ${rowPaddingY} 2px;
      font-size: ${tableFontSize};
      font-weight: bold;
      text-align: center;
      line-height: 1.15;
    }
    table.data-table td {
      border: 1px solid #6B7280;
      padding: ${rowPaddingY} 3px;
      font-size: ${tableFontSize};
      vertical-align: middle;
      line-height: 1.15;
    }
    table.data-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .summary-box {
      margin-top: ${summaryMarginTop};
      font-size: ${summaryFontSize};
      line-height: 1.15;
      background: #F9FAFB;
      padding: ${summaryPadding};
      border: 1px solid #E5E7EB;
      border-radius: 3px;
    }
    .signature-table {
      width: 100%;
      border: none;
      margin-top: ${signatureMarginTop};
      font-size: ${signatureFontSize};
      line-height: 1.2;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .signature-table td {
      border: none !important;
      padding: 0;
    }
    .signature-spacer {
      height: ${signatureSpacer};
    }
    @media print {
      @page {
        size: 21.59cm 33.02cm;
        margin: 0.7cm ${marginX} 0.7cm ${marginX};
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .sheet-wrapper {
        padding: 0 !important;
        width: 100% !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="sheet-wrapper">
    <div class="kop-container">
      <img src="${LOGO_SMPN3_BASE64}" alt="Logo SMPN 3 Cibungbulang" style="width: 44px; height: auto; max-height: 54px; object-fit: contain; display: block;" />
      <div style="flex: 1; text-align: center; padding: 0 8px;">
        <div class="kop-title-1">REKAPITULASI KELENGKAPAN TUGAS &amp; ASESMEN SISWA KELAS ${formatClassRoman(className)}</div>
        <div class="kop-title-2">${getSchoolNameWithKabupaten(mergedMeta.schoolName)}</div>
        <div class="kop-title-3">TAHUN PELAJARAN 2026/2027</div>
        <div class="kop-info">Mata Pelajaran: <strong>${mergedMeta.subject}</strong> · Status: Nilai Angka Disensor (UU PDP)</div>
      </div>
      <div style="width: 44px;" aria-hidden="true"></div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: ${colWidthNo};">NO</th>
          <th style="width: ${colWidthNis};">NIS</th>
          <th style="text-align: left; padding-left: 6px;">NAMA SISWA</th>
          <th style="width: ${colWidthLp};">L/P</th>
          ${assessments
            .map(
              (a) =>
                `<th style="padding: ${rowPaddingY} ${asmtPadX}; font-size: ${asmtHeaderFont}; line-height: 1.1; min-width: ${asmtMinWidth};">${a.title}<br/><span style="font-size: 6.5pt; color: #4B5563; font-weight: normal;">[${a.type}]</span></th>`
            )
            .join("")}
          <th style="width: ${colWidthTotal}; background-color: #E0F2FE;">TOTAL</th>
          <th style="width: ${colWidthStatus};">STATUS</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="summary-box">
      <strong>Ringkasan Kelas:</strong> Total Siswa: ${summaries.length} | Siswa Lengkap: <span style="color: #166534; font-weight: bold;">${completeCount}</span> | Masih Ada Tagihan: <span style="color: #991B1B; font-weight: bold;">${pendingCount}</span>
    </div>

    <table class="signature-table">
      <tr>
        <td style="width: 50%; text-align: left; padding-left: 8px; vertical-align: top;">
          Mengetahui,<br/>
          Kepala ${mergedMeta.schoolName}<br/>
          <div class="signature-spacer"></div>
          <strong>( ............................................................ )</strong><br/>
          NIP. ........................................................
        </td>
        <td style="width: 50%; text-align: right; padding-right: 12px; vertical-align: top;">
          ${mergedMeta.location}, ${formattedToday}<br/>
          Guru Mata Pelajaran Informatika,<br/>
          <div class="signature-spacer"></div>
          <strong><u>${mergedMeta.teacherName}</u></strong><br/>
          NIP. ${mergedMeta.teacherNip}
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}

/** Alias untuk pratinjau HTML berkas pengumuman nilai */
export const generateCensoredGradesExcelHtmlWithKop = generateCensoredGradesHtmlPrint;



