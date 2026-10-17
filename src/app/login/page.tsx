"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser, isAuthenticated, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Jika sudah memiliki sesi login aktif, alihkan ke halaman utama
  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      if (currentUser.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await login(username, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal masuk. Periksa kembali username dan kata sandi Anda.");
      return;
    }

    // Arahkan ke rute yang sesuai
    if (username.trim().toLowerCase() === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/");
    }
  };

  // Pintasan login cepat untuk kemudahan pengujian
  const handleQuickLogin = (demoUser: "rizky" | "admin") => {
    if (demoUser === "rizky") {
      setUsername("rizky");
      setPassword("guru123");
      setErrorMessage(null);
    } else {
      setUsername("admin");
      setPassword("admin123");
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Latar Belakang Dekoratif Apple HIG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[var(--color-accent)]/20 blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[#3B82F6]/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md mx-auto z-10">
        {/* Kartu Formulir Masuk */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-hairline)] rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-xl transition-all">
          {/* Header Identitas Sekolah */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)] text-[var(--color-on-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20 mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Sistem Presensi & Nilai</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
              SMP Negeri 3 Cibungbulang · Kab. Bogor
            </p>
          </div>

          {/* Banner Pesan Error */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
              <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                !
              </div>
              <p className="flex-1 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Form Input Masuk */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: rizky atau admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-[var(--surface-recessed)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[var(--color-accent)] hover:opacity-90 active:scale-[0.98] text-[var(--color-on-accent)] text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent)]/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Memeriksa Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pembatas / Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-hairline)]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">
              <span className="bg-[var(--surface-card)] px-2">Akses Cepat Pengujian</span>
            </div>
          </div>

          {/* Pintasan Masuk Cepat (Demo Mode Chips) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("rizky")}
              className="w-full p-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-recessed)] hover:border-[var(--color-accent)] text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center font-bold text-xs">
                  👨‍🏫
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                    Masuk sebagai Guru (Pak Rizky)
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] font-mono">user: rizky · pass: guru123</p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              className="w-full p-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-recessed)] hover:border-blue-500 text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-xs">
                  🛡️
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">
                    Masuk sebagai Administrator
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] font-mono">user: admin · pass: admin123</p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* Footer Kebijakan Keamanan */}
          <div className="mt-6 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Sesi aman terenkripsi lokal & tersinkronisasi cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
}
