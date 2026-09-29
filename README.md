# Absensi Kelas

Aplikasi web pencatatan absensi siswa berbasis web dan PWA (*mobile-first*) yang dirancang khusus untuk guru sekolah di Indonesia. Berfokus pada kecepatan, keandalan tanpa kehilangan data, kesiapan offline (*offline-resilient*), dan kemudahan rekapitulasi kehadiran.

---

## Fitur Utama

- **Pencatatan Cepat (≤ 60 Detik):** Antarmuka satu tangan dengan status *pre-filled* Hadir, tombol aksi cepat "Semua Hadir", serta pembaruan langsung (*Live Tally*).
- **Status Kehadiran Lengkap:** Hadir (H), Sakit (S), Izin (I), Alpa (A), dan Terlambat (T) dengan indikator simbolis ganda (huruf + ikon + tint warna ramah aksesibilitas).
- **Ketahanan Jaringan & Offline-First:** Dilengkapi *optimistic UI*, antrean simpan lokal di browser (IndexedDB), dan sinkronisasi otomatis idempoten saat koneksi pulih.
- **Manajemen Kelas & Siswa:** Pengelolaan rombongan belajar, data siswa, serta fitur impor data siswa via CSV dengan pratinjau validasi kesalahan per baris.
- **Riwayat & Rekapitulasi Otomatis:** Tampilan kalender kehadiran kelas dan matriks rekap bulanan interaktif dengan perhitungan persentase kehadiran akurat.
- **Ekspor & Cetak Sekali Klik:** Ekspor data rekap ke format CSV (UTF-8 BOM siap Excel) serta tata letak cetak dokumen ramah printer via native print browser.
- **Desain Khusus ("Buku Absen yang Dirancang Ulang"):** Terinspirasi dari ketenangan buku register sekolah tradisional dengan estetika modern, palet warna kertas hangat, dan kepatuhan pada Apple Human Interface Guidelines (HIG).

---

## Tumpukan Teknologi (*Tech Stack*)

- **Framework:** Next.js (App Router, CSR-focused for private authenticated app)
- **Bahasa:** TypeScript
- **Styling & Desain:** Tailwind CSS, CSS Variables Design Tokens, Lucide Icons
- **Backend & Autentikasi:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Manajemen State & Sinkronisasi:** TanStack Query, IndexedDB Local Queue
- **Validasi Skema Runtime:** Zod

---

## Panduan Memulai (*Getting Started*)

### 1. Prasyarat
- Node.js versi 18+ (disarankan Node.js 20 LTS atau lebih baru)
- Akun atau instans lokal Supabase

### 2. Pemasangan Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan
Salin file konfigurasi lingkungan:
```bash
cp .env.example .env.local
```
Sesuaikan nilai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan kredensial proyek Supabase Anda.

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## Kebijakan Privasi & Keamanan Data

Aplikasi ini mematuhi prinsip perlindungan data pribadi dan minimasi data:
- Hanya menyimpan data identitas sekolah yang esensial (Nama Siswa, NIS opsional, Jenis Kelamin opsional).
- Seluruh akses data diisolasi secara ketat per guru menggunakan *Row Level Security* (RLS) di level basis data PostgreSQL.
- Tidak menyertakan pelacak analitik pihak ketiga atau iklan.

---

## Lisensi

Didistribusikan di bawah lisensi MIT.
