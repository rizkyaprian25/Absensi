import { z } from "zod";
import { ScheduleDaySchema, type ScheduleDay } from "./attendance";

// ============================================================================
// SKEMA SLOT JADWAL PELAJARAN (ASC TIMETABLES MATRIX)
// ============================================================================

export const TeacherScheduleSlotSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  subjectId: z.string(),
  subjectName: z.string(),
  classId: z.string(),
  className: z.string(),
  day: ScheduleDaySchema,
  period: z.string(), // Contoh: "Jam Ke 1–3", "Jam Ke 4–5"
  time: z.string(),   // Contoh: "08:00 – 09:45"
});

export type TeacherScheduleSlot = z.infer<typeof TeacherScheduleSlotSchema>;

export interface TeacherWeeklySchedule {
  teacherId: string;
  teacherName: string;
  totalSessions: number;
  byDay: Record<ScheduleDay, TeacherScheduleSlot[]>;
}
