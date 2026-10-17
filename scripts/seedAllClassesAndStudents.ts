import fs from "fs";
import path from "path";
import XLSX from "xlsx-js-style";

// 1. Muat variabel lingkungan dari .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [k, ...v] = trimmed.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  }
}

async function run() {
  console.log("=== EKSTRAKSI & SINKRONISASI KELAS 8C-8G DAN KELAS 9A-9G ===");

  const { supabase } = await import("../src/lib/supabaseClient.ts");
  if (!supabase) {
    throw new Error("Klien Supabase tidak terkonfigurasi.");
  }

  // 2. Baca file Excel Kelas 8
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

  interface ExtractedStudent {
    id: string;
    classId: string;
    nis: string;
    fullName: string;
    gender: "L" | "P";
    isActive: boolean;
    createdAt: string;
  }

  const studentsByClass: Record<string, ExtractedStudent[]> = {};
  const allNewStudents: ExtractedStudent[] = [];

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

        const stdObj: ExtractedStudent = {
          id: `std-${cr.classId}-${numStr}`,
          classId: cr.classId,
          nis: cleanNis,
          fullName: cleanName,
          gender,
          isActive: true,
          createdAt: "2026-07-15T00:00:00Z",
        };
        students.push(stdObj);
        allNewStudents.push(stdObj);
      }
    }

    studentsByClass[cr.classId] = students;
    console.log(`✓ Kelas ${cr.className}: Berhasil mengekstrak ${students.length} siswa.`);
  }

  // 3. Siapkan Daftar Rombel Kelas Tambahan:
  // Kelas 8: 8C, 8D, 8E, 8F, 8G
  // Kelas 9: 9A, 9B, 9C, 9D, 9E, 9F, 9G (Sesuai instruksi pengguna: buat kelasnya dulu saja)
  const teacherId = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
  const newClasses = [
    // Kelas 8 lanjutan
    { id: "class-8c", teacher_id: teacherId, name: "8C", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Senin", schedule_time: "07:30 – 09:15", schedule_period: "Jam Ke 1–3", subject: "Informatika" },
    { id: "class-8d", teacher_id: teacherId, name: "8D", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Selasa", schedule_time: "09:15 – 11:25", schedule_period: "Jam Ke 4–6", subject: "Informatika" },
    { id: "class-8e", teacher_id: teacherId, name: "8E", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Rabu", schedule_time: "07:30 – 09:15", schedule_period: "Jam Ke 1–3", subject: "Informatika" },
    { id: "class-8f", teacher_id: teacherId, name: "8F", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Kamis", schedule_time: "09:15 – 11:25", schedule_period: "Jam Ke 4–6", subject: "Informatika" },
    { id: "class-8g", teacher_id: teacherId, name: "8G", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Jumat", schedule_time: "08:50 – 10:35", schedule_period: "Jam Ke 1–2", subject: "Informatika" },
    // Kelas 9 (9A - 9G)
    { id: "class-9a", teacher_id: teacherId, name: "9A", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Senin", schedule_time: "07:30 – 09:15", schedule_period: "Jam Ke 1–3", subject: "Informatika" },
    { id: "class-9b", teacher_id: teacherId, name: "9B", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Senin", schedule_time: "09:15 – 11:25", schedule_period: "Jam Ke 4–6", subject: "Informatika" },
    { id: "class-9c", teacher_id: teacherId, name: "9C", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Selasa", schedule_time: "07:30 – 09:15", schedule_period: "Jam Ke 1–3", subject: "Informatika" },
    { id: "class-9d", teacher_id: teacherId, name: "9D", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Selasa", schedule_time: "09:15 – 11:25", schedule_period: "Jam Ke 4–6", subject: "Informatika" },
    { id: "class-9e", teacher_id: teacherId, name: "9E", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Rabu", schedule_time: "07:30 – 09:15", schedule_period: "Jam Ke 1–3", subject: "Informatika" },
    { id: "class-9f", teacher_id: teacherId, name: "9F", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Kamis", schedule_time: "07:30 – 09:15", schedule_period: "Jam Ke 1–3", subject: "Informatika" },
    { id: "class-9g", teacher_id: teacherId, name: "9G", academic_year: "2026/2027", semester: 1, archived_at: null, created_at: "2026-07-15T00:00:00Z", schedule_day: "Jumat", schedule_time: "07:00 – 08:45", schedule_period: "Jam Ke 1–2", subject: "Informatika" },
  ];

  console.log(`Mengunggah ${newClasses.length} rombel kelas ke tabel classes Supabase (8C-8G & 9A-9G)...`);
  const { error: errCls } = await supabase
    .from("classes")
    .upsert(newClasses, { onConflict: "id" });

  if (errCls) {
    console.error("Gagal upsert classes:", errCls.message);
  } else {
    console.log("✓ Rombel kelas 8C-8G dan 9A-9G berhasil disimpan di database Supabase.");
  }

  // 4. Masukkan seluruh siswa 8C-8G ke tabel students di Supabase
  console.log(`Mengunggah ${allNewStudents.length} siswa 8C-8G ke tabel students Supabase...`);
  const studentRows = allNewStudents.map((s) => ({
    id: s.id,
    class_id: s.classId,
    nis: s.nis || null,
    full_name: s.fullName,
    gender: s.gender,
    is_active: s.isActive,
    created_at: s.createdAt,
  }));

  const BATCH_SIZE = 100;
  for (let i = 0; i < studentRows.length; i += BATCH_SIZE) {
    const batch = studentRows.slice(i, i + BATCH_SIZE);
    const { error: errStd } = await supabase
      .from("students")
      .upsert(batch, { onConflict: "id" });
    if (errStd) {
      console.error(`Gagal batch ${i}:`, errStd.message);
    }
  }
  console.log(`✓ Berhasil memasukkan ${allNewStudents.length} siswa kelas 8C-8G ke database Supabase!`);

  // 5. Verifikasi jumlah siswa di Supabase per kelas 8
  for (const c of ["8A", "8B", "8C", "8D", "8E", "8F", "8G"]) {
    const cid = `class-${c.toLowerCase()}`;
    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("class_id", cid);
    console.log(`• Siswa Kelas ${c} (${cid}) di Database: ${count} siswa`);
  }

  // 6. Tulis data ke file JSON agar dapat disematkan ke studentsData.ts
  fs.writeFileSync(
    path.join(process.cwd(), "scripts", "all_extracted_8c_8g.json"),
    JSON.stringify(studentsByClass, null, 2)
  );
  console.log("Selesai!");
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
