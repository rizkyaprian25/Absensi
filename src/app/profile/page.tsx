"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Lock,
  PenTool,
  BookOpen,
  Check,
  AlertCircle,
  Save,
  Trash2,
  Upload,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  School,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile, changePassword } from "@/lib/authStorage";
import {
  getStoredSubjects,
  getTeacherAssignments,
  setTeacherEnrollmentMatrix,
} from "@/lib/academicStorage";
import { MOCK_CLASSES } from "@/contracts/mocks/attendanceMocks";
import type { Subject } from "@/contracts/academic";

export default function ProfilePage() {
  const { currentUser, refreshUser } = useAuth();

  // State Biodata
  const [fullName, setFullName] = useState("");
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bioSuccess, setBioSuccess] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);

  // State Ganti Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // State Tanda Tangan Digital
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [sigSuccess, setSigSuccess] = useState<string | null>(null);

  // State Self-Enrollment Mapel & Kelas
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  // Mapping subjectId -> array of classIds
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string[]>>({});
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  // Inisialisasi Data dari Pengguna Aktif
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setNip(currentUser.nip || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setSignatureUrl(currentUser.signatureUrl || null);

      // Muat mata pelajaran dan penugasan mengajar
      const subjects = getStoredSubjects();
      setAvailableSubjects(subjects);

      const assignments = getTeacherAssignments(currentUser.id);
      const matrix: Record<string, string[]> = {};
      assignments.forEach((a) => {
        if (!matrix[a.subjectId]) matrix[a.subjectId] = [];
        if (!matrix[a.subjectId].includes(a.classId)) {
          matrix[a.subjectId].push(a.classId);
        }
      });

      // Default jika belum ada penugasan sama sekali dan guru adalah Pak Rizky
      if (Object.keys(matrix).length === 0 && currentUser.role === "GURU") {
        matrix["sub-inf"] = MOCK_CLASSES.map((c) => c.id);
      }

      setEnrollmentMap(matrix);
    }
  }, [currentUser]);

  // Inisialisasi Kanvas Tanda Tangan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Bersihkan latar belakang transparan
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#163A29";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Handler Gambar Tanda Tangan (Touch & Pointer Events)
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentUser) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureUrl(dataUrl);

    updateUserProfile(currentUser.id, { signatureUrl: dataUrl });
    refreshUser();
    setSigSuccess("Tanda tangan digital berhasil disimpan!");
    setTimeout(() => setSigSuccess(null), 3000);
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSignatureUrl(dataUrl);
        updateUserProfile(currentUser.id, { signatureUrl: dataUrl });
        refreshUser();
        setSigSuccess("Berkas tanda tangan berhasil diunggah!");
        setTimeout(() => setSigSuccess(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Simpan Biodata
  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setBioError(null);
    setBioSuccess(null);

    const res = updateUserProfile(currentUser.id, {
      fullName: fullName.trim(),
      nip: nip.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
    });

    if (res.success) {
      refreshUser();
      setBioSuccess("Data kepegawaian berhasil diperbarui!");
      setTimeout(() => setBioSuccess(null), 3000);
    } else {
      setBioError(res.error || "Gagal memperbarui data biodata.");
    }
  };

  // Ganti Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    const res = changePassword(currentUser.id, oldPassword, newPassword);

    if (res.success) {
      setPassSuccess("Kata sandi berhasil diubah! Gunakan kata sandi baru untuk login berikutnya.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccess(null), 4000);
    } else {
      setPassError(res.error || "Gagal mengubah kata sandi.");
    }
  };

  // Helper Self-Enrollment
  const toggleSubject = (subId: string) => {
    setEnrollmentMap((prev) => {
      const copy = { ...prev };
      if (copy[subId]) {
        delete copy[subId];
      } else {
        copy[subId] = [];
      }
      return copy;
    });
  };

  const toggleClassForSubject = (subId: string, classId: string) => {
    setEnrollmentMap((prev) => {
      const copy = { ...prev };
      const currentList = copy[subId] || [];
      if (currentList.includes(classId)) {
        copy[subId] = currentList.filter((id) => id !== classId);
      } else {
        copy[subId] = [...currentList, classId];
      }
      return copy;
    });
  };

  const selectAllClassesForSubject = (subId: string, grade: "all" | "7" | "8") => {
    const targetClasses = MOCK_CLASSES.filter((c) => {
      if (grade === "7") return c.name.startsWith("7");
      if (grade === "8") return c.name.startsWith("8");
      return true;
    }).map((c) => c.id);

    setEnrollmentMap((prev) => {
      const copy = { ...prev };
      const current = new Set(copy[subId] || []);
      targetClasses.forEach((id) => current.add(id));
      copy[subId] = Array.from(current);
      return copy;
    });
  };

  const clearClassesForSubject = (subId: string) => {
    setEnrollmentMap((prev) => ({
      ...prev,
      [subId]: [],
    }));
  };

  const handleSaveEnrollment = () => {
    if (!currentUser) return;

    setTeacherEnrollmentMatrix(currentUser.id, enrollmentMap);
    setEnrollSuccess("Penugasan mengajar mandiri berhasil disimpan!");
    setTimeout(() => setEnrollSuccess(null), 3000);
  };

  // Hitung total rombel aktif
  const totalEnrolledCount = Object.values(enrollmentMap).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-hairline)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Profil & Penugasan Guru
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Kelola data akun, keamanan, tanda tangan resmi, dan rombel mengajar mandiri.
          </p>
        </div>

        {/* Lencana Peran */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              currentUser?.role === "ADMIN"
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/20"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {currentUser?.role === "ADMIN" ? "Administrator Sekolah" : "Guru Mata Pelajaran"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ================================================================= */}
        {/* KARTU 1: INFORMASI KEPEGAWAIAN & BIODATA                          */}
        {/* ================================================================= */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-hairline)]">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">
                Informasi Kepegawaian
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">Biodata resmi identitas guru</p>
            </div>
          </div>

          {bioSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{bioSuccess}</span>
            </div>
          )}
          {bioError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bioError}</span>
            </div>
          )}

          <form onSubmit={handleSaveBio} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Username Sistem (Permanen)
              </label>
              <input
                type="text"
                disabled
                value={currentUser?.username || ""}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--surface-recessed)] opacity-70 border border-[var(--border-hairline)] font-mono text-[var(--text-secondary)] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Muhamad Rizky Aprian, S.Kom"
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Nomor Induk Pegawai (NIP)
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: 19940825 202221 1 004"
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Surel / Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guru@sekolah.sch.id"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  No. WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-on-accent)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan Biodata</span>
            </button>
          </form>
        </div>

        {/* ================================================================= */}
        {/* KARTU 2: KEAMANAN AKUN (GANTI PASSWORD MANDIRI)                   */}
        {/* ================================================================= */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-hairline)]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">
                Keamanan & Kata Sandi
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">Ubah kata sandi login Anda secara mandiri</p>
            </div>
          </div>

          {passSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}
          {passError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Kata Sandi Lama
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Kata Sandi Baru (Min. 6 Karakter)
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi kata sandi baru..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? "Sembunyikan" : "Tampilkan"} Karakter</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] border border-[var(--border-hairline)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Perbarui Kata Sandi</span>
            </button>
          </form>
        </div>
      </div>

      {/* ================================================================= */}
      {/* KARTU 3: TANDA TANGAN DIGITAL RESMI GURU                          */}
      {/* ================================================================= */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">
                Tanda Tangan Digital Resmi
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Digunakan otomatis pada kop cetak resmi presensi dan raport nilai
              </p>
            </div>
          </div>

          <label className="cursor-pointer px-3 py-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-recessed)] hover:bg-[var(--border-hairline)] text-[11px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah PNG Transparan</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleUploadSignature}
              className="hidden"
            />
          </label>
        </div>

        {sigSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{sigSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Kanvas Gambar Sentuh/Mouse */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                Goreskan Tanda Tangan Anda di Bawah:
              </span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus Goresan</span>
              </button>
            </div>

            <div className="relative border-2 border-dashed border-[var(--border-hairline)] rounded-2xl bg-white dark:bg-zinc-900/50 overflow-hidden flex items-center justify-center touch-none">
              <canvas
                ref={canvasRef}
                width={360}
                height={140}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                className="w-full h-[140px] cursor-crosshair"
              />
            </div>

            <button
              type="button"
              onClick={saveCanvasSignature}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-on-accent)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Goresan Tanda Tangan</span>
            </button>
          </div>

          {/* Pratinjau Tanda Tangan Aktif */}
          <div className="p-4 rounded-2xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] flex flex-col items-center justify-center text-center min-h-[180px]">
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] mb-2">
              Pratinjau Tanda Tangan Terdaftar:
            </p>
            {signatureUrl ? (
              <div className="bg-white p-3 rounded-xl shadow-sm border border-zinc-200">
                <img
                  src={signatureUrl}
                  alt="Tanda Tangan Guru"
                  className="max-h-[90px] object-contain"
                />
              </div>
            ) : (
              <div className="text-[11px] text-[var(--text-tertiary)] italic">
                Belum ada tanda tangan tersimpan. Silakan goreskan pada kanvas atau unggah berkas PNG.
              </div>
            )}
            <p className="text-[10px] text-[var(--text-secondary)] mt-3">
              Nama Tertera: <strong>{fullName || "Guru Pengampu"}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* KARTU 4: SELF-ENROLLMENT PENUGASAN MENGAJAR MANDIRI                */}
      {/* ================================================================= */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">
                Penugasan Mengajar Mandiri (Self-Enrollment)
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Pilih mata pelajaran & centang rombel kelas yang Anda ajar di semester berjalan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[var(--surface-recessed)] text-[11px] font-semibold text-[var(--color-accent)] font-mono border border-[var(--border-hairline)]">
              {totalEnrolledCount} Kelas Terpilih
            </span>
            <button
              type="button"
              onClick={handleSaveEnrollment}
              className="py-1.5 px-3 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-on-accent)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Penugasan</span>
            </button>
          </div>
        </div>

        {enrollSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{enrollSuccess}</span>
          </div>
        )}

        {/* 1. Pilih Mata Pelajaran yang Diampu */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            1. Centang Mata Pelajaran yang Anda Ajar (Bisa Lebih dari 1 Mapel):
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSubjects.map((sub) => {
              const isSelected = Boolean(enrollmentMap[sub.id]);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[var(--color-accent)] text-[var(--color-on-accent)] border-[var(--color-accent)] shadow-sm font-semibold"
                      : "bg-[var(--surface-recessed)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{sub.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({sub.code})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Pilih Rombel Kelas untuk Setiap Mapel yang Dipilih */}
        <div className="space-y-4 pt-2">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">
            2. Tentukan Rombel Kelas yang Diajar per Mata Pelajaran:
          </label>

          {Object.keys(enrollmentMap).length === 0 ? (
            <div className="p-4 rounded-xl bg-[var(--surface-recessed)] text-center text-xs text-[var(--text-tertiary)] italic">
              Belum ada mata pelajaran yang dicentang. Silakan pilih minimal 1 mata pelajaran di atas.
            </div>
          ) : (
            Object.keys(enrollmentMap).map((subId) => {
              const subObj = availableSubjects.find((s) => s.id === subId);
              if (!subObj) return null;
              const selectedClasses = enrollmentMap[subId] || [];

              return (
                <div
                  key={subId}
                  className="p-4 rounded-2xl bg-[var(--surface-recessed)] border border-[var(--border-hairline)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
                      <h3 className="font-bold text-xs text-[var(--text-primary)]">
                        {subObj.name} ({subObj.code})
                      </h3>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        · KKM Standar: {subObj.defaultKkm}
                      </span>
                    </div>

                    {/* Pintasan Pilih Cepat */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => selectAllClassesForSubject(subId, "7")}
                        className="px-2 py-0.5 rounded-lg bg-[var(--surface-card)] hover:bg-[var(--border-hairline)] text-[10px] font-semibold text-[var(--text-secondary)]"
                      >
                        + Semua Kls 7
                      </button>
                      <button
                        type="button"
                        onClick={() => selectAllClassesForSubject(subId, "8")}
                        className="px-2 py-0.5 rounded-lg bg-[var(--surface-card)] hover:bg-[var(--border-hairline)] text-[10px] font-semibold text-[var(--text-secondary)]"
                      >
                        + Semua Kls 8
                      </button>
                      <button
                        type="button"
                        onClick={() => selectAllClassesForSubject(subId, "all")}
                        className="px-2 py-0.5 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:opacity-80 text-[10px] font-semibold"
                      >
                        + Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => clearClassesForSubject(subId)}
                        className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px]"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  {/* Grid Pilihan Kelas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1">
                    {MOCK_CLASSES.map((cls) => {
                      const isClassSelected = selectedClasses.includes(cls.id);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => toggleClassForSubject(subId, cls.id)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                            isClassSelected
                              ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-[var(--color-accent)] shadow-sm"
                              : "bg-[var(--surface-card)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Kelas {cls.name}</span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] border transition-colors ${
                              isClassSelected
                                ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-on-accent)]"
                                : "border-[var(--border-hairline)]"
                            }`}
                          >
                            {isClassSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
