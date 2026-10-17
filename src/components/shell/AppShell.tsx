"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  BookOpen,
  CheckCircle2,
  Award,
  User,
  Shield,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import {
  recoverFromIndexedDBIfLocalStorageEmpty,
  triggerAutoSnapshot,
  STORAGE_KEY_LAST_BACKUP_TIME,
} from "@/lib/backupManager";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Menu Navigasi Guru: Hari Ini, Kelas, Nilai, Rekap, Profil (Pengaturan disembunyikan total) */
const GURU_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Hari Ini", icon: Calendar },
  { href: "/classes", label: "Kelas", icon: Users },
  { href: "/grades", label: "Nilai", icon: Award },
  { href: "/reports", label: "Rekap", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
];

/** Menu Navigasi Admin: Dasbor Eksekutif, Hari Ini, Kelas, Nilai, Rekap, Pengaturan */
const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Hari Ini", icon: Calendar },
  { href: "/classes", label: "Kelas", icon: Users },
  { href: "/grades", label: "Nilai", icon: Award },
  { href: "/reports", label: "Rekap", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

/**
 * AppShell: Kerangka aplikasi utama (SOP §3.3 & §7.2)
 * Terintegrasi dengan RBAC Multi-User (Peran Guru vs Administrator)
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading, isAuthenticated, isAdmin, isGuru, logout } = useAuth();

  // 1. Jika rute adalah halaman login, jangan tampilkan AppShell (render halaman penuh)
  const isLoginPage = pathname === "/login";

  // 2. Proteksi Rute (Route Guarding)
  useEffect(() => {
    if (isLoading) return;

    // Jika pengguna belum login dan mencoba membuka halaman aplikasi, arahkan ke /login
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/login");
      return;
    }

    // Jika Guru mencoba membuka halaman /settings atau /admin, tolak dan kembalikan ke /
    if (isGuru && (pathname === "/settings" || pathname.startsWith("/admin"))) {
      alert("Akses Terbatas: Menu Pengaturan hanya dapat diakses oleh Administrator.");
      router.replace("/");
    }
  }, [isAuthenticated, isGuru, isLoading, isLoginPage, pathname, router]);

  // 3. Mesin Cadangan Otomatis Latar Belakang & Pemulihan Darurat
  useEffect(() => {
    if (isLoginPage) return;

    recoverFromIndexedDBIfLocalStorageEmpty().then((recovered) => {
      if (recovered) {
        console.log("Data darurat dipulihkan otomatis dari IndexedDB");
      }
    });

    const lastBackup = localStorage.getItem(STORAGE_KEY_LAST_BACKUP_TIME);
    const oneHourAgo = Date.now() - 3600 * 1000;
    if (!lastBackup || new Date(lastBackup).getTime() < oneHourAgo) {
      triggerAutoSnapshot("Snapshot Berkala Sesi Baru");
    }

    const interval = setInterval(() => {
      triggerAutoSnapshot("Snapshot Otomatis 15 Menit");
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoginPage]);

  // Jika di halaman login, langsung render halaman login tanpa shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Jika sedang memverifikasi sesi dan belum autentikasi, tampilkan pemuat layar Apple HIG
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)]">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)] text-[var(--color-on-accent)] flex items-center justify-center animate-pulse mb-3 shadow-lg shadow-[var(--color-accent)]/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
          Memverifikasi Sesi Akun...
        </p>
      </div>
    );
  }

  // Pilih daftar menu navigasi berdasarkan peran pengguna
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : GURU_NAV_ITEMS;

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      logout();
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Sidebar Navigasi Desktop (Tampil pada layar md ke atas) */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--surface-card)] border-r border-[var(--border-hairline)] p-4 shrink-0">
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-[var(--border-hairline)]">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--color-accent)] text-[var(--color-on-accent)] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Absensi Kelas</h1>
            <p className="text-xs text-[var(--text-secondary)]">Buku Presensi Digital</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--surface-recessed)] text-[var(--color-accent)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-recessed)]"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--text-secondary)]"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Profil Akun Pengguna & Tombol Keluar (Logout) */}
        <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
          <div className="flex items-center justify-between text-xs px-2 text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-hadir-fg)]" />
              Sesi Aktif
            </span>
            <span className="font-medium text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-recessed)] text-[var(--color-accent)] font-mono">
              {currentUser?.role === "ADMIN" ? "ADMINISTRATOR" : "GURU MAPEL"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-[var(--surface-recessed)] rounded-xl border border-[var(--border-hairline)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  currentUser?.role === "ADMIN"
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                }`}
              >
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate text-xs">
                <p className="font-semibold truncate text-[var(--text-primary)] leading-tight">
                  {currentUser?.fullName}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">
                  @{currentUser?.username}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari sistem"
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Kontainer Konten Utama: Responsif & Lega untuk Tabel & Rekapitulasi Data */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-20 md:pb-6">
        <div className="w-full max-w-full mx-auto md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1560px] p-4 md:p-6 flex-1 flex flex-col transition-all">
          {children}
        </div>
      </main>

      {/* Bilah Tab Bawah Mobile (Tampil pada layar di bawah md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-page)]/90 backdrop-blur-md border-t border-[var(--border-hairline)] px-2 py-1 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-[10px] text-[11px] transition-all ${
                isActive
                  ? "text-[var(--color-accent)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? "bg-[var(--surface-recessed)]" : ""
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--text-secondary)]"
                  }`}
                />
              </div>
              <span className="mt-0.5 text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Tombol Logout Mobile */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-[10px] text-[11px] text-[var(--text-secondary)] hover:text-red-500 transition-all"
        >
          <div className="p-1 rounded-full">
            <LogOut className="w-5 h-5 text-[var(--text-secondary)] hover:text-red-500" />
          </div>
          <span className="mt-0.5 text-[10px] leading-tight">Keluar</span>
        </button>
      </nav>
    </div>
  );
}
