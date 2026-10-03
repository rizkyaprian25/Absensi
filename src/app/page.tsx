"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Calendar,
  School,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  MOCK_CLASSES,
  MOCK_TEACHER_NAME,
  MOCK_SCHOOL_NAME,
  MOCK_SUBJECT,
} from "@/contracts/mocks/attendanceMocks";
import { ScheduleDay } from "@/contracts/attendance";

const DAYS_OF_WEEK: ScheduleDay[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

/**
 * Halaman Dashboard "Hari Ini" & Jadwal Mengajar
 * Disesuaikan dengan jadwal resmi Muhamad Rizky Aprian, S.Kom (SMPN 3 Cibungbulang)
 */
export default function TodayDashboardPage() {
  // Dapatkan hari saat ini dalam bahasa Indonesia
  const currentDayName = useMemo<ScheduleDay>(() => {
    const dayIndex = new Date().getDay(); // 0 = Minggu, 1 = Senin, ... 5 = Jumat, 6 = Sabtu
    if (dayIndex === 1) return "Senin";
    if (dayIndex === 2) return "Selasa";
    if (dayIndex === 3) return "Rabu";
    if (dayIndex === 4) return "Kamis";
    if (dayIndex === 5) return "Jumat";
    // Jika Sabtu/Minggu, default tampilkan Senin
    return "Senin";
  }, []);

  const [selectedDay, setSelectedDay] = useState<ScheduleDay>(currentDayName);

  // Filter kelas berdasarkan hari yang dipilih
  const classesForSelectedDay = useMemo(() => {
    return MOCK_CLASSES.filter((c) => c.scheduleDay === selectedDay);
  }, [selectedDay]);

  // Format tanggal hari ini
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Guru & Status Sinkronisasi */}
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)] font-medium">
              Selamat datang, <strong className="text-[var(--text-primary)]">Pak Rizky</strong>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--surface-card)] border border-[var(--border-hairline)] text-[var(--status-hadir-fg)] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--status-hadir-fg)] animate-pulse" />
            TERSIMPAN
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {formattedToday}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium mt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              {MOCK_SCHOOL_NAME}
            </span>
            <span>·</span>
            <span className="font-semibold text-[var(--color-accent)]">
              {MOCK_SUBJECT}
            </span>
            <span>·</span>
            <span>Semester Ganjil 2026/2027</span>
          </div>
        </div>
      </header>

      {/* Selektor Hari Jadwal Mengajar */}
      <div className="p-1.5 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex items-center justify-between gap-1 shadow-xs overflow-x-auto">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = currentDayName === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex flex-col items-center justify-center shrink-0 ${
                isSelected
                  ? "bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-recessed)]"
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{day}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-[var(--color-accent)]"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-normal font-mono ${
                  isSelected ? "text-white/80" : "text-[var(--text-secondary)]"
                }`}
              >
                2 Sesi KBM
              </span>
            </button>
          );
        })}
      </div>

      {/* Bagian: Jadwal KBM Hari Terpilih */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
              Jadwal Mengajar {selectedDay}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-recessed)] text-[var(--text-secondary)]">
              {classesForSelectedDay.length} Kelas
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">Informatika</span>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] divide-y divide-[var(--border-hairline)] overflow-hidden shadow-xs">
          {classesForSelectedDay.map((cls, idx) => (
            <div
              key={cls.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-recessed)]/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] flex flex-col items-center justify-center font-bold shrink-0">
                  <span className="text-xs text-[var(--text-secondary)] font-mono">KELAS</span>
                  <span className="text-base text-[var(--color-accent)] font-extrabold leading-none">
                    {cls.name}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-bold text-base text-[var(--text-primary)]">
                      Kelas {cls.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[var(--surface-recessed)] text-[var(--text-secondary)] font-mono font-medium">
                      {cls.schedulePeriod}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>{cls.scheduleTime} WIB</span>
                    <span>·</span>
                    <span>34 Siswa</span>
                  </p>
                </div>
              </div>

              <Link
                href={`/attendance/${cls.id}`}
                className="min-h-[44px] px-4 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold rounded-[10px] text-xs flex items-center justify-center gap-2 shrink-0 hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
              >
                <span>Mulai Absen Kelas {cls.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Ringkasan Beban Mengajar Mingguan */}
      <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[14px] flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-bold uppercase tracking-wider">
            Total Beban Mengajar Mingguan
          </span>
          <span className="font-semibold text-[var(--color-accent)]">
            10 Rombel · aSc Timetables
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">SENIN</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">7A &amp; 7D</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">08.00–11.55</span>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">SELASA</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">8B &amp; 7B</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">07.30–11.25</span>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">RABU</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">7F &amp; 7E</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">07.30–11.25</span>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">KAMIS</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">8A &amp; 7H</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">07.30–11.25</span>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)]/60 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] block">JUMAT</span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">7G &amp; 7C</span>
            <span className="text-[10px] text-[var(--text-secondary)] block">08.00–11.20</span>
          </div>
        </div>
      </div>

      {/* Catatan Berita Acara Presensi */}
      <div className="p-3.5 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[14px] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
        <Clock className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[var(--text-primary)]">
            Buku Presensi Guru Mata Pelajaran Informatika
          </p>
          <p>
            Pencatatan presensi siswa disesuaikan dengan jam KBM kelas bersangkutan di SMP Negeri 3 Cibungbulang.
          </p>
        </div>
      </div>
    </div>
  );
}
