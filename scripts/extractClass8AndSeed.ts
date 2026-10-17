import fs from "fs";
import path from "path";
import XLSX from "xlsx-js-style";

const excelPath = path.join(process.cwd(), "Kelas", "ABSEN KELAS 8 2026-2027.xlsx");
const wb = XLSX.readFile(excelPath);
const sheet = wb.Sheets["ABSEN KELAS"];
const allRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

const classRanges = [
  { classId: "class-8c", className: "8C", start: 107, end: 161 },
  { classId: "class-8d", className: "8D", start: 162, end: 215 },
  { classId: "class-8e", className: "8E", start: 216, end: 269 },
  { classId: "class-8f", className: "8F", start: 270, end: 323 },
  { classId: "class-8g", className: "8G", start: 324, end: 393 },
];

export interface ExtractedStudent {
  id: string;
  classId: string;
  nis: string;
  fullName: string;
  gender: "L" | "P";
  isActive: boolean;
  createdAt: string;
}

const extractedByClass: Record<string, ExtractedStudent[]> = {};

for (const cr of classRanges) {
  const section = allRows.slice(cr.start - 1, cr.end);
  const students: ExtractedStudent[] = [];

  for (const row of section) {
    const no = row[0];
    const rawNis = row[1];
    const rawName = row[3];
    const rawGender = row[4];

    if (typeof no === "number" && rawName && typeof rawName === "string") {
      const cleanName = rawName.trim();
      const numStr = String(no).padStart(2, "0");
      const cleanNis = rawNis ? String(rawNis).trim() : `252607${numStr}`;
      const gender = String(rawGender).trim().toUpperCase() === "P" ? "P" : "L";

      students.push({
        id: `std-${cr.classId}-${numStr}`,
        classId: cr.classId,
        nis: cleanNis,
        fullName: cleanName,
        gender,
        isActive: true,
        createdAt: "2026-07-15T00:00:00Z",
      });
    }
  }

  extractedByClass[cr.classId] = students;
  console.log(`Kelas ${cr.className}: ${students.length} siswa berhasil diekstrak.`);
}

// Cetak ke format JSON untuk diperiksa
fs.writeFileSync(
  path.join(process.cwd(), "scripts", "extracted_8c_8g.json"),
  JSON.stringify(extractedByClass, null, 2)
);
console.log("Data berhasil disimpan ke scripts/extracted_8c_8g.json");
