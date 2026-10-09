import type {
  HolidayItem,
  HolidayCategory,
  ScheduleDay,
} from "../contracts/attendance.ts";

/** Kunci penyimpanan lokal daftar hari libur kustom */
export const STORAGE_KEY_HOLIDAYS = "absensi_custom_holidays_v1";

/**
 * Daftar Hari Libur Default Tahun Ajaran 2026/2027 (Semester Ganjil)
 * SMP Negeri 3 Cibungbulang (Kabupaten Bogor)
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
  // Minggu Penilaian Tengah Semester (UTS / PTS Ganjil)
  {
    id: "hld-2026-09-21",
    date: "2026-09-21",
    name: "Minggu Penilaian Tengah Semester (UTS / PTS)",
    category: "UTS",
    description: "Pekan pelaksanaan tes sumatif tengah semester ganjil",
  },
  {
    id: "hld-2026-09-22",
    date: "2026-09-22",
    name: "Minggu Penilaian Tengah Semester (UTS / PTS)",
    category: "UTS",
    description: "Pekan pelaksanaan tes sumatif tengah semester ganjil",
  },
  {
    id: "hld-2026-09-23",
    date: "2026-09-23",
    name: "Minggu Penilaian Tengah Semester (UTS / PTS)",
    category: "UTS",
    description: "Pekan pelaksanaan tes sumatif tengah semester ganjil",
  },
  {
    id: "hld-2026-09-24",
    date: "2026-09-24",
    name: "Minggu Penilaian Tengah Semester (UTS / PTS)",
    category: "UTS",
    description: "Pekan pelaksanaan tes sumatif tengah semester ganjil",
  },
  {
    id: "hld-2026-09-25",
    date: "2026-09-25",
    name: "Minggu Penilaian Tengah Semester (UTS / PTS)",
    category: "UTS",
    description: "Pekan pelaksanaan tes sumatif tengah semester ganjil",
  },
  {
    id: "hld-2026-10-01",
    date: "2026-10-01",
    name: "Hari Kesaktian Pancasila",
    category: "SEKOLAH",
    description: "Peringatan nasional & apel pagi sekolah",
  },
  // Minggu Kokurikuler / P5 (Projek Penguatan Profil Pelajar Pancasila)
  {
    id: "hld-2026-10-12",
    date: "2026-10-12",
    name: "Minggu Kokurikuler / Projek P5",
    category: "KOKURIKULER",
    description: "Kegiatan kokurikuler blok proyek bertema Kearifan Lokal & Rekayasa Teknologi",
  },
  {
    id: "hld-2026-10-13",
    date: "2026-10-13",
    name: "Minggu Kokurikuler / Projek P5",
    category: "KOKURIKULER",
    description: "Kegiatan kokurikuler blok proyek bertema Kearifan Lokal & Rekayasa Teknologi",
  },
  {
    id: "hld-2026-10-14",
    date: "2026-10-14",
    name: "Minggu Kokurikuler / Projek P5",
    category: "KOKURIKULER",
    description: "Kegiatan kokurikuler blok proyek bertema Kearifan Lokal & Rekayasa Teknologi",
  },
  {
    id: "hld-2026-10-15",
    date: "2026-10-15",
    name: "Minggu Kokurikuler / Projek P5",
    category: "KOKURIKULER",
    description: "Kegiatan kokurikuler blok proyek bertema Kearifan Lokal & Rekayasa Teknologi",
  },
  {
    id: "hld-2026-10-16",
    date: "2026-10-16",
    name: "Minggu Kokurikuler / Projek P5",
    category: "KOKURIKULER",
    description: "Kegiatan kokurikuler blok proyek bertema Kearifan Lokal & Rekayasa Teknologi",
  },
  {
    id: "hld-2026-11-25",
    date: "2026-11-25",
    name: "Hari Guru Nasional (HGN)",
    category: "SEKOLAH",
    description: "Peringatan hari guru & apresiasi pendidik",
  },
  // Minggu Penilaian Akhir Semester (UAS / PAS / SAS Ganjil)
  {
    id: "hld-2026-11-30",
    date: "2026-11-30",
    name: "Minggu Penilaian Akhir Semester (UAS / PAS)",
    category: "UAS",
    description: "Pekan pelaksanaan asesmen sumatif akhir semester (PAS) ganjil",
  },
  {
    id: "hld-2026-12-01",
    date: "2026-12-01",
    name: "Minggu Penilaian Akhir Semester (UAS / PAS)",
    category: "UAS",
    description: "Pekan pelaksanaan asesmen sumatif akhir semester (PAS) ganjil",
  },
  {
    id: "hld-2026-12-02",
    date: "2026-12-02",
    name: "Minggu Penilaian Akhir Semester (UAS / PAS)",
    category: "UAS",
    description: "Pekan pelaksanaan asesmen sumatif akhir semester (PAS) ganjil",
  },
  {
    id: "hld-2026-12-03",
    date: "2026-12-03",
    name: "Minggu Penilaian Akhir Semester (UAS / PAS)",
    category: "UAS",
    description: "Pekan pelaksanaan asesmen sumatif akhir semester (PAS) ganjil",
  },
  {
    id: "hld-2026-12-04",
    date: "2026-12-04",
    name: "Minggu Penilaian Akhir Semester (UAS / PAS)",
    category: "UAS",
    description: "Pekan pelaksanaan asesmen sumatif akhir semester (PAS) ganjil",
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
 * Mengambil daftar hari libur dari penyimpanan lokal (dengan fallback ke default)
 */
export function getStoredHolidays(): HolidayItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_HOLIDAYS;
  }

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
 * Memeriksa apakah suatu tanggal tertentu (format YYYY-MM-DD) merupakan hari libur
 */
export function findHolidayByDate(
  dateStr: string,
  holidays: HolidayItem[] = DEFAULT_HOLIDAYS
): HolidayItem | null {
  return holidays.find((h) => h.date === dateStr) ?? null;
}

/**
 * Memeriksa apakah suatu tanggal merupakan hari libur (boolean)
 */
export function isDateHoliday(
  dateStr: string,
  holidays: HolidayItem[] = DEFAULT_HOLIDAYS
): boolean {
  return Boolean(findHolidayByDate(dateStr, holidays));
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
      return "Libur Nasional / Tanggal Merah";
    case "CUTI_BERSAMA":
      return "Cuti Bersama";
    case "SEKOLAH":
      return "Libur / Kegiatan Sekolah";
    case "KHUSUS":
      return "Diliburkan Khusus Guru";
    case "UTS":
      return "Pekan / Minggu Penilaian Tengah Semester (UTS/PTS)";
    case "UAS":
      return "Pekan / Minggu Penilaian Akhir Semester (UAS/PAS)";
    case "KOKURIKULER":
      return "Pekan / Kegiatan Kokurikuler & P5";
    default:
      return "Hari Libur / Agenda";
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

