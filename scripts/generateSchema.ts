import fs from "fs";
import path from "path";
import { MOCK_CLASSES } from "../src/contracts/mocks/attendanceMocks.ts";
import { ALL_STUDENTS_BY_CLASS } from "../src/contracts/mocks/studentsData.ts";
import { DEFAULT_HOLIDAYS } from "../src/lib/calendarUtils.ts";

function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}

function generateSql(): string {
  const lines: string[] = [];

  lines.push(`-- ============================================================================`);
  lines.push(`-- SKEMA DATABASE BUKU PRESENSI DIGITAL & ASESMEN SISWA`);
  lines.push(`-- SMP NEGERI 3 CIBUNGBULANG - KABUPATEN BOGOR`);
  lines.push(`-- TAHUN AJARAN 2026/2027 (INFORMATIKA)`);
  lines.push(`-- ============================================================================`);
  lines.push(`-- Script ini bersifat idempoten (aman dijalankan berkali-kali di SQL Editor).`);
  lines.push(``);

  // 1. Tabel classes
  lines.push(`-- 1. TABEL KELAS`);
  lines.push(`CREATE TABLE IF NOT EXISTS classes (`);
  lines.push(`  id TEXT PRIMARY KEY,`);
  lines.push(`  teacher_id TEXT NOT NULL,`);
  lines.push(`  name VARCHAR(50) NOT NULL,`);
  lines.push(`  academic_year VARCHAR(20) NOT NULL,`);
  lines.push(`  semester INTEGER DEFAULT 1,`);
  lines.push(`  archived_at TIMESTAMPTZ,`);
  lines.push(`  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),`);
  lines.push(`  schedule_day VARCHAR(20),`);
  lines.push(`  schedule_time VARCHAR(50),`);
  lines.push(`  schedule_period VARCHAR(50),`);
  lines.push(`  subject VARCHAR(80) DEFAULT 'Informatika'`);
  lines.push(`);`);
  lines.push(``);

  // 2. Tabel students
  lines.push(`-- 2. TABEL SISWA`);
  lines.push(`CREATE TABLE IF NOT EXISTS students (`);
  lines.push(`  id TEXT PRIMARY KEY,`);
  lines.push(`  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,`);
  lines.push(`  nis VARCHAR(20),`);
  lines.push(`  full_name VARCHAR(100) NOT NULL,`);
  lines.push(`  gender VARCHAR(1) CHECK (gender IN ('L', 'P')),`);
  lines.push(`  is_active BOOLEAN DEFAULT TRUE,`);
  lines.push(`  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())`);
  lines.push(`);`);
  lines.push(``);

  // 3. Tabel attendance_sessions
  lines.push(`-- 3. TABEL SESI PRESENSI`);
  lines.push(`CREATE TABLE IF NOT EXISTS attendance_sessions (`);
  lines.push(`  id TEXT PRIMARY KEY,`);
  lines.push(`  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,`);
  lines.push(`  session_date DATE NOT NULL,`);
  lines.push(`  slot INTEGER DEFAULT 0,`);
  lines.push(`  subject VARCHAR(80),`);
  lines.push(`  topic VARCHAR(200),`);
  lines.push(`  learning_activities TEXT,`);
  lines.push(`  note TEXT,`);
  lines.push(`  client_request_id TEXT,`);
  lines.push(`  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),`);
  lines.push(`  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),`);
  lines.push(`  CONSTRAINT uq_sessions_class_date_slot UNIQUE (class_id, session_date, slot)`);
  lines.push(`);`);
  lines.push(``);

  // 4. Tabel attendance_records
  lines.push(`-- 4. TABEL REKAMAN KEHADIRAN SISWA`);
  lines.push(`CREATE TABLE IF NOT EXISTS attendance_records (`);
  lines.push(`  id TEXT PRIMARY KEY,`);
  lines.push(`  session_id TEXT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,`);
  lines.push(`  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,`);
  lines.push(`  status VARCHAR(20) NOT NULL CHECK (status IN ('HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TERLAMBAT', 'DISPEN')),`);
  lines.push(`  late_minutes INTEGER,`);
  lines.push(`  note TEXT,`);
  lines.push(`  CONSTRAINT uq_records_session_student UNIQUE (session_id, student_id)`);
  lines.push(`);`);
  lines.push(``);

  // 5. Tabel assessments
  lines.push(`-- 5. TABEL ASESMEN / PENILAIAN`);
  lines.push(`CREATE TABLE IF NOT EXISTS assessments (`);
  lines.push(`  id TEXT PRIMARY KEY,`);
  lines.push(`  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,`);
  lines.push(`  subject VARCHAR(80) DEFAULT 'Informatika',`);
  lines.push(`  type VARCHAR(20) NOT NULL CHECK (type IN ('TUGAS', 'UH', 'QUIZ', 'UTS', 'UAS', 'PRAKTIK', 'LAINNYA')),`);
  lines.push(`  title VARCHAR(150) NOT NULL,`);
  lines.push(`  description TEXT,`);
  lines.push(`  date DATE NOT NULL,`);
  lines.push(`  max_score NUMERIC DEFAULT 100,`);
  lines.push(`  weight NUMERIC DEFAULT 1,`);
  lines.push(`  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())`);
  lines.push(`);`);
  lines.push(``);

  // 6. Tabel student_scores
  lines.push(`-- 6. TABEL NILAI SISWA`);
  lines.push(`CREATE TABLE IF NOT EXISTS student_scores (`);
  lines.push(`  id TEXT PRIMARY KEY,`);
  lines.push(`  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,`);
  lines.push(`  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,`);
  lines.push(`  score NUMERIC CHECK (score >= 0 AND score <= 100),`);
  lines.push(`  feedback TEXT,`);
  lines.push(`  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),`);
  lines.push(`  CONSTRAINT uq_scores_assessment_student UNIQUE (assessment_id, student_id)`);
  lines.push(`);`);
  lines.push(``);

  // 7. Tabel holidays
  lines.push(`-- 7. TABEL HARI LIBUR & AGENDA KALENDER`);
  lines.push(`CREATE TABLE IF NOT EXISTS holidays (`);
  lines.push(`  id TEXT PRIMARY KEY,`);
  lines.push(`  date DATE NOT NULL UNIQUE,`);
  lines.push(`  name VARCHAR(150) NOT NULL,`);
  lines.push(`  category VARCHAR(30) NOT NULL CHECK (category IN ('NASIONAL', 'CUTI_BERSAMA', 'SEKOLAH', 'KHUSUS', 'UTS', 'UAS', 'KOKURIKULER')),`);
  lines.push(`  description TEXT,`);
  lines.push(`  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())`);
  lines.push(`);`);
  lines.push(``);

  // 8. Tabel app_snapshots
  lines.push(`-- 8. TABEL SNAPSHOT CADANGAN LENGKAP (DISASTER RECOVERY)`);
  lines.push(`CREATE TABLE IF NOT EXISTS app_snapshots (`);
  lines.push(`  id TEXT PRIMARY KEY,`);
  lines.push(`  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),`);
  lines.push(`  trigger VARCHAR(100),`);
  lines.push(`  checksum VARCHAR(50),`);
  lines.push(`  payload JSONB NOT NULL,`);
  lines.push(`  stats JSONB`);
  lines.push(`);`);
  lines.push(``);

  // Indeks Performa
  lines.push(`-- ============================================================================`);
  lines.push(`-- INDEKS PERFORMA QUERY CEPAT`);
  lines.push(`-- ============================================================================`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_sessions_class_date ON attendance_sessions(class_id, session_date);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_records_session_id ON attendance_records(session_id);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_records_student_id ON attendance_records(student_id);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_assessments_class_id ON assessments(class_id);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_scores_assessment_id ON student_scores(assessment_id);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_scores_student_id ON student_scores(student_id);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON app_snapshots(timestamp DESC);`);
  lines.push(``);

  // Row Level Security (RLS)
  lines.push(`-- ============================================================================`);
  lines.push(`-- KEAMANAN ROW LEVEL SECURITY (RLS)`);
  lines.push(`-- ============================================================================`);
  const tables = [
    "classes",
    "students",
    "attendance_sessions",
    "attendance_records",
    "assessments",
    "student_scores",
    "holidays",
    "app_snapshots",
  ];

  for (const tbl of tables) {
    lines.push(`ALTER TABLE ${tbl} ENABLE ROW LEVEL SECURITY;`);
    lines.push(`DROP POLICY IF EXISTS "Anon full access on ${tbl}" ON ${tbl};`);
    lines.push(
      `CREATE POLICY "Anon full access on ${tbl}" ON ${tbl} FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`
    );
  }
  lines.push(``);

  // SEED DATA: CLASSES
  lines.push(`-- ============================================================================`);
  lines.push(`-- SEED DATA: 10 KELAS SMPN 3 CIBUNGBULANG`);
  lines.push(`-- ============================================================================`);
  for (const c of MOCK_CLASSES) {
    lines.push(
      `INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)`
    );
    lines.push(
      `VALUES (${escapeSql(c.id)}, ${escapeSql(c.teacherId)}, ${escapeSql(c.name)}, ${escapeSql(
        c.academicYear
      )}, ${c.semester ?? 1}, NULL, ${escapeSql(c.createdAt)}, ${escapeSql(c.scheduleDay)}, ${escapeSql(
        c.scheduleTime
      )}, ${escapeSql(c.schedulePeriod)}, ${escapeSql(c.subject)})`
    );
    lines.push(
      `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;`
    );
  }
  lines.push(``);

  // SEED DATA: DEFAULT HOLIDAYS
  lines.push(`-- ============================================================================`);
  lines.push(`-- SEED DATA: HARI LIBUR NASIONAL`);
  lines.push(`-- ============================================================================`);
  for (const h of DEFAULT_HOLIDAYS) {
    lines.push(
      `INSERT INTO holidays (id, date, name, category, description)`
    );
    lines.push(
      `VALUES (${escapeSql(h.id)}, ${escapeSql(h.date)}, ${escapeSql(h.name)}, ${escapeSql(
        h.category
      )}, ${escapeSql(h.description)})`
    );
    lines.push(`ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`);
  }
  lines.push(``);

  // SEED DATA: SISWA (401 SISWA)
  lines.push(`-- ============================================================================`);
  lines.push(`-- SEED DATA: 401 SISWA OTENTIK LENGKAP KELAS 7A-7H & 8A-8B`);
  lines.push(`-- ============================================================================`);
  for (const [classId, students] of Object.entries(ALL_STUDENTS_BY_CLASS)) {
    lines.push(`-- Siswa ${classId.toUpperCase()} (${students.length} Siswa)`);
    for (const s of students) {
      lines.push(
        `INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)`
      );
      lines.push(
        `VALUES (${escapeSql(s.id)}, ${escapeSql(s.classId)}, ${escapeSql(s.nis)}, ${escapeSql(
          s.fullName
        )}, ${escapeSql(s.gender)}, ${s.isActive ? "TRUE" : "FALSE"}, ${escapeSql(s.createdAt)})`
      );
      lines.push(
        `ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;`
      );
    }
    lines.push(``);
  }

  return lines.join("\n");
}

const sqlContent = generateSql();
const outputPath = path.join(process.cwd(), "supabase", "schema.sql");
fs.writeFileSync(outputPath, sqlContent, "utf8");
console.log(`Berhasil membuat schema.sql di ${outputPath} (${(Buffer.byteLength(sqlContent, "utf8") / 1024).toFixed(1)} KB)`);
