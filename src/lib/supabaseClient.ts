import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Membersihkan URL Supabase dari kemungkinan akhiran path seperti '/rest/v1/'
 */
function sanitizeSupabaseUrl(url: string | undefined): string {
  if (!url) return "";
  let clean = url.trim();
  // Hilangkan trailing slash
  clean = clean.replace(/\/+$/, "");
  // Hilangkan suffix /rest/v1 jika tertera
  clean = clean.replace(/\/rest\/v1$/, "");
  return clean;
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
export const supabaseAnonKey = rawAnonKey.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    supabaseAnonKey.length > 20
);

/**
 * Klien Tunggal Supabase (Singleton Client)
 * Bernilai null jika variabel environment belum dikonfigurasi.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseHealthStatus {
  isConfigured: boolean;
  connected: boolean;
  tableReady: boolean;
  message: string;
  projectUrl?: string;
  classesCount?: number;
  error?: string;
}

/**
 * Memeriksa status koneksi jaringan dan kesiapan skema tabel Supabase
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      connected: false,
      tableReady: false,
      message: "Kredensial Supabase (URL / Anon Key) belum diatur di .env.local",
    };
  }

  try {
    // Uji ketersediaan tabel 'classes'
    const { data, error, count } = await supabase
      .from("classes")
      .select("id", { count: "exact", head: false })
      .limit(1);

    if (error) {
      const msg = error.message.toLowerCase();
      // Kode error PostgreSQL 42P01 atau schema cache PostgREST menandakan tabel belum dibuat di database
      if (
        error.code === "42P01" ||
        msg.includes("relation") ||
        msg.includes("does not exist") ||
        msg.includes("could not find the table") ||
        msg.includes("schema cache")
      ) {
        return {
          isConfigured: true,
          connected: true,
          tableReady: false,
          projectUrl: supabaseUrl,
          message: "Terkoneksi ke server Supabase, namun tabel belum dibuat. Silakan jalankan script schema.sql di Supabase SQL Editor.",
          error: error.message,
        };
      }

      return {
        isConfigured: true,
        connected: false,
        tableReady: false,
        projectUrl: supabaseUrl,
        message: `Koneksi Supabase gagal: ${error.message}`,
        error: error.message,
      };
    }

    return {
      isConfigured: true,
      connected: true,
      tableReady: true,
      projectUrl: supabaseUrl,
      classesCount: count ?? data?.length ?? 0,
      message: "Terkoneksi ke Supabase PostgreSQL & Skema Tabel Siap Digunakan.",
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      connected: false,
      tableReady: false,
      projectUrl: supabaseUrl,
      message: `Gagal menghubungi Supabase: ${err?.message || "Periksa koneksi internet Anda."}`,
      error: err?.message,
    };
  }
}
