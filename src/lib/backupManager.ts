import type {
  AttendanceSession,
  AttendanceRecord,
  HolidayItem,
  Student,
} from "../contracts/attendance.ts";
import type {
  AssessmentItem,
  StudentScoreRecord,
} from "../contracts/grades.ts";
import { DEFAULT_KKM } from "../contracts/grades.ts";
import {
  STORAGE_KEY_SESSIONS,
  STORAGE_KEY_RECORDS,
  getSavedSessions,
  getSavedRecords,
} from "./attendanceStorage.ts";
import {
  STORAGE_KEY_ASSESSMENTS,
  STORAGE_KEY_SCORES,
  STORAGE_KEY_KKM,
  getStoredAssessments,
  getStoredScores,
  getStoredKKM,
} from "./gradeStorage.ts";
import {
  STORAGE_KEY_HOLIDAYS,
  getStoredHolidays,
  saveStoredHolidays,
} from "./calendarUtils.ts";

export const STORAGE_KEY_AUTO_SNAPSHOTS = "absensi_auto_snapshots_v1";
export const STORAGE_KEY_CUSTOM_STUDENTS = "absensi_custom_students_v1";
export const STORAGE_KEY_LAST_BACKUP_TIME = "absensi_last_backup_timestamp_v1";

const IDB_DATABASE_NAME = "absensi_vault_db_v1";
const IDB_STORE_NAME = "vault_store";

/**
 * Struktur Payload Berkas Cadangan Komprehensif (SSOT & Disaster Recovery)
 */
export interface AppBackupPayload {
  version: 2;
  app: "Buku Presensi Digital SMPN 3 Cibungbulang";
  exportedAt: string;
  checksum: string;
  stats: {
    totalSessions: number;
    totalRecords: number;
    totalAssessments: number;
    totalScores: number;
    totalHolidays: number;
  };
  data: {
    sessions: AttendanceSession[];
    records: AttendanceRecord[];
    assessments: AssessmentItem[];
    scores: StudentScoreRecord[];
    holidays: HolidayItem[];
    kkm: number;
    customStudents?: Record<string, Student[]>;
  };
}

/**
 * Struktur Riwayat Snapshot Otomatis Lokal
 */
export interface AutoSnapshotItem {
  id: string;
  timestamp: string;
  trigger: string;
  payload: AppBackupPayload;
}

// ============================================================================
// 1. UTILITAS KONTROL CHECKSUM & INTEGRITAS DATA
// ============================================================================

/**
 * Menghitung checksum sederhana untuk memverifikasi keutuhan payload data
 */
function calculateSimpleChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Ubah ke integer 32-bit
  }
  return `chk-${Math.abs(hash).toString(16)}`;
}

/**
 * Mengambil data siswa kustom yang tersimpan di localStorage jika ada
 */
export function getStoredCustomStudents(): Record<string, Student[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_STUDENTS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Gagal membaca siswa kustom lokal:", err);
    return {};
  }
}

/**
 * Menyimpan data siswa kustom ke localStorage
 */
export function saveStoredCustomStudents(customMap: Record<string, Student[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_STUDENTS, JSON.stringify(customMap));
  } catch (err) {
    console.error("Gagal menyimpan siswa kustom lokal:", err);
  }
}

// ============================================================================
// 2. PEMBUATAN PAYLOAD CADANGAN LENGKAP
// ============================================================================

/**
 * Membangun paket payload cadangan lengkap dari seluruh repositori lokal
 */
export function createFullBackupPayload(): AppBackupPayload {
  const sessions = getSavedSessions();
  const records = getSavedRecords();
  const assessments = getStoredAssessments();
  const scores = getStoredScores();
  const holidays = getStoredHolidays();
  const kkm = getStoredKKM();
  const customStudents = getStoredCustomStudents();

  const dataPayload = {
    sessions,
    records,
    assessments,
    scores,
    holidays,
    kkm,
    customStudents,
  };

  const contentStr = JSON.stringify(dataPayload);
  const checksum = calculateSimpleChecksum(contentStr);

  return {
    version: 2,
    app: "Buku Presensi Digital SMPN 3 Cibungbulang",
    exportedAt: new Date().toISOString(),
    checksum,
    stats: {
      totalSessions: sessions.length,
      totalRecords: records.length,
      totalAssessments: assessments.length,
      totalScores: scores.length,
      totalHolidays: holidays.length,
    },
    data: dataPayload,
  };
}

// ============================================================================
// 3. MESIN SNAPSHOT OTOMATIS BERKALA (ROLLING AUTO-SNAPSHOTS)
// ============================================================================

const MAX_ROLLING_SNAPSHOTS = 10;

/**
 * Mengambil seluruh riwayat snapshot otomatis dari localStorage
 */
export function getAutoSnapshots(): AutoSnapshotItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTO_SNAPSHOTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Gagal membaca riwayat snapshot otomatis:", err);
    return [];
  }
}

/**
 * Menyimpan satu snapshot baru ke dalam riwayat lokal (maksimal 10 item terbaru)
 */
export function triggerAutoSnapshot(triggerLabel: string = "Perubahan Sistem"): AutoSnapshotItem | null {
  if (typeof window === "undefined") return null;

  try {
    const payload = createFullBackupPayload();
    const newSnapshot: AutoSnapshotItem = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      trigger: triggerLabel,
      payload,
    };

    const existing = getAutoSnapshots();
    // Tambahkan snapshot baru di depan, batasi maksimal 10 item
    const updated = [newSnapshot, ...existing.filter((s) => s.id !== newSnapshot.id)].slice(
      0,
      MAX_ROLLING_SNAPSHOTS
    );

    localStorage.setItem(STORAGE_KEY_AUTO_SNAPSHOTS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_LAST_BACKUP_TIME, newSnapshot.timestamp);

    // Salin ganda (dual-write) ke IndexedDB untuk proteksi level browser storage
    mirrorToIndexedDB(payload);

    // Siarkan event keberhasilan snapshot agar syncManager dapat melakukan sinkronisasi cloud di latar belakang
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("absensi-snapshot-saved", {
          detail: { id: newSnapshot.id, timestamp: newSnapshot.timestamp },
        })
      );
    }

    return newSnapshot;
  } catch (err) {
    console.error("Gagal membuat snapshot otomatis:", err);
    return null;
  }
}

// Inisialisasi pendengar event otomatis di sisi browser
if (typeof window !== "undefined") {
  window.addEventListener("absensi-data-changed", (event: any) => {
    // Abaikan jika data baru saja ditarik dari cloud untuk mencegah redundansi
    if (event?.detail?.source === "cloud-pull") return;
    const reason = event?.detail?.reason || "Pembaruan Data Otomatis";
    triggerAutoSnapshot(reason);
  });
}

// ============================================================================
// 4. DUAL-WRITE KE INDEXEDDB (REDUNDANSI LEVEL BROWSER DATABASE)
// ============================================================================

/**
 * Membuka koneksi native IndexedDB
 */
function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB tidak didukung oleh browser"));
      return;
    }

    const request = indexedDB.open(IDB_DATABASE_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Menyimpan replika cadangan mutakhir ke IndexedDB
 */
export async function mirrorToIndexedDB(payload: AppBackupPayload): Promise<void> {
  // Abaikan secara senyap jika peramban/lingkungan tidak mendukung IndexedDB (misal: SSR atau CLI test)
  if (typeof window === "undefined" || !window.indexedDB) return;

  try {
    const db = await openVaultDB();
    const tx = db.transaction(IDB_STORE_NAME, "readwrite");
    const store = tx.objectStore(IDB_STORE_NAME);

    store.put({
      key: "latest_snapshot",
      savedAt: new Date().toISOString(),
      payload,
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Kegagalan IndexedDB tidak boleh menghentikan alur operasional utama LocalStorage
    console.warn("Gagal menyinkronkan replika cadangan ke IndexedDB:", err);
  }
}

/**
 * Memulihkan data dari IndexedDB jika LocalStorage kosong atau terhapus tidak sengaja
 */
export async function recoverFromIndexedDBIfLocalStorageEmpty(): Promise<boolean> {
  if (typeof window === "undefined" || !window.indexedDB) return false;

  try {
    const hasSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
    const hasRecords = localStorage.getItem(STORAGE_KEY_RECORDS);

    // Jika LocalStorage masih utuh, tidak perlu pemulihan darurat
    if (hasSessions && hasRecords) return false;

    const db = await openVaultDB();
    const tx = db.transaction(IDB_STORE_NAME, "readonly");
    const store = tx.objectStore(IDB_STORE_NAME);
    const req = store.get("latest_snapshot");

    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result && req.result.payload) {
          console.log("Menemukan cadangan darurat di IndexedDB! Memulihkan ke LocalStorage...");
          applyBackupPayloadToLocalStorage(req.result.payload);
          resolve(true);
        } else {
          resolve(false);
        }
      };
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn("Gagal memeriksa pemulihan IndexedDB:", err);
    return false;
  }
}

// ============================================================================
// 5. RESTORE & APLIKASI PAYLOAD KE LOCALSTORAGE
// ============================================================================

/**
 * Menerapkan isi payload cadangan ke seluruh kunci LocalStorage
 */
export function applyBackupPayloadToLocalStorage(payload: AppBackupPayload): void {
  if (typeof window === "undefined") return;

  const { data } = payload;

  if (Array.isArray(data.sessions)) {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(data.sessions));
  }

  if (Array.isArray(data.records)) {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(data.records));
  }

  if (Array.isArray(data.assessments)) {
    localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(data.assessments));
  }

  if (Array.isArray(data.scores)) {
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(data.scores));
  }

  if (Array.isArray(data.holidays)) {
    localStorage.setItem(STORAGE_KEY_HOLIDAYS, JSON.stringify(data.holidays));
  }

  if (typeof data.kkm === "number") {
    localStorage.setItem(STORAGE_KEY_KKM, String(data.kkm));
  }

  if (data.customStudents && typeof data.customStudents === "object") {
    localStorage.setItem(STORAGE_KEY_CUSTOM_STUDENTS, JSON.stringify(data.customStudents));
  }

  // Perbarui juga replika IndexedDB
  mirrorToIndexedDB(payload);
}

/**
 * Memulihkan sistem ke snapshot riwayat tertentu
 */
export function restoreFromSnapshot(snapshotId: string): boolean {
  try {
    const snapshots = getAutoSnapshots();
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target) return false;

    // Ambil safety snapshot sebelum memulihkan
    triggerAutoSnapshot("Sebelum Pemulihan Snapshot");

    applyBackupPayloadToLocalStorage(target.payload);
    return true;
  } catch (err) {
    console.error("Gagal memulihkan snapshot:", err);
    return false;
  }
}

/**
 * Menghapus satu item snapshot dari riwayat
 */
export function deleteSnapshot(snapshotId: string): void {
  if (typeof window === "undefined") return;
  try {
    const snapshots = getAutoSnapshots();
    const updated = snapshots.filter((s) => s.id !== snapshotId);
    localStorage.setItem(STORAGE_KEY_AUTO_SNAPSHOTS, JSON.stringify(updated));
  } catch (err) {
    console.error("Gagal menghapus snapshot:", err);
  }
}

// ============================================================================
// 6. EKSPOR FILE .JSON DAN IMPOR / PEMULIHAN BERKAS
// ============================================================================

/**
 * Mengunduh berkas cadangan komprehensif dalam format JSON ke perangkat pengguna
 */
export function downloadBackupFile(): { filename: string; sizeBytes: number } {
  const payload = createFullBackupPayload();
  const jsonStr = JSON.stringify(payload, null, 2);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateTag = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
    now.getHours()
  )}-${pad(now.getMinutes())}`;

  const filename = `Backup_Buku_Presensi_SMPN3Cibungbulang_${dateTag}.json`;

  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Rekam waktu cadangan terakhir
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_LAST_BACKUP_TIME, new Date().toISOString());
  }

  return {
    filename,
    sizeBytes: blob.size,
  };
}

/**
 * Memvalidasi dan memulihkan data dari teks JSON yang diunggah oleh guru
 */
export function restoreFromUploadedJson(jsonText: string): {
  success: boolean;
  message: string;
  stats?: AppBackupPayload["stats"];
} {
  try {
    const parsed = JSON.parse(jsonText);

    // Validasi skema dasar berkas cadangan
    if (!parsed || typeof parsed !== "object") {
      return { success: false, message: "Format berkas tidak valid (bukan objek JSON)." };
    }

    if (parsed.version !== 2 && parsed.version !== 1) {
      return { success: false, message: "Versi berkas cadangan tidak kompatibel." };
    }

    if (!parsed.data || typeof parsed.data !== "object") {
      return { success: false, message: "Berkas tidak memuat payload data yang valid." };
    }

    // Ambil safety snapshot dari kondisi saat ini sebelum ditimpa
    triggerAutoSnapshot("Sebelum Pemulihan Berkas Eksternal");

    // Terapkan data ke LocalStorage & IndexedDB
    applyBackupPayloadToLocalStorage(parsed as AppBackupPayload);

    return {
      success: true,
      message: "Data berhasil dipulihkan secara utuh.",
      stats: parsed.stats,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal memproses berkas: ${err?.message || "Format JSON rusak"}`,
    };
  }
}

// ============================================================================
// 7. STATISTIK KESEHATAN DAN INTEGRITAS DATA
// ============================================================================

export interface DataIntegrityStats {
  totalSessions: number;
  totalRecords: number;
  totalAssessments: number;
  totalScores: number;
  totalHolidays: number;
  lastBackupTimestamp: string | null;
  totalSnapshots: number;
  isIndexedDbSupported: boolean;
}

/**
 * Mengambil ringkasan kesehatan integritas data untuk ditampilkan di Pengaturan
 */
export function getDataIntegrityStats(): DataIntegrityStats {
  const sessions = getSavedSessions();
  const records = getSavedRecords();
  const assessments = getStoredAssessments();
  const scores = getStoredScores();
  const holidays = getStoredHolidays();
  const snapshots = getAutoSnapshots();

  const lastBackup =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEY_LAST_BACKUP_TIME)
      : null;

  return {
    totalSessions: sessions.length,
    totalRecords: records.length,
    totalAssessments: assessments.length,
    totalScores: scores.length,
    totalHolidays: holidays.length,
    lastBackupTimestamp: lastBackup,
    totalSnapshots: snapshots.length,
    isIndexedDbSupported: typeof window !== "undefined" && "indexedDB" in window,
  };
}
