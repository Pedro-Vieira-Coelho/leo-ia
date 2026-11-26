/**
 * Workout and Exercise Models
 */

export interface ExerciseSet {
  setNumber: number;
  repsTarget: string; // e.g. "10-12"
  weightKg: number;
  completed: boolean;
}

export interface ExerciseAlternative {
  name: string;
  reason: string;
  equipment: string;
  focus: string;
}

export interface LeoPostureTip {
  execution: string;
  avoidError: string;
  breathing: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  targetArea: string;
  sets: ExerciseSet[];
  defaultRestSeconds: number;
  leoTip: string;
  postureTip?: LeoPostureTip;
  previousPerformance?: string;
  videoPlaceholderUrl?: string;
  alternatives: ExerciseAlternative[];
  currentAlternativeIndex?: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  /** Indicates that this workout is a generic starter template, not an individualized plan. */
  isTemplate?: boolean;
  code: 'Treino A' | 'Treino B' | 'Treino C' | 'Treino D';
  title: string;
  focusMuscles: string[];
  estimatedDurationMin: number;
  intensity: 'Moderada' | 'Alta' | 'Intensa';
  exercises: Exercise[];
  lastCompletedDate?: string;
  maxWeightLabel?: string;
}
