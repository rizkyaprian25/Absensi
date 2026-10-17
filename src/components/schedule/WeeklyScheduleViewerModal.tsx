"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  X,
  Printer,
  Users,
  GraduationCap,
  Clock,
  BookOpen,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { ScheduleDay } from "@/contracts/attendance";
import { OFFICIAL_SCHEDULE_SLOTS } from "@/contracts/mocks/scheduleMocks";
import { getStoredUsers } from "@/lib/authStorage";
import { MOCK_CLASSES } from "@/contracts/mocks/attendanceMocks";
import type { AppUser } from "@/contracts/academic";

interface WeeklyScheduleViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  defaultTeacherId?: string;
  defaultClassId?: string;
}

const DAYS: ScheduleDay[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

/**
 * Modal Matriks Jadwal Mingguan aSc Timetables
 * Menampilkan jadwal mingguan interaktif (Mode Per Guru & Mode Per Rombel)
 * untuk seluruh 29 guru dan 22 rombel SMP Negeri 3 Cibungbulang
 */
export default function WeeklyScheduleViewerModal({
  isOpen,
  onClose,
  currentUser,
  defaultTeacherId,
  defaultClassId,
}: WeeklyScheduleViewerModalProps) {
  const [viewMode, setViewMode] = useState<"TEACHER" | "CLASS">("TEACHER");

  // Daftar seluruh guru pengampu
  const allUsers = useMemo(() => getStoredUsers(), []);
  const teachers = useMemo(() => {
    return allUsers.filter((u) => u.role === "GURU");
  }, [allUsers]);

  // ID Guru terpilih (default: guru yang sedang login atau Pak Rizky)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    if (defaultTeacherId) return defaultTeacherId;
    if (currentUser?.role === "GURU") return currentUser.id;
    return "user-rizky";
  });

  // ID Rombel terpilih (default: 7A)
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return defaultClassId || "class-7a";
  });

  // Data guru terpilih
  const currentTeacher = useMemo(() => {
    return (
      allUsers.find((u) => u.id === selectedTeacherId) || {
        id: selectedTeacherId,
        fullName: "Guru Pengampu",
        username: "guru",
      }
    );
  }, [allUsers, selectedTeacherId]);

  // Slot jadwal berdasarkan Mode Tampilan
  const activeSlots = useMemo(() => {
    if (viewMode === "TEACHER") {
      return OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.teacherId === selectedTeacherId);
    } else {
      return OFFICIAL_SCHEDULE_SLOTS.filter((s) => s.classId === selectedClassId);
    }
  }, [viewMode, selectedTeacherId, selectedClassId]);

  // Kelompokkan slot per hari
  const slotsByDay = useMemo(() => {
    const map: Record<ScheduleDay, typeof activeSlots> = {
      Senin: [],
      Selasa: [],
      Rabu: [],
      Kamis: [],
      Jumat: [],
    };

    activeSlots.forEach((slot) => {
      if (map[slot.day]) {
        map[slot.day].push(slot);
      }
    });

    // Urutkan slot berdasarkan jam masuk
    DAYS.forEach((day) => {
      map[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    return map;
  }, [activeSlots]);

  // Total jam / sesi
  const totalSessions = activeSlots.length;

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="w-full max-w-5xl bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[20px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-recessed)]/50 print:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--color-accent)] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Matriks Jadwal Pelajaran Mingguan (aSc Timetables)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold font-mono">
                  TP. 2026/2027
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                SMP Negeri 3 Cibungbulang · Jadwal Resmi Berlaku Mulai 14 Juli 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-[10px] bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Cetak Jadwal Pelajaran"
            >
              <Printer className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-[10px] bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Kontrol Mode & Selektor Subjek/Guru */}
        <div className="p-4 border-b border-[var(--border-hairline)] bg-[var(--surface-card)] flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
          {/* Tombol Tab Mode */}
          <div className="inline-flex items-center p-1 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] self-start">
            <button
              type="button"
              onClick={() => setViewMode("TEACHER")}
              className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "TEACHER"
                  ? "bg-[var(--color-accent)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Jadwal Guru ({teachers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("CLASS")}
              className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "CLASS"
                  ? "bg-[var(--color-accent)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Jadwal Rombel ({MOCK_CLASSES.length})</span>
            </button>
          </div>

          {/* Selektor Guru atau Rombel */}
          <div className="flex items-center gap-2">
            {viewMode === "TEACHER" ? (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-[var(--text-secondary)] font-medium shrink-0">
                  Pilih Guru:
                </span>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="min-h-[38px] px-3 py-1.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer max-w-[280px]"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} (@{t.username})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-[var(--text-secondary)] font-medium shrink-0">
                  Pilih Rombel:
                </span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="min-h-[38px] px-3 py-1.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer"
                >
                  {MOCK_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      Kelas {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Badge Ringkasan Sesi */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-mono font-bold text-[var(--color-accent)] shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{totalSessions} Sesi KBM / Minggu</span>
            </div>
          </div>
        </div>

        {/* Informasi Entitas yang Ditampilkan */}
        <div className="px-5 py-3 bg-[var(--surface-recessed)]/30 border-b border-[var(--border-hairline)] flex items-center justify-between text-xs">
          <div>
            {viewMode === "TEACHER" ? (
              <p className="text-[var(--text-secondary)]">
                Jadwal mengajar resmi untuk:{" "}
                <strong className="text-[var(--text-primary)] font-bold">
                  {currentTeacher.fullName}
                </strong>{" "}
                <span className="text-[var(--text-tertiary)] font-mono">
                  (@{currentTeacher.username})
                </span>
              </p>
            ) : (
              <p className="text-[var(--text-secondary)]">
                Jadwal pelajaran resmi rombongan belajar:{" "}
                <strong className="text-[var(--text-primary)] font-bold">
                  Kelas {MOCK_CLASSES.find((c) => c.id === selectedClassId)?.name}
                </strong>
              </p>
            )}
          </div>
          <span className="font-mono text-[var(--text-tertiary)]">
            Total {totalSessions} Pertemuan
          </span>
        </div>

        {/* Grid Matriks 5 Hari (Senin - Jumat) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[var(--surface-recessed)]/10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {DAYS.map((day) => {
              const daySlots = slotsByDay[day] || [];
              const isToday =
                new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date()) === day;

              return (
                <div
                  key={day}
                  className={`rounded-[14px] border flex flex-col overflow-hidden bg-[var(--surface-card)] transition-all ${
                    isToday
                      ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20 shadow-xs"
                      : "border-[var(--border-hairline)]"
                  }`}
                >
                  {/* Header Hari */}
                  <div
                    className={`p-3 border-b border-[var(--border-hairline)] flex items-center justify-between ${
                      isToday ? "bg-[var(--color-accent)]/10" : "bg-[var(--surface-recessed)]/50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[var(--text-primary)]">{day}</span>
                      {isToday && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-accent)] text-white font-bold">
                          Hari Ini
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {daySlots.length} sesi
                    </span>
                  </div>

                  {/* Daftar Slot Hari Tersebut */}
                  <div className="p-2.5 flex flex-col gap-2 flex-1 min-h-[160px]">
                    {daySlots.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-xs text-[var(--text-tertiary)] italic">
                          Tidak ada jam KBM
                        </span>
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-2.5 rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border-hairline)] flex flex-col gap-1.5 hover:border-[var(--color-accent)]/40 transition-colors shadow-2xs"
                        >
                          {/* Waktu & Periode */}
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-[var(--color-accent)] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {slot.time}
                            </span>
                            <span className="text-[var(--text-tertiary)] bg-[var(--surface-card)] px-1.5 py-0.5 rounded border border-[var(--border-hairline)]">
                              {slot.period}
                            </span>
                          </div>

                          {/* Informasi Kelas & Mapel */}
                          <div className="mt-0.5">
                            {viewMode === "TEACHER" ? (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-xs text-[var(--text-primary)]">
                                    Kelas {slot.className}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold">
                                    {slot.subjectName}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-[var(--text-primary)]">
                                    {slot.subjectName}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate">
                                  {slot.teacherName}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--surface-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--text-secondary)] print:hidden">
          <p className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>
              Total 374 sesi KBM dan 264 penugasan resmi terintegrasi otomatis dengan aSc Timetables
            </span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] font-semibold text-[var(--text-primary)] transition-all cursor-pointer self-end sm:self-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
