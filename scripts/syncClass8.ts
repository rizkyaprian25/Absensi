import fs from "fs";
import path from "path";

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
  const { supabase } = await import("../src/lib/supabaseClient.ts");
  const { MOCK_CLASSES } = await import("../src/contracts/mocks/attendanceMocks.ts");
  const { STUDENTS_CLASS_8A, STUDENTS_CLASS_8B, ALL_STUDENTS_BY_CLASS } = await import(
    "../src/contracts/mocks/studentsData.ts"
  );

  if (!supabase) {
    throw new Error("Klien Supabase belum terkonfigurasi.");
  }

  console.log("=== SINKRONISASI DATA KELAS 8 KE SUPABASE DATABASE ===");

  // 1. Pastikan Rombel Kelas 8A dan 8B sudah ada di tabel classes
  const classRows = MOCK_CLASSES.map((c) => ({
    id: c.id,
    teacher_id: c.teacherId,
    name: c.name,
    academic_year: c.academicYear,
    semester: c.semester,
    archived_at: c.archivedAt,
    created_at: c.createdAt,
    schedule_day: c.scheduleDay,
    schedule_time: c.scheduleTime,
    schedule_period: c.schedulePeriod,
    subject: c.subject || "Informatika",
  }));

  const { error: errClasses } = await supabase
    .from("classes")
    .upsert(classRows, { onConflict: "id" });

  if (errClasses) {
    console.error("Gagal upsert classes:", errClasses.message);
  } else {
    console.log("✓ Tabel classes berhasil disinkronkan (10 rombel: 7A-7H, 8A, 8B).");
  }

  // 2. Siapkan data siswa kelas 8A dan 8B
  const allStudents = [...STUDENTS_CLASS_8A, ...STUDENTS_CLASS_8B];
  console.log(`Menyiapkan ${allStudents.length} siswa kelas 8 (${STUDENTS_CLASS_8A.length} di 8A, ${STUDENTS_CLASS_8B.length} di 8B)...`);

  const studentRows = allStudents.map((s) => ({
    id: s.id,
    class_id: s.classId,
    nis: s.nis || null,
    full_name: s.fullName,
    gender: s.gender === "P" ? "P" : "L",
    is_active: s.isActive ?? true,
    created_at: s.createdAt,
  }));

  const { error: errStudents } = await supabase
    .from("students")
    .upsert(studentRows, { onConflict: "id" });

  if (errStudents) {
    console.error("Gagal upsert students kelas 8:", errStudents.message);
  } else {
    console.log(`✓ Berhasil memasukkan ${studentRows.length} siswa kelas 8 ke database Supabase!`);
  }

  // 3. Verifikasi jumlah total siswa kelas 8 di database
  const { data: countData, error: countErr } = await supabase
    .from("students")
    .select("class_id, count", { count: "exact" })
    .in("class_id", ["class-8a", "class-8b"]);

  console.log("Hasil Verifikasi Database Supabase:");
  const { count: count8A } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("class_id", "class-8a");
  const { count: count8B } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("class_id", "class-8b");

  console.log(`• Siswa Kelas 8A di Database: ${count8A} siswa`);
  console.log(`• Siswa Kelas 8B di Database: ${count8B} siswa`);
  console.log(`• Total Siswa Kelas 8 Siap Di-Enroll: ${(count8A ?? 0) + (count8B ?? 0)} siswa`);
}

run().catch((err) => {
  console.error("Terjadi kesalahan:", err);
  process.exit(1);
});
