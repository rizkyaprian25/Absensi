import path from "path";
import XLSX from "xlsx-js-style";

const filePath = path.join(process.cwd(), "Kelas", "ABSEN KELAS 8 2026-2027.xlsx");
const workbook = XLSX.readFile(filePath);

console.log("Sheet names in ABSEN KELAS 8 2026-2027.xlsx:", workbook.SheetNames);

const sheet = workbook.Sheets["ABSEN KELAS"];
const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
console.log("Total baris di sheet ABSEN KELAS:", rows.length);
console.log("Menganalisis baris 107 sampai 393...");


const ranges = [
  { name: "8C", start: 107, end: 161 },
  { name: "8D", start: 162, end: 215 },
  { name: "8E", start: 216, end: 269 },
  { name: "8F", start: 270, end: 323 },
  { name: "8G", start: 324, end: 393 },
];

for (const r of ranges) {
  console.log(`\n=== KELAS ${r.name} ===`);
  const classRows = rows.slice(r.start - 1, r.end);
  // cari baris header No, NIPD / NIS, NISN, NAMA
  for (let i = 0; i < Math.min(8, classRows.length); i++) {
    console.log(`  Header row ${i + 1}:`, classRows[i]);
  }
  // cari baris siswa pertama dan terakhir
  const studentRows = classRows.filter(
    (row) => typeof row[0] === "number" && row[3] && typeof row[3] === "string"
  );
  console.log(`  Total siswa terdeteksi di ${r.name}: ${studentRows.length}`);
  if (studentRows.length > 0) {
    console.log("  Siswa pertama:", studentRows[0]);
    console.log("  Siswa terakhir:", studentRows[studentRows.length - 1]);
  }
}


