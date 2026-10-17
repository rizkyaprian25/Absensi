"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Calendar,
  Award,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  School,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Download,
  Database,
  Timer,
  AlertTriangle,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Toast } from "@/components/ui/Toast";
import { MOCK_CLASSES } from "@/contracts/mocks/attendanceMocks";
import { getStoredUsers } from "@/lib/authStorage";
import { getStoredSubjects, getStoredTeacherAssignments } from "@/lib/academicStorage";
import { getSchoolTotalStudentsStats } from "@/lib/rolloverStorage";
import { getSavedSessions } from "@/lib/attendanceStorage";
import type { ScheduleDay, AttendanceSession } from "@/contracts/attendance";
import {
  downloadBackupFile,
  triggerAutoSnapshot,
  STORAGE_KEY_LAST_BACKUP_TIME,
} from "@/lib/backupManager";

function getCurrentScheduleDay(): ScheduleDay {
  const dayIndex = new Date().getDay();
  if (dayIndex === 1) return "Senin";
  if (dayIndex === 2) return "Selasa";
  if (dayIndex === 3) return "Rabu";
  if (dayIndex === 4) return "Kamis";
  if (dayIndex === 5) return "Jumat";
  return "Senin";
}

interface PunctualityResult {
  status: "ON_TIME" | "LATE" | "EARLY" | "OVERDUE" | "UPCOMING" | "NOT_RECORDED";
  label: string;
  badgeClass: string;
  recordedTimeStr: string;
  diffMinutes: number;
}

/**
 * Mengevaluasi ketepatan waktu guru saat mengabsen kelas berdasarkan jam jadwal KBM
 */
function evaluateTeacherPunctuality(
  scheduleTimeStr?: string | null,
  session?: AttendanceSession | null,
  isToday = true
): PunctualityResult {
  // Parsing jam masuk dari scheduleTime, contoh "07:30 – 09:15"
  let startHour = 7;
  let startMinute = 30;
  if (scheduleTimeStr) {
    const match = scheduleTimeStr.match(/(\d{1,2})[:.](\d{2})/);
    if (match) {
      startHour = parseInt(match[1], 10);
      startMinute = parseInt(match[2], 10);
    }
  }
  const scheduleMinutes = startHour * 60 + startMinute;

  // Jika sesi sudah tercatat
  if (session) {
    const createdDate = new Date(session.createdAt);
    const recHour = createdDate.getHours();
    const recMin = createdDate.getMinutes();
    const recMinutes = recHour * 60 + recMin;
    const diff = recMinutes - scheduleMinutes;

    const recordedTimeStr =
      session.recordedAtTime ||
      createdDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

    if (diff > 5) {
      return {
        status: "LATE",
        label: `Terlambat ${diff} Menit`,
        badgeClass:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-bold",
        recordedTimeStr,
        diffMinutes: diff,
      };
    } else if (diff < -15) {
      return {
        status: "EARLY",
        label: `Lebih Awal ${Math.abs(diff)} Menit`,
        badgeClass:
          "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50",
        recordedTimeStr,
        diffMinutes: diff,
      };
    } else {
      return {
        status: "ON_TIME",
        label: diff <= 0 ? "Tepat Waktu" : `Tepat Waktu (+${diff}m)`,
        badgeClass:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-medium",
        recordedTimeStr,
        diffMinutes: diff,
      };
    }
  }

  // Jika sesi belum ada
  if (isToday) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const diffNow = nowMinutes - scheduleMinutes;

    if (diffNow > 10) {
      return {
        status: "OVERDUE",
        label: `Belum Diabsen (Lewat ${diffNow} Menit)`,
        badgeClass: "bg-rose-600 text-white font-bold animate-pulse shadow-xs",
        recordedTimeStr: "-",
        diffMinutes: diffNow,
      };
    } else if (diffNow >= 0) {
      return {
        status: "UPCOMING",
        label: "Sedang Berlangsung (Segera Absen)",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 font-semibold",
        recordedTimeStr: "-",
        diffMinutes: diffNow,
      };
    } else {
      return {
        status: "UPCOMING",
        label: "Menunggu Jam Masuk",
        badgeClass: "bg-[var(--surface-recessed)] text-[var(--text-tertiary)] border border-[var(--border-hairline)]",
        recordedTimeStr: "-",
        diffMinutes: diffNow,
      };
    }
  }

  return {
    status: "NOT_RECORDED",
    label: "Belum Ada Presensi",
    badgeClass: "bg-[var(--surface-recessed)] text-[var(--text-secondary)] border border-[var(--border-hairline)]",
    recordedTimeStr: "-",
    diffMinutes: 0,
  };
}

/**
 * Menghasilkan tautan WhatsApp untuk mengingatkan guru yang terlambat / belum mengabsen
 */
function buildWhatsAppReminderLink(
  phone: string | null | undefined,
  teacherName: string,
  className: string,
  scheduleTime: string
): string {
  const text = encodeURIComponent(
    `Yth. Bapak/Ibu ${teacherName},\n\nBerdasarkan pantauan Live Monitor KBM SMP Negeri 3 Cibungbulang, presensi kelas ${className} (Jadwal: ${scheduleTime}) terpantau belum diisi atau melewati jam masuk.\n\nMohon kesediaannya untuk segera mengisi presensi kelas dan agenda materi pada aplikasi Absensi. Terima kasih.`
  );
  if (phone) {
    const clean = phone.replace(/^0/, "62").replace(/\D/g, "");
    return `https://wa.me/${clean}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

/**
 * Halaman Dasbor Eksekutif Terpadu Administrator
 * SMP Negeri 3 Cibungbulang — Supervisi KBM, Statistik Sekolah, dan Pusat Tata Kelola
 */
export default function AdminDashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const currentDay = getCurrentScheduleDay();
  const [selectedDay, setSelectedDay] = useState<ScheduleDay>(currentDay);
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setLastBackupTime(localStorage.getItem(STORAGE_KEY_LAST_BACKUP_TIME));
    }
  }, []);

  // 1. Agregasi Statistik Sekolah
  const studentStats = useMemo(() => getSchoolTotalStudentsStats(), [mounted]);
  const users = useMemo(() => getStoredUsers(), [mounted]);
  const teacherCount = useMemo(() => users.filter((u) => u.role === "GURU").length, [users]);
  const subjects = useMemo(() => getStoredSubjects(), [mounted]);
  const assignments = useMemo(() => getStoredTeacherAssignments(), [mounted]);
  const savedSessions = useMemo(() => (mounted ? getSavedSessions() : []), [mounted]);

  // 2. Monitoring Live KBM untuk Hari yang Dipilih
  const scheduleDays: ScheduleDay[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const classesToday = useMemo(() => {
    return MOCK_CLASSES.filter((c) => c.scheduleDay === selectedDay);
  }, [selectedDay]);

  const isSelectedDayActualToday = selectedDay === currentDay;

  // Cari sesi absensi dan evaluasi waktu keterlambatan
  const monitorRows = useMemo(() => {
    return classesToday.map((cls) => {
      // Cari penugasan guru untuk kelas ini
      const asgn = assignments.find((a) => a.classId === cls.id);
      const teacher = asgn ? users.find((u) => u.id === asgn.teacherId) : null;
      const subject = asgn ? subjects.find((s) => s.id === asgn.subjectId) : null;

      // Cari apakah kelas ini sudah memiliki sesi absensi tersimpan
      const session = savedSessions.find((s) => s.classId === cls.id);

      const teacherName = session?.teacherName || teacher?.fullName || "Muhamad Rizky Aprian, S.Kom";
      const subjectName = session?.subject || subject?.name || cls.subject || "Informatika";
      const scheduleTime = cls.scheduleTime || "08:00 – 09:45";

      const punctuality = evaluateTeacherPunctuality(scheduleTime, session, isSelectedDayActualToday);

      return {
        cls,
        teacher,
        teacherName,
        subjectName,
        scheduleTime,
        schedulePeriod: cls.schedulePeriod || "Jam Ke 1–3",
        isAbsenceCompleted: !!session,
        topic: session?.topic || null,
        sessionDate: session?.sessionDate || null,
        session,
        punctuality,
      };
    });
  }, [classesToday, assignments, users, subjects, savedSessions, isSelectedDayActualToday]);

  // Statistik Disiplin KBM
  const completedCount = monitorRows.filter((r) => r.isAbsenceCompleted).length;
  const totalClassesToday = monitorRows.length;
  const onTimeCount = monitorRows.filter((r) => r.punctuality.status === "ON_TIME" || r.punctuality.status === "EARLY").length;
  const lateCount = monitorRows.filter((r) => r.punctuality.status === "LATE").length;
  const overdueCount = monitorRows.filter((r) => r.punctuality.status === "OVERDUE").length;

  // Tindakan Unduh Backup Cepat
  const handleQuickBackup = () => {
    const res = downloadBackupFile();
    setToastMessage(`Cadangan komprehensif berhasil diunduh (${(res.sizeBytes / 1024).toFixed(1)} KB).`);
    setLastBackupTime(new Date().toISOString());
  };

  // Tindakan Snapshot Darurat
  const handleForceSnapshot = () => {
    triggerAutoSnapshot("Snapshot Manual Administrator");
    setToastMessage("Snapshot darurat berhasil disimpan ke LocalStorage dan IndexedDB.");
    setLastBackupTime(new Date().toISOString());
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Akses Terbatas</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md">
          Halaman Dasbor Eksekutif hanya dapat diakses oleh akun dengan peran Administrator (Kurikulum / Tata Usaha).
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90"
        >
          Kembali ke Beranda KBM
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notifikasi */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Header Eksekutif */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Portal Supervisi Administrator
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Pusat Komando Akademik
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Supervisi KBM, Pelacakan Disiplin Guru, Kenaikan Kelas & Pencadangan Otomatis · SMP Negeri 3 Cibungbulang
          </p>
        </div>

        {/* Info Admin Aktif */}
        <div className="flex items-center gap-3 bg-[var(--surface-card)] p-3 rounded-2xl border border-[var(--border-hairline)] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            AD
          </div>
          <div className="text-xs">
            <p className="font-bold text-[var(--text-primary)]">{currentUser?.fullName || "Administrator"}</p>
            <p className="text-[var(--text-secondary)] font-mono">@{currentUser?.username || "admin"}</p>
          </div>
        </div>
      </div>

      {/* Banner Status Pencadangan Otomatis Multi-Tier Vault */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Pencadangan Otomatis Multi-Tier Aktif
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" /> Berjalan Normal
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Setiap kali guru menyimpan presensi, nilai, atau siswa baru PPDB, sistem mencadangkan otomatis ke <strong>LocalStorage</strong>, replika darurat <strong>IndexedDB</strong>, dan sinkronisasi <strong>Supabase Cloud</strong>.
            </p>
            {lastBackupTime && (
              <p className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1">
                Titik cadangan terakhir: {new Date(lastBackupTime).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleForceSnapshot}
            title="Ambil snapshot darurat sekarang"
            className="px-3 py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--text-primary)] border border-[var(--border-hairline)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Snapshot Darurat</span>
          </button>
          <button
            type="button"
            onClick={handleQuickBackup}
            title="Unduh seluruh database ke berkas .json"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh JSON</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Metrik Utama Sekolah */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kartu 1: Total Siswa Aktif */}
        <div className="bg-[var(--surface-card)] p-4 md:p-5 rounded-2xl border border-[var(--border-hairline)] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Siswa Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              {studentStats.total}
            </span>
            <span className="text-xs text-[var(--text-secondary)] ml-1.5 font-medium">siswa</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
            <span className="text-blue-600 font-bold">{studentStats.totalL} Putra</span>
            <span>·</span>
            <span className="text-pink-600 font-bold">{studentStats.totalP} Putri</span>
          </div>
        </div>

        {/* Kartu 2: Rombongan Belajar */}
        <div className="bg-[var(--surface-card)] p-4 md:p-5 rounded-2xl border border-[var(--border-hairline)] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Rombongan Belajar</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              {MOCK_CLASSES.length}
            </span>
            <span className="text-xs text-[var(--text-secondary)] ml-1.5 font-medium">kelas</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-secondary)]">
            Kls 7: 8 rombel · Kls 8: 7 rombel · Kls 9: 7 rombel
          </div>
        </div>

        {/* Kartu 3: Guru Terdaftar */}
        <div className="bg-[var(--surface-card)] p-4 md:p-5 rounded-2xl border border-[var(--border-hairline)] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Guru & Tenaga Pendidik</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              {teacherCount}
            </span>
            <span className="text-xs text-[var(--text-secondary)] ml-1.5 font-medium">guru aktif</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-secondary)]">
            Mencakup {subjects.length} mata pelajaran pokok
          </div>
        </div>

        {/* Kartu 4: Kesiapan KBM Hari Ini */}
        <div className="bg-[var(--surface-card)] p-4 md:p-5 rounded-2xl border border-[var(--border-hairline)] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Kelas Terabsen</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              {completedCount}
            </span>
            <span className="text-xs text-[var(--text-secondary)] ml-1.5 font-medium">
              / {totalClassesToday} rombel
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-secondary)]">
            {completedCount === totalClassesToday && totalClassesToday > 0
              ? "Semua tuntas diabsen"
              : `${totalClassesToday - completedCount} kelas belum diabsen`}
          </div>
        </div>
      </div>

      {/* Grid Pintasan Modul Utama Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Modul 1: Pusat Tutup Tahun, Kenaikan Kelas & PPDB */}
        <Link
          href="/admin/rollover"
          className="group p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold">Kenaikan Kelas & PPDB Baru</h3>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Impor siswa baru via template Excel (.xlsx), alokasi rombel berimbang, promosi kelas paralel (7-&gt;8, 8-&gt;9), dan kelulusan alumni.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
            Buka Modul Tutup Tahun <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Modul 2: Manajemen Pengguna & Akun Guru */}
        <Link
          href="/admin/users"
          className="group p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] shadow-xs hover:border-[var(--color-accent)] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Manajemen Guru & Akun</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Kelola akun seluruh guru, reset kata sandi, aktif/nonaktifkan guru mutasi, serta pantau matriks penugasan kelas sekolah.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] group-hover:translate-x-1 transition-transform">
            Kelola Guru <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Modul 3: Konfigurasi Sekolah & Vault Cadangan */}
        <Link
          href="/settings"
          className="group p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] shadow-xs hover:border-[var(--color-accent)] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-stone-500/10 text-stone-600 dark:text-stone-400 flex items-center justify-center mb-4">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Pengaturan & Cadangan</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Pengaturan profil resmi sekolah, kop surat raport, identitas Kepala Sekolah, dan disaster recovery (IndexedDB + Supabase).
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform">
            Buka Pengaturan <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Bagian Live Monitor Presensi KBM & Pelacakan Disiplin Guru */}
      <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                Live Monitor KBM Sekolah & Rekam Jam Absensi Guru
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Mencatat waktu riil guru saat menekan simpan absensi untuk mendeteksi ketepatan waktu masuk kelas secara transparan
            </p>
          </div>

          {/* Pemilih Hari Jadwal */}
          <div className="flex items-center gap-1 bg-[var(--surface-recessed)] p-1 rounded-xl border border-[var(--border-hairline)] self-start">
            {scheduleDays.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDay === day
                    ? "bg-[var(--color-accent)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {day} {day === currentDay && "· Hari Ini"}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Kartu Ringkasan Kedisiplinan Guru Hari Ini */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                Tepat Waktu / Lebih Awal
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {onTimeCount} kelas
              </span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 opacity-80" />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold block">
                Terlambat Mengabsen
              </span>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
                {lateCount} kelas
              </span>
            </div>
            <Timer className="w-8 h-8 text-amber-600 dark:text-amber-400 opacity-80" />
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-800 dark:text-rose-300 font-semibold block">
                Melewati Jadwal Masuk
              </span>
              <span className="text-2xl font-black text-rose-700 dark:text-rose-300">
                {overdueCount} kelas
              </span>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400 opacity-80" />
          </div>
        </div>

        {/* Tabel Pemantauan KBM dengan Record Jam Guru */}
        <div className="overflow-x-auto border border-[var(--border-hairline)] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-recessed)]">
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Jadwal Masuk (aSc)</th>
                <th className="py-2.5 px-3">Mata Pelajaran</th>
                <th className="py-2.5 px-3">Guru Pengampu</th>
                <th className="py-2.5 px-3 text-center">Jam Riil Diabsen</th>
                <th className="py-2.5 px-3 text-center">Status Kedisiplinan</th>
                <th className="py-2.5 px-3">Materi KBM</th>
                <th className="py-2.5 px-3 text-center">Aksi / Peringatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {monitorRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--text-secondary)]">
                    Tidak ada jadwal KBM pada hari {selectedDay}.
                  </td>
                </tr>
              ) : (
                monitorRows.map((row) => {
                  const isLateOrOverdue =
                    row.punctuality.status === "LATE" || row.punctuality.status === "OVERDUE";
                  const waLink = buildWhatsAppReminderLink(
                    row.teacher?.phone,
                    row.teacherName,
                    row.cls.name,
                    row.scheduleTime
                  );

                  return (
                    <tr
                      key={row.cls.id}
                      className={`hover:bg-[var(--surface-recessed)]/50 transition-colors ${
                        row.punctuality.status === "OVERDUE"
                          ? "bg-rose-500/5"
                          : row.punctuality.status === "LATE"
                          ? "bg-amber-500/5"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-bold font-mono text-[var(--text-primary)]">
                        Kelas {row.cls.name}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)] font-mono">
                        <span className="font-bold text-[var(--text-primary)]">{row.scheduleTime}</span>
                        <span className="block text-[10px] text-[var(--text-tertiary)]">
                          {row.schedulePeriod}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-[var(--text-primary)]">
                        {row.subjectName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[var(--text-primary)] block">
                          {row.teacherName}
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                          @{row.teacher?.username || "guru"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {row.punctuality.recordedTimeStr !== "-" ? (
                          <span className="font-bold text-[var(--text-primary)] bg-[var(--surface-recessed)] px-2 py-1 rounded-md border border-[var(--border-hairline)]">
                            {row.punctuality.recordedTimeStr}
                          </span>
                        ) : (
                          <span className="text-[var(--text-tertiary)] italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] ${row.punctuality.badgeClass}`}
                        >
                          {row.punctuality.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate text-[var(--text-secondary)]">
                        {row.topic ? (
                          <span className="text-[var(--text-primary)] font-medium">
                            {row.topic}
                          </span>
                        ) : (
                          <span className="italic text-[var(--text-tertiary)]">Belum ada materi</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isLateOrOverdue ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                            title="Kirim pesan peringatan sopan ke guru pengampu via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Tegur / WA</span>
                          </a>
                        ) : row.isAbsenceCompleted ? (
                          <span className="text-emerald-600 text-[11px] font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tuntas
                          </span>
                        ) : (
                          <span className="text-[var(--text-tertiary)] text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
