import type { AppUser } from "../contracts/academic.ts";
import { DEFAULT_USERS } from "../contracts/academic.ts";

// ============================================================================
// KUNCI PENYIMPANAN SESI & PENGGUNA (LOCALSTORAGE SSOT)
// ============================================================================

export const STORAGE_KEY_CURRENT_USER = "absensi_auth_current_user_v1";
export const STORAGE_KEY_USERS = "absensi_auth_users_v1";
export const STORAGE_KEY_PASSWORDS = "absensi_auth_passwords_v1";

/**
 * Kredensial kata sandi bawaan awal sistem
 * Menggunakan username unik, bukan NIP, demi keamanan data pribadi guru (UU PDP)
 */
export const DEFAULT_PASSWORDS: Record<string, string> = {
  admin: "admin123",
  rizky: "guru123",
  "siti.rahmawati": "guru123",
  "budi.santoso": "guru123",
};

/**
 * Mengambil daftar seluruh pengguna dari penyimpanan lokal
 */
export function getStoredUsers(): AppUser[] {
  if (typeof window === "undefined") {
    return DEFAULT_USERS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_USERS;
  } catch (err) {
    console.warn("Gagal membaca daftar pengguna lokal:", err);
    return DEFAULT_USERS;
  }
}

/**
 * Mengambil kamus kata sandi dari penyimpanan lokal
 */
export function getStoredPasswords(): Record<string, string> {
  if (typeof window === "undefined") {
    return DEFAULT_PASSWORDS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PASSWORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(DEFAULT_PASSWORDS));
      return DEFAULT_PASSWORDS;
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : DEFAULT_PASSWORDS;
  } catch (err) {
    console.warn("Gagal membaca kata sandi lokal:", err);
    return DEFAULT_PASSWORDS;
  }
}

/**
 * Mengambil sesi pengguna yang sedang login aktif saat ini
 */
export function getCurrentUser(): AppUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) {
      // Jika belum ada sesi yang tersimpan sama sekali, kembalikan null untuk meminta login
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && parsed.id ? (parsed as AppUser) : null;
  } catch (err) {
    console.warn("Gagal membaca sesi pengguna aktif:", err);
    return null;
  }
}

/**
 * Menyimpan sesi pengguna aktif ke penyimpanan lokal
 */
export function setCurrentUser(user: AppUser | null): void {
  if (typeof window === "undefined") return;

  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (err) {
    console.warn("Gagal memperbarui sesi pengguna aktif:", err);
  }
}

/**
 * Melakukan proses autentikasi login berbasis Username dan Password
 */
export function loginUser(
  username: string,
  password: string
): { success: boolean; user?: AppUser; error?: string } {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanUsername) {
    return { success: false, error: "Username wajib diisi." };
  }
  if (!cleanPassword) {
    return { success: false, error: "Kata sandi wajib diisi." };
  }

  const users = getStoredUsers();
  const passwords = getStoredPasswords();

  const user = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!user) {
    return { success: false, error: "Username tidak ditemukan." };
  }

  if (!user.isActive) {
    return { success: false, error: "Akun ini telah dinonaktifkan oleh Administrator." };
  }

  const expectedPassword = passwords[user.username.toLowerCase()] || "guru123";

  if (cleanPassword !== expectedPassword) {
    return { success: false, error: "Kata sandi yang Anda masukkan salah." };
  }

  // Perbarui waktu login terakhir
  const updatedUser: AppUser = {
    ...user,
    lastLoginAt: new Date().toISOString(),
  };

  // Simpan ke daftar pengguna
  const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn("Gagal menyimpan update waktu login pengguna:", e);
    }
  }

  setCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

/**
 * Melakukan proses keluar (logout) dan menghapus sesi aktif
 */
export function logoutUser(): void {
  setCurrentUser(null);
}

/**
 * Mengubah kata sandi pengguna secara mandiri
 */
export function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const passwords = getStoredPasswords();

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: "Pengguna tidak ditemukan." };
  }

  const cleanOld = oldPassword.trim();
  const cleanNew = newPassword.trim();

  const currentPass = passwords[user.username.toLowerCase()] || "guru123";
  if (cleanOld !== currentPass) {
    return { success: false, error: "Kata sandi lama tidak sesuai." };
  }

  if (cleanNew.length < 6) {
    return { success: false, error: "Kata sandi baru minimal 6 karakter." };
  }

  passwords[user.username.toLowerCase()] = cleanNew;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(passwords));
    } catch (err) {
      return { success: false, error: "Gagal menyimpan kata sandi baru ke penyimpanan lokal." };
    }
  }

  return { success: true };
}

/**
 * Mereset kata sandi pengguna oleh Administrator
 */
export function resetUserPasswordByAdmin(
  targetUsername: string,
  newPassword = "guru123"
): { success: boolean; error?: string } {
  const passwords = getStoredPasswords();
  const cleanUser = targetUsername.trim().toLowerCase();

  passwords[cleanUser] = newPassword;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(passwords));
    } catch (err) {
      return { success: false, error: "Gagal menyimpan kata sandi reset ke penyimpanan lokal." };
    }
  }

  return { success: true };
}

/**
 * Memperbarui profil pengguna (Nama, NIP, Tanda Tangan, dll.)
 */
export function updateUserProfile(
  userId: string,
  updates: Partial<Omit<AppUser, "id" | "username" | "role">>
): { success: boolean; user?: AppUser; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return { success: false, error: "Pengguna tidak ditemukan." };
  }

  const updated: AppUser = {
    ...users[index],
    ...updates,
  };

  users[index] = updated;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      const current = getCurrentUser();
      if (current && current.id === userId) {
        setCurrentUser(updated);
      }
    } catch (e) {
      return { success: false, error: "Gagal memperbarui profil di penyimpanan lokal." };
    }
  }

  return { success: true, user: updated };
}

/**
 * Membuat akun guru baru oleh Administrator
 */
export function createUserByAdmin(userData: {
  username: string;
  fullName: string;
  nip?: string;
  email?: string;
  role?: "ADMIN" | "GURU";
  initialPassword?: string;
}): { success: boolean; user?: AppUser; error?: string } {
  const cleanUsername = userData.username.trim().toLowerCase();
  const cleanFullName = userData.fullName.trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: "Username minimal 3 karakter." };
  }
  if (!cleanFullName) {
    return { success: false, error: "Nama lengkap guru wajib diisi." };
  }

  const users = getStoredUsers();
  if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return { success: false, error: `Username @${cleanUsername} sudah digunakan.` };
  }

  const newUser: AppUser = {
    id: `user-${Date.now()}`,
    username: cleanUsername,
    fullName: cleanFullName,
    nip: userData.nip?.trim() || null,
    email: userData.email?.trim() || null,
    role: userData.role || "GURU",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  const passwords = getStoredPasswords();
  passwords[cleanUsername] = userData.initialPassword?.trim() || "guru123";

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
      localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(passwords));
    } catch (e) {
      return { success: false, error: "Gagal menyimpan akun guru baru ke penyimpanan lokal." };
    }
  }

  return { success: true, user: newUser };
}

/**
 * Mengubah status aktif/nonaktif akun guru oleh Administrator
 */
export function toggleUserActiveByAdmin(userId: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, error: "Pengguna tidak ditemukan." };
  }

  // Lindungi akun admin utama agar tidak bisa dinonaktifkan sendiri
  if (users[index].username === "admin") {
    return { success: false, error: "Akun Super Administrator utama tidak dapat dinonaktifkan." };
  }

  users[index].isActive = !users[index].isActive;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      return { success: false, error: "Gagal memperbarui status keaktifan akun." };
    }
  }

  return { success: true };
}

