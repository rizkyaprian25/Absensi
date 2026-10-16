import XLSX from "xlsx-js-style";
import type { Student } from "@/contracts/attendance";

/**
 * Representasi kecocokan nilai per siswa
 */
export interface GradeImportRowMatch {
  studentId: string;
  studentName: string;
  nis: string;
  originalIndex: number; // Urutan nomor absen (1-based)
  score: number | null;
  scoreText: string;
  matchType: "NIS" | "NAME" | "INDEX" | "UNMATCHED";
  matchDetail?: string;
}

/**
 * Hasil agregat impor nilai siswa
 */
export interface GradeImportResult {
  totalStudentsInClass: number;
  matchedCount: number;
  unmatchedCount: number;
  scoresMap: Record<string, string>; // studentId -> string e.g. "85"
  rows: GradeImportRowMatch[];
  unmatchedFileRows: Array<{ rawRow: any[]; rowNumber: number; reason: string }>;
  warnings: string[];
}

/**
 * Normalisasi string nama siswa untuk pencocokan toleran
 */
export function normalizeStudentName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parsing dan sanitasi nilai angka (0-100)
 */
export function parseScoreValue(val: any): { num: number | null; text: string } {
  if (val === null || val === undefined) return { num: null, text: "" };
  let str = String(val).trim();
  if (str === "" || str === "-" || str === "N/A" || str.toLowerCase() === "null") {
    return { num: null, text: "" };
  }

  // Ubah koma desimal menjadi titik jika ada
  str = str.replace(",", ".");

  // Ekstrak angka float/integer
  const match = str.match(/^-?\d+(?:\.\d+)?/);
  if (!match) return { num: null, text: "" };

  const parsed = parseFloat(match[0]);
  if (isNaN(parsed)) return { num: null, text: "" };

  // Batasi rentang nilai standar 0 sampai 100
  const clamped = Math.max(0, Math.min(100, Math.round(parsed * 10) / 10));
  return { num: clamped, text: String(clamped) };
}

/**
 * Mencocokkan matriks 2D (dari Excel / CSV / Salin-Tempel) ke daftar siswa kelas aktif
 */
export function matchGradeRowsToStudents(
  matrix: any[][],
  students: Student[]
): GradeImportResult {
  const resultRows: GradeImportRowMatch[] = students.map((s, idx) => ({
    studentId: s.id,
    studentName: s.fullName,
    nis: s.nis ?? "",
    originalIndex: idx + 1,
    score: null,
    scoreText: "",
    matchType: "UNMATCHED",
  }));

  const scoresMap: Record<string, string> = {};
  const unmatchedFileRows: Array<{ rawRow: any[]; rowNumber: number; reason: string }> = [];
  const warnings: string[] = [];

  // 1. Cari baris header tabel yang paling relevan (memiliki indikator kolom terbanyak di sel berbeda)
  let bestHeaderScore = 0;
  let headerRowIdx = -1;
  let nisColIdx = -1;
  let nameColIdx = -1;
  let scoreColIdx = -1;

  for (let r = 0; r < Math.min(15, matrix.length); r++) {
    const row = matrix[r];
    if (!Array.isArray(row)) continue;

    let curNis = -1;
    let curName = -1;
    let curScore = -1;

    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || "").toLowerCase().trim();
      if (!cell) continue;

      if (cell.includes("nis") || cell.includes("nipd") || cell.includes("induk")) {
        curNis = c;
      }
      if (cell.includes("nama") || cell.includes("siswa") || cell.includes("student")) {
        curName = c;
      }
      if (
        cell.includes("nilai") ||
        cell.includes("skor") ||
        cell.includes("score") ||
        cell.includes("grade") ||
        cell.includes("angka") ||
        cell.includes("hasil")
      ) {
        curScore = c;
      }
    }

    // Hitung bobot baris header (harus sel yang berbeda)
    let score = 0;
    if (curNis !== -1) score++;
    if (curName !== -1 && curName !== curNis) score++;
    if (curScore !== -1 && curScore !== curName && curScore !== curNis) score++;

    if (score > bestHeaderScore && score >= 2) {
      bestHeaderScore = score;
      headerRowIdx = r;
      nisColIdx = curNis;
      nameColIdx = curName;
      scoreColIdx = curScore;
    }
  }

  // Jika tidak ditemukan baris header, namun hanya ada 1 kolom atau baris pertama angka:
  const isSingleScoreList = matrix.length > 0 && matrix.every((row) => row.length <= 2);

  // Siswa yang sudah terpetakan nilainya
  const claimedStudentIds = new Set<string>();

  // 2. Ekstrak data baris setelah header (atau sejak awal jika tanpa header)
  const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
  let sequentialIndex = 0;

  for (let r = startRow; r < matrix.length; r++) {
    const row = matrix[r];
    if (!Array.isArray(row) || row.every((c) => c === "" || c === null || c === undefined)) {
      continue;
    }

    // Ambil kandidat NIS, Nama, dan Nilai
    let rawNis = nisColIdx !== -1 ? String(row[nisColIdx] || "").trim() : "";
    let rawName = nameColIdx !== -1 ? String(row[nameColIdx] || "").trim() : "";
    let rawScore = scoreColIdx !== -1 ? row[scoreColIdx] : null;

    // Jika header tidak eksplisit atau hanya 1 kolom nilai angka:
    if (scoreColIdx === -1) {
      // Cari sel pertama yang berisi angka valid 0-100
      for (let c = row.length - 1; c >= 0; c--) {
        const { num } = parseScoreValue(row[c]);
        if (num !== null) {
          rawScore = row[c];
          break;
        }
      }
    }

    // Jika NIS dan Nama tidak terdeteksi dari header, cari dari kolom teks
    if (nisColIdx === -1 || nameColIdx === -1) {
      for (let c = 0; c < row.length; c++) {
        const str = String(row[c] || "").trim();
        // Cek kandidat NIS (angka 6-12 digit)
        if (!rawNis && /^\d{5,12}$/.test(str)) {
          rawNis = str;
        } else if (!rawName && /[a-zA-Z]{3,}/.test(str) && !str.toLowerCase().includes("nilai")) {
          rawName = str;
        }
      }
    }

    const { num: scoreNum, text: scoreText } = parseScoreValue(rawScore);

    // Pencocokan ke siswa kelas
    let matchedStudentIndex = -1;
    let matchType: "NIS" | "NAME" | "INDEX" | "UNMATCHED" = "UNMATCHED";

    // 1) Prioritas 1: Cocokkan via NIS
    if (rawNis) {
      const cleanNis = rawNis.replace(/\D/g, "");
      matchedStudentIndex = students.findIndex(
        (s) => s.nis && s.nis.replace(/\D/g, "") === cleanNis && !claimedStudentIds.has(s.id)
      );
      if (matchedStudentIndex !== -1) {
        matchType = "NIS";
      }
    }

    // 2) Prioritas 2: Cocokkan via Nama Persis
    if (matchedStudentIndex === -1 && rawName) {
      const normInput = normalizeStudentName(rawName);
      matchedStudentIndex = students.findIndex(
        (s) => normalizeStudentName(s.fullName) === normInput && !claimedStudentIds.has(s.id)
      );
      if (matchedStudentIndex !== -1) {
        matchType = "NAME";
      }
    }

    // 3) Prioritas 3: Cocokkan via Nama Sebagian (Substring / Bagian Nama)
    if (matchedStudentIndex === -1 && rawName) {
      const normInput = normalizeStudentName(rawName);
      if (normInput.length >= 4) {
        matchedStudentIndex = students.findIndex((s) => {
          if (claimedStudentIds.has(s.id)) return false;
          const normS = normalizeStudentName(s.fullName);
          return normS.includes(normInput) || normInput.includes(normS);
        });
        if (matchedStudentIndex !== -1) {
          matchType = "NAME";
        }
      }
    }

    // 4) Prioritas 4: Fallback Sekuensial (Nomor Absen 1, 2, 3...) jika tidak ada NIS/Nama
    if (matchedStudentIndex === -1 && (!rawName && !rawNis || isSingleScoreList)) {
      if (sequentialIndex < students.length) {
        matchedStudentIndex = sequentialIndex;
        matchType = "INDEX";
      }
    }

    sequentialIndex++;

    if (matchedStudentIndex !== -1) {
      const matchedStudent = students[matchedStudentIndex];
      claimedStudentIds.add(matchedStudent.id);

      resultRows[matchedStudentIndex].score = scoreNum;
      resultRows[matchedStudentIndex].scoreText = scoreText;
      resultRows[matchedStudentIndex].matchType = matchType;
      resultRows[matchedStudentIndex].matchDetail =
        matchType === "NIS"
          ? `Cocok NIS: ${rawNis}`
          : matchType === "NAME"
          ? `Cocok Nama: "${rawName}"`
          : `Urutan Absen #${matchedStudentIndex + 1}`;

      if (scoreText !== "") {
        scoresMap[matchedStudent.id] = scoreText;
      }
    } else {
      unmatchedFileRows.push({
        rawRow: row,
        rowNumber: r + 1,
        reason: rawName || rawNis ? `Tidak ditemukan siswa dengan NIS: ${rawNis || "-"} / Nama: "${rawName || "-"}"` : "Baris data tidak dikenali",
      });
    }
  }

  const matchedCount = Object.keys(scoresMap).length;
  const unmatchedCount = students.length - matchedCount;

  if (unmatchedCount > 0) {
    warnings.push(`${unmatchedCount} dari ${students.length} siswa belum terisi nilainya dari berkas.`);
  }
  if (unmatchedFileRows.length > 0) {
    warnings.push(`${unmatchedFileRows.length} baris pada berkas tidak cocok dengan data siswa kelas.`);
  }

  return {
    totalStudentsInClass: students.length,
    matchedCount,
    unmatchedCount,
    scoresMap,
    rows: resultRows,
    unmatchedFileRows,
    warnings,
  };
}

/**
 * Parsing berkas Excel / CSV yang diunggah pengguna
 */
export async function parseGradesFromFile(
  file: File,
  students: Student[]
): Promise<GradeImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Berkas Excel/CSV tidak memiliki lembar kerja (worksheet).");
  }
  const sheet = wb.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
  return matchGradeRowsToStudents(matrix, students);
}

/**
 * Parsing data teks yang disalin-tempel (paste) langsung dari Excel / spreadsheet
 */
export function parseGradesFromPastedText(
  pastedText: string,
  students: Student[]
): GradeImportResult {
  const lines = pastedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const matrix: any[][] = lines.map((line) => {
    if (line.includes("\t")) {
      return line.split("\t").map((c) => c.trim());
    }
    if (line.includes(";")) {
      return line.split(";").map((c) => c.trim());
    }
    if (line.includes(",") && !/^\d+,\d+$/.test(line)) {
      return line.split(",").map((c) => c.trim());
    }
    return [line];
  });

  return matchGradeRowsToStudents(matrix, students);
}

/**
 * Membuat berkas template Excel (.xlsx) kosong siap isi untuk kelas dan asesmen terpilih
 */
export function generateGradeImportTemplateXlsx(
  className: string,
  assessmentTitle: string,
  students: Student[]
): Uint8Array {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    ["FORMAT IMPOR NILAI SISWA - SMP NEGERI 3 CIBUNGBULANG"],
    [`KELAS: ${className.toUpperCase()} | PENILAIAN: ${assessmentTitle.toUpperCase()}`],
    ["PETUNJUK: Masukkan angka nilai (0-100) pada kolom NILAI di bawah. Jangan ubah urutan atau NIS siswa."],
    [], // Baris kosong
    ["NO", "NIS / NIPD", "NAMA LENGKAP SISWA", "L/P", "NILAI (0-100)"],
  ];

  const dataRows = students.map((s, idx) => [
    idx + 1,
    s.nis ?? "",
    s.fullName,
    s.gender ?? "-",
    "", // Kolom nilai kosong untuk diisi
  ]);

  const allRows = [...titleRows, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Atur lebar kolom
  ws["!cols"] = [
    { wch: 6 },  // NO
    { wch: 15 }, // NIS
    { wch: 32 }, // NAMA
    { wch: 6 },  // L/P
    { wch: 16 }, // NILAI
  ];

  // Styling sederhana dengan xlsx-js-style
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "0F6B4F" } }, // Emerald accent
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "CCCCCC" } },
      bottom: { style: "thin", color: { rgb: "CCCCCC" } },
      left: { style: "thin", color: { rgb: "CCCCCC" } },
      right: { style: "thin", color: { rgb: "CCCCCC" } },
    },
  };

  // Terapkan style header kolom pada baris 5 (indeks 4)
  const headerCells = ["A5", "B5", "C5", "D5", "E5"];
  headerCells.forEach((c) => {
    if (ws[c]) ws[c].s = headerStyle;
  });

  XLSX.utils.book_append_sheet(wb, ws, "Input Nilai");
  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(buffer);
}
