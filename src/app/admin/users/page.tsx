"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  KeyRound,
  Shield,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Search,
  BookOpen,
  School,
  Lock,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useConfirm } from "@/context/ConfirmContext";
import { Toast } from "@/components/ui/Toast";
import type { AppUser, Subject } from "@/contracts/academic";
import { MOCK_CLASSES } from "@/contracts/mocks/attendanceMocks";
import {
  getStoredUsers,
  createUserByAdmin,
  resetUserPasswordByAdmin,
  toggleUserActiveByAdmin,
  getStoredPasswords,
  deleteUserByAdmin,
  getUserPassword,
} from "@/lib/authStorage";
import {
  getStoredSubjects,
  getStoredTeacherAssignments,
  setTeacherEnrollmentMatrix,
  removeTeacherAssignmentsForTeacher,
} from "@/lib/academicStorage";

/**
 * Halaman Manajemen Pengguna & Akun Guru (/admin/users)
 * Khusus Administrator untuk menambah guru, reset sandi, dan mengelola penugasan
 */
export default function AdminUsersPage() {
  const { currentUser, isAdmin } = useAuth();
  const { confirm } = useConfirm();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<ReturnType<typeof getStoredTeacherAssignments>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State Modal Tambah Guru
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newNip, setNewNip] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("guru123");

  // State Modal Penugasan Mengajar Guru
  const [editingTeacher, setEditingTeacher] = useState<AppUser | null>(null);
  const [teacherEnrollmentMap, setTeacherEnrollmentMap] = useState<Record<string, string[]>>({});
  const [selectedSubjectForTeacher, setSelectedSubjectForTeacher] = useState<string>("sub-inf");

  // State Modal Reset Password
  const [resetTargetUser, setResetTargetUser] = useState<AppUser | null>(null);
  const [resetNewPass, setResetNewPass] = useState("guru123");

  // State Manajemen Kata Sandi (Lihat / Sembunyikan & Salin Kredensial)
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswordUserIds, setVisiblePasswordUserIds] = useState<Set<string>>(new Set());

  // State Modal Konfirmasi Hapus Guru
  const [deleteTargetUser, setDeleteTargetUser] = useState<AppUser | null>(null);

  const refreshData = () => {
    setUsers(getStoredUsers());
    setSubjects(getStoredSubjects());
    setAssignments(getStoredTeacherAssignments());
    setPasswords(getStoredPasswords());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Toggle visibilitas kata sandi untuk satu guru tertentu
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswordUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // Toggle tampilkan seluruh kata sandi guru
  const handleToggleShowAllPasswords = () => {
    if (showAllPasswords) {
      setShowAllPasswords(false);
      setVisiblePasswordUserIds(new Set());
      setToastMessage("Seluruh kata sandi disembunyikan.");
    } else {
      setShowAllPasswords(true);
      const allIds = new Set(users.map((u) => u.id));
      setVisiblePasswordUserIds(allIds);
      setToastMessage("Seluruh kata sandi guru kini ditampilkan.");
    }
  };

  const isPasswordVisible = (userId: string) => {
    return showAllPasswords || visiblePasswordUserIds.has(userId);
  };

  // Salin kredensial login (Username & Password) untuk satu guru
  const handleCopyCredentials = (user: AppUser) => {
    const pass = passwords[user.username.toLowerCase()] || "guru123";
    const text = `Akun Absensi SMPN 3 Cibungbulang\nNama: ${user.fullName}\nUsername: ${user.username}\nKata Sandi: ${pass}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setToastMessage(`Kredensial login @${user.username} berhasil disalin ke clipboard.`);
    }
  };

  // Salin seluruh daftar kredensial guru untuk dibagikan ke forum resmi
  const handleCopyAllCredentials = () => {
    const teachersList = users
      .filter((u) => u.role === "GURU")
      .map((u, i) => {
        const pass = passwords[u.username.toLowerCase()] || "guru123";
        return `${i + 1}. ${u.fullName}\n   Username: ${u.username}\n   Password: ${pass}`;
      })
      .join("\n\n");

    const fullText = `DAFTAR AKUN LOGIN GURU SMP NEGERI 3 CIBUNGBULANG\nSemester Ganjil TP. 2026/2027\n\n${teachersList}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullText);
      setToastMessage("Seluruh kredensial (username & password) guru berhasil disalin.");
    }
  };

  // Eksekusi Hapus Akun Guru
  const handleExecuteDeleteUser = () => {
    if (!deleteTargetUser) return;

    const res = deleteUserByAdmin(deleteTargetUser.id, currentUser?.id);
    if (!res.success) {
      setToastMessage(res.error || "Gagal menghapus akun guru.");
      return;
    }

    // Bersihkan penugasan mengajar guru yang dihapus
    removeTeacherAssignmentsForTeacher(deleteTargetUser.id);

    setToastMessage(`Akun guru ${deleteTargetUser.fullName} (@${deleteTargetUser.username}) berhasil dihapus.`);
    setDeleteTargetUser(null);
    refreshData();
  };

  // Filter daftar pengguna berdasarkan pencarian
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.nip && u.nip.includes(q))
    );
  }, [users, searchQuery]);

  // Handle Tambah Guru Baru
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createUserByAdmin({
      fullName: newFullName,
      username: newUsername,
      nip: newNip,
      email: newEmail,
      role: "GURU",
      initialPassword: newPassword,
    });

    if (!res.success) {
      setToastMessage(res.error || "Gagal membuat akun.");
      return;
    }

    setToastMessage(`Akun guru @${newUsername} berhasil dibuat dengan password awal "${newPassword}".`);
    setIsAddUserOpen(false);
    setNewFullName("");
    setNewUsername("");
    setNewNip("");
    setNewEmail("");
    setNewPassword("guru123");
    refreshData();
  };

  // Handle Reset Password
  const handleExecuteResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;

    const res = resetUserPasswordByAdmin(resetTargetUser.username, resetNewPass);
    if (!res.success) {
      setToastMessage(res.error || "Gagal mereset kata sandi.");
      return;
    }

    setToastMessage(`Kata sandi untuk @${resetTargetUser.username} berhasil direset menjadi "${resetNewPass}".`);
    setResetTargetUser(null);
    refreshData();
  };

  // Handle Aktif / Nonaktif Akun
  const handleToggleActive = async (user: AppUser) => {
    const action = user.isActive ? "menonaktifkan" : "mengaktifkan";
    const isConfirmed = await confirm({
      title: `${user.isActive ? "Nonaktifkan" : "Aktifkan"} Akun Guru`,
      message: `Apakah Anda yakin ingin ${action} akun @${user.username} (${user.fullName})?`,
      confirmText: user.isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan",
      cancelText: "Batal",
      variant: user.isActive ? "warning" : "success",
      icon: user.isActive ? "warning" : "success",
    });

    if (!isConfirmed) return;

    const res = toggleUserActiveByAdmin(user.id);
    if (!res.success) {
      setToastMessage(res.error || "Gagal memperbarui status akun.");
      return;
    }
    setToastMessage(`Akun @${user.username} berhasil ${user.isActive ? "dinonaktifkan" : "diaktifkan kembali"}.`);
    refreshData();
  };

  // Buka Modal Penugasan Mengajar untuk Guru
  const handleOpenAssignmentModal = (teacher: AppUser) => {
    setEditingTeacher(teacher);
    const teacherAsgns = assignments.filter((a) => a.teacherId === teacher.id);
    const matrix: Record<string, string[]> = {};

    for (const a of teacherAsgns) {
      if (!matrix[a.subjectId]) matrix[a.subjectId] = [];
      matrix[a.subjectId].push(a.classId);
    }

    setTeacherEnrollmentMap(matrix);
    setSelectedSubjectForTeacher("sub-inf");
  };

  // Toggle Kelas untuk Penugasan Guru
  const handleToggleClassForSubject = (classId: string) => {
    const currentList = teacherEnrollmentMap[selectedSubjectForTeacher] || [];
    let updated: string[];
    if (currentList.includes(classId)) {
      updated = currentList.filter((id) => id !== classId);
    } else {
      updated = [...currentList, classId];
    }

    setTeacherEnrollmentMap({
      ...teacherEnrollmentMap,
      [selectedSubjectForTeacher]: updated,
    });
  };

  // Simpan Penugasan Mengajar Guru
  const handleSaveTeacherAssignments = () => {
    if (!editingTeacher) return;
    setTeacherEnrollmentMatrix(editingTeacher.id, teacherEnrollmentMap);
    setToastMessage(`Matriks penugasan mengajar untuk ${editingTeacher.fullName} berhasil diperbarui.`);
    setEditingTeacher(null);
    refreshData();
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Akses Terbatas</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md">
          Halaman Manajemen Akun Guru hanya dapat diakses oleh Administrator.
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dasbor Admin
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Manajemen Akun Guru
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Pengelolaan akun tenaga pendidik, pemulihan kata sandi, dan distribusi penugasan rombel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleToggleShowAllPasswords}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-all cursor-pointer"
          >
            {showAllPasswords ? (
              <EyeOff className="w-4 h-4 text-amber-600" />
            ) : (
              <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
            <span>{showAllPasswords ? "Sembunyikan Sandi" : "Lihat Semua Sandi"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAllCredentials}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-all cursor-pointer"
            title="Salin rekap seluruh akun guru untuk dibagikan"
          >
            <Copy className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Salin Rekap Akun</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-on-accent)] text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Akun Guru
          </button>
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari guru berdasarkan nama, username, atau NIP..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      {/* Grid Kartu Pengguna / Guru */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const userAsgns = assignments.filter((a) => a.teacherId === user.id);
          const enrolledSubjects = subjects.filter((s) => userAsgns.some((a) => a.subjectId === s.id));

          return (
            <div
              key={user.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                user.isActive
                  ? "bg-[var(--surface-card)] border-[var(--border-hairline)] shadow-xs"
                  : "bg-[var(--surface-recessed)]/50 border-stone-300 dark:border-stone-800 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        user.role === "ADMIN"
                          ? "bg-blue-600 text-white"
                          : "bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                      }`}
                    >
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-primary)] leading-tight">
                        {user.fullName}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[var(--text-secondary)]">
                  {/* Kotak Kredensial Login (Username & Password) */}
                  <div className="p-2.5 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[var(--text-tertiary)] block font-medium">
                          Kredensial Login
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
                          <span className="font-bold text-[var(--color-accent)]">@{user.username}</span>
                          <span className="text-[var(--text-tertiary)]">·</span>
                          <span className="font-bold text-[var(--text-primary)]">
                            {isPasswordVisible(user.id)
                              ? passwords[user.username.toLowerCase()] || "guru123"
                              : "••••••••"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(user.id)}
                        title={isPasswordVisible(user.id) ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
                      >
                        {isPasswordVisible(user.id) ? (
                          <EyeOff className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(user)}
                        title="Salin username & kata sandi"
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <span>NIP:</span>
                    <span className="font-mono text-[var(--text-primary)]">{user.nip || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-semibold ${
                        user.isActive ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  {user.role === "GURU" && (
                    <div className="pt-2 border-t border-[var(--border-hairline)]">
                      <span className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">
                        Penugasan Mengajar ({userAsgns.length} rombel):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {enrolledSubjects.length > 0 ? (
                          enrolledSubjects.map((s) => (
                            <span
                              key={s.id}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--surface-recessed)] text-[var(--color-accent)] font-medium border border-[var(--border-hairline)]"
                            >
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[var(--text-tertiary)] italic">
                            Belum ada penugasan mapel
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Pengguna */}
              <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setResetTargetUser(user);
                      setResetNewPass(passwords[user.username.toLowerCase()] || "guru123");
                    }}
                    title="Ubah / Reset kata sandi"
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  {user.role === "GURU" && (
                    <button
                      type="button"
                      onClick={() => handleOpenAssignmentModal(user)}
                      title="Atur penugasan mapel & kelas"
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--surface-recessed)] transition-colors cursor-pointer"
                    >
                      <School className="w-4 h-4" />
                    </button>
                  )}

                  {/* Tombol Hapus Akun Guru (Kecuali Super Admin & Kepala Sekolah) */}
                  {user.username !== "admin" && user.username !== "juwariyah" && (
                    <button
                      type="button"
                      onClick={() => setDeleteTargetUser(user)}
                      title="Hapus akun guru ini"
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {user.username !== "admin" && (
                  <button
                    type="button"
                    onClick={() => handleToggleActive(user)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      user.isActive
                        ? "text-rose-600 hover:bg-rose-500/10"
                        : "text-emerald-600 hover:bg-emerald-500/10"
                    }`}
                  >
                    {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Guru Baru */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] shadow-xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <h3 className="font-bold text-base text-[var(--text-primary)]">Tambah Akun Guru Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi, S.Pd"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Username * (Tanpa spasi, huruf kecil)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ahmad.fauzi"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19850101 201001 1 002"
                  value={newNip}
                  onChange={(e) => setNewNip(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Alamat Surel / Email
                </label>
                <input
                  type="email"
                  placeholder="Contoh: ahmad.fauzi@smpn3cibungbulang.sch.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Kata Sandi Awal *
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                  Guru dapat mengubah kata sandi ini secara mandiri di halaman Profil mereka.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-xs hover:opacity-90"
                >
                  Simpan Akun Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] shadow-xl p-6 space-y-4 animate-scale-up">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              Reset Kata Sandi
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Mereset kata sandi akun guru: <strong>{resetTargetUser.fullName}</strong> (@{resetTargetUser.username}).
            </p>

            <div className="p-3 bg-[var(--surface-recessed)] rounded-xl border border-[var(--border-hairline)] text-xs space-y-1">
              <span className="text-[var(--text-tertiary)] block text-[11px] font-medium">Kata Sandi Saat Ini:</span>
              <span className="font-mono font-bold text-[var(--text-primary)] text-sm tracking-wider">
                {passwords[resetTargetUser.username] || "(belum diset)"}
              </span>
            </div>

            <form onSubmit={handleExecuteResetPassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="text"
                  required
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:opacity-90"
                >
                  Reset Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Atur Penugasan Mengajar Guru */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--surface-card)] rounded-2xl border border-[var(--border-hairline)] shadow-xl p-6 space-y-4 animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Atur Penugasan: {editingTeacher.fullName}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Pilih mata pelajaran dan centang rombel kelas yang diajar oleh guru ini
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Pemilih Mapel */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">
                  1. Pilih Mata Pelajaran:
                </label>
                <select
                  value={selectedSubjectForTeacher}
                  onChange={(e) => setSelectedSubjectForTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) — KKM Standar: {s.defaultKkm}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checklist Kelas untuk Mapel Ini */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    2. Centang Rombel Kelas yang Diajar:
                  </label>
                  <span className="text-[11px] font-mono text-[var(--color-accent)] font-bold">
                    {(teacherEnrollmentMap[selectedSubjectForTeacher] || []).length} kelas terpilih
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MOCK_CLASSES.map((cls, idx) => {
                    const isChecked = (teacherEnrollmentMap[selectedSubjectForTeacher] || []).includes(cls.id);
                    return (
                      <button
                        key={`${cls.id}-${idx}`}
                        type="button"
                        onClick={() => handleToggleClassForSubject(cls.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? "bg-[var(--surface-recessed)] border-[var(--color-accent)] font-bold text-[var(--color-accent)]"
                            : "bg-[var(--surface-card)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <span>Kelas {cls.name}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTeacherAssignments}
                className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-xs hover:opacity-90"
              >
                Simpan Penugasan Guru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Akun Guru */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface-card)] rounded-2xl border border-rose-500/30 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Hapus Akun Guru?
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Tindakan ini akan menghapus akun login dan seluruh penugasan mengajar guru secara permanen.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[var(--surface-recessed)] rounded-xl border border-[var(--border-hairline)] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Nama Guru:</span>
                <span className="font-bold text-[var(--text-primary)]">{deleteTargetUser.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Username:</span>
                <span className="font-mono font-semibold text-[var(--color-accent)]">@{deleteTargetUser.username}</span>
              </div>
              {deleteTargetUser.nip && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">NIP:</span>
                  <span className="font-mono text-[var(--text-secondary)]">{deleteTargetUser.nip}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-[var(--border-hairline)]">
                <span className="text-[var(--text-tertiary)]">Kata Sandi:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {passwords[deleteTargetUser.username] || "-"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 space-y-1">
              <p className="font-semibold">Catatan Keamanan & Integritas:</p>
              <p>Riwayat presensi dan nilai siswa yang sebelumnya diinput oleh guru ini tetap tersimpan aman di database sekolah.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-recessed)] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Akun Guru
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
