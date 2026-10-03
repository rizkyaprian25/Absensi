"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, BarChart3, Settings, BookOpen, CheckCircle2 } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Hari Ini", icon: Calendar },
  { href: "/classes", label: "Kelas", icon: Users },
  { href: "/reports", label: "Rekap", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

/**
 * AppShell: Kerangka aplikasi utama (SOP §3.3 & §7.2)
 * - Mobile: Tampilan buku register dengan bilah tab navigasi bawah (touch target >= 44px)
 * - Desktop: Sidebar vertikal dengan area konten terpusat (max-w-4xl)
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
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
                <Icon className={`w-5 h-5 ${isActive ? "text-[var(--color-accent)]" : "text-[var(--text-secondary)]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status Sinkronisasi & Profil Guru di Sidebar */}
        <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
          <div className="flex items-center justify-between text-xs px-2 text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-hadir-fg)]" />
              Sinkronisasi
            </span>
            <span className="font-medium text-[var(--status-hadir-fg)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersimpan
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-2 py-2 bg-[var(--surface-recessed)] rounded-[10px]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-[var(--color-on-accent)] flex items-center justify-center font-bold text-xs shrink-0">
              M
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold truncate text-[var(--text-primary)]">Muhamad Rizky Aprian, S.Kom</p>
              <p className="text-[var(--text-secondary)] truncate">Guru Informatika · SMPN 3 Cibungbulang</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Kontainer Konten Utama */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-20 md:pb-6">
        <div className="w-full max-w-md mx-auto md:max-w-4xl p-4 md:p-6 flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Bilah Tab Bawah Mobile (Tampil pada layar di bawah md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-page)]/90 backdrop-blur-md border-t border-[var(--border-hairline)] px-2 py-1 flex justify-around items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 rounded-[10px] text-[11px] transition-all ${
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
                <Icon className={`w-5 h-5 ${isActive ? "text-[var(--color-accent)]" : "text-[var(--text-secondary)]"}`} />
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
