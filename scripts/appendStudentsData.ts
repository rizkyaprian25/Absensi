import fs from "fs";
import path from "path";

const jsonPath = path.join(process.cwd(), "scripts", "all_extracted_8c_8g.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const filePath = path.join(process.cwd(), "src", "contracts", "mocks", "studentsData.ts");
let fileContent = fs.readFileSync(filePath, "utf8");

// Potong dari `export const ALL_STUDENTS_BY_CLASS`
const splitMarker = "/** Pemetaan seluruh data siswa terdaftar berdasarkan ID Kelas */";
const [beforeSplit] = fileContent.split(splitMarker);

let newCode = "";
for (const [classId, students] of Object.entries(data)) {
  const varName = "STUDENTS_" + classId.replace("-", "_").toUpperCase();
  newCode += `export const ${varName}: Student[] = [\n`;
  for (const s of (students as any[])) {
    const escapedName = s.fullName.replace(/"/g, '\\"');
    newCode += `  { id: "${s.id}", classId: "${s.classId}", nis: "${s.nis}", fullName: "${escapedName}", gender: "${s.gender}", isActive: true, createdAt: "2026-07-15T00:00:00Z" },\n`;
  }
  newCode += "];\n\n";
}

const newAllStudentsMapping = `/** Pemetaan seluruh data siswa terdaftar berdasarkan ID Kelas */
export const ALL_STUDENTS_BY_CLASS: Record<string, Student[]> = {
  "class-7a": STUDENTS_CLASS_7A,
  "class-7b": STUDENTS_CLASS_7B,
  "class-7c": STUDENTS_CLASS_7C,
  "class-7d": STUDENTS_CLASS_7D,
  "class-7e": STUDENTS_CLASS_7E,
  "class-7f": STUDENTS_CLASS_7F,
  "class-7g": STUDENTS_CLASS_7G,
  "class-7h": STUDENTS_CLASS_7H,
  "class-8a": STUDENTS_CLASS_8A,
  "class-8b": STUDENTS_CLASS_8B,
  "class-8c": STUDENTS_CLASS_8C,
  "class-8d": STUDENTS_CLASS_8D,
  "class-8e": STUDENTS_CLASS_8E,
  "class-8f": STUDENTS_CLASS_8F,
  "class-8g": STUDENTS_CLASS_8G,
  "class-9a": [],
  "class-9b": [],
  "class-9c": [],
  "class-9d": [],
  "class-9e": [],
  "class-9f": [],
  "class-9g": [],
};
`;

const finalContent = beforeSplit + newCode + newAllStudentsMapping;
fs.writeFileSync(filePath, finalContent, "utf8");
console.log("src/contracts/mocks/studentsData.ts berhasil diperbarui!");
