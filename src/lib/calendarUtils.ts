import type {
  HolidayItem,
  HolidayCategory,
  ScheduleDay,
} from "../contracts/attendance.ts";

/** Kunci penyimpanan lokal daftar hari libur kustom */
export const STORAGE_KEY_HOLIDAYS = "absensi_custom_holidays_v2";

/**
 * Daftar Hari Libur Nasional Resmi Tahun Ajaran 2026/2027 (Semester Ganjil)
 * SMP Negeri 3 Cibungbulang (Kabupaten Bogor)
 * Catatan: Pekan UTS, UAS, dan Kokurikuler TIDAK diset otomatis oleh sistem,
 * agar guru leluasa menentukan dan menyesuaikan sendiri tanggal pelaksanaannya.
 */
export const DEFAULT_HOLIDAYS: HolidayItem[] = [
  {
    id: "hld-2026-08-17",
    date: "2026-08-17",
    name: "Hari Kemerdekaan RI ke-81",
    category: "NASIONAL",
    description: "Upacara bendera & peringatan kemerdekaan nasional",
  },
  {
    id: "hld-2026-08-25",
    date: "2026-08-25",
    name: "Maulid Nabi Muhammad SAW",
    category: "NASIONAL",
    description: "Peringatan hari besar keagamaan nasional",
  },
  {
    id: "hld-2026-12-25",
    date: "2026-12-25",
    name: "Hari Raya Natal",
    category: "NASIONAL",
    description: "Libur keagamaan nasional",
  },
];

/**
 * Membersihkan cache hari libur lama (v1) yang sebelumnya memuat tanggal otomatis
 */
function cleanupLegacyHolidays(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem("absensi_custom_holidays_v1") !== null) {
      localStorage.removeItem("absensi_custom_holidays_v1");
      if (localStorage.getItem(STORAGE_KEY_HOLIDAYS) === null) {
        localStorage.setItem(STORAGE_KEY_HOLIDAYS, JSON.stringify(DEFAULT_HOLIDAYS));
      }
    }
  } catch (err) {
    console.warn("Peringatan saat membersihkan cache hari libur lama:", err);
  }
}

/**
 * Mengambil daftar hari libur dari penyimpanan lokal (dengan fallback ke default)
 */
export function getStoredHolidays(): HolidayItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_HOLIDAYS;
  }

  cleanupLegacyHolidays();

  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOLIDAYS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_HOLIDAYS, JSON.stringify(DEFAULT_HOLIDAYS));
      return DEFAULT_HOLIDAYS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_HOLIDAYS;
  } catch (err) {
    console.warn("Gagal membaca daftar hari libur lokal, menggunakan default:", err);
    return DEFAULT_HOLIDAYS;
  }
}

/**
 * Menyimpan daftar hari libur ke penyimpanan lokal
 */
export function saveStoredHolidays(holidays: HolidayItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_HOLIDAYS, JSON.stringify(holidays));
  } catch (err) {
    console.error("Gagal menyimpan daftar hari libur lokal:", err);
  }
}

/**
 * Menambahkan atau memperbarui hari libur untuk tanggal tertentu (termasuk tanggal lampau)
 */
export function addOrUpdateHoliday(
  date: string,
  name: string,
  category: HolidayCategory = "SEKOLAH",
  description?: string
): HolidayItem[] {
  const current = getStoredHolidays();
  const existingIdx = current.findIndex((h) => h.date === date);
  const newItem: HolidayItem = {
    id: existingIdx !== -1 ? current[existingIdx].id : `hld-${date}-${Date.now()}`,
    date,
    name,
    category,
    description: description?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const updated =
    existingIdx !== -1
      ? current.map((h, i) => (i === existingIdx ? newItem : h))
      : [...current, newItem];

  saveStoredHolidays(updated);
  return updated;
}

/**
 * Menghapus hari libur berdasarkan tanggal tertentu (mengembalikan jadi hari KBM aktif)
 */
export function removeHolidayByDate(date: string): HolidayItem[] {
  const current = getStoredHolidays();
  const updated = current.filter((h) => h.date !== date);
  saveStoredHolidays(updated);
  return updated;
}

/**
 * Memeriksa apakah suatu kategori merupakan hari libur murni (siswa bebas absen di rumah)
 * vs agenda kegiatan aktif (UTS, UAS, Kokurikuler tetap masuk & tetap ada absensi).
 */
export function isRealHoliday(category?: HolidayCategory): boolean {
  if (!category) return false;
  return (
    category === "NASIONAL" ||
    category === "CUTI_BERSAMA" ||
    category === "SEKOLAH" ||
    category === "KHUSUS"
  );
}

/**
 * Memeriksa apakah suatu kategori merupakan agenda kegiatan sekolah aktif
 * di mana siswa TETAP MASUK dan TETAP ADA ABSENSI (UTS, UAS, Kokurikuler/P5).
 */
export function isActiveSchoolEvent(category?: HolidayCategory): boolean {
  if (!category) return false;
  return category === "UTS" || category === "UAS" || category === "KOKURIKULER";
}

/**
 * Memeriksa apakah suatu tanggal tertentu (format YYYY-MM-DD) tercatat dalam kalender
 */
export function findHolidayByDate(
  dateStr: string,
  holidays: HolidayItem[] = DEFAULT_HOLIDAYS
): HolidayItem | null {
  return holidays.find((h) => h.date === dateStr) ?? null;
}

/**
 * Memeriksa apakah suatu tanggal merupakan hari libur murni (sekolah libur, bebas absen).
 * CATATAN PENTING: Pekan UTS, UAS, dan Kokurikuler BUKAN hari libur karena siswa tetap
 * masuk sekolah dan presensi tetap wajib diambil. Fungsi ini mengembalikan FALSE untuk UTS/UAS/P5.
 */
export function isDateHoliday(
  dateStr: string,
  holidays: HolidayItem[] = DEFAULT_HOLIDAYS
): boolean {
  const item = findHolidayByDate(dateStr, holidays);
  return Boolean(item && isRealHoliday(item.category));
}

/**
 * Memeriksa apakah suatu tanggal merupakan agenda kegiatan pekan khusus aktif (UTS, UAS, Kokurikuler)
 */
export function isDateActiveEvent(
  dateStr: string,
  holidays: HolidayItem[] = DEFAULT_HOLIDAYS
): boolean {
  const item = findHolidayByDate(dateStr, holidays);
  return Boolean(item && isActiveSchoolEvent(item.category));
}

/**
 * Mengambil agenda pekan aktif (UTS/UAS/Kokurikuler) pada tanggal tertentu jika ada
 */
export function getActiveSpecialEvent(
  dateStr: string,
  holidays: HolidayItem[] = DEFAULT_HOLIDAYS
): HolidayItem | null {
  const item = findHolidayByDate(dateStr, holidays);
  return item && isActiveSchoolEvent(item.category) ? item : null;
}

/**
 * Menghitung tanggal (YYYY-MM-DD) untuk hari tertentu dalam pekan aktif saat ini (Senin - Jumat)
 */
export function getDateForWeekday(dayName: ScheduleDay, baseDate: Date = new Date()): string {
  const currentDayIndex = baseDate.getDay(); // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
  
  // Pemetaan index hari (Senin = 1, Selasa = 2, Rabu = 3, Kamis = 4, Jumat = 5)
  const targetDayMap: Record<ScheduleDay, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
  };

  const targetDayIndex = targetDayMap[dayName] ?? 1;
  // Hitung selisih hari dari hari Senin pekan ini
  const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  
  const mondayDate = new Date(baseDate);
  mondayDate.setDate(baseDate.getDate() + mondayOffset);

  const targetDate = new Date(mondayDate);
  targetDate.setDate(mondayDate.getDate() + (targetDayIndex - 1));

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Format tanggal Indonesia ramah pengguna (misal: "Senin, 28 September 2026")
 */
export function formatIndonesianDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}

/**
 * Label human-readable untuk kategori libur & agenda kalender
 */
export function getCategoryLabel(category: HolidayCategory): string {
  switch (category) {
    case "NASIONAL":
      return "Libur Nasional / Tanggal Merah (Bebas Absen)";
    case "CUTI_BERSAMA":
      return "Cuti Bersama (Bebas Absen)";
    case "SEKOLAH":
      return "Libur Sekolah (Bebas Absen)";
    case "KHUSUS":
      return "Diliburkan Khusus Guru (Bebas Absen)";
    case "UTS":
      return "Pekan UTS / PTS (Sekolah Masuk & Tetap Ada Presensi)";
    case "UAS":
      return "Pekan UAS / PAS (Sekolah Masuk & Tetap Ada Presensi)";
    case "KOKURIKULER":
      return "Pekan Kokurikuler / Projek P5 (Sekolah Masuk & Tetap Ada Presensi)";
    default:
      return "Agenda Kalender";
  }
}

/**
 * Menambahkan atau memperbarui agenda sepekan penuh (misal: Minggu UTS, Minggu UAS, Minggu Kokurikuler)
 * untuk seluruh rentang tanggal (Senin s/d Jumat) secara otomatis dan aman.
 */
export function addOrUpdateSpecialPeriod(
  startDateStr: string,
  endDateStr: string,
  name: string,
  category: HolidayCategory,
  description?: string
): HolidayItem[] {
  const current = getStoredHolidays();
  const currentMap = new Map<string, HolidayItem>();
  current.forEach((item) => currentMap.set(item.date, item));

  const [sy, sm, sd] = startDateStr.split("-").map(Number);
  const [ey, em, ed] = endDateStr.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const loop = new Date(start);
  while (loop <= end) {
    const dayOfWeek = loop.getDay();
    // Proses hari kerja Senin (1) s/d Jumat (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const y = loop.getFullYear();
      const m = String(loop.getMonth() + 1).padStart(2, "0");
      const d = String(loop.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      currentMap.set(dateStr, {
        id: `hld-${dateStr}-${category.toLowerCase()}`,
        date: dateStr,
        name,
        category,
        description: description?.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    loop.setDate(loop.getDate() + 1);
  }

  const updated = Array.from(currentMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  saveStoredHolidays(updated);
  return updated;
}

