"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Users, ChevronRight, School, Archive, CheckCircle2 } from "lucide-react";
import { MOCK_CLASSES, getStudentsForClass } from "@/contracts/mocks/attendanceMocks";
import { Class } from "@/contracts/attendance";

/**
 * Halaman Daftar Kelas (L5 Stitch)
 * Memuat daftar rombongan belajar guru, tahun ajaran, dan status arsip
 */
export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newAcademicYear, setNewAcademicYear] = useState("2026/2027");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: Class = {
      id: `class-${Date.now()}`,
      teacherId: "teacher-1",
      name: newClassName.trim(),
      academicYear: newAcademicYear,
      semester: 1,
      archivedAt: null,
      createdAt: new Date().toISOString(),
      subject: "Informatika",
    };

    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
    setIsCreateOpen(false);
    setToastMessage(`Kelas ${newClass.name} berhasil ditambahkan`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--status-hadir-fg)] text-white px-4 py-2.5 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman & Aksi Tambah Kelas */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Daftar Kelas
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            10 Rombongan Belajar Informatika · SMP Negeri 3 Cibungbulang
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="min-h-[44px] px-3.5 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold rounded-[10px] text-xs flex items-center gap-1.5 hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas</span>
        </button>
      </header>

      {/* Modal Tambah Kelas Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-[16px] p-5 shadow-xl flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Tambah Rombongan Belajar
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Masukkan identitas kelas dan tahun ajaran baru.
              </p>
            </div>

            <form onSubmit={handleCreateClass} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VII-C atau IX IPA 1"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  required
                  value={newAcademicYear}
                  onChange={(e) => setNewAcademicYear(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-[var(--surface-recessed)] border border-[var(--border-hairline)] rounded-[10px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="min-h-[40px] px-4 rounded-[10px] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 rounded-[10px] text-xs font-bold bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daftar Kelas (Ruled Cards) */}
      <div className="flex flex-col gap-3">
        {classes.map((cls) => {
          const studentCount = getStudentsForClass(cls.id).length;

          return (
            <Link
              key={cls.id}
              href={`/classes/${cls.id}`}
              className="p-4 bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)]/50 border border-[var(--border-hairline)] rounded-[14px] flex items-center justify-between gap-3 transition-colors shadow-xs group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-[10px] bg-[var(--surface-recessed)] text-[var(--color-accent)] flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                  <School className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-[var(--text-primary)] leading-tight">
                      Kelas {cls.name}
                    </h2>
                    {cls.scheduleDay && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[var(--surface-recessed)] text-[var(--color-accent)] font-mono">
                        {cls.scheduleDay}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1 flex-wrap">
                    <span className="font-mono text-[var(--color-accent)] font-medium">
                      {cls.schedulePeriod} ({cls.scheduleTime} WIB)
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Users className="w-3.5 h-3.5" />
                      {studentCount} Siswa
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] shrink-0">
                <span className="hidden sm:inline font-medium">Kelola Siswa</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
