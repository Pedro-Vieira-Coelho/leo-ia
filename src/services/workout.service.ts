import { Exercise, WorkoutSession } from '../models/workout.model';
import { INITIAL_WORKOUTS } from '../shared/constants';
import { getSupabaseClient } from './supabase.client';

type WorkoutCode = WorkoutSession['code'];

const WORKOUT_CODES: WorkoutCode[] = ['Treino A', 'Treino B', 'Treino C', 'Treino D'];
const LEGACY_STORAGE_PREFIX = 'leo_ia_workouts_state';
const ACTIVE_WORKOUT_PREFIX = 'leo_ia_active_workout_code';

function cloneWorkouts(workouts: WorkoutSession[]): WorkoutSession[] {
  return JSON.parse(JSON.stringify(workouts)) as WorkoutSession[];
}

function isWorkoutSession(value: unknown): value is WorkoutSession {
  if (!value || typeof value !== 'object') return false;
  const workout = value as Partial<WorkoutSession>;
  return (
    typeof workout.code === 'string' &&
    WORKOUT_CODES.includes(workout.code as WorkoutCode) &&
    typeof workout.title === 'string' &&
    Array.isArray(workout.exercises)
  );
}

function mergeInitialExerciseDetails(workout: WorkoutSession): WorkoutSession {
  const initialWorkout = INITIAL_WORKOUTS.find((item) => item.code === workout.code);
  if (!initialWorkout) return workout;

  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => {
      const initialExercise = initialWorkout.exercises.find((item) => item.id === exercise.id);
      if (!initialExercise) return exercise;
      return {
        ...exercise,
        previousPerformance: exercise.previousPerformance || initialExercise.previousPerformance,
        postureTip: exercise.postureTip || initialExercise.postureTip,
      };
    }),
  };
}

function reportSaveError(error: unknown): void {
  const message = error instanceof Error ? error.message : 'Não foi possível salvar seus treinos.';
  window.dispatchEvent(new CustomEvent('app:error', { detail: message }));
}

class WorkoutService {
  private workouts = cloneWorkouts(INITIAL_WORKOUTS);
  private activeWorkoutCode: WorkoutCode = INITIAL_WORKOUTS[0].code;
  private listeners: Array<() => void> = [];
  private userId: string | null = null;
  private isReady = false;
  private scopeVersion = 0;
  private saveQueue: Promise<void> = Promise.resolve();

  public async setUserScope(userId: string | null): Promise<void> {
    const version = ++this.scopeVersion;
    this.userId = userId;
    this.isReady = false;
    this.workouts = cloneWorkouts(INITIAL_WORKOUTS);
    this.activeWorkoutCode = INITIAL_WORKOUTS[0].code;

    if (!userId) {
      this.isReady = true;
      this.notify();
      return;
    }

    await this.saveQueue.catch(() => undefined);
    if (version !== this.scopeVersion) return;

    const legacyStorageKey = `${LEGACY_STORAGE_PREFIX}:${userId}`;
    const activeStorageKey = `${ACTIVE_WORKOUT_PREFIX}:${userId}`;
    const { data, error } = await getSupabaseClient()
      .from('workouts')
      .select('code, payload')
      .eq('user_id', userId);

    if (version !== this.scopeVersion) return;
    if (error) throw new Error(`Não foi possível carregar seus treinos: ${error.message}`);

    const rows = (data ?? []) as Array<{ code: string; payload: unknown }>;
    if (rows.length > 0) {
      const remoteWorkouts = rows.map((row) => {
        if (!isWorkoutSession(row.payload) || row.payload.code !== row.code) {
          throw new Error(`O treino "${row.code}" no Supabase está em um formato inválido.`);
        }
        return row.payload;
      });
      this.workouts = remoteWorkouts.map(mergeInitialExerciseDetails);
    } else {
      const legacyState = localStorage.getItem(legacyStorageKey);
      if (legacyState) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(legacyState);
        } catch {
          throw new Error('O cache local dos treinos está corrompido e não pôde ser migrado.');
        }

        if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isWorkoutSession)) {
          throw new Error('O cache local dos treinos está em um formato inválido e não pôde ser migrado.');
        }
        this.workouts = parsed.map(mergeInitialExerciseDetails);
      }

      await this.persistWorkouts(userId, this.workouts);
      if (version !== this.scopeVersion) return;
      if (legacyState) localStorage.removeItem(legacyStorageKey);
    }

    const storedActiveCode = localStorage.getItem(activeStorageKey);
    if (storedActiveCode && WORKOUT_CODES.includes(storedActiveCode as WorkoutCode)) {
      this.activeWorkoutCode = storedActiveCode as WorkoutCode;
    }

    this.isReady = true;
    this.notify();
  }

  public getWorkouts(): WorkoutSession[] {
    return this.workouts;
  }

  public getActiveWorkout(): WorkoutSession {
    return this.workouts.find((workout) => workout.code === this.activeWorkoutCode) ?? this.workouts[0];
  }

  public setActiveWorkoutCode(code: WorkoutCode): void {
    if (!this.workouts.some((workout) => workout.code === code)) return;
    this.activeWorkoutCode = code;
    if (this.userId) localStorage.setItem(`${ACTIVE_WORKOUT_PREFIX}:${this.userId}`, code);
    this.notify();
  }

  public calculateProgress(workout: WorkoutSession): { completed: number; total: number; percentage: number } {
    const total = workout.exercises.length;
    const completed = workout.exercises.filter((exercise) => exercise.completed).length;
    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }

  public toggleSetCompletion(exerciseId: string, setNumber: number): void {
    this.updateActiveWorkout((workout) => {
      const exercise = workout.exercises.find((item) => item.id === exerciseId);
      const set = exercise?.sets.find((item) => item.setNumber === setNumber);
      if (!exercise || !set) return;
      set.completed = !set.completed;
      exercise.completed = exercise.sets.length > 0 && exercise.sets.every((item) => item.completed);
    });
  }

  public toggleExerciseCompletion(exerciseId: string): void {
    this.updateActiveWorkout((workout) => {
      const exercise = workout.exercises.find((item) => item.id === exerciseId);
      if (!exercise) return;
      exercise.completed = !exercise.completed;
      exercise.sets.forEach((set) => {
        set.completed = exercise.completed;
      });
    });
  }

  public updateSetWeight(exerciseId: string, setNumber: number, weightKg: number): void {
    this.updateActiveWorkout((workout) => {
      const set = workout.exercises
        .find((item) => item.id === exerciseId)
        ?.sets.find((item) => item.setNumber === setNumber);
      if (set) set.weightKg = weightKg;
    });
  }

  public swapWithAlternative(exerciseId: string, alternativeIndex: number): Exercise | null {
    const workout = this.getActiveWorkout();
    const exerciseIndex = workout.exercises.findIndex((item) => item.id === exerciseId);
    if (exerciseIndex === -1) return null;

    const exercise = workout.exercises[exerciseIndex];
    const alternative = exercise.alternatives[alternativeIndex];
    if (!alternative) return null;

    const updatedExercise: Exercise = {
      ...exercise,
      name: alternative.name,
      targetArea: alternative.focus,
      leoTip: `Adaptação LÉO ativada: ${alternative.reason} Equipamento sugerido: ${alternative.equipment}.`,
      currentAlternativeIndex: alternativeIndex,
    };
    workout.exercises[exerciseIndex] = updatedExercise;
    this.workouts = [...this.workouts];
    this.notify();
    this.enqueueSave();
    return updatedExercise;
  }

  public resetCurrentWorkout(): void {
    this.updateActiveWorkout((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.completed = false;
        exercise.sets.forEach((set) => {
          set.completed = false;
        });
      });
    });
  }

  public completeFullWorkout(): { title: string; minutes: number } {
    const workout = this.getActiveWorkout();
    this.updateActiveWorkout((active) => {
      active.exercises.forEach((exercise) => {
        exercise.completed = true;
        exercise.sets.forEach((set) => {
          set.completed = true;
        });
      });
      active.lastCompletedDate = new Date().toISOString();
    });
    return { title: workout.title, minutes: workout.estimatedDurationMin };
  }

  private updateActiveWorkout(update: (workout: WorkoutSession) => void): void {
    const workout = this.getActiveWorkout();
    update(workout);
    this.workouts = [...this.workouts];
    this.notify();
    this.enqueueSave();
  }

  private enqueueSave(): void {
    if (!this.userId || !this.isReady) return;
    const userId = this.userId;
    const snapshot = cloneWorkouts(this.workouts);
    this.saveQueue = this.saveQueue
      .catch(() => undefined)
      .then(() => this.persistWorkouts(userId, snapshot))
      .catch((error: unknown) => reportSaveError(error));
  }

  private async persistWorkouts(userId: string, workouts: WorkoutSession[]): Promise<void> {
    const rows = workouts.map((workout) => ({
      user_id: userId,
      code: workout.code,
      title: workout.title,
      payload: workout,
    }));
    const { error } = await getSupabaseClient()
      .from('workouts')
      .upsert(rows, { onConflict: 'user_id,code' });
    if (error) throw new Error(`Não foi possível salvar seus treinos: ${error.message}`);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const workoutService = new WorkoutService();
