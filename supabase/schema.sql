-- ============================================================================
-- SKEMA DATABASE BUKU PRESENSI DIGITAL & ASESMEN SISWA
-- SMP NEGERI 3 CIBUNGBULANG - KABUPATEN BOGOR
-- TAHUN AJARAN 2026/2027 (INFORMATIKA)
-- ============================================================================
-- Script ini bersifat idempoten (aman dijalankan berkali-kali di SQL Editor).

-- 1. TABEL KELAS
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  name VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester INTEGER DEFAULT 1,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  schedule_day VARCHAR(20),
  schedule_time VARCHAR(50),
  schedule_period VARCHAR(50),
  subject VARCHAR(80) DEFAULT 'Informatika'
);

-- 2. TABEL SISWA
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  nis VARCHAR(20),
  full_name VARCHAR(100) NOT NULL,
  gender VARCHAR(1) CHECK (gender IN ('L', 'P')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL SESI PRESENSI
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  slot INTEGER DEFAULT 0,
  subject VARCHAR(80),
  topic VARCHAR(200),
  learning_activities TEXT,
  note TEXT,
  client_request_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_sessions_class_date_slot UNIQUE (class_id, session_date, slot)
);

-- 4. TABEL REKAMAN KEHADIRAN SISWA
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TERLAMBAT', 'DISPEN')),
  late_minutes INTEGER,
  note TEXT,
  CONSTRAINT uq_records_session_student UNIQUE (session_id, student_id)
);

-- 5. TABEL ASESMEN / PENILAIAN
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject VARCHAR(80) DEFAULT 'Informatika',
  type VARCHAR(20) NOT NULL CHECK (type IN ('TUGAS', 'UH', 'QUIZ', 'UTS', 'UAS', 'PRAKTIK', 'LAINNYA')),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  max_score NUMERIC DEFAULT 100,
  weight NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. TABEL NILAI SISWA
CREATE TABLE IF NOT EXISTS student_scores (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_scores_assessment_student UNIQUE (assessment_id, student_id)
);

-- 7. TABEL HARI LIBUR & AGENDA KALENDER
CREATE TABLE IF NOT EXISTS holidays (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('NASIONAL', 'CUTI_BERSAMA', 'SEKOLAH', 'KHUSUS', 'UTS', 'UAS', 'KOKURIKULER')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. TABEL SNAPSHOT CADANGAN LENGKAP (DISASTER RECOVERY)
CREATE TABLE IF NOT EXISTS app_snapshots (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  trigger VARCHAR(100),
  checksum VARCHAR(50),
  payload JSONB NOT NULL,
  stats JSONB
);

-- ============================================================================
-- INDEKS PERFORMA QUERY CEPAT
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_sessions_class_date ON attendance_sessions(class_id, session_date);
CREATE INDEX IF NOT EXISTS idx_records_session_id ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_class_id ON assessments(class_id);
CREATE INDEX IF NOT EXISTS idx_scores_assessment_id ON student_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_scores_student_id ON student_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);
CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON app_snapshots(timestamp DESC);

-- ============================================================================
-- KEAMANAN ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access on classes" ON classes;
CREATE POLICY "Anon full access on classes" ON classes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access on students" ON students;
CREATE POLICY "Anon full access on students" ON students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access on attendance_sessions" ON attendance_sessions;
CREATE POLICY "Anon full access on attendance_sessions" ON attendance_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access on attendance_records" ON attendance_records;
CREATE POLICY "Anon full access on attendance_records" ON attendance_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access on assessments" ON assessments;
CREATE POLICY "Anon full access on assessments" ON assessments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER TABLE student_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access on student_scores" ON student_scores;
CREATE POLICY "Anon full access on student_scores" ON student_scores FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access on holidays" ON holidays;
CREATE POLICY "Anon full access on holidays" ON holidays FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER TABLE app_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon full access on app_snapshots" ON app_snapshots;
CREATE POLICY "Anon full access on app_snapshots" ON app_snapshots FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- SEED DATA: 10 KELAS SMPN 3 CIBUNGBULANG
-- ============================================================================
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-7a', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '7A', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Senin', '08:00 – 09:45', 'Jam Ke 1–3', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-7d', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '7D', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Senin', '10:10 – 11:55', 'Jam Ke 4–6', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-8b', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '8B', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Selasa', '07:30 – 09:15', 'Jam Ke 1–3', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-7b', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '7B', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Selasa', '09:15 – 11:25', 'Jam Ke 4–6', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-7f', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '7F', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Rabu', '07:30 – 09:15', 'Jam Ke 1–3', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-7e', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '7E', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Rabu', '09:15 – 11:25', 'Jam Ke 4–6', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-8a', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '8A', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Kamis', '07:30 – 09:15', 'Jam Ke 1–3', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-7h', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '7H', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Kamis', '09:15 – 11:25', 'Jam Ke 4–6', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-7g', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '7G', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Jumat', '08:00 – 09:30', 'Jam Ke 1–2', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;
INSERT INTO classes (id, teacher_id, name, academic_year, semester, archived_at, created_at, schedule_day, schedule_time, schedule_period, subject)
VALUES ('class-7c', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '7C', '2026/2027', 1, NULL, '2026-07-15T00:00:00Z', 'Jumat', '09:50 – 11:20', 'Jam Ke 3–4', 'Informatika')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule_day = EXCLUDED.schedule_day, schedule_time = EXCLUDED.schedule_time, schedule_period = EXCLUDED.schedule_period, subject = EXCLUDED.subject;

-- ============================================================================
-- SEED DATA: HARI LIBUR NASIONAL
-- ============================================================================
INSERT INTO holidays (id, date, name, category, description)
VALUES ('hld-2026-08-17', '2026-08-17', 'Hari Kemerdekaan RI ke-81', 'NASIONAL', 'Upacara bendera & peringatan kemerdekaan nasional')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO holidays (id, date, name, category, description)
VALUES ('hld-2026-08-25', '2026-08-25', 'Maulid Nabi Muhammad SAW', 'NASIONAL', 'Peringatan hari besar keagamaan nasional')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO holidays (id, date, name, category, description)
VALUES ('hld-2026-12-25', '2026-12-25', 'Hari Raya Natal', 'NASIONAL', 'Libur keagamaan nasional')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================================================
-- SEED DATA: 401 SISWA OTENTIK LENGKAP KELAS 7A-7H & 8A-8B
-- ============================================================================
-- Siswa CLASS-7A (40 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-01', 'class-7a', '262707001', 'ABDULLAH AL SAFWA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-02', 'class-7a', '262707002', 'AINUN DEPIRJA SOLEGAR', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-03', 'class-7a', '262707003', 'AIRIL', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-04', 'class-7a', '262707004', 'ALISSA NAURA ATHIFA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-05', 'class-7a', '262707005', 'AUDRA FEBRYANA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-06', 'class-7a', '262707006', 'AZHELA RUSDIANA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-07', 'class-7a', '262707007', 'AZKA AL HAFIDZ ARDIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-08', 'class-7a', '262707008', 'DAEROBI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-09', 'class-7a', '262707009', 'DIAN HANDAYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-10', 'class-7a', '262707010', 'EUIS PERMADANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-11', 'class-7a', '262707011', 'FEBRIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-12', 'class-7a', '262707012', 'HERIZKA SAPIRA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-13', 'class-7a', '262707013', 'ILHAM SHAPUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-14', 'class-7a', '262707014', 'KAYLA KUSUMA ARDINA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-15', 'class-7a', '262707015', 'M DIMAS PRATAMA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-16', 'class-7a', '262707016', 'M. WAFIQ RIDHO MUDAWAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-17', 'class-7a', '262707017', 'MARWA FATIH AQILAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-18', 'class-7a', '262707018', 'MUHAMAD AKBAR RAMADHAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-19', 'class-7a', '262707019', 'Muhamad Amril', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-20', 'class-7a', '262707020', 'MUHAMAD FIKRI AKBAR', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-21', 'class-7a', '262707021', 'MUHAMAD ILHAM SAPUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-22', 'class-7a', '262707022', 'MUHAMAD NURIL ANWAR', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-23', 'class-7a', '262707023', 'Muhamad Rizal Al Gipari', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-24', 'class-7a', '262707024', 'MUHAMAD YUSUF AL HAFIDZ', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-25', 'class-7a', '262707025', 'MUHAMMAD GIYAS MIFTAHULHA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-26', 'class-7a', '262707026', 'MUHAMMAD UMAR ZIYAD RISWANDI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-27', 'class-7a', '262707027', 'NABILA MUSLIMA TUZANAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-28', 'class-7a', '262707028', 'NAYLA AZHANA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-29', 'class-7a', '262707029', 'Nur Azizah', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-30', 'class-7a', '262707030', 'PUTRA RAMADHAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-31', 'class-7a', '262707031', 'RAISAH CAHAYA GUNAWAN', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-32', 'class-7a', '262707032', 'RESTU HAIKAL FADLI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-33', 'class-7a', '262707033', 'RUBBYANA TUN NAZWA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-34', 'class-7a', '262707034', 'SERA LATIPAH IMANDA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-35', 'class-7a', '262707035', 'SHOFIA ARSHIFA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-36', 'class-7a', '262707036', 'SITI NAFISA HAPSARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-37', 'class-7a', '262707037', 'SITI SRI RISTIYANA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-38', 'class-7a', '262707038', 'SYAKIRA MAWADDATUNNISA AZZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-39', 'class-7a', '262707039', 'YOVITA ARRELLY', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7a-40', 'class-7a', '262707040', 'YUGHI YUSUF MAULANA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-7B (40 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-01', 'class-7b', '262707041', 'ABIZAR MANDALA PUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-02', 'class-7b', '262707042', 'AISYAH HANDAYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-03', 'class-7b', '262707043', 'ALFIANSYAH PUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-04', 'class-7b', '262707044', 'Aliya Rahmania Putri', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-05', 'class-7b', '262707045', 'AULIA AGUSTINA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-06', 'class-7b', '262707046', 'BANIYAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-07', 'class-7b', '262707047', 'BIMA SATYA PUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-08', 'class-7b', '262707048', 'DESTIYAN MAHESA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-09', 'class-7b', '262707049', 'DIDANA SARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-10', 'class-7b', '262707050', 'FEBI YATRIYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-11', 'class-7b', '262707051', 'Ferdiyansyah', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-12', 'class-7b', '262707052', 'IIK NURMALIKA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-13', 'class-7b', '262707053', 'IMAM MULHAKIM', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-14', 'class-7b', '262707054', 'Keishya Nur Hasanah', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-15', 'class-7b', '262707055', 'M FATHIR SEPTIAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-16', 'class-7b', '262707056', 'Mamduh Rifqy', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-17', 'class-7b', '262707057', 'MARWAH HAETAMY', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-18', 'class-7b', '262707058', 'MUHAMAD AKMAL AL FARIZI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-19', 'class-7b', '262707059', 'MUHAMAD APRIANSAH ILHAM', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-20', 'class-7b', '262707060', 'MUHAMAD GANDI RANDIKA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-21', 'class-7b', '262707061', 'MUHAMAD ILHAM SAPUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-22', 'class-7b', '262707062', 'Muhamad Pahri Ramadan', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-23', 'class-7b', '262707063', 'Muhamad Rohmat', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-24', 'class-7b', '262707064', 'MUHAMAD YUSUF JUNAEDI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-25', 'class-7b', '262707065', 'MUHAMMAD NADZAR AL-FATIH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-26', 'class-7b', '262707066', 'MUHAMMAD YUSUF SULAIMAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-27', 'class-7b', '262707067', 'NABILA ROSYADAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-28', 'class-7b', '262707068', 'Nazwa Mukodatullah', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-29', 'class-7b', '262707069', 'NUR ISMA FADILAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-30', 'class-7b', '262707070', 'Raden Khalifah Kusuma Diningrat', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-31', 'class-7b', '262707071', 'RANI AL ZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-32', 'class-7b', '262707072', 'RIDHO FAHREZA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-33', 'class-7b', '262707073', 'Sabrina', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-34', 'class-7b', '262707074', 'SERLI YANTIKA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-35', 'class-7b', '262707075', 'SINTIYA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-36', 'class-7b', '262707076', 'SITI NAYLA SARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-37', 'class-7b', '262707077', 'SITI SYAVIRATU ZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-38', 'class-7b', '262707078', 'SYFA NUR AZILAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-39', 'class-7b', '262707079', 'ZAFRAN FABIAN TAURINA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7b-40', 'class-7b', '262707080', 'ZAHRA AQUILA PUTRI AURURI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-7C (40 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-01', 'class-7c', '262707081', 'ABY MANYYU', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-02', 'class-7c', '262707082', 'AKILA NUR HAMIDAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-03', 'class-7c', '262707083', 'Algi Pahri', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-04', 'class-7c', '262707084', 'ALYA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-05', 'class-7c', '262707085', 'AULIA IZATUNISA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-06', 'class-7c', '262707086', 'BUNGA APRIYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-07', 'class-7c', '262707087', 'DAFA AL FATIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-08', 'class-7c', '262707088', 'DIKA ANDIKA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-09', 'class-7c', '262707089', 'DINDA SOFIATUL JANNAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-10', 'class-7c', '262707090', 'FIKRI RAHMADANI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-11', 'class-7c', '262707091', 'FIRANA KAYLA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-12', 'class-7c', '262707092', 'IMELDA SARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-13', 'class-7c', '262707093', 'JIKRI RAHMAT RAMADAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-14', 'class-7c', '262707094', 'KHAIRA TALITA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-15', 'class-7c', '262707095', 'M RAFA LIANSAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-16', 'class-7c', '262707096', 'MAURA KANZA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-17', 'class-7c', '262707097', 'Miftahul Risky', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-18', 'class-7c', '262707098', 'MUHAMAD ALBIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-19', 'class-7c', '262707099', 'MUHAMAD ASRAL HUSAINI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-20', 'class-7c', '262707100', 'MUHAMAD HABIBI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-21', 'class-7c', '262707101', 'MUHAMAD JAKI JULFA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-22', 'class-7c', '262707102', 'MUHAMAD PIRMANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-23', 'class-7c', '262707103', 'MUHAMAD SALMAN AL FARISI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-24', 'class-7c', '262707104', 'MUHAMAD ZIDANE AL GHAZALI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-25', 'class-7c', '262707105', 'MUHAMMAD NURDIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-26', 'class-7c', '262707106', 'MUHTAR', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-27', 'class-7c', '262707107', 'NADHIRA NAZHQIA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-28', 'class-7c', '262707108', 'NAZWA NUR ASYFA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-29', 'class-7c', '262707109', 'NURUL PAUZIATU AZZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-30', 'class-7c', '262707110', 'RAFA FADILAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-31', 'class-7c', '262707111', 'RANIAH NUR ALFIAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-32', 'class-7c', '262707112', 'Sahru Ramadon', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-33', 'class-7c', '262707113', 'SAKILA SEPTRIASA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-34', 'class-7c', '262707114', 'SHARBILA KARUNIA HARSYA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-35', 'class-7c', '262707115', 'SITI INDAH NUR HAYATI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-36', 'class-7c', '262707116', 'SITI NUR HILFALIAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-37', 'class-7c', '262707117', 'SOFIA AZELA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-38', 'class-7c', '262707118', 'TANIA SARI ALIPA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-39', 'class-7c', '262707119', 'ZAHWA AURELIA PUTRI AGISNI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7c-40', 'class-7c', '262707120', 'ZIDAN ERYANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-7D (40 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-01', 'class-7d', '262707121', 'ADEA HUMAIRA BILQIS', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-02', 'class-7d', '262707122', 'ADITIA DIMA SUPRIYATNA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-03', 'class-7d', '262707123', 'ALEA QALESYA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-04', 'class-7d', '262707124', 'ALIEF FAHREZA ALVARO', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-05', 'class-7d', '262707125', 'AMARA FAZIRA ROSANDI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-06', 'class-7d', '262707126', 'AULIA JULIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-07', 'class-7d', '262707127', 'Dafa Bustomi', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-08', 'class-7d', '262707128', 'DELISA NURAINI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-09', 'class-7d', '262707129', 'DIRGA ANGGARA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-10', 'class-7d', '262707130', 'DIVA SANDRA WIYATNA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-11', 'class-7d', '262707131', 'GINA SHAFWATUN NASYWA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-12', 'class-7d', '262707132', 'HAERUL ABIL QORIAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-13', 'class-7d', '262707133', 'INDIANI RUSLIAWATI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-14', 'class-7d', '262707134', 'JILDA ROSIKHUL ULLUM', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-15', 'class-7d', '262707135', 'KHAIRUNNISA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-16', 'class-7d', '262707136', 'M RANGGA AGUSTIAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-17', 'class-7d', '262707137', 'MILAN NATASYA RAHMADANY', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-18', 'class-7d', '262707138', 'MUHAMAD ABDUL MALIK', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-19', 'class-7d', '262707139', 'Muhamad Aldiyansyah', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-20', 'class-7d', '262707140', 'Muhamad Athaar Al Miski', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-21', 'class-7d', '262707141', 'MUHAMAD HAIKAL', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-22', 'class-7d', '262707142', 'Muhamad Khoirul Fikri Sidiq', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-23', 'class-7d', '262707143', 'MUHAMAD RADIT SETIAWAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-24', 'class-7d', '262707144', 'Muhamad Salman Alfaris', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-25', 'class-7d', '262707145', 'MUHAMAD ZIKRY WAHYUDIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-26', 'class-7d', '262707146', 'MUHAMMAD NURIL FAJRI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-27', 'class-7d', '262707147', 'MUKHAMAD IBRA APRIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-28', 'class-7d', '262707148', 'NADIA LINAWATI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-29', 'class-7d', '262707149', 'Neng Erika', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-30', 'class-7d', '262707150', 'NURUL ZAHRA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-31', 'class-7d', '262707151', 'RAIHAN ARSYIL', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-32', 'class-7d', '262707152', 'RAYSA ALINKA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-33', 'class-7d', '262707153', 'SALMAN ALFARIZI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-34', 'class-7d', '262707154', 'SALSABILA RAUDOHTU JANNAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-35', 'class-7d', '262707155', 'SHELA NUR FADILAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-36', 'class-7d', '262707156', 'SITI KAMILA AZKIA MAULIDA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-37', 'class-7d', '262707157', 'SITI NURHALIFAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-38', 'class-7d', '262707158', 'Sopiah', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-39', 'class-7d', '262707159', 'Tasya Aulia Putri', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7d-40', 'class-7d', '262707160', 'ZAKIRA TALITA ZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-7E (40 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-01', 'class-7e', '262707161', 'ADINDA RAHMATUNNISA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-02', 'class-7e', '262707162', 'AFKAR YAZID', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-03', 'class-7e', '262707163', 'ALIFAH FEBRIANI SUBRATA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-04', 'class-7e', '262707164', 'ANANDA RIFKI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-05', 'class-7e', '262707165', 'ANGGUN CAHYA SALSABILA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-06', 'class-7e', '262707166', 'AURA NURUL AISYAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-07', 'class-7e', '262707167', 'DAFFA IBNU HAFIDZ', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-08', 'class-7e', '262707168', 'DEMIA NUR YANTI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-09', 'class-7e', '262707169', 'ELIS', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-10', 'class-7e', '262707170', 'ERLANGGA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-11', 'class-7e', '262707171', 'GLADYS MAYUMI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-12', 'class-7e', '262707172', 'HAPIZ MAULANA AL FARIZKI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-13', 'class-7e', '262707173', 'INTAN SILVIANA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-14', 'class-7e', '262707174', 'JUNA AL MAHDI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-15', 'class-7e', '262707175', 'KHANZA KALISYA AZ ZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-16', 'class-7e', '262707176', 'M. ALIFA MUHLIS', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-17', 'class-7e', '262707177', 'MIRANDA NOVILA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-18', 'class-7e', '262707178', 'MUHAMAD ADAM MAULANA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-19', 'class-7e', '262707179', 'Muhamad Alfin Ramadan', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-20', 'class-7e', '262707180', 'MUHAMAD CHAIRUL UMAM', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-21', 'class-7e', '262707181', 'MUHAMAD HAPIDIN PAHRI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-22', 'class-7e', '262707182', 'MUHAMAD LEGI PUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-23', 'class-7e', '262707183', 'MUHAMAD RAFA IBRA SAPUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-24', 'class-7e', '262707184', 'Muhamad Saputra', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-25', 'class-7e', '262707185', 'MUHAMMAD AL KHALIFI ZIKRI HADY', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-26', 'class-7e', '262707186', 'MUHAMMAD RANGGA KURNIAWAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-27', 'class-7e', '262707187', 'MUSA AZHAR AL BASIR', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-28', 'class-7e', '262707188', 'NAILAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-29', 'class-7e', '262707189', 'NENG RAYA NAHDATUL HASANAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-30', 'class-7e', '262707190', 'NURZAKIA SALSABILA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-31', 'class-7e', '262707191', 'RAMADI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-32', 'class-7e', '262707192', 'RIRIN', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-33', 'class-7e', '262707193', 'SATRIA PRASETYAWAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-34', 'class-7e', '262707194', 'Savira Putri Aprilia', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-35', 'class-7e', '262707195', 'SHELA RUBIATUL ADAWIYAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-36', 'class-7e', '262707196', 'SITI KASIPATUZ ZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-37', 'class-7e', '262707197', 'SITI NURIN NABAWIYAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-38', 'class-7e', '262707198', 'SRI ASTUTI BAIDILAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-39', 'class-7e', '262707199', 'TIWI NURMAYASARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7e-40', 'class-7e', '262707200', 'ZASKIA MAULIDA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-7F (40 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-01', 'class-7f', '262707201', 'ADINDA RAISA FEBRIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-02', 'class-7f', '262707202', 'AHMAD AZKA ALHAFIZ', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-03', 'class-7f', '262707203', 'ALIKA NAILA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-04', 'class-7f', '262707204', 'ANGGI SAPUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-05', 'class-7f', '262707205', 'APRIL YANINGRUM', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-06', 'class-7f', '262707206', 'AURELIA NUR HERMANSYAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-07', 'class-7f', '262707207', 'Dandi Kurniawan', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-08', 'class-7f', '262707208', 'DEVA APRILIA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-09', 'class-7f', '262707209', 'ELMIRAWATI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-10', 'class-7f', '262707210', 'FAQIH ZAKARIA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-11', 'class-7f', '262707211', 'HAFIZAH NUR HIDAYAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-12', 'class-7f', '262707212', 'HARRY AFRIZAL', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-13', 'class-7f', '262707213', 'JASMINE AZIS', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-14', 'class-7f', '262707214', 'KIRANA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-15', 'class-7f', '262707215', 'KRISTANTO DWI CAHYO', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-16', 'class-7f', '262707216', 'M. GALANG PRATAMA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-17', 'class-7f', '262707217', 'MISNAWATI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-18', 'class-7f', '262707218', 'MUHAMAD ADITYA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-19', 'class-7f', '262707219', 'MUHAMAD ALI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-20', 'class-7f', '262707220', 'MUHAMAD DEDE FIKRI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-21', 'class-7f', '262707221', 'MUHAMAD HASBI ABDUL GHANI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-22', 'class-7f', '262707222', 'MUHAMAD MAULANA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-23', 'class-7f', '262707223', 'MUHAMAD RANGGA FIRDAUS', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-24', 'class-7f', '262707224', 'MUHAMAD SYAHRIL MUBAROK', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-25', 'class-7f', '262707225', 'MUHAMMAD ALBYZAR', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-26', 'class-7f', '262707226', 'MUHAMMAD RIDHO SEPTIAJI ROMLI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-27', 'class-7f', '262707227', 'Naira Putri Ramadhani', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-28', 'class-7f', '262707228', 'Naufaldi Ramadhan', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-29', 'class-7f', '262707229', 'NENG ZHIVA OKTAVIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-30', 'class-7f', '262707230', 'PANI PEBRIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-31', 'class-7f', '262707231', 'RANDI PADILAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-32', 'class-7f', '262707232', 'Ririn Riyanti', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-33', 'class-7f', '262707233', 'SEKAR LESTARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-34', 'class-7f', '262707234', 'SHENA NATASYA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-35', 'class-7f', '262707235', 'Siti Khalifa Azahwa', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-36', 'class-7f', '262707236', 'Siti Nurlelah', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-37', 'class-7f', '262707237', 'SRI WIRANTI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-38', 'class-7f', '262707238', 'TRIA NURFALAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-39', 'class-7f', '262707239', 'YAZID AL BUSTAMI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7f-40', 'class-7f', '262707240', 'ZASKIA MEGA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-7G (40 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-01', 'class-7g', '262707241', 'AFFA ASTILA RAHMA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-02', 'class-7g', '262707242', 'AHMAD DAEROBI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-03', 'class-7g', '262707243', 'ALIKA NAILA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-04', 'class-7g', '262707244', 'ARDIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-05', 'class-7g', '262707245', 'ASIPA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-06', 'class-7g', '262707246', 'AYUNIA AFRILIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-07', 'class-7g', '262707247', 'DEAN ANDRA ADHITIA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-08', 'class-7g', '262707248', 'DEVIKA FADILLAH PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-09', 'class-7g', '262707249', 'ELSA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-10', 'class-7g', '262707250', 'FATECHA SAKA GAOZHAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-11', 'class-7g', '262707251', 'HAMDA SAKHIA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-12', 'class-7g', '262707252', 'HERDIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-13', 'class-7g', '262707253', 'JULAIKA SINTIA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-14', 'class-7g', '262707254', 'LAILA SARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-15', 'class-7g', '262707255', 'M ALVIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-16', 'class-7g', '262707256', 'M. HADROMI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-17', 'class-7g', '262707257', 'MUHAMAD AJIM', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-18', 'class-7g', '262707258', 'MUHAMAD ALWI MUNZIR', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-19', 'class-7g', '262707259', 'MUHAMAD FAHRU ROJI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-20', 'class-7g', '262707260', 'MUHAMAD IGO SAEPUDIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-21', 'class-7g', '262707261', 'MUHAMAD NABIL ALMUSTOPA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-22', 'class-7g', '262707262', 'MUHAMAD RIPKI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-23', 'class-7g', '262707263', 'MUHAMAD SYAUQI PAHRURROJI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-24', 'class-7g', '262707264', 'MUHAMMAD AZHARI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-25', 'class-7g', '262707265', 'MUHAMMAD RIZKIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-26', 'class-7g', '262707266', 'Mutiara Putri', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-27', 'class-7g', '262707267', 'NAURA PUTRI MULAS SHABIL', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-28', 'class-7g', '262707268', 'NAZRIL SRI RELA KUSUMA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-29', 'class-7g', '262707269', 'NUR AINI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-30', 'class-7g', '262707270', 'RAISA FEBRIYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-31', 'class-7g', '262707271', 'RAYHANA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-32', 'class-7g', '262707272', 'RISKA ANJANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-33', 'class-7g', '262707273', 'SELVI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-34', 'class-7g', '262707274', 'SHIDQIA AIDA RAHMAN', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-35', 'class-7g', '262707275', 'SITI MAULIDIA NAZWA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-36', 'class-7g', '262707276', 'SITI RAHAYU', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-37', 'class-7g', '262707277', 'SRI WULANDARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-38', 'class-7g', '262707278', 'UFAIRA BILQIS SABILA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-39', 'class-7g', '262707279', 'YUDA PERMANA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7g-40', 'class-7g', '262707280', 'ZULFA KAILA AZ ZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-7H (39 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-01', 'class-7h', '262707281', 'AFIKA KHANZA DESTIYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-02', 'class-7h', '262707282', 'AHMAD ZALALLUDIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-03', 'class-7h', '262707283', 'ALISAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-04', 'class-7h', '262707284', 'ARGA FITRA RIZKY', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-05', 'class-7h', '262707285', 'Audita Selpira', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-06', 'class-7h', '262707286', 'AZDHANA BUNGA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-07', 'class-7h', '262707287', 'DEDEN PAHRUDIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-08', 'class-7h', '262707288', 'DEWI ULAN RATNASARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-09', 'class-7h', '262707289', 'ERLITA FAUZIAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-10', 'class-7h', '262707290', 'FEBRI FEBRIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-11', 'class-7h', '262707291', 'HASBIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-12', 'class-7h', '262707292', 'IBNU UBAIDILAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-13', 'class-7h', '262707293', 'KASYIDA KHIRWA DAMITSA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-14', 'class-7h', '262707294', 'LELI FAJRIAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-15', 'class-7h', '262707295', 'M BALYA TAMARA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-16', 'class-7h', '262707296', 'M. HAFIZ SAPUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-17', 'class-7h', '262707297', 'Muhamad Akbar', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-18', 'class-7h', '262707298', 'MUHAMAD AMAR SAPUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-19', 'class-7h', '262707299', 'Muhamad Fariz Nurahman', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-20', 'class-7h', '262707300', 'MUHAMAD ILHAM NUDIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-21', 'class-7h', '262707301', 'MUHAMAD NAUFAL AL SYAKIR', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-22', 'class-7h', '262707302', 'MUHAMAD RISKI RADITYA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-23', 'class-7h', '262707303', 'MUHAMAD UKON', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-24', 'class-7h', '262707304', 'Muhammad Fairruzi', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-25', 'class-7h', '262707305', 'MUHAMMAD RIZKY AL - FARIZ', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-26', 'class-7h', '262707306', 'NABILA HOERUNISA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-27', 'class-7h', '262707307', 'NAURA RAMANDA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-28', 'class-7h', '262707308', 'NIZAM DWI PUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-29', 'class-7h', '262707309', 'NUR ANISA FITRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-30', 'class-7h', '262707310', 'RAISA FITRIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-31', 'class-7h', '262707311', 'REGI YUDIYANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-32', 'class-7h', '262707312', 'RIYANA SALSABILA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-33', 'class-7h', '262707313', 'SEPTI ANGGRAENI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-34', 'class-7h', '262707314', 'SHIDQIA LISVIANI AZ ZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-35', 'class-7h', '262707315', 'SITI NABILAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-36', 'class-7h', '262707316', 'SITI SRI LESTIYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-37', 'class-7h', '262707317', 'SYAKILA NUR MAULIDA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-38', 'class-7h', '262707318', 'VIONA PUTRI NURAENI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-7h-39', 'class-7h', '262707319', 'Yudiansyah', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-8A (42 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-01', 'class-8a', '252607001', 'AA FIKRI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-02', 'class-8a', '252607002', 'Adela Mutya Dwi', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-03', 'class-8a', '252607003', 'ADITTIYA SAPUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-04', 'class-8a', '252607004', 'ALYA AL TESA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-05', 'class-8a', '252607005', 'ANDI BAGAS', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-06', 'class-8a', '252607006', 'Aprilita Trias Anggraeni', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-07', 'class-8a', '252607007', 'AULIA IZZATUNNISA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-08', 'class-8a', '252607008', 'BAYU GIRI ADRIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-09', 'class-8a', '252607009', 'Cindy Seftiani', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-10', 'class-8a', '252607010', 'ELVIRA YUNITA DEWI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-11', 'class-8a', '252607011', 'FAHAD ABDULLOH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-12', 'class-8a', '252607012', 'FITRI ALIV LA REMBULAN', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-13', 'class-8a', '252607013', 'FRISILLA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-14', 'class-8a', '252607014', 'IPAN NURDIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-15', 'class-8a', '252607015', 'JULIYANA NOVITA SARI PURBA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-16', 'class-8a', '252607016', 'KHALISA IMANIAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-17', 'class-8a', '252607017', 'M. ARI MAULANA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-18', 'class-8a', '252607019', 'MUHAMAD ALWI HERMANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-19', 'class-8a', '252607020', 'MUHAMAD DICKY WAHYUDI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-20', 'class-8a', '252607021', 'MUHAMAD HAIKAL', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-21', 'class-8a', '252607022', 'MUHAMAD REPAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-22', 'class-8a', '252607023', 'Muhamad Robi', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-23', 'class-8a', '252607024', 'MUHAMMAD ANAZRIL', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-24', 'class-8a', '252607025', 'MUHAMMAD JAELANI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-25', 'class-8a', '252607026', 'NADILA NUR AZKIA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-26', 'class-8a', '252607027', 'NAZWA AULIA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-27', 'class-8a', '252607028', 'NUGI TIAR AQILA FUTRA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-28', 'class-8a', '252607029', 'NUR FADLAH ANDRIYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-29', 'class-8a', '252607030', 'PHUSPA EKA ANGGRAENI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-30', 'class-8a', '252607031', 'RAYHAN MAYBIANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-31', 'class-8a', '252607032', 'Rizki Yudittiano', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-32', 'class-8a', '252607033', 'SISKA SULISTIANAWATI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-33', 'class-8a', '252607034', 'SITI NOPIATUN', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-34', 'class-8a', '252607035', 'SITI YUNIAR', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-35', 'class-8a', '252607036', 'ULFAH ANGGRAENI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-36', 'class-8a', '252607037', 'ZASKIA SEFTIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-37', 'class-8a', '252607276', 'NADIA NUR RISKA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-38', 'class-8a', '252607261', 'ELSA APRILIA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-39', 'class-8a', '252607277', 'NAYLA QORIATUN NISA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-40', 'class-8a', '252607282', 'RISKA AULIANA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-41', 'class-8a', '252607255', 'ALFITTO RAFKY MARCHISIO', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8a-42', 'class-8a', '252607262', 'ERLANGGA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;

-- Siswa CLASS-8B (40 Siswa)
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-01', 'class-8b', '252607039', 'AGUS RAMADHANI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-02', 'class-8b', '252607040', 'ALYA INDRIYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-03', 'class-8b', '252607041', 'ANDIKA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-04', 'class-8b', '252607042', 'APRILLIYANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-05', 'class-8b', '252607043', 'AYLA LATISHA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-06', 'class-8b', '252607045', 'DARENA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-07', 'class-8b', '252607046', 'DIKTA ALFARIJI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-08', 'class-8b', '252607047', 'EMELLY OKTAVIANTI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-09', 'class-8b', '252607048', 'FAIZ AL MUAMMAR', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-10', 'class-8b', '252607049', 'HEMALIA PUTRI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-11', 'class-8b', '252607050', 'KAILA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-12', 'class-8b', '252607051', 'KHAERUL ILHAM', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-13', 'class-8b', '252607052', 'KINARA ANGGRAENI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-14', 'class-8b', '252607053', 'M. ELZHAR DZULKARNAIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-15', 'class-8b', '252607054', 'MEYLANI ROKHIMATUL HIKMAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-16', 'class-8b', '252607055', 'MUHAMAD ANDRE', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-17', 'class-8b', '252607056', 'Muhamad Egi Saputra', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-18', 'class-8b', '252607057', 'MUHAMAD HENDRI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-19', 'class-8b', '252607058', 'MUHAMAD REPAN AL IBRAHIM', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-20', 'class-8b', '252607059', 'MUHAMAD ROMADONI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-21', 'class-8b', '252607060', 'MUHAMMAD BIMA NURMANSYAH', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-22', 'class-8b', '252607061', 'MUHAMMAD QUWIRIZAL FIRDAUS', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-23', 'class-8b', '252607062', 'NADIRA RAHMAWATI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-24', 'class-8b', '252607063', 'NAZWA KIRANA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-25', 'class-8b', '252607064', 'NUR SYIFA AWALIYAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-26', 'class-8b', '252607065', 'PAIS SAPARUDIN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-27', 'class-8b', '252607066', 'PUTRI LESTARI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-28', 'class-8b', '252607067', 'REFAN BINTARA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-29', 'class-8b', '252607068', 'RIZQI ALFI ANDREAN', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-30', 'class-8b', '252607069', 'Salsa Nabila', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-31', 'class-8b', '252607070', 'SITI HALIFAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-32', 'class-8b', '252607071', 'SITI NUR AZIZAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-33', 'class-8b', '252607072', 'SOPIA SEPTIANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-34', 'class-8b', '252607073', 'Yuli', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-35', 'class-8b', '252607074', 'ZAZKIA AZZAHRA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-36', 'class-8b', '252607285', 'SITI NAZWA RAHMADANI', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-37', 'class-8b', '252607284', 'SINDI NUR RIZKIYAH', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-38', 'class-8b', '252607259', 'AZZLI AFRIANA GUNARA', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-39', 'class-8b', '252607270', 'MUHAMAD DAVI', 'L', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
INSERT INTO students (id, class_id, nis, full_name, gender, is_active, created_at)
VALUES ('std-class-8b-40', 'class-8b', '252607265', 'JIHAN HANIPA SHAKILA', 'P', TRUE, '2026-07-15T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, nis = EXCLUDED.nis, gender = EXCLUDED.gender, is_active = EXCLUDED.is_active;
