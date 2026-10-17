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
  BookOpen,
  TrendingUp,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_CLASSES } from "@/contracts/mocks/attendanceMocks";
import { getStoredUsers } from "@/lib/authStorage";
import { getStoredSubjects, getStoredTeacherAssignments } from "@/lib/academicStorage";
import { getSchoolTotalStudentsStats } from "@/lib/rolloverStorage";
import { getSavedSessions } from "@/lib/attendanceStorage";
import type { ScheduleDay } from "@/contracts/attendance";

function getCurrentScheduleDay(): ScheduleDay {
  const dayIndex = new Date().getDay();
  if (dayIndex === 1) return "Senin";
  if (dayIndex === 2) return "Selasa";
  if (dayIndex === 3) return "Rabu";
  if (dayIndex === 4) return "Kamis";
  if (dayIndex === 5) return "Jumat";
  return "Senin";
}

/**
 * Halaman Dasbor Eksekutif Terpadu Administrator
 * SMP Negeri 3 Cibungbulang — Supervisi KBM, Statistik Sekolah, dan Pusat Tata Kelola
 */
export default function AdminDashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const [selectedDay, setSelectedDay] = useState<ScheduleDay>(getCurrentScheduleDay());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Cari sesi absensi yang cocok dengan kelas dan hari ini
  const monitorRows = useMemo(() => {
    return classesToday.map((cls) => {
      // Cari penugasan guru untuk kelas ini
      const asgn = assignments.find((a) => a.classId === cls.id);
      const teacher = asgn ? users.find((u) => u.id === asgn.teacherId) : null;
      const subject = asgn ? subjects.find((s) => s.id === asgn.subjectId) : null;

      // Cari apakah kelas ini sudah memiliki sesi absensi tersimpan
      const session = savedSessions.find((s) => s.classId === cls.id);

      return {
        cls,
        teacherName: teacher?.fullName || "Muhamad Rizky Aprian, S.Kom",
        subjectName: subject?.name || cls.subject || "Informatika",
        scheduleTime: cls.scheduleTime || "08:00 – 09:45",
        schedulePeriod: cls.schedulePeriod || "Jam Ke 1–3",
        isAbsenceCompleted: !!session,
        topic: session?.topic || null,
        sessionDate: session?.sessionDate || null,
      };
    });
  }, [classesToday, assignments, users, subjects, savedSessions]);

  const completedCount = monitorRows.filter((r) => r.isAbsenceCompleted).length;
  const totalClassesToday = monitorRows.length;
  const completionPercentage = totalClassesToday > 0 ? Math.round((completedCount / totalClassesToday) * 100) : 0;

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
            Supervisi Kegiatan Belajar Mengajar (KBM), Manajemen Rombel & Kenaikan Kelas · SMP Negeri 3 Cibungbulang
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
            <span className="text-xs font-semibold text-[var(--text-secondary)]">KBM Terabsen Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              {completionPercentage}%
            </span>
            <span className="text-xs text-[var(--text-secondary)] ml-1.5 font-medium">
              ({completedCount}/{totalClassesToday} kelas)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-secondary)]">
            {completedCount === totalClassesToday && totalClassesToday > 0
              ? "Semua kelas tuntas diabsen"
              : `${totalClassesToday - completedCount} kelas belum input presensi`}
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

      {/* Bagian Live Monitor Presensi KBM Harian Sekolah */}
      <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
              Live Monitor KBM Sekolah
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Pemantauan real-time kehadiran KBM dan pencatatan materi pembelajaran oleh guru
            </p>
          </div>

          {/* Pemilih Hari Jadwal */}
          <div className="flex items-center gap-1 bg-[var(--surface-recessed)] p-1 rounded-xl border border-[var(--border-hairline)] self-start">
            {scheduleDays.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDay === day
                    ? "bg-[var(--color-accent)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Pemantauan KBM */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Waktu & Jam</th>
                <th className="py-2.5 px-3">Mata Pelajaran</th>
                <th className="py-2.5 px-3">Guru Pengampu</th>
                <th className="py-2.5 px-3 text-center">Status Presensi</th>
                <th className="py-2.5 px-3">Materi / Agenda KBM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {monitorRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                    Tidak ada jadwal KBM pada hari {selectedDay}.
                  </td>
                </tr>
              ) : (
                monitorRows.map((row) => (
                  <tr key={row.cls.id} className="hover:bg-[var(--surface-recessed)]/50 transition-colors">
                    <td className="py-3 px-3 font-bold font-mono text-[var(--text-primary)]">
                      Kelas {row.cls.name}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-secondary)] font-mono">
                      {row.scheduleTime} ({row.schedulePeriod})
                    </td>
                    <td className="py-3 px-3 font-medium text-[var(--text-primary)]">
                      {row.subjectName}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">
                      {row.teacherName}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.isAbsenceCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Sudah Diabsen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3" />
                          Belum Diabsen
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-[280px] truncate text-[var(--text-secondary)]">
                      {row.topic ? (
                        <span className="text-[var(--text-primary)] font-medium">
                          {row.topic}
                        </span>
                      ) : (
                        <span className="italic text-[var(--text-tertiary)]">Belum ada catatan materi</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
