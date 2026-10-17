import XLSX from "xlsx-js-style";
import type { Student, Class } from "../contracts/attendance.ts";
import { ALL_STUDENTS_BY_CLASS, MOCK_CLASSES } from "../contracts/mocks/attendanceMocks.ts";
import type {
  StudentPpdbImportRow,
  StudentPromotionRecord,
  StudentMutationRecord,
  StudentMutationReasonCategory,
  StudentAcademicStatus,
} from "../contracts/academic.ts";

// ============================================================================
// KUNCI PENYIMPANAN DATA ROLLOVER, PPDB & MUTASI (LOCALSTORAGE SSOT)
// ============================================================================

export const STORAGE_KEY_DYNAMIC_STUDENTS = "absensi_dynamic_students_v1";
export const STORAGE_KEY_PROMOTION_LOGS = "absensi_promotion_logs_v1";
export const STORAGE_KEY_ALUMNI_STUDENTS = "absensi_alumni_students_v1";
export const STORAGE_KEY_STUDENT_MUTATIONS = "absensi_student_mutations_v1";

export interface AlumniStudentRecord {
  id: string;
  nis: string;
  nisn?: string | null;
  name: string;
  gender: "L" | "P";
  graduationYear: string; // contoh: "2026/2027"
  lastClass: string; // contoh: "9A"
  graduatedAt: string;
}

// ============================================================================
// AKSES DATA SISWA DINAMIS (SSOT: MEMADUKAN DATA OTENTIK DENGAN SISWA BARU / PROMOSI)
// ============================================================================

/**
 * Mengambil peta seluruh siswa aktif per rombel kelas dari penyimpanan lokal
 */
export function getStoredDynamicStudentsMap(): Record<string, Student[]> {
  if (typeof window === "undefined") {
    return ALL_STUDENTS_BY_CLASS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_DYNAMIC_STUDENTS);
    if (!raw) {
      // Inisialisasi awal dengan data otentik sekolah (7A-7H, 8A-8G)
      localStorage.setItem(STORAGE_KEY_DYNAMIC_STUDENTS, JSON.stringify(ALL_STUDENTS_BY_CLASS));
      return ALL_STUDENTS_BY_CLASS;
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : ALL_STUDENTS_BY_CLASS;
  } catch (err) {
    console.warn("Gagal membaca data siswa dinamis:", err);
    return ALL_STUDENTS_BY_CLASS;
  }
}

/**
 * Menyimpan seluruh peta siswa aktif ke penyimpanan lokal
 */
export function saveDynamicStudentsMap(map: Record<string, Student[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_DYNAMIC_STUDENTS, JSON.stringify(map));
  } catch (err) {
    console.warn("Gagal menyimpan data siswa dinamis:", err);
  }
}

/**
 * Mendapatkan daftar siswa untuk suatu kelas dengan memperhitungkan data dinamis
 */
export function getDynamicStudentsForClass(classId: string): Student[] {
  const map = getStoredDynamicStudentsMap();
  return map[classId] ?? ALL_STUDENTS_BY_CLASS[classId] ?? [];
}

/**
 * Menghitung rekap total seluruh siswa aktif di sekolah
 */
export function getSchoolTotalStudentsStats(): {
  total: number;
  totalL: number;
  totalP: number;
  byGrade: { grade7: number; grade8: number; grade9: number };
} {
  const map = getStoredDynamicStudentsMap();
  let total = 0;
  let totalL = 0;
  let totalP = 0;
  let grade7 = 0;
  let grade8 = 0;
  let grade9 = 0;

  for (const [classId, students] of Object.entries(map)) {
    if (!Array.isArray(students)) continue;
    total += students.length;

    for (const s of students) {
      if (s.gender === "L") totalL++;
      else if (s.gender === "P") totalP++;
    }

    if (classId.includes("7")) {
      grade7 += students.length;
    } else if (classId.includes("8")) {
      grade8 += students.length;
    } else if (classId.includes("9")) {
      grade9 += students.length;
    }
  }

  return { total, totalL, totalP, byGrade: { grade7, grade8, grade9 } };
}

// ============================================================================
// MESIN PEMBUATAN TEMPLATE XLSX PPDB RESMI
// ============================================================================

/**
 * Menghasilkan berkas Excel template PPDB resmi (.xlsx) dengan instruksi dan baris contoh
 */
export function generatePpdbTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Data Baris Template
  const headers = [
    "NO",
    "NIS",
    "NISN",
    "NAMA_LENGKAP",
    "JENIS_KELAMIN",
    "KELAS_ROMBEL",
    "TEMPAT_LAHIR",
    "TANGGAL_LAHIR",
    "NAMA_WALI",
    "NO_WHATSAPP",
  ];

  // Baris panduan contoh (Dummy data realistis untuk contoh pengisian)
  const sampleRows = [
    [1, "262707001", "0112345671", "ADITIA PRATAMA", "L", "7A", "Bogor", "2013-05-12", "Suryana", "081234567890"],
    [2, "262707002", "0112345672", "BELLA SAFITRI", "P", "7A", "Bogor", "2013-08-21", "Maman", "081234567891"],
    [3, "262707003", "0112345673", "CANDRA WIJAYA", "L", "", "Bogor", "2013-02-14", "Herman", "081234567892"],
    [4, "262707004", "0112345674", "DINA MARIANA", "P", "", "Jakarta", "2013-11-09", "Agus", "081234567893"],
    [5, "262707005", "0112345675", "EKO PRASETYO", "L", "7B", "Bogor", "2013-07-30", "Bambang", "081234567894"],
  ];

  const wsData = [
    ["FORMAT IMPOR DATA SISWA BARU PPDB — SMP NEGERI 3 CIBUNGBULANG"],
    ["Tahun Ajaran 2026/2027 · Rombongan Belajar Kelas 7 (7A s.d. 7H)"],
    [],
    headers,
    ...sampleRows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Lebar kolom optimal
  ws["!cols"] = [
    { wch: 6 },  // NO
    { wch: 14 }, // NIS
    { wch: 16 }, // NISN
    { wch: 32 }, // NAMA_LENGKAP
    { wch: 16 }, // JENIS_KELAMIN
    { wch: 16 }, // KELAS_ROMBEL
    { wch: 18 }, // TEMPAT_LAHIR
    { wch: 16 }, // TANGGAL_LAHIR
    { wch: 22 }, // NAMA_WALI
    { wch: 18 }, // NO_WHATSAPP
  ];

  // Styling Header Judul & Tabel
  const headerStyle = {
    font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1E3A8A" } }, // Biru Gelap Presisi
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "CCCCCC" } },
      bottom: { style: "medium", color: { rgb: "1E3A8A" } },
      left: { style: "thin", color: { rgb: "CCCCCC" } },
      right: { style: "thin", color: { rgb: "CCCCCC" } },
    },
  };

  // Terapkan style header di baris ke-4 (indeks row 3)
  for (let c = 0; c < headers.length; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 3, c });
    if (ws[cellRef]) {
      ws[cellRef].s = headerStyle;
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "DATA_SISWA_PPDB");

  // Sheet Petunjuk Pengisian
  const instructions = [
    ["PETUNJUK PENGISIAN TEMPLATE EXCEL PPDB"],
    [""],
    ["1. Jangan mengubah nama kolom header pada baris ke-4."],
    ["2. Kolom NIS dan NAMA_LENGKAP adalah kolom wajib (tidak boleh kosong)."],
    ["3. Kolom JENIS_KELAMIN hanya boleh diisi huruf 'L' (Laki-laki) atau 'P' (Perempuan)."],
    ["4. Kolom KELAS_ROMBEL dapat diisi '7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'."],
    ["   Jika kolom KELAS_ROMBEL dikosongkan, sistem menyediakan opsi Alokasi Otomatis Berimbang"],
    ["   yang akan membagi siswa secara rata ke 8 kelas 7 dengan komposisi gender seimbang."],
    ["5. Kolom TANGGAL_LAHIR disarankan menggunakan format YYYY-MM-DD (contoh: 2013-05-12)."],
    ["6. Hapus baris contoh sebelum mengunggah berkas jika tidak ingin menyertakannya."],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(instructions);
  wsGuide["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, "PETUNJUK");

  return wb;
}

/**
 * Memicu pengunduhan berkas template XLSX PPDB langsung di browser pengguna
 */
export function downloadPpdbTemplate(): void {
  if (typeof window === "undefined") return;
  const wb = generatePpdbTemplateWorkbook();
  XLSX.writeFile(wb, "TEMPLATE_PPDB_SMPN3_CIBUNGBULANG.xlsx");
}

// ============================================================================
// MESIN PARSER & VALIDASI CERDAS BERKAS PPDB
// ============================================================================

export interface ParsedPpdbResult {
  totalRows: number;
  validRows: StudentPpdbImportRow[];
  errorRows: { rowNumber: number; nis?: string; name?: string; message: string }[];
  summary: {
    totalL: number;
    totalP: number;
    unassignedClassCount: number;
    assignedClassCounts: Record<string, number>;
  };
}

/**
 * Membaca dan memvalidasi berkas Excel (.xlsx / .xls / .csv) data siswa baru PPDB
 */
export function parsePpdbExcelBuffer(buffer: ArrayBuffer): ParsedPpdbResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];

  if (!ws) {
    throw new Error("Lembar kerja Excel kosong atau tidak terbaca.");
  }

  // Konversi sheet ke matriks array of array
  const rawMatrix: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

  if (rawMatrix.length === 0) {
    throw new Error("Berkas tidak memiliki data baris.");
  }

  // Temukan baris header (mencari baris yang mengandung 'NAMA' atau 'NIS')
  let headerRowIndex = -1;
  for (let r = 0; r < Math.min(10, rawMatrix.length); r++) {
    const row = rawMatrix[r];
    const joined = row.map((cell) => String(cell).toUpperCase()).join(" ");
    if (joined.includes("NAMA") && (joined.includes("NIS") || joined.includes("KELAMIN"))) {
      headerRowIndex = r;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(
      "Format header tidak dikenali. Pastikan template memuat kolom NIS, NAMA_LENGKAP, dan JENIS_KELAMIN."
    );
  }

  const headerRow = rawMatrix[headerRowIndex].map((c) => String(c).trim().toUpperCase());
  const colNis = headerRow.findIndex((h) => h.includes("NIS") && !h.includes("NISN"));
  const colNisn = headerRow.findIndex((h) => h.includes("NISN"));
  const colName = headerRow.findIndex((h) => h.includes("NAMA"));
  const colGender = headerRow.findIndex((h) => h.includes("KELAMIN") || h === "JK" || h === "GENDER");
  const colClass = headerRow.findIndex((h) => h.includes("KELAS") || h.includes("ROMBEL"));
  const colBirthPlace = headerRow.findIndex((h) => h.includes("TEMPAT"));
  const colBirthDate = headerRow.findIndex((h) => h.includes("TANGGAL") || h.includes("LAHIR"));
  const colGuardian = headerRow.findIndex((h) => h.includes("WALI") || h.includes("ORANG"));
  const colPhone = headerRow.findIndex((h) => h.includes("HP") || h.includes("WA") || h.includes("TELP"));

  const validRows: StudentPpdbImportRow[] = [];
  const errorRows: { rowNumber: number; nis?: string; name?: string; message: string }[] = [];
  const existingMap = getStoredDynamicStudentsMap();
  const allExistingNis = new Set<string>();

  for (const students of Object.values(existingMap)) {
    if (Array.isArray(students)) {
      for (const s of students) {
        if (s.nis) allExistingNis.add(String(s.nis).trim());
      }
    }
  }

  const seenNisInBatch = new Set<string>();
  const assignedClassCounts: Record<string, number> = {};
  let totalL = 0;
  let totalP = 0;
  let unassignedClassCount = 0;

  for (let r = headerRowIndex + 1; r < rawMatrix.length; r++) {
    const row = rawMatrix[r];
    // Lewati baris kosong
    if (!row || row.every((c) => c === "" || c === null || c === undefined)) {
      continue;
    }

    const rowNum = r + 1;
    const rawNis = colNis !== -1 ? String(row[colNis] || "").trim() : "";
    const rawNisn = colNisn !== -1 ? String(row[colNisn] || "").trim() : "";
    const rawName = colName !== -1 ? String(row[colName] || "").trim().toUpperCase() : "";
    const rawGender = colGender !== -1 ? String(row[colGender] || "").trim().toUpperCase() : "";
    const rawClass = colClass !== -1 ? String(row[colClass] || "").trim().toUpperCase() : "";
    const birthPlace = colBirthPlace !== -1 ? String(row[colBirthPlace] || "").trim() : "";
    const birthDate = colBirthDate !== -1 ? String(row[colBirthDate] || "").trim() : "";
    const guardianName = colGuardian !== -1 ? String(row[colGuardian] || "").trim() : "";
    const guardianPhone = colPhone !== -1 ? String(row[colPhone] || "").trim() : "";

    // Validasi Wajib: Nama Lengkap
    if (!rawName) {
      errorRows.push({ rowNumber: rowNum, nis: rawNis, name: "-", message: "Nama lengkap siswa kosong." });
      continue;
    }

    // Validasi Wajib: NIS
    if (!rawNis) {
      errorRows.push({ rowNumber: rowNum, nis: "-", name: rawName, message: "NIS siswa tidak boleh kosong." });
      continue;
    }

    // Pengecekan duplikat dalam file unggahan
    if (seenNisInBatch.has(rawNis)) {
      errorRows.push({
        rowNumber: rowNum,
        nis: rawNis,
        name: rawName,
        message: `Duplikat NIS ${rawNis} terdeteksi lebih dari satu kali dalam berkas.`,
      });
      continue;
    }
    seenNisInBatch.add(rawNis);

    // Pengecekan duplikat terhadap database yang sudah ada
    if (allExistingNis.has(rawNis)) {
      errorRows.push({
        rowNumber: rowNum,
        nis: rawNis,
        name: rawName,
        message: `NIS ${rawNis} sudah terdaftar pada siswa aktif di database sekolah.`,
      });
      continue;
    }

    // Normalisasi Gender
    let gender: "L" | "P" = "L";
    if (rawGender === "P" || rawGender.startsWith("PEREM") || rawGender === "WANITA") {
      gender = "P";
      totalP++;
    } else {
      gender = "L";
      totalL++;
    }

    // Normalisasi Kelas Rombel (7A - 7H)
    let targetClass: string | null = null;
    const cleanClass = rawClass.replace(/\s+/g, "");
    if (["7A", "7B", "7C", "7D", "7E", "7F", "7G", "7H"].includes(cleanClass)) {
      targetClass = cleanClass;
      assignedClassCounts[cleanClass] = (assignedClassCounts[cleanClass] || 0) + 1;
    } else {
      unassignedClassCount++;
    }

    validRows.push({
      nis: rawNis,
      nisn: rawNisn || null,
      fullName: rawName,
      gender,
      targetClass,
      birthPlace: birthPlace || null,
      birthDate: birthDate || null,
      guardianName: guardianName || null,
      guardianPhone: guardianPhone || null,
    });
  }

  return {
    totalRows: validRows.length + errorRows.length,
    validRows,
    errorRows,
    summary: {
      totalL,
      totalP,
      unassignedClassCount,
      assignedClassCounts,
    },
  };
}

// ============================================================================
// MESIN PENYIMPANAN DATA PPDB & ALOKASI BERIMBANG OTOMATIS
// ============================================================================

/**
 * Menyimpan data hasil impor PPDB ke penyimpanan lokal
 * @param validRows Baris siswa yang lolos validasi
 * @param autoBalance Jika true, membagi siswa tanpa rombel secara rata & seimbang gender ke kelas 7A-7H
 */
export function commitPpdbImport(
  validRows: StudentPpdbImportRow[],
  autoBalance = true
): { success: boolean; importedCount: number; perClassSummary: Record<string, number> } {
  const currentMap = getStoredDynamicStudentsMap();
  const class7Ids = ["class-7a", "class-7b", "class-7c", "class-7d", "class-7e", "class-7f", "class-7g", "class-7h"];

  // Pisahkan siswa yang sudah ada kelasnya dan yang belum ada kelasnya
  const manualAssigned: StudentPpdbImportRow[] = [];
  const unassignedMales: StudentPpdbImportRow[] = [];
  const unassignedFemales: StudentPpdbImportRow[] = [];

  for (const row of validRows) {
    if (!autoBalance && row.targetClass) {
      manualAssigned.push(row);
    } else if (autoBalance && row.targetClass) {
      manualAssigned.push(row);
    } else {
      if (row.gender === "L") unassignedMales.push(row);
      else unassignedFemales.push(row);
    }
  }

  const perClassSummary: Record<string, number> = {};

  // 1. Masukkan yang manual assigned
  for (const row of manualAssigned) {
    const targetClassId = `class-${row.targetClass!.toLowerCase()}`;
    if (!currentMap[targetClassId]) {
      currentMap[targetClassId] = [];
    }

    const currentLen = currentMap[targetClassId].length;
    const newStudent: Student = {
      id: `student-${row.targetClass!.toLowerCase()}-${Date.now()}-${currentLen + 1}`,
      classId: targetClassId,
      fullName: row.fullName,
      nis: row.nis,
      gender: row.gender,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    currentMap[targetClassId].push(newStudent);
    perClassSummary[row.targetClass!] = (perClassSummary[row.targetClass!] || 0) + 1;
  }

  // 2. Alokasikan siswa berimbang (Round-robin balancing untuk putra dan putri secara terpisah)
  let classIndex = 0;
  for (const male of unassignedMales) {
    const classId = class7Ids[classIndex % class7Ids.length];
    const className = classId.replace("class-", "").toUpperCase();
    if (!currentMap[classId]) currentMap[classId] = [];

    const newStudent: Student = {
      id: `student-${className.toLowerCase()}-${Date.now()}-${currentMap[classId].length + 1}`,
      classId,
      fullName: male.fullName,
      nis: male.nis,
      gender: "L",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    currentMap[classId].push(newStudent);
    perClassSummary[className] = (perClassSummary[className] || 0) + 1;
    classIndex++;
  }

  classIndex = 0;
  for (const female of unassignedFemales) {
    const classId = class7Ids[classIndex % class7Ids.length];
    const className = classId.replace("class-", "").toUpperCase();
    if (!currentMap[classId]) currentMap[classId] = [];

    const newStudent: Student = {
      id: `student-${className.toLowerCase()}-${Date.now()}-${currentMap[classId].length + 1}`,
      classId,
      fullName: female.fullName,
      nis: female.nis,
      gender: "P",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    currentMap[classId].push(newStudent);
    perClassSummary[className] = (perClassSummary[className] || 0) + 1;
    classIndex++;
  }

  // Simpan peta siswa yang telah diperbarui
  saveDynamicStudentsMap(currentMap);

  return {
    success: true,
    importedCount: validRows.length,
    perClassSummary,
  };
}

// ============================================================================
// MESIN KENAIKAN KELAS PARALEL & KELULUSAN KELAS 9 (ALUMNI)
// ============================================================================

/**
 * Menjalankan proses kelulusan siswa Kelas 9 menjadi Alumni
 * - Memindahkan siswa aktif kelas 9A s.d. 9G ke arsip Alumni
 * - Mengosongkan rombel 9 agar siap menampung kenaikan kelas dari kelas 8
 */
export function executeGraduationClass9(adminUsername: string): {
  success: boolean;
  graduatedCount: number;
  error?: string;
} {
  const currentMap = getStoredDynamicStudentsMap();
  const class9Ids = ["class-9a", "class-9b", "class-9c", "class-9d", "class-9e", "class-9f", "class-9g"];

  const alumniRecords: AlumniStudentRecord[] = [];
  const now = new Date().toISOString();

  // Ambil alumni lama
  let existingAlumni: AlumniStudentRecord[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALUMNI_STUDENTS);
    if (raw) existingAlumni = JSON.parse(raw);
  } catch (e) {
    console.warn("Gagal membaca arsip alumni lama:", e);
  }

  let count = 0;
  for (const cid of class9Ids) {
    const students = currentMap[cid] || [];
    const className = cid.replace("class-", "").toUpperCase();

    for (const s of students) {
      alumniRecords.push({
        id: s.id,
        nis: s.nis || "-",
        name: s.fullName,
        gender: s.gender === "P" ? "P" : "L",
        graduationYear: "2026/2027",
        lastClass: className,
        graduatedAt: now,
      });
      count++;
    }

    // Kosongkan rombel kelas 9
    currentMap[cid] = [];
  }

  // Simpan arsip alumni
  try {
    localStorage.setItem(STORAGE_KEY_ALUMNI_STUDENTS, JSON.stringify([...existingAlumni, ...alumniRecords]));
  } catch (e) {
    console.warn("Gagal menyimpan alumni:", e);
  }

  saveDynamicStudentsMap(currentMap);

  return {
    success: true,
    graduatedCount: count,
  };
}

/**
 * Menjalankan Kenaikan Kelas Paralel:
 * - Kelas 8 naik ke Kelas 9 (8A -> 9A, 8B -> 9B, ... 8G -> 9G)
 * - Kelas 7 naik ke Kelas 8 (7A -> 8A, 7B -> 8B, ... 7G -> 8G, 7H -> 8A/8B seimbang)
 * - Siswa yang ditandai tinggal kelas (retained) tetap berada di kelas asalnya
 */
export function executeParallelPromotion(
  retainedStudentIds: Set<string>,
  adminUsername: string
): {
  success: boolean;
  promotedToGrade9: number;
  promotedToGrade8: number;
  retainedCount: number;
} {
  const currentMap = getStoredDynamicStudentsMap();

  let promotedToGrade9 = 0;
  let promotedToGrade8 = 0;
  let retainedCount = 0;

  // 1. Promosikan Kelas 8 ke Kelas 9 (8A->9A, 8B->9B, dst.)
  const grade8Letters = ["a", "b", "c", "d", "e", "f", "g"];
  const newGrade9Map: Record<string, Student[]> = {};
  const remainingGrade8Map: Record<string, Student[]> = {};

  for (const l of grade8Letters) {
    const fromId = `class-8${l}`;
    const toId = `class-9${l}`;
    newGrade9Map[toId] = [];
    remainingGrade8Map[fromId] = [];

    const students = currentMap[fromId] || [];
    for (const s of students) {
      if (retainedStudentIds.has(s.id)) {
        // Siswa tinggal kelas di kelas 8
        remainingGrade8Map[fromId].push(s);
        retainedCount++;
      } else {
        // Naik ke kelas 9
        newGrade9Map[toId].push({
          ...s,
          classId: toId,
        });
        promotedToGrade9++;
      }
    }
  }

  // 2. Promosikan Kelas 7 ke Kelas 8 (7A->8A, 7B->8B, ... 7G->8G, 7H didistribusikan merata)
  const grade7Letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const newGrade8Map: Record<string, Student[]> = { ...remainingGrade8Map };
  const remainingGrade7Map: Record<string, Student[]> = {};

  for (const l of grade7Letters) {
    const fromId = `class-7${l}`;
    remainingGrade7Map[fromId] = [];

    // Tentukan kelas 8 tujuan (7A->8A ... 7G->8G, 7H ke 8A)
    const targetLetter = l === "h" ? "a" : l;
    const toId = `class-8${targetLetter}`;

    if (!newGrade8Map[toId]) newGrade8Map[toId] = [];

    const students = currentMap[fromId] || [];
    for (const s of students) {
      if (retainedStudentIds.has(s.id)) {
        // Siswa tinggal kelas di kelas 7
        remainingGrade7Map[fromId].push(s);
        retainedCount++;
      } else {
        // Naik ke kelas 8
        newGrade8Map[toId].push({
          ...s,
          classId: toId,
        });
        promotedToGrade8++;
      }
    }
  }

  // 3. Pasang hasil kenaikan ke peta utama
  // Rombel kelas 9 diisi hasil kenaikan kelas 8
  for (const [cid, studs] of Object.entries(newGrade9Map)) {
    currentMap[cid] = studs;
  }
  // Rombel kelas 8 diisi hasil kenaikan kelas 7 + siswa tinggal kelas 8
  for (const [cid, studs] of Object.entries(newGrade8Map)) {
    currentMap[cid] = studs;
  }
  // Rombel kelas 7 hanya menyisakan siswa yang tinggal kelas (siap menyambut PPDB baru)
  for (const [cid, studs] of Object.entries(remainingGrade7Map)) {
    currentMap[cid] = studs;
  }

  saveDynamicStudentsMap(currentMap);

  return {
    success: true,
    promotedToGrade9,
    promotedToGrade8,
    retainedCount,
  };
}

// ============================================================================
// MODUL BUKU INDUK DIGITAL & PENGARSIPAN MUTASI SISWA (AUDIT TRAIL DINAS)
// ============================================================================

/**
 * Mengambil seluruh arsip riwayat mutasi / siswa keluar dari penyimpanan lokal
 */
export function getStoredStudentMutations(): StudentMutationRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_MUTATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Gagal membaca arsip mutasi siswa:", err);
    return [];
  }
}

/**
 * Menyimpan seluruh arsip riwayat mutasi siswa ke penyimpanan lokal
 */
export function saveStoredStudentMutations(mutations: StudentMutationRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_STUDENT_MUTATIONS, JSON.stringify(mutations));
  } catch (err) {
    console.warn("Gagal menyimpan arsip mutasi siswa:", err);
  }
}

/**
 * Mengeluarkan atau memutasikan siswa dari rombel kelas aktif (Soft Deactivation)
 * Siswa tidak dihapus permanen, melainkan dipindahkan ke Buku Induk & Arsip Mutasi.
 * Seluruh riwayat presensi dan nilai lampau siswa tetap utuh 100%.
 */
export function deactivateStudentWithMutation(params: {
  studentId: string;
  classId: string;
  status?: StudentAcademicStatus;
  mutationDate: string;
  reasonCategory: StudentMutationReasonCategory;
  reasonDetail: string;
  destinationSchool?: string;
  referenceLetterNo?: string;
  adminUser: { id: string; fullName: string };
}): { success: boolean; mutationRecord?: StudentMutationRecord; error?: string } {
  const currentMap = getStoredDynamicStudentsMap();
  const classStudents = currentMap[params.classId] || [];
  const targetStudent = classStudents.find((s) => s.id === params.studentId);

  if (!targetStudent) {
    return {
      success: false,
      error: `Siswa dengan ID "${params.studentId}" tidak ditemukan di rombel kelas terpilih.`,
    };
  }

  const classObj = MOCK_CLASSES.find((c) => c.id === params.classId);
  const className = classObj?.name || params.classId;

  // 1. Keluarkan siswa dari rombel aktif
  currentMap[params.classId] = classStudents.filter((s) => s.id !== params.studentId);
  saveDynamicStudentsMap(currentMap);

  // 2. Buat rekaman resmi mutasi (Audit Trail)
  const mutationRecord: StudentMutationRecord = {
    id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentId: targetStudent.id,
    studentNis: targetStudent.nis || "-",
    studentNisn: null,
    studentName: targetStudent.fullName,
    gender: (targetStudent.gender as "L" | "P") || "L",
    lastClassId: params.classId,
    lastClassName: className,
    academicYear: "2026/2027",
    semester: 1,
    status: params.status || "TRANSFERRED",
    mutationDate: params.mutationDate,
    reasonCategory: params.reasonCategory,
    reasonDetail: params.reasonDetail,
    destinationSchool: params.destinationSchool?.trim() || null,
    referenceLetterNo: params.referenceLetterNo?.trim() || null,
    processedByUserId: params.adminUser.id,
    processedByUserName: params.adminUser.fullName,
    createdAt: new Date().toISOString(),
  };

  const existingMutations = getStoredStudentMutations();
  const updatedMutations = [mutationRecord, ...existingMutations];
  saveStoredStudentMutations(updatedMutations);

  return {
    success: true,
    mutationRecord,
  };
}

/**
 * Memulihkan siswa dari arsip mutasi kembali ke rombel kelas aktif (Reactivate / Pembatalan Mutasi)
 */
export function reactivateStudentFromMutation(mutationId: string): {
  success: boolean;
  error?: string;
} {
  const mutations = getStoredStudentMutations();
  const index = mutations.findIndex((m) => m.id === mutationId);

  if (index === -1) {
    return { success: false, error: "Rekaman mutasi siswa tidak ditemukan." };
  }

  const record = mutations[index];
  const currentMap = getStoredDynamicStudentsMap();
  if (!currentMap[record.lastClassId]) {
    currentMap[record.lastClassId] = [];
  }

  // Cek apakah siswa sudah ada di kelas tersebut
  const alreadyInClass = currentMap[record.lastClassId].some((s) => s.id === record.studentId);
  if (!alreadyInClass) {
    const restoredStudent: Student = {
      id: record.studentId,
      classId: record.lastClassId,
      nis: record.studentNis !== "-" ? record.studentNis : null,
      fullName: record.studentName,
      gender: record.gender,
      isActive: true,
      createdAt: record.createdAt,
    };
    currentMap[record.lastClassId].push(restoredStudent);
    // Urutkan berdasarkan nama
    currentMap[record.lastClassId].sort((a, b) => a.fullName.localeCompare(b.fullName, "id"));
    saveDynamicStudentsMap(currentMap);
  }

  // Hapus dari daftar mutasi aktif
  const updatedMutations = mutations.filter((m) => m.id !== mutationId);
  saveStoredStudentMutations(updatedMutations);

  return { success: true };
}

/**
 * Mengambil rekam jejak historis lengkap siswa (Presensi & Nilai) untuk keperluan audit Dinas Pendidikan
 */
export function getStudentHistoricalAuditData(studentId: string): {
  attendanceStats: {
    totalSessions: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    dispen: number;
    terlambat: number;
    persentase: number;
  };
  scores: Array<{
    assessmentId: string;
    subject: string;
    title: string;
    type: string;
    date: string;
    score: number;
    maxScore: number;
  }>;
} {
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;
  let dispen = 0;
  let terlambat = 0;
  let totalSessions = 0;

  if (typeof window !== "undefined") {
    try {
      const recordsRaw = localStorage.getItem("absensi_saved_records_v1");
      if (recordsRaw) {
        const records = JSON.parse(recordsRaw);
        if (Array.isArray(records)) {
          const studentRecords = records.filter((r: any) => r.studentId === studentId);
          totalSessions = studentRecords.length;
          for (const r of studentRecords) {
            if (r.status === "HADIR") hadir++;
            else if (r.status === "SAKIT") sakit++;
            else if (r.status === "IZIN") izin++;
            else if (r.status === "ALPA") alpa++;
            else if (r.status === "DISPEN") dispen++;
            else if (r.status === "TERLAMBAT") terlambat++;
          }
        }
      }
    } catch (e) {
      console.warn("Gagal membaca rekam presensi siswa:", e);
    }
  }

  const effectivePresence = hadir + dispen + terlambat;
  const persentase = totalSessions > 0 ? Number(((effectivePresence / totalSessions) * 100).toFixed(1)) : 100;

  // Baca rekam nilai siswa
  const scores: Array<{
    assessmentId: string;
    subject: string;
    title: string;
    type: string;
    date: string;
    score: number;
    maxScore: number;
  }> = [];

  if (typeof window !== "undefined") {
    try {
      const asgnsRaw = localStorage.getItem("absensi_grade_assessments_v2");
      const scoresRaw = localStorage.getItem("absensi_student_scores_v2");

      if (asgnsRaw && scoresRaw) {
        const assessments = JSON.parse(asgnsRaw);
        const allScores = JSON.parse(scoresRaw);

        if (Array.isArray(assessments) && Array.isArray(allScores)) {
          const studentScores = allScores.filter((s: any) => s.studentId === studentId);
          for (const sc of studentScores) {
            const asgn = assessments.find((a: any) => a.id === sc.assessmentId);
            if (asgn) {
              scores.push({
                assessmentId: asgn.id,
                subject: asgn.subject || "Informatika",
                title: asgn.title,
                type: asgn.type,
                date: asgn.date,
                score: sc.score,
                maxScore: asgn.maxScore || 100,
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Gagal membaca rekam nilai siswa:", e);
    }
  }

  return {
    attendanceStats: {
      totalSessions,
      hadir,
      sakit,
      izin,
      alpa,
      dispen,
      terlambat,
      persentase,
    },
    scores,
  };
}
