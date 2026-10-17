"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AppUser } from "@/contracts/academic";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  setCurrentUser as persistCurrentUser,
} from "@/lib/authStorage";

// ============================================================================
// TIPE DATA STATE KONTEKS AUTENTIKASI
// ============================================================================

export interface AuthContextType {
  currentUser: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuru: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: AppUser }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider Konteks Autentikasi Pengguna (Admin & Guru)
 * Menyimpan sesi pengguna aktif di LocalStorage dengan inisialisasi cepat dan aman
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inisialisasi sesi saat aplikasi dimuat pertama kali di peramban
  useEffect(() => {
    try {
      const activeUser = getCurrentUser();
      setCurrentUserState(activeUser);
    } catch (err) {
      console.warn("Gagal menginisialisasi sesi pengguna:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = () => {
    try {
      const activeUser = getCurrentUser();
      setCurrentUserState(activeUser);
    } catch (err) {
      console.warn("Gagal memuat ulang sesi pengguna:", err);
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: AppUser }> => {
    setIsLoading(true);
    try {
      const result = loginUser(username, password);
      if (result.success && result.user) {
        setCurrentUserState(result.user);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error || "Gagal melakukan autentikasi." };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem saat masuk.";
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setCurrentUserState(null);
  };

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.role === "ADMIN";
  const isGuru = currentUser?.role === "GURU";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated,
        isAdmin,
        isGuru,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook khusus untuk mengakses sesi autentikasi pengguna
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam cakupan AuthProvider.");
  }
  return context;
}
