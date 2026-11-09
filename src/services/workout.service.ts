import { WorkoutSession, Exercise } from '../models/workout.model';
import { INITIAL_WORKOUTS } from '../shared/constants';

class WorkoutService {
  private readonly STORAGE_KEY = 'leo_ia_workouts_state';
  private workouts: WorkoutSession[] = [];
  private activeWorkoutCode: WorkoutSession['code'] = 'Treino A';
  private listeners: Array<() => void> = [];

  constructor() {
    this.initWorkouts();
  }

  private initWorkouts() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed: WorkoutSession[] = JSON.parse(stored);
        // Merge metadata (postureTip, previousPerformance) from INITIAL_WORKOUTS if missing
        this.workouts = parsed.map(w => {
          const initialW = INITIAL_WORKOUTS.find(iw => iw.code === w.code);
          if (!initialW) return w;
          return {
            ...w,
            exercises: w.exercises.map(ex => {
              const initEx = initialW.exercises.find(ie => ie.id === ex.id);
              if (!initEx) return ex;
              return {
                ...ex,
                previousPerformance: ex.previousPerformance || initEx.previousPerformance,
                postureTip: ex.postureTip || initEx.postureTip,
              };
            })
          };
        });
      } else {
        this.workouts = JSON.parse(JSON.stringify(INITIAL_WORKOUTS));
        this.save();
      }
    } catch {
      this.workouts = JSON.parse(JSON.stringify(INITIAL_WORKOUTS));
    }
  }

  private save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.workouts));
    } catch {
      // ignore
    }
  }

  public getWorkouts(): WorkoutSession[] {
    return this.workouts;
  }

  public getActiveWorkout(): WorkoutSession {
    const found = this.workouts.find(w => w.code === this.activeWorkoutCode);
    return found || this.workouts[0];
  }

  public setActiveWorkoutCode(code: WorkoutSession['code']) {
    this.activeWorkoutCode = code;
    this.notify();
  }

  public toggleSetCompletion(exerciseId: string, setNumber: number) {
    const currentWorkout = this.getActiveWorkout();
    const ex = currentWorkout.exercises.find(e => e.id === exerciseId);
    if (!ex) return;

    const setObj = ex.sets.find(s => s.setNumber === setNumber);
    if (setObj) {
      setObj.completed = !setObj.completed;
    }

    // Check if all sets are completed
    ex.completed = ex.sets.every(s => s.completed);
    this.save();
    this.notify();
  }

  public toggleExerciseCompletion(exerciseId: string) {
    const currentWorkout = this.getActiveWorkout();
    const ex = currentWorkout.exercises.find(e => e.id === exerciseId);
    if (!ex) return;

    const newState = !ex.completed;
    ex.completed = newState;
    ex.sets.forEach(s => {
      s.completed = newState;
    });

    this.save();
    this.notify();
  }

  public updateSetWeight(exerciseId: string, setNumber: number, weightKg: number) {
    const currentWorkout = this.getActiveWorkout();
    const ex = currentWorkout.exercises.find(e => e.id === exerciseId);
    if (!ex) return;

    const setObj = ex.sets.find(s => s.setNumber === setNumber);
    if (setObj) {
      setObj.weightKg = Math.max(0, weightKg);
      this.save();
      this.notify();
    }
  }

  public swapWithAlternative(exerciseId: string, alternativeIndex: number): Exercise | null {
    const currentWorkout = this.getActiveWorkout();
    const exIndex = currentWorkout.exercises.findIndex(e => e.id === exerciseId);
    if (exIndex === -1) return null;

    const oldEx = currentWorkout.exercises[exIndex];
    const alt = oldEx.alternatives[alternativeIndex];
    if (!alt) return null;

    // Create swapped exercise preserving sets structure
    const updatedEx: Exercise = {
      ...oldEx,
      name: alt.name,
      targetArea: alt.focus,
      leoTip: `Adaptação LÉO ativada: ${alt.reason} Equipamento sugerido: ${alt.equipment}.`,
      currentAlternativeIndex: alternativeIndex
    };

    currentWorkout.exercises[exIndex] = updatedEx;
    this.save();
    this.notify();
    return updatedEx;
  }

  public calculateProgress(workout: WorkoutSession): { completed: number; total: number; percentage: number } {
    const total = workout.exercises.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = workout.exercises.filter(e => e.completed).length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  }

  public resetCurrentWorkout() {
    const current = this.getActiveWorkout();
    current.exercises.forEach(e => {
      e.completed = false;
      e.sets.forEach(s => {
        s.completed = false;
      });
    });
    this.save();
    this.notify();
  }

  public completeFullWorkout(): { title: string; minutes: number } {
    const current = this.getActiveWorkout();
    current.exercises.forEach(e => {
      e.completed = true;
      e.sets.forEach(s => {
        s.completed = true;
      });
    });
    current.lastCompletedDate = new Date().toISOString();
    this.save();
    this.notify();
    return {
      title: current.title,
      minutes: current.estimatedDurationMin
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const workoutService = new WorkoutService();
