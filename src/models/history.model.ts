/**
 * History & Evolution Models
 */

export interface HistoryStats {
  totalWorkouts: number; // e.g. 43
  weeklyPace: string; // e.g. "4x"
  activeStreakDays: number; // e.g. 14
  completionRatePercent: number; // e.g. 96
  focusIncreasePercent: number; // e.g. 18
}

export interface CalendarDayStatus {
  dayNumber: number;
  month: number; // 1-12
  year: number;
  dayOfWeek: number; // 0=Dom, 1=Seg, ...
  isCurrentMonth: boolean;
  hasWorkout: boolean;
  workoutCode?: string;
  isRestActive?: boolean;
  isToday?: boolean;
  dateKey: string; // "YYYY-MM-DD"
}

export interface PastExerciseSetDetail {
  setNumber: number;
  reps: string;
  weightKg: number;
}

export interface PastExerciseDetail {
  name: string;
  muscleGroup: string;
  sets: PastExerciseSetDetail[];
}

export interface PastWorkoutLog {
  id: string;
  workoutCode: string;
  title: string;
  dateFormatted: string; // e.g. "Hoje, 27 de Outubro • 07:30"
  dateKey?: string; // "YYYY-MM-DD" e.g. "2026-10-27"
  durationMin: number;
  exerciseCount: number;
  maxStatLabel: string; // e.g. "Carga máx. 24kg" or "Leg press 160kg"
  status: 'Concluído' | 'Parcial';
  feedbackNotes?: string;
  exercises?: PastExerciseDetail[];
}
