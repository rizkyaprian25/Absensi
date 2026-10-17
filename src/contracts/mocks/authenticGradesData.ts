import type { AssessmentItem, StudentScoreRecord } from "../grades";

/**
 * DATA OTENTIK PENILAIAN & NILAI SISWA (SSOT OFFLINE-FIRST)
 * Bersumber dari snapshot cloud resmi SMPN 3 Cibungbulang (2026-10-17T09:36:41.604+00:00).
 * Memuat 43 asesmen lengkap (7A-7H, 8A, 8B) dan 757 catatan nilai otentik siswa.
 * Memastikan saat aplikasi dibuka di peramban baru atau mode Incognito,
 * seluruh data penilaian dan nilai siswa langsung otomatis tampil 100% tanpa perlu sinkronisasi manual.
 */

export const AUTHENTIC_KKM_BY_GRADE: Record<string, number> = {
  "7": 82,
  "8": 83,
  "9": 84,
};

export const AUTHENTIC_INITIAL_ASSESSMENTS: AssessmentItem[] = [
  {
    "id": "asmt-1791579083441-7n56x",
    "date": "2026-10-10",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-8b",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-09T20:51:23.441Z",
    "description": ""
  },
  {
    "id": "asmt-1791723490366-cq90x",
    "date": "2026-10-11",
    "type": "TUGAS",
    "title": "Tugas Fungsi",
    "weight": 1,
    "classId": "class-8a",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-11T12:58:10.366Z",
    "description": ""
  },
  {
    "id": "asmt-1791556700593-a8dyn",
    "date": "2026-10-09",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-8a",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-09T14:38:20.593Z",
    "description": ""
  },
  {
    "id": "asmt-1791809431676-hox0c",
    "date": "2026-10-12",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-7b",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-12T12:50:31.676Z",
    "description": ""
  },
  {
    "id": "asmt-1791819025095-ua5cl",
    "date": "2026-10-12",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-7f",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-12T15:30:25.095Z",
    "description": ""
  },
  {
    "id": "asmt-1791850082875-t57ex",
    "date": "2026-10-13",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-7e",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-13T00:08:02.875Z",
    "description": ""
  },
  {
    "id": "asmt-1791947235695-4klpg",
    "date": "2026-10-14",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-7h",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-14T03:07:15.695Z",
    "description": ""
  },
  {
    "id": "asmt-1791983267793-fuanp",
    "date": "2026-10-14",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-7g",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-14T13:07:47.793Z",
    "description": ""
  },
  {
    "id": "asmt-1792066967824-roghf",
    "date": "2026-10-15",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-7c",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-15T12:22:47.824Z",
    "description": ""
  },
  {
    "id": "asmt-1792154029876-1dg55",
    "date": "2026-10-16",
    "type": "TUGAS",
    "title": "Tugas 1 : Algoritma",
    "weight": 1,
    "classId": "class-7a",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-16T12:33:49.876Z",
    "description": ""
  },
  {
    "id": "asmt-1792154844794-dssbs",
    "date": "2026-10-16",
    "type": "TUGAS",
    "title": "Tugas 2 : Optimasi",
    "weight": 1,
    "classId": "class-7a",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-16T12:47:24.794Z",
    "description": ""
  },
  {
    "id": "asmt-1792155115145-ef23h",
    "date": "2026-10-16",
    "type": "TUGAS",
    "title": "Tugas 3 : Penjelasan Data",
    "weight": 1,
    "classId": "class-7a",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-16T12:51:55.145Z",
    "description": ""
  },
  {
    "id": "asmt-1792159899592-qwmn3",
    "date": "2026-10-16",
    "type": "UH",
    "title": "UH 1 : Data dan Fungsi Tombol Keyboard",
    "weight": 1,
    "classId": "class-7a",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-16T14:11:39.592Z",
    "description": ""
  },
  {
    "id": "asmt-1791725594077-8h1ak",
    "date": "2026-10-11",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-7a",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-11T13:33:14.077Z",
    "description": ""
  },
  {
    "id": "asmt-1792160187208-9eakr",
    "date": "2026-10-16",
    "type": "TUGAS",
    "title": "Tugas 1 : Algoritma",
    "weight": 1,
    "classId": "class-7d",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-16T14:16:27.208Z",
    "description": ""
  },
  {
    "id": "asmt-1792160229962-zkdwe",
    "date": "2026-10-16",
    "type": "TUGAS",
    "title": "Tugas 3 : Penjelasan Data",
    "weight": 1,
    "classId": "class-7d",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-16T14:17:09.962Z",
    "description": ""
  },
  {
    "id": "asmt-1792160204391-l1lpb",
    "date": "2026-10-16",
    "type": "TUGAS",
    "title": "Tugas 2 : Optimasi",
    "weight": 1,
    "classId": "class-7d",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-16T14:16:44.391Z",
    "description": ""
  },
  {
    "id": "asmt-1791730405253-z11uy",
    "date": "2026-10-11",
    "type": "UTS",
    "title": "UTS",
    "weight": 1,
    "classId": "class-7d",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-11T14:53:25.253Z",
    "description": ""
  },
  {
    "id": "asmt-1792160309568-a48ti",
    "date": "2026-10-16",
    "type": "UH",
    "title": "UH 1 : Data dan Fungsi Tombol Keyboard",
    "weight": 1,
    "classId": "class-7d",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-10-16T14:18:29.568Z",
    "description": ""
  },
  {
    "id": "asmt-class-7b-tugas-1",
    "date": "2026-08-04",
    "type": "TUGAS",
    "title": "Tugas 1 : Algoritma",
    "weight": 1,
    "classId": "class-7b",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Pemahaman konsep dasar algoritma dan berpikir komputasional"
  },
  {
    "id": "asmt-class-7b-tugas-2",
    "date": "2026-08-18",
    "type": "TUGAS",
    "title": "Tugas 2 : Optimasi",
    "weight": 1,
    "classId": "class-7b",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Optimasi penjadwalan dan efisiensi langkah kerja komputasi"
  },
  {
    "id": "asmt-class-7b-tugas-3",
    "date": "2026-09-08",
    "type": "TUGAS",
    "title": "Tugas 3 : Penjelasan Data",
    "weight": 1,
    "classId": "class-7b",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Analisis dan penjelasan representasi data digital"
  },
  {
    "id": "asmt-class-7b-uh-1",
    "date": "2026-09-22",
    "type": "UH",
    "title": "UH 1 : Data dan Fungsi Tombol Keyboard",
    "weight": 1,
    "classId": "class-7b",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Ulangan harian evaluasi materi data dan fungsi tombol keyboard komputer"
  },
  {
    "id": "asmt-class-7c-tugas-1",
    "date": "2026-08-07",
    "type": "TUGAS",
    "title": "Tugas 1 : Algoritma",
    "weight": 1,
    "classId": "class-7c",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Pemahaman konsep dasar algoritma dan berpikir komputasional"
  },
  {
    "id": "asmt-class-7c-tugas-2",
    "date": "2026-08-21",
    "type": "TUGAS",
    "title": "Tugas 2 : Optimasi",
    "weight": 1,
    "classId": "class-7c",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Optimasi penjadwalan dan efisiensi langkah kerja komputasi"
  },
  {
    "id": "asmt-class-7c-tugas-3",
    "date": "2026-09-11",
    "type": "TUGAS",
    "title": "Tugas 3 : Penjelasan Data",
    "weight": 1,
    "classId": "class-7c",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Analisis dan penjelasan representasi data digital"
  },
  {
    "id": "asmt-class-7c-uh-1",
    "date": "2026-09-25",
    "type": "UH",
    "title": "UH 1 : Data dan Fungsi Tombol Keyboard",
    "weight": 1,
    "classId": "class-7c",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Ulangan harian evaluasi materi data dan fungsi tombol keyboard komputer"
  },
  {
    "id": "asmt-class-7e-tugas-1",
    "date": "2026-08-05",
    "type": "TUGAS",
    "title": "Tugas 1 : Algoritma",
    "weight": 1,
    "classId": "class-7e",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Pemahaman konsep dasar algoritma dan berpikir komputasional"
  },
  {
    "id": "asmt-class-7e-tugas-2",
    "date": "2026-08-19",
    "type": "TUGAS",
    "title": "Tugas 2 : Optimasi",
    "weight": 1,
    "classId": "class-7e",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Optimasi penjadwalan dan efisiensi langkah kerja komputasi"
  },
  {
    "id": "asmt-class-7e-tugas-3",
    "date": "2026-09-09",
    "type": "TUGAS",
    "title": "Tugas 3 : Penjelasan Data",
    "weight": 1,
    "classId": "class-7e",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Analisis dan penjelasan representasi data digital"
  },
  {
    "id": "asmt-class-7e-uh-1",
    "date": "2026-09-23",
    "type": "UH",
    "title": "UH 1 : Data dan Fungsi Tombol Keyboard",
    "weight": 1,
    "classId": "class-7e",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Ulangan harian evaluasi materi data dan fungsi tombol keyboard komputer"
  },
  {
    "id": "asmt-class-7f-tugas-1",
    "date": "2026-08-05",
    "type": "TUGAS",
    "title": "Tugas 1 : Algoritma",
    "weight": 1,
    "classId": "class-7f",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Pemahaman konsep dasar algoritma dan berpikir komputasional"
  },
  {
    "id": "asmt-class-7f-tugas-2",
    "date": "2026-08-19",
    "type": "TUGAS",
    "title": "Tugas 2 : Optimasi",
    "weight": 1,
    "classId": "class-7f",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Optimasi penjadwalan dan efisiensi langkah kerja komputasi"
  },
  {
    "id": "asmt-class-7f-tugas-3",
    "date": "2026-09-09",
    "type": "TUGAS",
    "title": "Tugas 3 : Penjelasan Data",
    "weight": 1,
    "classId": "class-7f",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Analisis dan penjelasan representasi data digital"
  },
  {
    "id": "asmt-class-7f-uh-1",
    "date": "2026-09-23",
    "type": "UH",
    "title": "UH 1 : Data dan Fungsi Tombol Keyboard",
    "weight": 1,
    "classId": "class-7f",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Ulangan harian evaluasi materi data dan fungsi tombol keyboard komputer"
  },
  {
    "id": "asmt-class-7g-tugas-1",
    "date": "2026-08-07",
    "type": "TUGAS",
    "title": "Tugas 1 : Algoritma",
    "weight": 1,
    "classId": "class-7g",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Pemahaman konsep dasar algoritma dan berpikir komputasional"
  },
  {
    "id": "asmt-class-7g-tugas-2",
    "date": "2026-08-21",
    "type": "TUGAS",
    "title": "Tugas 2 : Optimasi",
    "weight": 1,
    "classId": "class-7g",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Optimasi penjadwalan dan efisiensi langkah kerja komputasi"
  },
  {
    "id": "asmt-class-7g-tugas-3",
    "date": "2026-09-11",
    "type": "TUGAS",
    "title": "Tugas 3 : Penjelasan Data",
    "weight": 1,
    "classId": "class-7g",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Analisis dan penjelasan representasi data digital"
  },
  {
    "id": "asmt-class-7g-uh-1",
    "date": "2026-09-25",
    "type": "UH",
    "title": "UH 1 : Data dan Fungsi Tombol Keyboard",
    "weight": 1,
    "classId": "class-7g",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Ulangan harian evaluasi materi data dan fungsi tombol keyboard komputer"
  },
  {
    "id": "asmt-class-7h-tugas-1",
    "date": "2026-08-06",
    "type": "TUGAS",
    "title": "Tugas 1 : Algoritma",
    "weight": 1,
    "classId": "class-7h",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Pemahaman konsep dasar algoritma dan berpikir komputasional"
  },
  {
    "id": "asmt-class-7h-tugas-2",
    "date": "2026-08-20",
    "type": "TUGAS",
    "title": "Tugas 2 : Optimasi",
    "weight": 1,
    "classId": "class-7h",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Optimasi penjadwalan dan efisiensi langkah kerja komputasi"
  },
  {
    "id": "asmt-class-7h-tugas-3",
    "date": "2026-09-10",
    "type": "TUGAS",
    "title": "Tugas 3 : Penjelasan Data",
    "weight": 1,
    "classId": "class-7h",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Analisis dan penjelasan representasi data digital"
  },
  {
    "id": "asmt-class-7h-uh-1",
    "date": "2026-09-24",
    "type": "UH",
    "title": "UH 1 : Data dan Fungsi Tombol Keyboard",
    "weight": 1,
    "classId": "class-7h",
    "subject": "Informatika",
    "maxScore": 100,
    "createdAt": "2026-07-15T00:00:00.000Z",
    "description": "Ulangan harian evaluasi materi data dan fungsi tombol keyboard komputer"
  }
];

export const AUTHENTIC_INITIAL_SCORES: StudentScoreRecord[] = [
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-01",
    "score": 90,
    "studentId": "std-class-8a-01",
    "updatedAt": "2026-10-09T20:48:38.416Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-04",
    "score": 49,
    "studentId": "std-class-8a-04",
    "updatedAt": "2026-10-09T20:48:38.432Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-32",
    "score": 58,
    "studentId": "std-class-8a-32",
    "updatedAt": "2026-10-09T20:48:38.531Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-09",
    "score": 58,
    "studentId": "std-class-8a-09",
    "updatedAt": "2026-10-09T20:48:38.461Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-14",
    "score": 49,
    "studentId": "std-class-8a-14",
    "updatedAt": "2026-10-09T20:48:38.477Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-05",
    "score": 31,
    "studentId": "std-class-8a-05",
    "updatedAt": "2026-10-09T20:48:38.439Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-42",
    "score": 22,
    "studentId": "std-class-8a-42",
    "updatedAt": "2026-10-09T20:48:38.561Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-23",
    "score": 46,
    "studentId": "std-class-8a-23",
    "updatedAt": "2026-10-09T20:48:38.504Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-31",
    "score": 22,
    "studentId": "std-class-8a-31",
    "updatedAt": "2026-10-09T20:48:38.529Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-11",
    "score": 26,
    "studentId": "std-class-8a-11",
    "updatedAt": "2026-10-09T20:48:38.466Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-36",
    "score": 89,
    "studentId": "std-class-8a-36",
    "updatedAt": "2026-10-09T20:48:38.546Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-33",
    "score": 93,
    "studentId": "std-class-8a-33",
    "updatedAt": "2026-10-09T20:48:38.539Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-13",
    "score": 86,
    "studentId": "std-class-8a-13",
    "updatedAt": "2026-10-09T20:48:38.473Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-18",
    "score": 72,
    "studentId": "std-class-8a-18",
    "updatedAt": "2026-10-09T20:48:38.487Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-08",
    "score": 19,
    "studentId": "std-class-8a-08",
    "updatedAt": "2026-10-09T20:48:38.453Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-20",
    "score": 22,
    "studentId": "std-class-8a-20",
    "updatedAt": "2026-10-09T20:48:38.493Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-19",
    "score": 23,
    "studentId": "std-class-8a-19",
    "updatedAt": "2026-10-09T20:48:38.490Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-24",
    "score": 23,
    "studentId": "std-class-8a-24",
    "updatedAt": "2026-10-09T20:48:38.508Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-03",
    "score": 29,
    "studentId": "std-class-8a-03",
    "updatedAt": "2026-10-09T20:48:38.427Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-41",
    "score": 22,
    "studentId": "std-class-8a-41",
    "updatedAt": "2026-10-09T20:48:38.558Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-21",
    "score": 90,
    "studentId": "std-class-8a-21",
    "updatedAt": "2026-10-09T20:48:38.495Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-30",
    "score": 94,
    "studentId": "std-class-8a-30",
    "updatedAt": "2026-10-09T20:48:38.526Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-29",
    "score": 48,
    "studentId": "std-class-8a-29",
    "updatedAt": "2026-10-09T20:48:38.522Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-17",
    "score": 86,
    "studentId": "std-class-8a-17",
    "updatedAt": "2026-10-09T20:48:38.485Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-27",
    "score": 90,
    "studentId": "std-class-8a-27",
    "updatedAt": "2026-10-09T20:48:38.517Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-07",
    "score": 100,
    "studentId": "std-class-8a-07",
    "updatedAt": "2026-10-09T20:48:38.449Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-35",
    "score": 54,
    "studentId": "std-class-8a-35",
    "updatedAt": "2026-10-09T20:48:38.544Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-16",
    "score": 83,
    "studentId": "std-class-8a-16",
    "updatedAt": "2026-10-09T20:48:38.482Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-22",
    "score": 86,
    "studentId": "std-class-8a-22",
    "updatedAt": "2026-10-09T20:48:38.500Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-34",
    "score": 36,
    "studentId": "std-class-8a-34",
    "updatedAt": "2026-10-09T20:48:38.542Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-10",
    "score": 100,
    "studentId": "std-class-8a-10",
    "updatedAt": "2026-10-09T20:48:38.464Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-02",
    "score": 93,
    "studentId": "std-class-8a-02",
    "updatedAt": "2026-10-09T20:48:38.422Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-37",
    "score": 100,
    "studentId": "std-class-8a-37",
    "updatedAt": "2026-10-09T20:48:38.548Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-39",
    "score": 70,
    "studentId": "std-class-8a-39",
    "updatedAt": "2026-10-09T20:48:38.553Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-40",
    "score": 43,
    "studentId": "std-class-8a-40",
    "updatedAt": "2026-10-09T20:48:38.556Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-38",
    "score": 62,
    "studentId": "std-class-8a-38",
    "updatedAt": "2026-10-09T20:48:38.551Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-12",
    "score": 100,
    "studentId": "std-class-8a-12",
    "updatedAt": "2026-10-09T20:48:38.470Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-06",
    "score": 100,
    "studentId": "std-class-8a-06",
    "updatedAt": "2026-10-09T20:48:38.445Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-28",
    "score": 65,
    "studentId": "std-class-8a-28",
    "updatedAt": "2026-10-09T20:48:38.519Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-26",
    "score": 92,
    "studentId": "std-class-8a-26",
    "updatedAt": "2026-10-09T20:48:38.513Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-25",
    "score": 99,
    "studentId": "std-class-8a-25",
    "updatedAt": "2026-10-09T20:48:38.510Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791556700593-a8dyn-std-class-8a-15",
    "score": 80,
    "studentId": "std-class-8a-15",
    "updatedAt": "2026-10-09T20:48:38.479Z",
    "assessmentId": "asmt-1791556700593-a8dyn"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-01",
    "score": 42,
    "studentId": "std-class-8b-01",
    "updatedAt": "2026-10-09T20:56:37.532Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-02",
    "score": 38,
    "studentId": "std-class-8b-02",
    "updatedAt": "2026-10-09T20:57:45.070Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-03",
    "score": 34,
    "studentId": "std-class-8b-03",
    "updatedAt": "2026-10-09T20:58:56.208Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-04",
    "score": 47,
    "studentId": "std-class-8b-04",
    "updatedAt": "2026-10-09T21:00:08.679Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-05",
    "score": 89,
    "studentId": "std-class-8b-05",
    "updatedAt": "2026-10-09T21:00:45.908Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-06",
    "score": 67,
    "studentId": "std-class-8b-06",
    "updatedAt": "2026-10-09T21:02:30.164Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-07",
    "score": 61,
    "studentId": "std-class-8b-07",
    "updatedAt": "2026-10-09T21:04:57.290Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-08",
    "score": 72,
    "studentId": "std-class-8b-08",
    "updatedAt": "2026-10-09T21:05:40.753Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-09",
    "score": 79,
    "studentId": "std-class-8b-09",
    "updatedAt": "2026-10-09T21:07:20.009Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-10",
    "score": 44,
    "studentId": "std-class-8b-10",
    "updatedAt": "2026-10-09T21:08:50.827Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-11",
    "score": 95,
    "studentId": "std-class-8b-11",
    "updatedAt": "2026-10-09T21:10:17.759Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-12",
    "score": 52,
    "studentId": "std-class-8b-12",
    "updatedAt": "2026-10-09T21:10:41.196Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-13",
    "score": 40,
    "studentId": "std-class-8b-13",
    "updatedAt": "2026-10-09T21:13:34.491Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-14",
    "score": 60,
    "studentId": "std-class-8b-14",
    "updatedAt": "2026-10-09T21:14:00.933Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-15",
    "score": 80,
    "studentId": "std-class-8b-15",
    "updatedAt": "2026-10-09T21:17:26.492Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-16",
    "score": 60,
    "studentId": "std-class-8b-16",
    "updatedAt": "2026-10-09T21:19:22.514Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-17",
    "score": 70,
    "studentId": "std-class-8b-17",
    "updatedAt": "2026-10-09T21:19:25.538Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-18",
    "score": 60,
    "studentId": "std-class-8b-18",
    "updatedAt": "2026-10-09T21:22:08.165Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-19",
    "score": 37,
    "studentId": "std-class-8b-19",
    "updatedAt": "2026-10-09T21:23:19.397Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-20",
    "score": 38,
    "studentId": "std-class-8b-20",
    "updatedAt": "2026-10-09T21:23:22.271Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-21",
    "score": 58,
    "studentId": "std-class-8b-21",
    "updatedAt": "2026-10-09T21:25:12.470Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-22",
    "score": 89,
    "studentId": "std-class-8b-22",
    "updatedAt": "2026-10-09T21:25:17.227Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-23",
    "score": 93,
    "studentId": "std-class-8b-23",
    "updatedAt": "2026-10-09T21:25:57.237Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-24",
    "score": 84,
    "studentId": "std-class-8b-24",
    "updatedAt": "2026-10-09T21:28:18.653Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-25",
    "score": 76,
    "studentId": "std-class-8b-25",
    "updatedAt": "2026-10-09T21:29:56.987Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-26",
    "score": 51,
    "studentId": "std-class-8b-26",
    "updatedAt": "2026-10-09T21:30:09.832Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-27",
    "score": 66,
    "studentId": "std-class-8b-27",
    "updatedAt": "2026-10-09T21:31:32.275Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-28",
    "score": 65,
    "studentId": "std-class-8b-28",
    "updatedAt": "2026-10-09T21:33:14.887Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-29",
    "score": 38,
    "studentId": "std-class-8b-29",
    "updatedAt": "2026-10-09T21:35:38.962Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-30",
    "score": 81,
    "studentId": "std-class-8b-30",
    "updatedAt": "2026-10-09T21:37:08.924Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-31",
    "score": 76,
    "studentId": "std-class-8b-31",
    "updatedAt": "2026-10-09T21:38:23.106Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-32",
    "score": 93,
    "studentId": "std-class-8b-32",
    "updatedAt": "2026-10-09T21:38:30.668Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-33",
    "score": 79,
    "studentId": "std-class-8b-33",
    "updatedAt": "2026-10-09T21:40:26.835Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-34",
    "score": 51,
    "studentId": "std-class-8b-34",
    "updatedAt": "2026-10-09T21:40:46.553Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-35",
    "score": 96,
    "studentId": "std-class-8b-35",
    "updatedAt": "2026-10-09T21:41:59.610Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-36",
    "score": 79,
    "studentId": "std-class-8b-36",
    "updatedAt": "2026-10-09T21:43:18.349Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-37",
    "score": 59,
    "studentId": "std-class-8b-37",
    "updatedAt": "2026-10-09T21:43:29.283Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-38",
    "score": 59,
    "studentId": "std-class-8b-38",
    "updatedAt": "2026-10-09T21:45:31.814Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-39",
    "score": 52,
    "studentId": "std-class-8b-39",
    "updatedAt": "2026-10-09T21:46:51.066Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791579083441-7n56x-std-class-8b-40",
    "score": 80,
    "studentId": "std-class-8b-40",
    "updatedAt": "2026-10-09T21:47:10.271Z",
    "assessmentId": "asmt-1791579083441-7n56x"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-01",
    "score": 74,
    "studentId": "std-class-7a-01",
    "updatedAt": "2026-10-11T14:44:08.030Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-02",
    "score": 86,
    "studentId": "std-class-7a-02",
    "updatedAt": "2026-10-11T14:44:08.052Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-03",
    "score": 50,
    "studentId": "std-class-7a-03",
    "updatedAt": "2026-10-15T14:27:30.947Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-04",
    "score": 100,
    "studentId": "std-class-7a-04",
    "updatedAt": "2026-10-11T14:44:08.109Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-05",
    "score": 67,
    "studentId": "std-class-7a-05",
    "updatedAt": "2026-10-11T14:44:08.129Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-06",
    "score": 79,
    "studentId": "std-class-7a-06",
    "updatedAt": "2026-10-11T14:44:08.153Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-07",
    "score": 79,
    "studentId": "std-class-7a-07",
    "updatedAt": "2026-10-11T14:44:08.183Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-08",
    "score": 44,
    "studentId": "std-class-7a-08",
    "updatedAt": "2026-10-11T14:44:08.207Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-09",
    "score": 78,
    "studentId": "std-class-7a-09",
    "updatedAt": "2026-10-11T14:44:08.231Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-10",
    "score": 96,
    "studentId": "std-class-7a-10",
    "updatedAt": "2026-10-11T14:44:08.265Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-11",
    "score": 65,
    "studentId": "std-class-7a-11",
    "updatedAt": "2026-10-15T14:26:09.917Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-12",
    "score": 85,
    "studentId": "std-class-7a-12",
    "updatedAt": "2026-10-11T14:44:08.315Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-13",
    "score": 100,
    "studentId": "std-class-7a-13",
    "updatedAt": "2026-10-11T14:44:08.339Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-14",
    "score": 57,
    "studentId": "std-class-7a-14",
    "updatedAt": "2026-10-11T14:44:08.361Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-15",
    "score": 30,
    "studentId": "std-class-7a-15",
    "updatedAt": "2026-10-11T14:44:08.386Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-16",
    "score": 65,
    "studentId": "std-class-7a-16",
    "updatedAt": "2026-10-11T14:44:08.413Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-17",
    "score": 93,
    "studentId": "std-class-7a-17",
    "updatedAt": "2026-10-11T14:44:08.448Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-18",
    "score": 44,
    "studentId": "std-class-7a-18",
    "updatedAt": "2026-10-11T14:44:08.487Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-19",
    "score": 49,
    "studentId": "std-class-7a-19",
    "updatedAt": "2026-10-11T14:44:08.523Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-20",
    "score": 50,
    "studentId": "std-class-7a-20",
    "updatedAt": "2026-10-11T14:44:08.555Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-21",
    "score": 38,
    "studentId": "std-class-7a-21",
    "updatedAt": "2026-10-11T14:44:08.594Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-22",
    "score": 47,
    "studentId": "std-class-7a-22",
    "updatedAt": "2026-10-11T14:44:08.635Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-23",
    "score": 76,
    "studentId": "std-class-7a-23",
    "updatedAt": "2026-10-11T14:44:08.663Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-24",
    "score": 62,
    "studentId": "std-class-7a-24",
    "updatedAt": "2026-10-11T14:44:08.697Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-25",
    "score": 47,
    "studentId": "std-class-7a-25",
    "updatedAt": "2026-10-11T14:44:08.722Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-26",
    "score": 94,
    "studentId": "std-class-7a-26",
    "updatedAt": "2026-10-11T14:44:08.749Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-27",
    "score": 70,
    "studentId": "std-class-7a-27",
    "updatedAt": "2026-10-11T14:44:08.779Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-28",
    "score": 94,
    "studentId": "std-class-7a-28",
    "updatedAt": "2026-10-11T14:44:08.804Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-29",
    "score": 89,
    "studentId": "std-class-7a-29",
    "updatedAt": "2026-10-11T14:44:08.835Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-30",
    "score": 50,
    "studentId": "std-class-7a-30",
    "updatedAt": "2026-10-11T14:44:08.862Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-31",
    "score": 93,
    "studentId": "std-class-7a-31",
    "updatedAt": "2026-10-11T14:44:08.891Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-32",
    "score": 75,
    "studentId": "std-class-7a-32",
    "updatedAt": "2026-10-15T14:23:50.986Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-33",
    "score": 82,
    "studentId": "std-class-7a-33",
    "updatedAt": "2026-10-11T14:44:08.945Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-34",
    "score": 40,
    "studentId": "std-class-7a-34",
    "updatedAt": "2026-10-11T14:44:08.969Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-35",
    "score": 67,
    "studentId": "std-class-7a-35",
    "updatedAt": "2026-10-11T14:44:08.989Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-36",
    "score": 88,
    "studentId": "std-class-7a-36",
    "updatedAt": "2026-10-11T14:44:09.013Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-37",
    "score": 71,
    "studentId": "std-class-7a-37",
    "updatedAt": "2026-10-11T14:44:09.034Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-38",
    "score": 81,
    "studentId": "std-class-7a-38",
    "updatedAt": "2026-10-11T14:44:09.055Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-39",
    "score": 58,
    "studentId": "std-class-7a-39",
    "updatedAt": "2026-10-11T14:44:09.076Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791725594077-8h1ak-std-class-7a-40",
    "score": 83,
    "studentId": "std-class-7a-40",
    "updatedAt": "2026-10-11T14:44:09.095Z",
    "assessmentId": "asmt-1791725594077-8h1ak"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-01",
    "score": 77,
    "studentId": "std-class-7d-01",
    "updatedAt": "2026-10-11T22:38:53.179Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-02",
    "score": 52,
    "studentId": "std-class-7d-02",
    "updatedAt": "2026-10-11T22:38:53.245Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-03",
    "score": 89,
    "studentId": "std-class-7d-03",
    "updatedAt": "2026-10-15T14:47:35.642Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-04",
    "score": 50,
    "studentId": "std-class-7d-04",
    "updatedAt": "2026-10-11T22:38:53.300Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-05",
    "score": 97,
    "studentId": "std-class-7d-05",
    "updatedAt": "2026-10-11T22:38:53.323Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-06",
    "score": 62,
    "studentId": "std-class-7d-06",
    "updatedAt": "2026-10-15T14:47:30.355Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-07",
    "score": 61,
    "studentId": "std-class-7d-07",
    "updatedAt": "2026-10-11T22:38:53.368Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-08",
    "score": 86,
    "studentId": "std-class-7d-08",
    "updatedAt": "2026-10-11T22:38:53.391Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-09",
    "score": 65,
    "studentId": "std-class-7d-09",
    "updatedAt": "2026-10-11T22:38:53.415Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-10",
    "score": 99,
    "studentId": "std-class-7d-10",
    "updatedAt": "2026-10-15T14:46:44.785Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-11",
    "score": 88,
    "studentId": "std-class-7d-11",
    "updatedAt": "2026-10-11T22:38:53.467Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-12",
    "score": 73,
    "studentId": "std-class-7d-12",
    "updatedAt": "2026-10-11T22:38:53.489Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-13",
    "score": 89,
    "studentId": "std-class-7d-13",
    "updatedAt": "2026-10-11T22:38:53.512Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-14",
    "score": 35,
    "studentId": "std-class-7d-14",
    "updatedAt": "2026-10-11T22:38:53.535Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-15",
    "score": 97,
    "studentId": "std-class-7d-15",
    "updatedAt": "2026-10-15T14:43:56.322Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-16",
    "score": 54,
    "studentId": "std-class-7d-16",
    "updatedAt": "2026-10-11T22:38:53.585Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-17",
    "score": 88,
    "studentId": "std-class-7d-17",
    "updatedAt": "2026-10-11T22:38:53.607Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-18",
    "score": 48,
    "studentId": "std-class-7d-18",
    "updatedAt": "2026-10-11T22:38:53.630Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-19",
    "score": 65,
    "studentId": "std-class-7d-19",
    "updatedAt": "2026-10-11T22:38:53.660Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-20",
    "score": 30,
    "studentId": "std-class-7d-20",
    "updatedAt": "2026-10-11T22:38:53.683Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-21",
    "score": 39,
    "studentId": "std-class-7d-21",
    "updatedAt": "2026-10-11T22:38:53.712Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-22",
    "score": 37,
    "studentId": "std-class-7d-22",
    "updatedAt": "2026-10-11T22:38:53.734Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-23",
    "score": 27,
    "studentId": "std-class-7d-23",
    "updatedAt": "2026-10-11T22:38:53.756Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-24",
    "score": 62,
    "studentId": "std-class-7d-24",
    "updatedAt": "2026-10-11T22:38:53.781Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-25",
    "score": 51,
    "studentId": "std-class-7d-25",
    "updatedAt": "2026-10-11T22:38:53.804Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-26",
    "score": 43,
    "studentId": "std-class-7d-26",
    "updatedAt": "2026-10-11T22:38:53.830Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-27",
    "score": 46,
    "studentId": "std-class-7d-27",
    "updatedAt": "2026-10-11T22:38:53.855Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-28",
    "score": 77,
    "studentId": "std-class-7d-28",
    "updatedAt": "2026-10-11T22:38:53.881Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-29",
    "score": 48,
    "studentId": "std-class-7d-29",
    "updatedAt": "2026-10-11T22:38:53.910Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-30",
    "score": 93,
    "studentId": "std-class-7d-30",
    "updatedAt": "2026-10-11T22:38:53.940Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-31",
    "score": 21,
    "studentId": "std-class-7d-31",
    "updatedAt": "2026-10-11T22:38:53.972Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-32",
    "score": 85,
    "studentId": "std-class-7d-32",
    "updatedAt": "2026-10-15T14:41:33.041Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-33",
    "score": 47,
    "studentId": "std-class-7d-33",
    "updatedAt": "2026-10-11T22:38:54.016Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-34",
    "score": 82,
    "studentId": "std-class-7d-34",
    "updatedAt": "2026-10-11T22:38:54.038Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-35",
    "score": 78,
    "studentId": "std-class-7d-35",
    "updatedAt": "2026-10-15T14:41:10.641Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-36",
    "score": 78,
    "studentId": "std-class-7d-36",
    "updatedAt": "2026-10-11T22:38:54.089Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-37",
    "score": 30,
    "studentId": "std-class-7d-37",
    "updatedAt": "2026-10-11T22:38:54.113Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-38",
    "score": null,
    "studentId": "std-class-7d-38",
    "updatedAt": "2026-10-11T22:38:54.136Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-39",
    "score": 40,
    "studentId": "std-class-7d-39",
    "updatedAt": "2026-10-11T22:38:54.163Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791730405253-z11uy-std-class-7d-40",
    "score": 90,
    "studentId": "std-class-7d-40",
    "updatedAt": "2026-10-11T22:38:54.185Z",
    "assessmentId": "asmt-1791730405253-z11uy"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-01",
    "score": 41,
    "studentId": "std-class-7b-01",
    "updatedAt": "2026-10-12T13:27:39.530Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-02",
    "score": 49,
    "studentId": "std-class-7b-02",
    "updatedAt": "2026-10-15T14:38:46.353Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-03",
    "score": 40,
    "studentId": "std-class-7b-03",
    "updatedAt": "2026-10-12T13:27:39.596Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-04",
    "score": 94,
    "studentId": "std-class-7b-04",
    "updatedAt": "2026-10-12T13:27:39.618Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-05",
    "score": 52,
    "studentId": "std-class-7b-05",
    "updatedAt": "2026-10-15T14:36:12.882Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-06",
    "score": 69,
    "studentId": "std-class-7b-06",
    "updatedAt": "2026-10-15T14:36:09.526Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-07",
    "score": 40,
    "studentId": "std-class-7b-07",
    "updatedAt": "2026-10-12T13:27:39.692Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-08",
    "score": 42,
    "studentId": "std-class-7b-08",
    "updatedAt": "2026-10-12T13:27:39.714Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-09",
    "score": 100,
    "studentId": "std-class-7b-09",
    "updatedAt": "2026-10-12T13:27:39.739Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-10",
    "score": 54,
    "studentId": "std-class-7b-10",
    "updatedAt": "2026-10-15T14:35:13.206Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-11",
    "score": null,
    "studentId": "std-class-7b-11",
    "updatedAt": "2026-10-12T13:27:39.795Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-12",
    "score": 32,
    "studentId": "std-class-7b-12",
    "updatedAt": "2026-10-15T14:34:23.073Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-13",
    "score": 38,
    "studentId": "std-class-7b-13",
    "updatedAt": "2026-10-12T13:30:56.807Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-14",
    "score": 98,
    "studentId": "std-class-7b-14",
    "updatedAt": "2026-10-12T13:32:40.551Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-15",
    "score": 19,
    "studentId": "std-class-7b-15",
    "updatedAt": "2026-10-12T13:34:59.139Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-16",
    "score": 58,
    "studentId": "std-class-7b-16",
    "updatedAt": "2026-10-12T13:35:04.197Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-17",
    "score": 25,
    "studentId": "std-class-7b-17",
    "updatedAt": "2026-10-12T13:36:45.155Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-18",
    "score": 64,
    "studentId": "std-class-7b-18",
    "updatedAt": "2026-10-12T13:39:37.702Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-19",
    "score": 30,
    "studentId": "std-class-7b-19",
    "updatedAt": "2026-10-12T13:41:11.477Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-20",
    "score": 44,
    "studentId": "std-class-7b-20",
    "updatedAt": "2026-10-12T13:42:36.837Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-21",
    "score": 68,
    "studentId": "std-class-7b-21",
    "updatedAt": "2026-10-12T13:42:43.545Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-22",
    "score": 44,
    "studentId": "std-class-7b-22",
    "updatedAt": "2026-10-12T13:44:44.541Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-23",
    "score": 52,
    "studentId": "std-class-7b-23",
    "updatedAt": "2026-10-12T13:45:06.910Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-24",
    "score": 30,
    "studentId": "std-class-7b-24",
    "updatedAt": "2026-10-12T13:46:06.391Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-25",
    "score": 71,
    "studentId": "std-class-7b-25",
    "updatedAt": "2026-10-12T13:47:15.152Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-26",
    "score": 71,
    "studentId": "std-class-7b-26",
    "updatedAt": "2026-10-12T13:48:31.410Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-27",
    "score": 79,
    "studentId": "std-class-7b-27",
    "updatedAt": "2026-10-12T13:48:38.350Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-28",
    "score": 43,
    "studentId": "std-class-7b-28",
    "updatedAt": "2026-10-12T13:50:21.953Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-29",
    "score": 69,
    "studentId": "std-class-7b-29",
    "updatedAt": "2026-10-12T13:51:55.537Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-30",
    "score": 35,
    "studentId": "std-class-7b-30",
    "updatedAt": "2026-10-12T13:53:34.387Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-31",
    "score": 74,
    "studentId": "std-class-7b-31",
    "updatedAt": "2026-10-15T14:32:05.435Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-32",
    "score": 75,
    "studentId": "std-class-7b-32",
    "updatedAt": "2026-10-12T13:57:12.147Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-33",
    "score": 98,
    "studentId": "std-class-7b-33",
    "updatedAt": "2026-10-12T13:57:15.222Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-34",
    "score": 51,
    "studentId": "std-class-7b-34",
    "updatedAt": "2026-10-12T14:00:30.023Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-35",
    "score": 25,
    "studentId": "std-class-7b-35",
    "updatedAt": "2026-10-12T14:02:13.923Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-36",
    "score": 33,
    "studentId": "std-class-7b-36",
    "updatedAt": "2026-10-12T14:03:54.583Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-37",
    "score": 68,
    "studentId": "std-class-7b-37",
    "updatedAt": "2026-10-12T14:03:58.446Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-38",
    "score": 37,
    "studentId": "std-class-7b-38",
    "updatedAt": "2026-10-13T00:07:35.965Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-39",
    "score": 49,
    "studentId": "std-class-7b-39",
    "updatedAt": "2026-10-15T14:31:02.031Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791809431676-hox0c-std-class-7b-40",
    "score": 40,
    "studentId": "std-class-7b-40",
    "updatedAt": "2026-10-15T14:30:59.166Z",
    "assessmentId": "asmt-1791809431676-hox0c"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-01",
    "score": 37,
    "studentId": "std-class-7f-01",
    "updatedAt": "2026-10-12T15:32:35.724Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-02",
    "score": 64,
    "studentId": "std-class-7f-02",
    "updatedAt": "2026-10-12T15:34:23.791Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-03",
    "score": 82,
    "studentId": "std-class-7f-03",
    "updatedAt": "2026-10-12T15:35:35.586Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-04",
    "score": 72,
    "studentId": "std-class-7f-04",
    "updatedAt": "2026-10-12T15:37:41.698Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-05",
    "score": 36,
    "studentId": "std-class-7f-05",
    "updatedAt": "2026-10-12T15:38:31.947Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-06",
    "score": 98,
    "studentId": "std-class-7f-06",
    "updatedAt": "2026-10-12T15:38:43.614Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-07",
    "score": 61,
    "studentId": "std-class-7f-07",
    "updatedAt": "2026-10-15T15:12:37.158Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-08",
    "score": 92,
    "studentId": "std-class-7f-08",
    "updatedAt": "2026-10-15T15:12:16.576Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-09",
    "score": 84,
    "studentId": "std-class-7f-09",
    "updatedAt": "2026-10-12T15:42:53.575Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-10",
    "score": 82,
    "studentId": "std-class-7f-10",
    "updatedAt": "2026-10-12T15:43:22.744Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-11",
    "score": 49,
    "studentId": "std-class-7f-11",
    "updatedAt": "2026-10-15T15:22:26.543Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-12",
    "score": 72,
    "studentId": "std-class-7f-12",
    "updatedAt": "2026-10-12T15:44:50.499Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-13",
    "score": 100,
    "studentId": "std-class-7f-13",
    "updatedAt": "2026-10-15T15:11:17.930Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-14",
    "score": 92,
    "studentId": "std-class-7f-14",
    "updatedAt": "2026-10-12T15:46:21.651Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-15",
    "score": 81,
    "studentId": "std-class-7f-15",
    "updatedAt": "2026-10-12T15:47:39.707Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-16",
    "score": 41,
    "studentId": "std-class-7f-16",
    "updatedAt": "2026-10-12T15:48:46.218Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-17",
    "score": 83,
    "studentId": "std-class-7f-17",
    "updatedAt": "2026-10-12T15:50:09.779Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-18",
    "score": 82,
    "studentId": "std-class-7f-18",
    "updatedAt": "2026-10-15T15:10:06.014Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-19",
    "score": 71,
    "studentId": "std-class-7f-19",
    "updatedAt": "2026-10-12T15:52:24.410Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-20",
    "score": 58,
    "studentId": "std-class-7f-20",
    "updatedAt": "2026-10-12T15:55:04.125Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-21",
    "score": 79,
    "studentId": "std-class-7f-21",
    "updatedAt": "2026-10-12T15:55:15.191Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-22",
    "score": 48,
    "studentId": "std-class-7f-22",
    "updatedAt": "2026-10-12T15:57:03.577Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-23",
    "score": 64,
    "studentId": "std-class-7f-23",
    "updatedAt": "2026-10-15T15:08:18.537Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-24",
    "score": 79,
    "studentId": "std-class-7f-24",
    "updatedAt": "2026-10-12T15:58:46.879Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-25",
    "score": 75,
    "studentId": "std-class-7f-25",
    "updatedAt": "2026-10-12T16:00:36.940Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-26",
    "score": 61,
    "studentId": "std-class-7f-26",
    "updatedAt": "2026-10-12T16:02:03.328Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-27",
    "score": 87,
    "studentId": "std-class-7f-27",
    "updatedAt": "2026-10-12T16:03:57.234Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-28",
    "score": 47,
    "studentId": "std-class-7f-28",
    "updatedAt": "2026-10-15T15:08:12.098Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-29",
    "score": 96,
    "studentId": "std-class-7f-29",
    "updatedAt": "2026-10-12T16:05:08.380Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-30",
    "score": 96,
    "studentId": "std-class-7f-30",
    "updatedAt": "2026-10-12T16:06:04.624Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-31",
    "score": 61,
    "studentId": "std-class-7f-31",
    "updatedAt": "2026-10-12T16:08:32.869Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-32",
    "score": 94,
    "studentId": "std-class-7f-32",
    "updatedAt": "2026-10-15T15:06:07.065Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-33",
    "score": 71,
    "studentId": "std-class-7f-33",
    "updatedAt": "2026-10-12T16:10:38.752Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-34",
    "score": 80,
    "studentId": "std-class-7f-34",
    "updatedAt": "2026-10-15T15:05:22.375Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-35",
    "score": 96,
    "studentId": "std-class-7f-35",
    "updatedAt": "2026-10-12T16:12:07.890Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-36",
    "score": 93,
    "studentId": "std-class-7f-36",
    "updatedAt": "2026-10-15T15:04:31.876Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-37",
    "score": 68,
    "studentId": "std-class-7f-37",
    "updatedAt": "2026-10-15T15:03:53.191Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-38",
    "score": 100,
    "studentId": "std-class-7f-38",
    "updatedAt": "2026-10-12T16:14:05.511Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-39",
    "score": 45,
    "studentId": "std-class-7f-39",
    "updatedAt": "2026-10-12T16:15:02.021Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791819025095-ua5cl-std-class-7f-40",
    "score": 48,
    "studentId": "std-class-7f-40",
    "updatedAt": "2026-10-12T16:16:35.390Z",
    "assessmentId": "asmt-1791819025095-ua5cl"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-20",
    "score": 38,
    "studentId": "std-class-7e-20",
    "updatedAt": "2026-10-13T00:08:22.688Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-01",
    "score": 52,
    "studentId": "std-class-7e-01",
    "updatedAt": "2026-10-13T10:12:05.818Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-02",
    "score": 51,
    "studentId": "std-class-7e-02",
    "updatedAt": "2026-10-15T15:01:00.417Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-03",
    "score": 62,
    "studentId": "std-class-7e-03",
    "updatedAt": "2026-10-15T15:00:24.008Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-04",
    "score": 38,
    "studentId": "std-class-7e-04",
    "updatedAt": "2026-10-13T10:16:36.518Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-05",
    "score": 90,
    "studentId": "std-class-7e-05",
    "updatedAt": "2026-10-15T14:59:50.125Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-06",
    "score": 94,
    "studentId": "std-class-7e-06",
    "updatedAt": "2026-10-13T10:19:00.947Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-07",
    "score": 51,
    "studentId": "std-class-7e-07",
    "updatedAt": "2026-10-15T14:59:18.054Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-08",
    "score": 74,
    "studentId": "std-class-7e-08",
    "updatedAt": "2026-10-15T14:58:55.794Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-09",
    "score": 40,
    "studentId": "std-class-7e-09",
    "updatedAt": "2026-10-13T10:22:40.089Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-10",
    "score": 43,
    "studentId": "std-class-7e-10",
    "updatedAt": "2026-10-13T10:24:03.055Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-11",
    "score": 90,
    "studentId": "std-class-7e-11",
    "updatedAt": "2026-10-13T10:24:07.448Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-12",
    "score": 57,
    "studentId": "std-class-7e-12",
    "updatedAt": "2026-10-15T14:58:03.751Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-13",
    "score": 93,
    "studentId": "std-class-7e-13",
    "updatedAt": "2026-10-13T10:27:23.471Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-14",
    "score": 36,
    "studentId": "std-class-7e-14",
    "updatedAt": "2026-10-13T10:28:44.545Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-15",
    "score": 67,
    "studentId": "std-class-7e-15",
    "updatedAt": "2026-10-13T10:28:56.425Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-16",
    "score": 64,
    "studentId": "std-class-7e-16",
    "updatedAt": "2026-10-13T10:30:48.251Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-17",
    "score": 98,
    "studentId": "std-class-7e-17",
    "updatedAt": "2026-10-13T10:30:51.778Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-18",
    "score": 35,
    "studentId": "std-class-7e-18",
    "updatedAt": "2026-10-13T10:32:42.932Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-19",
    "score": 42,
    "studentId": "std-class-7e-19",
    "updatedAt": "2026-10-13T10:32:45.787Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-21",
    "score": 55,
    "studentId": "std-class-7e-21",
    "updatedAt": "2026-10-13T10:34:26.048Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-22",
    "score": 49,
    "studentId": "std-class-7e-22",
    "updatedAt": "2026-10-15T14:58:00.108Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-23",
    "score": 90,
    "studentId": "std-class-7e-23",
    "updatedAt": "2026-10-13T10:35:33.750Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-24",
    "score": 28,
    "studentId": "std-class-7e-24",
    "updatedAt": "2026-10-13T10:36:17.553Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-25",
    "score": 42,
    "studentId": "std-class-7e-25",
    "updatedAt": "2026-10-13T10:38:23.799Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-26",
    "score": 45,
    "studentId": "std-class-7e-26",
    "updatedAt": "2026-10-13T10:39:31.437Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-27",
    "score": 89,
    "studentId": "std-class-7e-27",
    "updatedAt": "2026-10-15T14:55:18.763Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-28",
    "score": 92,
    "studentId": "std-class-7e-28",
    "updatedAt": "2026-10-13T10:40:22.010Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-29",
    "score": 100,
    "studentId": "std-class-7e-29",
    "updatedAt": "2026-10-13T10:41:03.226Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-30",
    "score": 36,
    "studentId": "std-class-7e-30",
    "updatedAt": "2026-10-13T10:42:35.592Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-31",
    "score": 47,
    "studentId": "std-class-7e-31",
    "updatedAt": "2026-10-13T10:42:49.076Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-32",
    "score": 50,
    "studentId": "std-class-7e-32",
    "updatedAt": "2026-10-15T14:54:32.098Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-33",
    "score": 88,
    "studentId": "std-class-7e-33",
    "updatedAt": "2026-10-13T10:45:45.875Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-34",
    "score": 100,
    "studentId": "std-class-7e-34",
    "updatedAt": "2026-10-15T14:54:26.017Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-35",
    "score": 96,
    "studentId": "std-class-7e-35",
    "updatedAt": "2026-10-13T10:49:09.713Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-36",
    "score": 39,
    "studentId": "std-class-7e-36",
    "updatedAt": "2026-10-13T10:50:11.612Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-37",
    "score": 86,
    "studentId": "std-class-7e-37",
    "updatedAt": "2026-10-13T10:50:15.121Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-38",
    "score": 43,
    "studentId": "std-class-7e-38",
    "updatedAt": "2026-10-13T10:52:36.803Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-39",
    "score": 45,
    "studentId": "std-class-7e-39",
    "updatedAt": "2026-10-13T10:53:28.755Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791850082875-t57ex-std-class-7e-40",
    "score": 78,
    "studentId": "std-class-7e-40",
    "updatedAt": "2026-10-15T14:53:29.848Z",
    "assessmentId": "asmt-1791850082875-t57ex"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-39",
    "score": 49,
    "studentId": "std-class-7h-39",
    "updatedAt": "2026-10-14T03:07:32.221Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-10",
    "score": 80,
    "studentId": "std-class-7h-10",
    "updatedAt": "2026-10-14T11:28:44.517Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-17",
    "score": 33,
    "studentId": "std-class-7h-17",
    "updatedAt": "2026-10-14T11:31:33.723Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-03",
    "score": 83,
    "studentId": "std-class-7h-03",
    "updatedAt": "2026-10-14T11:32:07.107Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-12",
    "score": 13,
    "studentId": "std-class-7h-12",
    "updatedAt": "2026-10-14T11:32:11.726Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-23",
    "score": 38,
    "studentId": "std-class-7h-23",
    "updatedAt": "2026-10-14T11:34:38.407Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-07",
    "score": 43,
    "studentId": "std-class-7h-07",
    "updatedAt": "2026-10-14T11:35:59.300Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-31",
    "score": 48,
    "studentId": "std-class-7h-31",
    "updatedAt": "2026-10-14T11:36:05.000Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-09",
    "score": 100,
    "studentId": "std-class-7h-09",
    "updatedAt": "2026-10-14T11:36:52.653Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-33",
    "score": 39,
    "studentId": "std-class-7h-33",
    "updatedAt": "2026-10-14T11:38:57.769Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-27",
    "score": 55,
    "studentId": "std-class-7h-27",
    "updatedAt": "2026-10-14T11:39:04.460Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-21",
    "score": 30,
    "studentId": "std-class-7h-21",
    "updatedAt": "2026-10-14T11:41:09.493Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-02",
    "score": 58,
    "studentId": "std-class-7h-02",
    "updatedAt": "2026-10-14T11:42:47.392Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-25",
    "score": 91,
    "studentId": "std-class-7h-25",
    "updatedAt": "2026-10-14T11:44:03.575Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-35",
    "score": 80,
    "studentId": "std-class-7h-35",
    "updatedAt": "2026-10-14T11:46:12.201Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-01",
    "score": 49,
    "studentId": "std-class-7h-01",
    "updatedAt": "2026-10-14T11:47:57.960Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-08",
    "score": 78,
    "studentId": "std-class-7h-08",
    "updatedAt": "2026-10-14T11:51:19.386Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-30",
    "score": 92,
    "studentId": "std-class-7h-30",
    "updatedAt": "2026-10-14T11:51:53.843Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-34",
    "score": 96,
    "studentId": "std-class-7h-34",
    "updatedAt": "2026-10-14T11:56:54.829Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-24",
    "score": 68,
    "studentId": "std-class-7h-24",
    "updatedAt": "2026-10-14T11:58:56.199Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-05",
    "score": 77,
    "studentId": "std-class-7h-05",
    "updatedAt": "2026-10-14T12:00:29.871Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-18",
    "score": 91,
    "studentId": "std-class-7h-18",
    "updatedAt": "2026-10-14T12:02:34.675Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-36",
    "score": 67,
    "studentId": "std-class-7h-36",
    "updatedAt": "2026-10-14T12:03:47.970Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-32",
    "score": 100,
    "studentId": "std-class-7h-32",
    "updatedAt": "2026-10-14T12:07:31.392Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-26",
    "score": 57,
    "studentId": "std-class-7h-26",
    "updatedAt": "2026-10-14T12:08:58.425Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-22",
    "score": 50,
    "studentId": "std-class-7h-22",
    "updatedAt": "2026-10-14T12:11:20.672Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-19",
    "score": 84,
    "studentId": "std-class-7h-19",
    "updatedAt": "2026-10-14T12:13:59.010Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-04",
    "score": 54,
    "studentId": "std-class-7h-04",
    "updatedAt": "2026-10-14T12:18:42.624Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-11",
    "score": 96,
    "studentId": "std-class-7h-11",
    "updatedAt": "2026-10-14T12:19:39.547Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-14",
    "score": 59,
    "studentId": "std-class-7h-14",
    "updatedAt": "2026-10-14T12:21:31.929Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-06",
    "score": 47,
    "studentId": "std-class-7h-06",
    "updatedAt": "2026-10-14T12:23:28.176Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-16",
    "score": 65,
    "studentId": "std-class-7h-16",
    "updatedAt": "2026-10-14T12:25:52.312Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-37",
    "score": 46,
    "studentId": "std-class-7h-37",
    "updatedAt": "2026-10-14T12:27:51.710Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-38",
    "score": 53,
    "studentId": "std-class-7h-38",
    "updatedAt": "2026-10-14T12:29:16.696Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-20",
    "score": 35,
    "studentId": "std-class-7h-20",
    "updatedAt": "2026-10-14T12:30:40.165Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-29",
    "score": 100,
    "studentId": "std-class-7h-29",
    "updatedAt": "2026-10-14T12:31:38.049Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-15",
    "score": 50,
    "studentId": "std-class-7h-15",
    "updatedAt": "2026-10-14T12:34:14.602Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-13",
    "score": 78,
    "studentId": "std-class-7h-13",
    "updatedAt": "2026-10-14T12:35:57.745Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791947235695-4klpg-std-class-7h-28",
    "score": 37,
    "studentId": "std-class-7h-28",
    "updatedAt": "2026-10-14T12:37:18.044Z",
    "assessmentId": "asmt-1791947235695-4klpg"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-15",
    "score": 49,
    "studentId": "std-class-7g-15",
    "updatedAt": "2026-10-14T13:10:45.479Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-03",
    "score": 25,
    "studentId": "std-class-7g-03",
    "updatedAt": "2026-10-14T13:11:36.989Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-09",
    "score": 55,
    "studentId": "std-class-7g-09",
    "updatedAt": "2026-10-14T13:13:31.209Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-01",
    "score": 60,
    "studentId": "std-class-7g-01",
    "updatedAt": "2026-10-14T13:13:40.464Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-18",
    "score": 18,
    "studentId": "std-class-7g-18",
    "updatedAt": "2026-10-14T13:14:43.334Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-02",
    "score": 23,
    "studentId": "std-class-7g-02",
    "updatedAt": "2026-10-14T13:15:35.061Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-34",
    "score": 28,
    "studentId": "std-class-7g-34",
    "updatedAt": "2026-10-14T13:17:26.197Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-12",
    "score": 30,
    "studentId": "std-class-7g-12",
    "updatedAt": "2026-10-14T13:18:07.286Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-07",
    "score": 34,
    "studentId": "std-class-7g-07",
    "updatedAt": "2026-10-14T13:19:15.602Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-17",
    "score": 38,
    "studentId": "std-class-7g-17",
    "updatedAt": "2026-10-14T13:20:19.329Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-30",
    "score": 92,
    "studentId": "std-class-7g-30",
    "updatedAt": "2026-10-14T13:21:31.169Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-26",
    "score": 79,
    "studentId": "std-class-7g-26",
    "updatedAt": "2026-10-14T13:22:42.192Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-25",
    "score": 28,
    "studentId": "std-class-7g-25",
    "updatedAt": "2026-10-14T13:23:33.326Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-27",
    "score": 98,
    "studentId": "std-class-7g-27",
    "updatedAt": "2026-10-14T13:25:28.305Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-05",
    "score": 96,
    "studentId": "std-class-7g-05",
    "updatedAt": "2026-10-14T13:25:43.467Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-16",
    "score": 45,
    "studentId": "std-class-7g-16",
    "updatedAt": "2026-10-14T13:26:42.412Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-08",
    "score": 54,
    "studentId": "std-class-7g-08",
    "updatedAt": "2026-10-14T13:33:52.427Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-06",
    "score": 48,
    "studentId": "std-class-7g-06",
    "updatedAt": "2026-10-14T13:34:58.674Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-14",
    "score": 35,
    "studentId": "std-class-7g-14",
    "updatedAt": "2026-10-14T13:35:17.594Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-40",
    "score": 87,
    "studentId": "std-class-7g-40",
    "updatedAt": "2026-10-14T13:37:30.034Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-29",
    "score": 30,
    "studentId": "std-class-7g-29",
    "updatedAt": "2026-10-14T13:38:51.584Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-11",
    "score": 50,
    "studentId": "std-class-7g-11",
    "updatedAt": "2026-10-14T13:41:27.727Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-04",
    "score": 37,
    "studentId": "std-class-7g-04",
    "updatedAt": "2026-10-14T13:42:32.075Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-35",
    "score": 72,
    "studentId": "std-class-7g-35",
    "updatedAt": "2026-10-14T13:44:45.942Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-32",
    "score": 48,
    "studentId": "std-class-7g-32",
    "updatedAt": "2026-10-14T13:46:03.555Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-23",
    "score": 64,
    "studentId": "std-class-7g-23",
    "updatedAt": "2026-10-14T13:47:26.481Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-21",
    "score": 54,
    "studentId": "std-class-7g-21",
    "updatedAt": "2026-10-14T13:48:23.501Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-28",
    "score": 69,
    "studentId": "std-class-7g-28",
    "updatedAt": "2026-10-14T13:50:14.935Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-19",
    "score": 61,
    "studentId": "std-class-7g-19",
    "updatedAt": "2026-10-14T13:51:11.328Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-20",
    "score": 52,
    "studentId": "std-class-7g-20",
    "updatedAt": "2026-10-14T13:54:54.890Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-13",
    "score": 37,
    "studentId": "std-class-7g-13",
    "updatedAt": "2026-10-14T13:56:08.962Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-31",
    "score": 83,
    "studentId": "std-class-7g-31",
    "updatedAt": "2026-10-14T13:57:39.425Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-10",
    "score": 96,
    "studentId": "std-class-7g-10",
    "updatedAt": "2026-10-14T13:58:39.979Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-22",
    "score": 59,
    "studentId": "std-class-7g-22",
    "updatedAt": "2026-10-14T13:59:35.262Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-36",
    "score": 65,
    "studentId": "std-class-7g-36",
    "updatedAt": "2026-10-14T14:07:00.387Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-39",
    "score": 59,
    "studentId": "std-class-7g-39",
    "updatedAt": "2026-10-14T14:08:03.445Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-38",
    "score": 96,
    "studentId": "std-class-7g-38",
    "updatedAt": "2026-10-14T14:09:02.347Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-24",
    "score": 30,
    "studentId": "std-class-7g-24",
    "updatedAt": "2026-10-14T14:10:56.075Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1791983267793-fuanp-std-class-7g-37",
    "score": 77,
    "studentId": "std-class-7g-37",
    "updatedAt": "2026-10-14T14:11:16.910Z",
    "assessmentId": "asmt-1791983267793-fuanp"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-30",
    "score": 34,
    "studentId": "std-class-7c-30",
    "updatedAt": "2026-10-15T12:27:19.582Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-02",
    "score": 37,
    "studentId": "std-class-7c-02",
    "updatedAt": "2026-10-15T12:29:36.425Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-03",
    "score": 49,
    "studentId": "std-class-7c-03",
    "updatedAt": "2026-10-15T12:30:46.770Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-04",
    "score": 75,
    "studentId": "std-class-7c-04",
    "updatedAt": "2026-10-15T12:32:25.145Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-05",
    "score": 68,
    "studentId": "std-class-7c-05",
    "updatedAt": "2026-10-15T12:34:07.649Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-06",
    "score": 52,
    "studentId": "std-class-7c-06",
    "updatedAt": "2026-10-15T12:35:45.550Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-09",
    "score": 63,
    "studentId": "std-class-7c-09",
    "updatedAt": "2026-10-15T12:37:18.256Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-07",
    "score": 39,
    "studentId": "std-class-7c-07",
    "updatedAt": "2026-10-15T12:38:09.349Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-10",
    "score": 46,
    "studentId": "std-class-7c-10",
    "updatedAt": "2026-10-15T12:39:13.105Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-11",
    "score": 94,
    "studentId": "std-class-7c-11",
    "updatedAt": "2026-10-15T12:40:34.036Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-12",
    "score": 69,
    "studentId": "std-class-7c-12",
    "updatedAt": "2026-10-15T12:43:55.448Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-13",
    "score": 49,
    "studentId": "std-class-7c-13",
    "updatedAt": "2026-10-15T12:46:17.704Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-14",
    "score": 71,
    "studentId": "std-class-7c-14",
    "updatedAt": "2026-10-15T12:46:31.810Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-15",
    "score": 41,
    "studentId": "std-class-7c-15",
    "updatedAt": "2026-10-15T12:47:14.461Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-16",
    "score": 64,
    "studentId": "std-class-7c-16",
    "updatedAt": "2026-10-15T12:49:44.489Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-17",
    "score": 45,
    "studentId": "std-class-7c-17",
    "updatedAt": "2026-10-15T12:49:50.122Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-18",
    "score": 68,
    "studentId": "std-class-7c-18",
    "updatedAt": "2026-10-15T12:52:47.700Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-19",
    "score": 44,
    "studentId": "std-class-7c-19",
    "updatedAt": "2026-10-15T12:53:39.718Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-21",
    "score": 68,
    "studentId": "std-class-7c-21",
    "updatedAt": "2026-10-15T12:55:14.138Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-22",
    "score": 68,
    "studentId": "std-class-7c-22",
    "updatedAt": "2026-10-15T12:56:21.622Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-23",
    "score": 45,
    "studentId": "std-class-7c-23",
    "updatedAt": "2026-10-15T12:57:18.676Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-24",
    "score": 42,
    "studentId": "std-class-7c-24",
    "updatedAt": "2026-10-15T12:59:01.075Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-26",
    "score": 26,
    "studentId": "std-class-7c-26",
    "updatedAt": "2026-10-15T13:00:16.415Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-27",
    "score": 65,
    "studentId": "std-class-7c-27",
    "updatedAt": "2026-10-15T13:00:22.311Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-28",
    "score": 79,
    "studentId": "std-class-7c-28",
    "updatedAt": "2026-10-15T13:01:51.261Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-29",
    "score": 50,
    "studentId": "std-class-7c-29",
    "updatedAt": "2026-10-15T13:03:45.287Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-33",
    "score": 62,
    "studentId": "std-class-7c-33",
    "updatedAt": "2026-10-15T13:05:16.726Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-36",
    "score": 28,
    "studentId": "std-class-7c-36",
    "updatedAt": "2026-10-15T13:07:58.923Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-31",
    "score": 71,
    "studentId": "std-class-7c-31",
    "updatedAt": "2026-10-15T13:09:01.569Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-38",
    "score": 36,
    "studentId": "std-class-7c-38",
    "updatedAt": "2026-10-15T13:09:08.655Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-25",
    "score": 36,
    "studentId": "std-class-7c-25",
    "updatedAt": "2026-10-15T13:10:20.367Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-08",
    "score": 21,
    "studentId": "std-class-7c-08",
    "updatedAt": "2026-10-15T13:10:46.977Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-40",
    "score": 24,
    "studentId": "std-class-7c-40",
    "updatedAt": "2026-10-15T13:12:58.375Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-37",
    "score": 67,
    "studentId": "std-class-7c-37",
    "updatedAt": "2026-10-15T13:13:15.317Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-39",
    "score": 61,
    "studentId": "std-class-7c-39",
    "updatedAt": "2026-10-15T13:14:21.709Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792066967824-roghf-std-class-7c-32",
    "score": 35,
    "studentId": "std-class-7c-32",
    "updatedAt": "2026-10-15T13:15:36.746Z",
    "assessmentId": "asmt-1792066967824-roghf"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-01",
    "score": 90,
    "studentId": "std-class-7a-01",
    "updatedAt": "2026-10-16T12:38:38.404Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-02",
    "score": 90,
    "studentId": "std-class-7a-02",
    "updatedAt": "2026-10-16T12:38:38.426Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-03",
    "score": null,
    "studentId": "std-class-7a-03",
    "updatedAt": "2026-10-17T05:13:22.242Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-04",
    "score": 90,
    "studentId": "std-class-7a-04",
    "updatedAt": "2026-10-16T12:38:38.479Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-05",
    "score": 90,
    "studentId": "std-class-7a-05",
    "updatedAt": "2026-10-16T12:38:38.505Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-06",
    "score": null,
    "studentId": "std-class-7a-06",
    "updatedAt": "2026-10-16T12:38:38.530Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-07",
    "score": 90,
    "studentId": "std-class-7a-07",
    "updatedAt": "2026-10-16T12:38:38.560Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-08",
    "score": null,
    "studentId": "std-class-7a-08",
    "updatedAt": "2026-10-16T12:38:38.588Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-09",
    "score": 90,
    "studentId": "std-class-7a-09",
    "updatedAt": "2026-10-16T12:38:38.615Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-10",
    "score": 90,
    "studentId": "std-class-7a-10",
    "updatedAt": "2026-10-16T12:38:38.641Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-11",
    "score": 90,
    "studentId": "std-class-7a-11",
    "updatedAt": "2026-10-16T12:38:38.667Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-12",
    "score": 90,
    "studentId": "std-class-7a-12",
    "updatedAt": "2026-10-16T12:38:38.691Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-13",
    "score": 90,
    "studentId": "std-class-7a-13",
    "updatedAt": "2026-10-16T12:38:38.714Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-14",
    "score": 90,
    "studentId": "std-class-7a-14",
    "updatedAt": "2026-10-16T12:38:38.739Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-15",
    "score": null,
    "studentId": "std-class-7a-15",
    "updatedAt": "2026-10-16T12:38:38.767Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-16",
    "score": 90,
    "studentId": "std-class-7a-16",
    "updatedAt": "2026-10-16T12:38:38.795Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-17",
    "score": 90,
    "studentId": "std-class-7a-17",
    "updatedAt": "2026-10-16T12:38:38.841Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-18",
    "score": null,
    "studentId": "std-class-7a-18",
    "updatedAt": "2026-10-16T12:38:38.879Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-19",
    "score": 90,
    "studentId": "std-class-7a-19",
    "updatedAt": "2026-10-16T12:38:38.908Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-20",
    "score": 90,
    "studentId": "std-class-7a-20",
    "updatedAt": "2026-10-16T12:38:38.935Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-21",
    "score": null,
    "studentId": "std-class-7a-21",
    "updatedAt": "2026-10-16T12:38:38.959Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-22",
    "score": 90,
    "studentId": "std-class-7a-22",
    "updatedAt": "2026-10-16T12:38:38.985Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-23",
    "score": 90,
    "studentId": "std-class-7a-23",
    "updatedAt": "2026-10-16T12:38:39.012Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-24",
    "score": 90,
    "studentId": "std-class-7a-24",
    "updatedAt": "2026-10-16T12:38:39.037Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-25",
    "score": 90,
    "studentId": "std-class-7a-25",
    "updatedAt": "2026-10-16T12:38:39.060Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-26",
    "score": 90,
    "studentId": "std-class-7a-26",
    "updatedAt": "2026-10-16T12:38:39.084Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-27",
    "score": 90,
    "studentId": "std-class-7a-27",
    "updatedAt": "2026-10-16T12:38:39.109Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-28",
    "score": 90,
    "studentId": "std-class-7a-28",
    "updatedAt": "2026-10-16T12:38:39.140Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-29",
    "score": 90,
    "studentId": "std-class-7a-29",
    "updatedAt": "2026-10-16T12:38:39.164Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-30",
    "score": 90,
    "studentId": "std-class-7a-30",
    "updatedAt": "2026-10-16T12:38:39.187Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-31",
    "score": 90,
    "studentId": "std-class-7a-31",
    "updatedAt": "2026-10-16T12:38:39.212Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-32",
    "score": 90,
    "studentId": "std-class-7a-32",
    "updatedAt": "2026-10-16T12:38:39.238Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-33",
    "score": 90,
    "studentId": "std-class-7a-33",
    "updatedAt": "2026-10-16T12:38:39.265Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-34",
    "score": null,
    "studentId": "std-class-7a-34",
    "updatedAt": "2026-10-16T12:38:39.290Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-35",
    "score": null,
    "studentId": "std-class-7a-35",
    "updatedAt": "2026-10-16T12:38:39.322Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-36",
    "score": 90,
    "studentId": "std-class-7a-36",
    "updatedAt": "2026-10-16T12:38:39.346Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-37",
    "score": null,
    "studentId": "std-class-7a-37",
    "updatedAt": "2026-10-16T12:38:39.370Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-38",
    "score": 90,
    "studentId": "std-class-7a-38",
    "updatedAt": "2026-10-16T12:38:39.394Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-39",
    "score": 90,
    "studentId": "std-class-7a-39",
    "updatedAt": "2026-10-16T12:38:39.417Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154029876-1dg55-std-class-7a-40",
    "score": 90,
    "studentId": "std-class-7a-40",
    "updatedAt": "2026-10-16T12:38:39.442Z",
    "assessmentId": "asmt-1792154029876-1dg55"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-01",
    "score": 75,
    "studentId": "std-class-7a-01",
    "updatedAt": "2026-10-16T12:50:51.343Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-02",
    "score": 90,
    "studentId": "std-class-7a-02",
    "updatedAt": "2026-10-16T12:50:51.379Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-03",
    "score": 85,
    "studentId": "std-class-7a-03",
    "updatedAt": "2026-10-16T12:50:51.416Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-04",
    "score": 100,
    "studentId": "std-class-7a-04",
    "updatedAt": "2026-10-16T12:50:51.439Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-05",
    "score": 90,
    "studentId": "std-class-7a-05",
    "updatedAt": "2026-10-16T12:50:51.464Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-06",
    "score": null,
    "studentId": "std-class-7a-06",
    "updatedAt": "2026-10-16T12:50:51.489Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-07",
    "score": 70,
    "studentId": "std-class-7a-07",
    "updatedAt": "2026-10-16T12:50:51.515Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-08",
    "score": 100,
    "studentId": "std-class-7a-08",
    "updatedAt": "2026-10-16T12:50:51.544Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-09",
    "score": 85,
    "studentId": "std-class-7a-09",
    "updatedAt": "2026-10-16T12:50:51.572Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-10",
    "score": 100,
    "studentId": "std-class-7a-10",
    "updatedAt": "2026-10-16T12:50:51.597Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-11",
    "score": 85,
    "studentId": "std-class-7a-11",
    "updatedAt": "2026-10-16T12:50:51.623Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-12",
    "score": 85,
    "studentId": "std-class-7a-12",
    "updatedAt": "2026-10-16T12:50:51.649Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-13",
    "score": 90,
    "studentId": "std-class-7a-13",
    "updatedAt": "2026-10-16T12:50:51.676Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-14",
    "score": null,
    "studentId": "std-class-7a-14",
    "updatedAt": "2026-10-16T12:50:51.703Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-15",
    "score": null,
    "studentId": "std-class-7a-15",
    "updatedAt": "2026-10-16T12:50:51.726Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-16",
    "score": 80,
    "studentId": "std-class-7a-16",
    "updatedAt": "2026-10-16T12:50:51.757Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-17",
    "score": 100,
    "studentId": "std-class-7a-17",
    "updatedAt": "2026-10-16T12:50:51.799Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-18",
    "score": null,
    "studentId": "std-class-7a-18",
    "updatedAt": "2026-10-16T12:50:51.823Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-19",
    "score": 100,
    "studentId": "std-class-7a-19",
    "updatedAt": "2026-10-16T12:50:51.845Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-20",
    "score": 80,
    "studentId": "std-class-7a-20",
    "updatedAt": "2026-10-16T12:50:51.868Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-21",
    "score": 90,
    "studentId": "std-class-7a-21",
    "updatedAt": "2026-10-16T12:50:51.894Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-22",
    "score": 90,
    "studentId": "std-class-7a-22",
    "updatedAt": "2026-10-16T12:50:51.920Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-23",
    "score": 80,
    "studentId": "std-class-7a-23",
    "updatedAt": "2026-10-16T12:50:51.946Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-24",
    "score": 75,
    "studentId": "std-class-7a-24",
    "updatedAt": "2026-10-16T12:50:51.970Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-25",
    "score": 80,
    "studentId": "std-class-7a-25",
    "updatedAt": "2026-10-16T12:50:51.999Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-26",
    "score": 80,
    "studentId": "std-class-7a-26",
    "updatedAt": "2026-10-16T12:50:52.026Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-27",
    "score": 80,
    "studentId": "std-class-7a-27",
    "updatedAt": "2026-10-16T12:50:52.052Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-28",
    "score": 80,
    "studentId": "std-class-7a-28",
    "updatedAt": "2026-10-16T12:50:52.083Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-29",
    "score": 100,
    "studentId": "std-class-7a-29",
    "updatedAt": "2026-10-16T12:50:52.107Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-30",
    "score": 80,
    "studentId": "std-class-7a-30",
    "updatedAt": "2026-10-16T12:50:52.135Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-31",
    "score": 100,
    "studentId": "std-class-7a-31",
    "updatedAt": "2026-10-16T12:50:52.175Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-32",
    "score": 90,
    "studentId": "std-class-7a-32",
    "updatedAt": "2026-10-16T12:50:52.201Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-33",
    "score": 70,
    "studentId": "std-class-7a-33",
    "updatedAt": "2026-10-16T12:50:52.226Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-34",
    "score": 90,
    "studentId": "std-class-7a-34",
    "updatedAt": "2026-10-16T12:50:52.250Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-35",
    "score": 100,
    "studentId": "std-class-7a-35",
    "updatedAt": "2026-10-16T12:50:52.277Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-36",
    "score": 70,
    "studentId": "std-class-7a-36",
    "updatedAt": "2026-10-16T12:50:52.303Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-37",
    "score": 100,
    "studentId": "std-class-7a-37",
    "updatedAt": "2026-10-16T12:50:52.327Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-38",
    "score": 80,
    "studentId": "std-class-7a-38",
    "updatedAt": "2026-10-16T12:50:52.358Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-39",
    "score": 80,
    "studentId": "std-class-7a-39",
    "updatedAt": "2026-10-16T12:50:52.381Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792154844794-dssbs-std-class-7a-40",
    "score": 90,
    "studentId": "std-class-7a-40",
    "updatedAt": "2026-10-16T12:50:52.404Z",
    "assessmentId": "asmt-1792154844794-dssbs"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-01",
    "score": 100,
    "studentId": "std-class-7a-01",
    "updatedAt": "2026-10-16T12:53:43.199Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-02",
    "score": 100,
    "studentId": "std-class-7a-02",
    "updatedAt": "2026-10-16T12:53:43.230Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-03",
    "score": 100,
    "studentId": "std-class-7a-03",
    "updatedAt": "2026-10-16T12:53:43.254Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-04",
    "score": null,
    "studentId": "std-class-7a-04",
    "updatedAt": "2026-10-16T12:53:43.277Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-05",
    "score": 100,
    "studentId": "std-class-7a-05",
    "updatedAt": "2026-10-16T12:53:43.313Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-06",
    "score": null,
    "studentId": "std-class-7a-06",
    "updatedAt": "2026-10-16T12:53:43.337Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-07",
    "score": 70,
    "studentId": "std-class-7a-07",
    "updatedAt": "2026-10-16T12:53:43.362Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-08",
    "score": null,
    "studentId": "std-class-7a-08",
    "updatedAt": "2026-10-16T12:53:43.391Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-09",
    "score": 100,
    "studentId": "std-class-7a-09",
    "updatedAt": "2026-10-16T12:53:43.414Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-10",
    "score": 100,
    "studentId": "std-class-7a-10",
    "updatedAt": "2026-10-16T12:53:43.450Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-11",
    "score": 100,
    "studentId": "std-class-7a-11",
    "updatedAt": "2026-10-16T12:53:43.474Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-12",
    "score": 100,
    "studentId": "std-class-7a-12",
    "updatedAt": "2026-10-16T12:53:43.496Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-13",
    "score": 100,
    "studentId": "std-class-7a-13",
    "updatedAt": "2026-10-16T12:53:43.522Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-14",
    "score": 100,
    "studentId": "std-class-7a-14",
    "updatedAt": "2026-10-16T12:53:43.546Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-15",
    "score": null,
    "studentId": "std-class-7a-15",
    "updatedAt": "2026-10-16T12:53:43.574Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-16",
    "score": 80,
    "studentId": "std-class-7a-16",
    "updatedAt": "2026-10-16T12:53:43.601Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-17",
    "score": 100,
    "studentId": "std-class-7a-17",
    "updatedAt": "2026-10-16T12:53:43.628Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-18",
    "score": null,
    "studentId": "std-class-7a-18",
    "updatedAt": "2026-10-16T12:53:43.656Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-19",
    "score": 90,
    "studentId": "std-class-7a-19",
    "updatedAt": "2026-10-16T12:53:43.684Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-20",
    "score": 70,
    "studentId": "std-class-7a-20",
    "updatedAt": "2026-10-16T12:53:43.719Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-21",
    "score": 70,
    "studentId": "std-class-7a-21",
    "updatedAt": "2026-10-16T12:53:43.752Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-22",
    "score": null,
    "studentId": "std-class-7a-22",
    "updatedAt": "2026-10-16T12:53:43.786Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-23",
    "score": 70,
    "studentId": "std-class-7a-23",
    "updatedAt": "2026-10-16T12:53:43.815Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-24",
    "score": 100,
    "studentId": "std-class-7a-24",
    "updatedAt": "2026-10-16T12:53:43.849Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-25",
    "score": 75,
    "studentId": "std-class-7a-25",
    "updatedAt": "2026-10-16T12:53:43.880Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-26",
    "score": 100,
    "studentId": "std-class-7a-26",
    "updatedAt": "2026-10-16T12:53:43.909Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-27",
    "score": 100,
    "studentId": "std-class-7a-27",
    "updatedAt": "2026-10-16T12:53:43.957Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-28",
    "score": 90,
    "studentId": "std-class-7a-28",
    "updatedAt": "2026-10-16T12:53:43.987Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-29",
    "score": 100,
    "studentId": "std-class-7a-29",
    "updatedAt": "2026-10-16T12:53:44.013Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-30",
    "score": 70,
    "studentId": "std-class-7a-30",
    "updatedAt": "2026-10-16T12:53:44.039Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-31",
    "score": 100,
    "studentId": "std-class-7a-31",
    "updatedAt": "2026-10-16T12:53:44.063Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-32",
    "score": null,
    "studentId": "std-class-7a-32",
    "updatedAt": "2026-10-16T12:53:44.088Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-33",
    "score": 100,
    "studentId": "std-class-7a-33",
    "updatedAt": "2026-10-16T12:53:44.112Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-34",
    "score": 100,
    "studentId": "std-class-7a-34",
    "updatedAt": "2026-10-16T12:53:44.144Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-35",
    "score": 100,
    "studentId": "std-class-7a-35",
    "updatedAt": "2026-10-16T12:53:44.170Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-36",
    "score": 85,
    "studentId": "std-class-7a-36",
    "updatedAt": "2026-10-16T12:53:44.194Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-37",
    "score": 70,
    "studentId": "std-class-7a-37",
    "updatedAt": "2026-10-16T12:53:44.219Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-38",
    "score": 90,
    "studentId": "std-class-7a-38",
    "updatedAt": "2026-10-16T12:53:44.247Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-39",
    "score": 100,
    "studentId": "std-class-7a-39",
    "updatedAt": "2026-10-16T12:53:44.274Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792155115145-ef23h-std-class-7a-40",
    "score": 100,
    "studentId": "std-class-7a-40",
    "updatedAt": "2026-10-16T12:53:44.302Z",
    "assessmentId": "asmt-1792155115145-ef23h"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-01",
    "score": 82,
    "studentId": "std-class-7a-01",
    "updatedAt": "2026-10-16T14:14:55.206Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-02",
    "score": 82,
    "studentId": "std-class-7a-02",
    "updatedAt": "2026-10-16T14:14:55.227Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-03",
    "score": 82,
    "studentId": "std-class-7a-03",
    "updatedAt": "2026-10-16T14:14:55.250Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-04",
    "score": 82,
    "studentId": "std-class-7a-04",
    "updatedAt": "2026-10-16T14:14:55.269Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-05",
    "score": 82,
    "studentId": "std-class-7a-05",
    "updatedAt": "2026-10-16T14:14:55.293Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-06",
    "score": null,
    "studentId": "std-class-7a-06",
    "updatedAt": "2026-10-16T14:15:05.929Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-07",
    "score": 82,
    "studentId": "std-class-7a-07",
    "updatedAt": "2026-10-16T14:14:55.341Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-08",
    "score": 82,
    "studentId": "std-class-7a-08",
    "updatedAt": "2026-10-16T14:14:55.366Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-09",
    "score": 82,
    "studentId": "std-class-7a-09",
    "updatedAt": "2026-10-16T14:14:55.386Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-10",
    "score": 82,
    "studentId": "std-class-7a-10",
    "updatedAt": "2026-10-16T14:14:55.407Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-11",
    "score": null,
    "studentId": "std-class-7a-11",
    "updatedAt": "2026-10-16T14:15:10.621Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-12",
    "score": 82,
    "studentId": "std-class-7a-12",
    "updatedAt": "2026-10-16T14:14:55.451Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-13",
    "score": 82,
    "studentId": "std-class-7a-13",
    "updatedAt": "2026-10-16T14:14:55.474Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-14",
    "score": 82,
    "studentId": "std-class-7a-14",
    "updatedAt": "2026-10-16T14:14:55.496Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-15",
    "score": 82,
    "studentId": "std-class-7a-15",
    "updatedAt": "2026-10-16T14:14:55.517Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-16",
    "score": 82,
    "studentId": "std-class-7a-16",
    "updatedAt": "2026-10-16T14:14:55.539Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-17",
    "score": 82,
    "studentId": "std-class-7a-17",
    "updatedAt": "2026-10-16T14:14:55.574Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-18",
    "score": 82,
    "studentId": "std-class-7a-18",
    "updatedAt": "2026-10-16T14:14:55.595Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-19",
    "score": 82,
    "studentId": "std-class-7a-19",
    "updatedAt": "2026-10-16T14:14:55.616Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-20",
    "score": 82,
    "studentId": "std-class-7a-20",
    "updatedAt": "2026-10-16T14:14:55.638Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-21",
    "score": 82,
    "studentId": "std-class-7a-21",
    "updatedAt": "2026-10-16T14:14:55.661Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-22",
    "score": 82,
    "studentId": "std-class-7a-22",
    "updatedAt": "2026-10-16T14:14:55.684Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-23",
    "score": 82,
    "studentId": "std-class-7a-23",
    "updatedAt": "2026-10-16T14:14:55.705Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-24",
    "score": 82,
    "studentId": "std-class-7a-24",
    "updatedAt": "2026-10-16T14:14:55.729Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-25",
    "score": null,
    "studentId": "std-class-7a-25",
    "updatedAt": "2026-10-16T14:15:21.246Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-26",
    "score": 82,
    "studentId": "std-class-7a-26",
    "updatedAt": "2026-10-16T14:14:55.775Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-27",
    "score": 82,
    "studentId": "std-class-7a-27",
    "updatedAt": "2026-10-16T14:14:55.796Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-28",
    "score": 82,
    "studentId": "std-class-7a-28",
    "updatedAt": "2026-10-16T14:14:55.818Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-29",
    "score": 82,
    "studentId": "std-class-7a-29",
    "updatedAt": "2026-10-16T14:14:55.845Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-30",
    "score": 82,
    "studentId": "std-class-7a-30",
    "updatedAt": "2026-10-16T14:14:55.866Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-31",
    "score": 82,
    "studentId": "std-class-7a-31",
    "updatedAt": "2026-10-16T14:14:55.886Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-32",
    "score": 82,
    "studentId": "std-class-7a-32",
    "updatedAt": "2026-10-16T14:14:55.908Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-33",
    "score": 82,
    "studentId": "std-class-7a-33",
    "updatedAt": "2026-10-16T14:14:55.929Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-34",
    "score": 82,
    "studentId": "std-class-7a-34",
    "updatedAt": "2026-10-16T14:14:55.953Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-35",
    "score": 82,
    "studentId": "std-class-7a-35",
    "updatedAt": "2026-10-16T14:14:55.976Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-36",
    "score": 82,
    "studentId": "std-class-7a-36",
    "updatedAt": "2026-10-16T14:14:55.999Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-37",
    "score": 82,
    "studentId": "std-class-7a-37",
    "updatedAt": "2026-10-16T14:14:56.021Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-38",
    "score": 82,
    "studentId": "std-class-7a-38",
    "updatedAt": "2026-10-16T14:14:56.041Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-39",
    "score": 82,
    "studentId": "std-class-7a-39",
    "updatedAt": "2026-10-16T14:14:56.065Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-1792159899592-qwmn3-std-class-7a-40",
    "score": 82,
    "studentId": "std-class-7a-40",
    "updatedAt": "2026-10-16T14:14:56.086Z",
    "assessmentId": "asmt-1792159899592-qwmn3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-01",
    "score": 90,
    "studentId": "std-class-7b-01",
    "updatedAt": "2026-10-16T14:29:43.661Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-02",
    "score": 90,
    "studentId": "std-class-7b-02",
    "updatedAt": "2026-10-16T14:29:43.684Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-03",
    "score": 90,
    "studentId": "std-class-7b-03",
    "updatedAt": "2026-10-16T14:29:43.713Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-04",
    "score": 90,
    "studentId": "std-class-7b-04",
    "updatedAt": "2026-10-16T14:29:43.738Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-05",
    "score": 90,
    "studentId": "std-class-7b-05",
    "updatedAt": "2026-10-16T14:29:43.762Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-06",
    "score": 90,
    "studentId": "std-class-7b-06",
    "updatedAt": "2026-10-16T14:29:43.786Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-07",
    "score": 90,
    "studentId": "std-class-7b-07",
    "updatedAt": "2026-10-16T14:29:43.812Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-08",
    "score": 90,
    "studentId": "std-class-7b-08",
    "updatedAt": "2026-10-16T14:29:43.837Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-09",
    "score": 90,
    "studentId": "std-class-7b-09",
    "updatedAt": "2026-10-16T14:29:43.863Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-10",
    "score": 90,
    "studentId": "std-class-7b-10",
    "updatedAt": "2026-10-16T14:29:43.890Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-11",
    "score": 90,
    "studentId": "std-class-7b-11",
    "updatedAt": "2026-10-16T14:29:43.917Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-12",
    "score": 90,
    "studentId": "std-class-7b-12",
    "updatedAt": "2026-10-16T14:29:43.942Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-13",
    "score": 90,
    "studentId": "std-class-7b-13",
    "updatedAt": "2026-10-16T14:29:43.969Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-14",
    "score": 90,
    "studentId": "std-class-7b-14",
    "updatedAt": "2026-10-16T14:29:43.995Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-15",
    "score": 90,
    "studentId": "std-class-7b-15",
    "updatedAt": "2026-10-16T14:29:44.018Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-16",
    "score": 90,
    "studentId": "std-class-7b-16",
    "updatedAt": "2026-10-16T14:29:44.047Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-17",
    "score": 90,
    "studentId": "std-class-7b-17",
    "updatedAt": "2026-10-16T14:29:44.070Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-18",
    "score": 90,
    "studentId": "std-class-7b-18",
    "updatedAt": "2026-10-16T14:29:44.101Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-19",
    "score": 90,
    "studentId": "std-class-7b-19",
    "updatedAt": "2026-10-16T14:29:44.126Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-20",
    "score": 90,
    "studentId": "std-class-7b-20",
    "updatedAt": "2026-10-16T14:29:44.150Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-21",
    "score": 90,
    "studentId": "std-class-7b-21",
    "updatedAt": "2026-10-16T14:29:44.174Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-22",
    "score": 90,
    "studentId": "std-class-7b-22",
    "updatedAt": "2026-10-16T14:29:44.199Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-23",
    "score": 90,
    "studentId": "std-class-7b-23",
    "updatedAt": "2026-10-16T14:29:44.222Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-24",
    "score": 90,
    "studentId": "std-class-7b-24",
    "updatedAt": "2026-10-16T14:29:44.245Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-25",
    "score": 90,
    "studentId": "std-class-7b-25",
    "updatedAt": "2026-10-16T14:29:44.269Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-26",
    "score": 90,
    "studentId": "std-class-7b-26",
    "updatedAt": "2026-10-16T14:29:44.291Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-27",
    "score": 90,
    "studentId": "std-class-7b-27",
    "updatedAt": "2026-10-16T14:29:44.318Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-28",
    "score": 90,
    "studentId": "std-class-7b-28",
    "updatedAt": "2026-10-16T14:29:44.342Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-29",
    "score": 90,
    "studentId": "std-class-7b-29",
    "updatedAt": "2026-10-16T14:29:44.366Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-30",
    "score": 90,
    "studentId": "std-class-7b-30",
    "updatedAt": "2026-10-16T14:29:44.389Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-31",
    "score": 90,
    "studentId": "std-class-7b-31",
    "updatedAt": "2026-10-16T14:29:44.412Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-32",
    "score": 90,
    "studentId": "std-class-7b-32",
    "updatedAt": "2026-10-16T14:29:44.434Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-33",
    "score": 90,
    "studentId": "std-class-7b-33",
    "updatedAt": "2026-10-16T14:29:44.457Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-34",
    "score": 90,
    "studentId": "std-class-7b-34",
    "updatedAt": "2026-10-16T14:29:44.485Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-35",
    "score": 90,
    "studentId": "std-class-7b-35",
    "updatedAt": "2026-10-16T14:29:44.507Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-36",
    "score": 90,
    "studentId": "std-class-7b-36",
    "updatedAt": "2026-10-16T14:29:44.530Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-37",
    "score": 90,
    "studentId": "std-class-7b-37",
    "updatedAt": "2026-10-16T14:29:44.552Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-38",
    "score": 90,
    "studentId": "std-class-7b-38",
    "updatedAt": "2026-10-16T14:29:44.573Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-39",
    "score": 90,
    "studentId": "std-class-7b-39",
    "updatedAt": "2026-10-16T14:29:44.596Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-1-std-class-7b-40",
    "score": 90,
    "studentId": "std-class-7b-40",
    "updatedAt": "2026-10-16T14:29:44.618Z",
    "assessmentId": "asmt-class-7b-tugas-1"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-01",
    "score": 98,
    "studentId": "std-class-7b-01",
    "updatedAt": "2026-10-16T14:33:10.781Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-02",
    "score": 98,
    "studentId": "std-class-7b-02",
    "updatedAt": "2026-10-16T14:33:10.801Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-03",
    "score": 75,
    "studentId": "std-class-7b-03",
    "updatedAt": "2026-10-16T14:33:10.825Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-04",
    "score": 100,
    "studentId": "std-class-7b-04",
    "updatedAt": "2026-10-16T14:33:10.848Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-05",
    "score": 75,
    "studentId": "std-class-7b-05",
    "updatedAt": "2026-10-16T14:33:10.872Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-06",
    "score": 95,
    "studentId": "std-class-7b-06",
    "updatedAt": "2026-10-16T14:33:10.911Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-07",
    "score": 80,
    "studentId": "std-class-7b-07",
    "updatedAt": "2026-10-16T14:33:10.939Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-08",
    "score": 90,
    "studentId": "std-class-7b-08",
    "updatedAt": "2026-10-16T14:33:10.961Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-09",
    "score": 100,
    "studentId": "std-class-7b-09",
    "updatedAt": "2026-10-16T14:33:10.984Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-10",
    "score": 90,
    "studentId": "std-class-7b-10",
    "updatedAt": "2026-10-16T14:33:11.007Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-11",
    "score": 90,
    "studentId": "std-class-7b-11",
    "updatedAt": "2026-10-16T14:33:11.032Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-12",
    "score": 80,
    "studentId": "std-class-7b-12",
    "updatedAt": "2026-10-16T14:33:11.057Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-13",
    "score": 80,
    "studentId": "std-class-7b-13",
    "updatedAt": "2026-10-16T14:33:11.083Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-14",
    "score": 100,
    "studentId": "std-class-7b-14",
    "updatedAt": "2026-10-16T14:33:11.107Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-15",
    "score": 80,
    "studentId": "std-class-7b-15",
    "updatedAt": "2026-10-16T14:33:11.130Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-16",
    "score": 75,
    "studentId": "std-class-7b-16",
    "updatedAt": "2026-10-16T14:33:11.155Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-17",
    "score": 80,
    "studentId": "std-class-7b-17",
    "updatedAt": "2026-10-16T14:33:11.177Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-18",
    "score": 95,
    "studentId": "std-class-7b-18",
    "updatedAt": "2026-10-16T14:33:11.205Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-19",
    "score": 80,
    "studentId": "std-class-7b-19",
    "updatedAt": "2026-10-16T14:33:11.226Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-20",
    "score": 75,
    "studentId": "std-class-7b-20",
    "updatedAt": "2026-10-16T14:33:11.249Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-21",
    "score": 80,
    "studentId": "std-class-7b-21",
    "updatedAt": "2026-10-16T14:33:11.274Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-22",
    "score": 85,
    "studentId": "std-class-7b-22",
    "updatedAt": "2026-10-16T14:33:11.304Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-23",
    "score": 95,
    "studentId": "std-class-7b-23",
    "updatedAt": "2026-10-16T14:33:11.343Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-24",
    "score": 98,
    "studentId": "std-class-7b-24",
    "updatedAt": "2026-10-16T14:33:11.366Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-25",
    "score": 95,
    "studentId": "std-class-7b-25",
    "updatedAt": "2026-10-16T14:33:11.388Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-26",
    "score": 95,
    "studentId": "std-class-7b-26",
    "updatedAt": "2026-10-16T14:33:11.411Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-27",
    "score": 80,
    "studentId": "std-class-7b-27",
    "updatedAt": "2026-10-16T14:33:11.432Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-28",
    "score": 80,
    "studentId": "std-class-7b-28",
    "updatedAt": "2026-10-16T14:33:11.455Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-29",
    "score": 85,
    "studentId": "std-class-7b-29",
    "updatedAt": "2026-10-16T14:33:11.478Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-30",
    "score": 100,
    "studentId": "std-class-7b-30",
    "updatedAt": "2026-10-16T14:33:11.499Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-31",
    "score": 98,
    "studentId": "std-class-7b-31",
    "updatedAt": "2026-10-16T14:33:11.521Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-32",
    "score": 95,
    "studentId": "std-class-7b-32",
    "updatedAt": "2026-10-16T14:33:11.546Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-33",
    "score": 100,
    "studentId": "std-class-7b-33",
    "updatedAt": "2026-10-16T14:33:11.569Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-34",
    "score": 80,
    "studentId": "std-class-7b-34",
    "updatedAt": "2026-10-16T14:33:11.592Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-35",
    "score": 90,
    "studentId": "std-class-7b-35",
    "updatedAt": "2026-10-16T14:33:11.615Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-36",
    "score": 80,
    "studentId": "std-class-7b-36",
    "updatedAt": "2026-10-16T14:33:11.638Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-37",
    "score": 100,
    "studentId": "std-class-7b-37",
    "updatedAt": "2026-10-16T14:33:11.662Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-38",
    "score": 95,
    "studentId": "std-class-7b-38",
    "updatedAt": "2026-10-16T14:33:11.692Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-39",
    "score": 95,
    "studentId": "std-class-7b-39",
    "updatedAt": "2026-10-16T14:33:11.714Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-2-std-class-7b-40",
    "score": 80,
    "studentId": "std-class-7b-40",
    "updatedAt": "2026-10-16T14:33:11.736Z",
    "assessmentId": "asmt-class-7b-tugas-2"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-01",
    "score": null,
    "studentId": "std-class-7b-01",
    "updatedAt": "2026-10-16T14:34:19.571Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-02",
    "score": 80,
    "studentId": "std-class-7b-02",
    "updatedAt": "2026-10-16T14:34:19.591Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-03",
    "score": 75,
    "studentId": "std-class-7b-03",
    "updatedAt": "2026-10-16T14:34:19.618Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-04",
    "score": 70,
    "studentId": "std-class-7b-04",
    "updatedAt": "2026-10-16T14:34:19.640Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-05",
    "score": 100,
    "studentId": "std-class-7b-05",
    "updatedAt": "2026-10-16T14:34:19.663Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-06",
    "score": 70,
    "studentId": "std-class-7b-06",
    "updatedAt": "2026-10-16T14:34:19.686Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-07",
    "score": 70,
    "studentId": "std-class-7b-07",
    "updatedAt": "2026-10-16T14:34:19.708Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-08",
    "score": 70,
    "studentId": "std-class-7b-08",
    "updatedAt": "2026-10-16T14:34:19.736Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-09",
    "score": 100,
    "studentId": "std-class-7b-09",
    "updatedAt": "2026-10-16T14:34:19.767Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-10",
    "score": 80,
    "studentId": "std-class-7b-10",
    "updatedAt": "2026-10-16T14:34:19.798Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-11",
    "score": 80,
    "studentId": "std-class-7b-11",
    "updatedAt": "2026-10-16T14:34:19.833Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-12",
    "score": 82,
    "studentId": "std-class-7b-12",
    "updatedAt": "2026-10-16T14:34:19.858Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-13",
    "score": 70,
    "studentId": "std-class-7b-13",
    "updatedAt": "2026-10-16T14:34:19.883Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-14",
    "score": 70,
    "studentId": "std-class-7b-14",
    "updatedAt": "2026-10-16T14:34:19.906Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-15",
    "score": null,
    "studentId": "std-class-7b-15",
    "updatedAt": "2026-10-16T14:34:19.930Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-16",
    "score": null,
    "studentId": "std-class-7b-16",
    "updatedAt": "2026-10-16T14:34:19.960Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-17",
    "score": 100,
    "studentId": "std-class-7b-17",
    "updatedAt": "2026-10-16T14:34:19.983Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-18",
    "score": 70,
    "studentId": "std-class-7b-18",
    "updatedAt": "2026-10-16T14:34:20.014Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-19",
    "score": 70,
    "studentId": "std-class-7b-19",
    "updatedAt": "2026-10-16T14:34:20.038Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-20",
    "score": 70,
    "studentId": "std-class-7b-20",
    "updatedAt": "2026-10-16T14:34:20.059Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-21",
    "score": null,
    "studentId": "std-class-7b-21",
    "updatedAt": "2026-10-16T14:34:20.081Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-22",
    "score": 70,
    "studentId": "std-class-7b-22",
    "updatedAt": "2026-10-16T14:34:20.104Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-23",
    "score": 80,
    "studentId": "std-class-7b-23",
    "updatedAt": "2026-10-16T14:34:20.128Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-24",
    "score": null,
    "studentId": "std-class-7b-24",
    "updatedAt": "2026-10-16T14:34:20.151Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-25",
    "score": 70,
    "studentId": "std-class-7b-25",
    "updatedAt": "2026-10-16T14:34:20.173Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-26",
    "score": 70,
    "studentId": "std-class-7b-26",
    "updatedAt": "2026-10-16T14:34:20.198Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-27",
    "score": 90,
    "studentId": "std-class-7b-27",
    "updatedAt": "2026-10-16T14:34:20.224Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-28",
    "score": 70,
    "studentId": "std-class-7b-28",
    "updatedAt": "2026-10-16T14:34:20.253Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-29",
    "score": 100,
    "studentId": "std-class-7b-29",
    "updatedAt": "2026-10-16T14:34:20.293Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-30",
    "score": 80,
    "studentId": "std-class-7b-30",
    "updatedAt": "2026-10-16T14:34:20.323Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-31",
    "score": 95,
    "studentId": "std-class-7b-31",
    "updatedAt": "2026-10-16T14:34:20.351Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-32",
    "score": 100,
    "studentId": "std-class-7b-32",
    "updatedAt": "2026-10-16T14:34:20.379Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-33",
    "score": 70,
    "studentId": "std-class-7b-33",
    "updatedAt": "2026-10-16T14:34:20.409Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-34",
    "score": 90,
    "studentId": "std-class-7b-34",
    "updatedAt": "2026-10-16T14:34:20.432Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-35",
    "score": 70,
    "studentId": "std-class-7b-35",
    "updatedAt": "2026-10-16T14:34:20.454Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-36",
    "score": 100,
    "studentId": "std-class-7b-36",
    "updatedAt": "2026-10-16T14:34:20.476Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-37",
    "score": 85,
    "studentId": "std-class-7b-37",
    "updatedAt": "2026-10-16T14:34:20.498Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-38",
    "score": 85,
    "studentId": "std-class-7b-38",
    "updatedAt": "2026-10-16T14:34:20.521Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-39",
    "score": 80,
    "studentId": "std-class-7b-39",
    "updatedAt": "2026-10-16T14:34:20.543Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-tugas-3-std-class-7b-40",
    "score": 85,
    "studentId": "std-class-7b-40",
    "updatedAt": "2026-10-16T14:34:20.572Z",
    "assessmentId": "asmt-class-7b-tugas-3"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-01",
    "score": null,
    "studentId": "std-class-7b-01",
    "updatedAt": "2026-10-16T14:35:50.887Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-02",
    "score": 82,
    "studentId": "std-class-7b-02",
    "updatedAt": "2026-10-16T14:35:36.175Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-03",
    "score": 82,
    "studentId": "std-class-7b-03",
    "updatedAt": "2026-10-16T14:35:36.200Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-04",
    "score": 82,
    "studentId": "std-class-7b-04",
    "updatedAt": "2026-10-16T14:35:36.226Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-05",
    "score": 82,
    "studentId": "std-class-7b-05",
    "updatedAt": "2026-10-16T14:35:36.254Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-06",
    "score": 82,
    "studentId": "std-class-7b-06",
    "updatedAt": "2026-10-16T14:35:36.283Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-07",
    "score": 82,
    "studentId": "std-class-7b-07",
    "updatedAt": "2026-10-16T14:35:36.310Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-08",
    "score": 82,
    "studentId": "std-class-7b-08",
    "updatedAt": "2026-10-16T14:35:36.338Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-09",
    "score": null,
    "studentId": "std-class-7b-09",
    "updatedAt": "2026-10-16T14:36:00.110Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-10",
    "score": 82,
    "studentId": "std-class-7b-10",
    "updatedAt": "2026-10-16T14:35:36.395Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-11",
    "score": 82,
    "studentId": "std-class-7b-11",
    "updatedAt": "2026-10-16T14:35:36.419Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-12",
    "score": 82,
    "studentId": "std-class-7b-12",
    "updatedAt": "2026-10-16T14:35:36.449Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-13",
    "score": 82,
    "studentId": "std-class-7b-13",
    "updatedAt": "2026-10-16T14:35:36.476Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-14",
    "score": 82,
    "studentId": "std-class-7b-14",
    "updatedAt": "2026-10-16T14:35:36.505Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-15",
    "score": 82,
    "studentId": "std-class-7b-15",
    "updatedAt": "2026-10-16T14:35:36.541Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-16",
    "score": null,
    "studentId": "std-class-7b-16",
    "updatedAt": "2026-10-16T14:36:09.118Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-17",
    "score": 82,
    "studentId": "std-class-7b-17",
    "updatedAt": "2026-10-16T14:35:36.600Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-18",
    "score": 82,
    "studentId": "std-class-7b-18",
    "updatedAt": "2026-10-16T14:35:36.626Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-19",
    "score": 82,
    "studentId": "std-class-7b-19",
    "updatedAt": "2026-10-16T14:35:36.657Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-20",
    "score": 82,
    "studentId": "std-class-7b-20",
    "updatedAt": "2026-10-16T14:35:36.685Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-21",
    "score": null,
    "studentId": "std-class-7b-21",
    "updatedAt": "2026-10-16T14:36:18.953Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-22",
    "score": 82,
    "studentId": "std-class-7b-22",
    "updatedAt": "2026-10-16T14:35:36.745Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-23",
    "score": 82,
    "studentId": "std-class-7b-23",
    "updatedAt": "2026-10-16T14:35:36.776Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-24",
    "score": 82,
    "studentId": "std-class-7b-24",
    "updatedAt": "2026-10-16T14:35:36.802Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-25",
    "score": 82,
    "studentId": "std-class-7b-25",
    "updatedAt": "2026-10-16T14:35:36.830Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-26",
    "score": 82,
    "studentId": "std-class-7b-26",
    "updatedAt": "2026-10-16T14:35:36.859Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-27",
    "score": 82,
    "studentId": "std-class-7b-27",
    "updatedAt": "2026-10-16T14:35:36.887Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-28",
    "score": 82,
    "studentId": "std-class-7b-28",
    "updatedAt": "2026-10-16T14:35:36.918Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-29",
    "score": 82,
    "studentId": "std-class-7b-29",
    "updatedAt": "2026-10-16T14:35:36.947Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-30",
    "score": 82,
    "studentId": "std-class-7b-30",
    "updatedAt": "2026-10-16T14:35:36.979Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-31",
    "score": null,
    "studentId": "std-class-7b-31",
    "updatedAt": "2026-10-16T14:36:28.713Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-32",
    "score": 82,
    "studentId": "std-class-7b-32",
    "updatedAt": "2026-10-16T14:35:37.034Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-33",
    "score": 82,
    "studentId": "std-class-7b-33",
    "updatedAt": "2026-10-16T14:35:37.061Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-34",
    "score": 82,
    "studentId": "std-class-7b-34",
    "updatedAt": "2026-10-16T14:35:37.091Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-35",
    "score": 82,
    "studentId": "std-class-7b-35",
    "updatedAt": "2026-10-16T14:35:37.138Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-36",
    "score": 82,
    "studentId": "std-class-7b-36",
    "updatedAt": "2026-10-16T14:35:37.166Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-37",
    "score": 82,
    "studentId": "std-class-7b-37",
    "updatedAt": "2026-10-16T14:35:37.192Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-38",
    "score": 82,
    "studentId": "std-class-7b-38",
    "updatedAt": "2026-10-16T14:35:37.223Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-39",
    "score": 82,
    "studentId": "std-class-7b-39",
    "updatedAt": "2026-10-16T14:35:37.257Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7b-uh-1-std-class-7b-40",
    "score": 82,
    "studentId": "std-class-7b-40",
    "updatedAt": "2026-10-16T14:35:37.284Z",
    "assessmentId": "asmt-class-7b-uh-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-01",
    "score": 90,
    "studentId": "std-class-7c-01",
    "updatedAt": "2026-10-16T14:39:27.568Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-02",
    "score": 90,
    "studentId": "std-class-7c-02",
    "updatedAt": "2026-10-16T14:39:27.587Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-03",
    "score": 90,
    "studentId": "std-class-7c-03",
    "updatedAt": "2026-10-16T14:39:27.613Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-04",
    "score": 90,
    "studentId": "std-class-7c-04",
    "updatedAt": "2026-10-16T14:39:27.642Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-05",
    "score": 90,
    "studentId": "std-class-7c-05",
    "updatedAt": "2026-10-16T14:39:27.673Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-06",
    "score": 90,
    "studentId": "std-class-7c-06",
    "updatedAt": "2026-10-16T14:39:27.702Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-07",
    "score": 90,
    "studentId": "std-class-7c-07",
    "updatedAt": "2026-10-16T14:39:27.732Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-08",
    "score": 90,
    "studentId": "std-class-7c-08",
    "updatedAt": "2026-10-16T14:39:27.762Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-09",
    "score": 90,
    "studentId": "std-class-7c-09",
    "updatedAt": "2026-10-16T14:39:27.789Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-10",
    "score": 90,
    "studentId": "std-class-7c-10",
    "updatedAt": "2026-10-16T14:39:27.816Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-11",
    "score": 90,
    "studentId": "std-class-7c-11",
    "updatedAt": "2026-10-16T14:39:27.840Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-12",
    "score": 90,
    "studentId": "std-class-7c-12",
    "updatedAt": "2026-10-16T14:39:27.868Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-13",
    "score": 90,
    "studentId": "std-class-7c-13",
    "updatedAt": "2026-10-16T14:39:27.899Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-14",
    "score": 90,
    "studentId": "std-class-7c-14",
    "updatedAt": "2026-10-16T14:39:27.929Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-15",
    "score": 90,
    "studentId": "std-class-7c-15",
    "updatedAt": "2026-10-16T14:39:27.958Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-16",
    "score": 90,
    "studentId": "std-class-7c-16",
    "updatedAt": "2026-10-16T14:39:27.990Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-17",
    "score": 90,
    "studentId": "std-class-7c-17",
    "updatedAt": "2026-10-16T14:39:28.016Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-18",
    "score": 90,
    "studentId": "std-class-7c-18",
    "updatedAt": "2026-10-16T14:39:28.051Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-19",
    "score": 90,
    "studentId": "std-class-7c-19",
    "updatedAt": "2026-10-16T14:39:28.091Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-20",
    "score": 90,
    "studentId": "std-class-7c-20",
    "updatedAt": "2026-10-16T14:39:28.120Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-21",
    "score": 90,
    "studentId": "std-class-7c-21",
    "updatedAt": "2026-10-16T14:39:28.148Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-22",
    "score": 90,
    "studentId": "std-class-7c-22",
    "updatedAt": "2026-10-16T14:39:28.176Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-23",
    "score": null,
    "studentId": "std-class-7c-23",
    "updatedAt": "2026-10-16T14:39:28.203Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-24",
    "score": 90,
    "studentId": "std-class-7c-24",
    "updatedAt": "2026-10-16T14:39:28.234Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-25",
    "score": 90,
    "studentId": "std-class-7c-25",
    "updatedAt": "2026-10-16T14:39:28.264Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-26",
    "score": 90,
    "studentId": "std-class-7c-26",
    "updatedAt": "2026-10-16T14:39:28.301Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-27",
    "score": 90,
    "studentId": "std-class-7c-27",
    "updatedAt": "2026-10-16T14:39:28.330Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-28",
    "score": 90,
    "studentId": "std-class-7c-28",
    "updatedAt": "2026-10-16T14:39:28.365Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-29",
    "score": 90,
    "studentId": "std-class-7c-29",
    "updatedAt": "2026-10-16T14:39:28.391Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-30",
    "score": 90,
    "studentId": "std-class-7c-30",
    "updatedAt": "2026-10-16T14:39:28.422Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-31",
    "score": 90,
    "studentId": "std-class-7c-31",
    "updatedAt": "2026-10-16T14:39:28.456Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-32",
    "score": 90,
    "studentId": "std-class-7c-32",
    "updatedAt": "2026-10-16T14:39:28.490Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-33",
    "score": 90,
    "studentId": "std-class-7c-33",
    "updatedAt": "2026-10-16T14:39:28.528Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-34",
    "score": null,
    "studentId": "std-class-7c-34",
    "updatedAt": "2026-10-16T14:39:28.575Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-35",
    "score": 90,
    "studentId": "std-class-7c-35",
    "updatedAt": "2026-10-16T14:39:28.607Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-36",
    "score": 90,
    "studentId": "std-class-7c-36",
    "updatedAt": "2026-10-16T14:39:28.645Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-37",
    "score": 90,
    "studentId": "std-class-7c-37",
    "updatedAt": "2026-10-16T14:39:28.683Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-38",
    "score": 90,
    "studentId": "std-class-7c-38",
    "updatedAt": "2026-10-16T14:39:28.717Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-39",
    "score": 90,
    "studentId": "std-class-7c-39",
    "updatedAt": "2026-10-16T14:39:28.746Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-1-std-class-7c-40",
    "score": 90,
    "studentId": "std-class-7c-40",
    "updatedAt": "2026-10-16T14:39:28.775Z",
    "assessmentId": "asmt-class-7c-tugas-1"
  },
  {
    "id": "scr-asmt-class-7c-tugas-2-std-class-7c-01",
    "score": null,
    "studentId": "std-class-7c-01",
    "updatedAt": "2026-10-16T14:39:33.021Z",
    "assessmentId": "asmt-class-7c-tugas-2"
  }
];
