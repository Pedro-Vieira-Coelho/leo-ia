import { HistoryStats, CalendarDayStatus, PastWorkoutLog } from '../models/history.model';
import { INITIAL_PAST_WORKOUTS } from '../shared/constants';

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

class HistoryService {
  private readonly STORAGE_PREFIX = 'leo_ia_history_logs_v2';
  private storageKey = `${this.STORAGE_PREFIX}:guest`;
  private pastWorkouts: PastWorkoutLog[] = [];
  private listeners: Array<() => void> = [];
  private userScope = 'guest';

  constructor() {
    this.initHistory();
  }

  private initHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed: PastWorkoutLog[] = JSON.parse(stored);
        // Merge enriched exercise details if missing in stored data
        this.pastWorkouts = parsed.map(log => {
          const initMatch = INITIAL_PAST_WORKOUTS.find(i => i.id === log.id || i.title === log.title);
          return {
            ...log,
            dateKey: log.dateKey || (initMatch ? initMatch.dateKey : undefined),
            exercises: log.exercises || (initMatch ? initMatch.exercises : undefined),
            feedbackNotes: log.feedbackNotes || (initMatch ? initMatch.feedbackNotes : undefined)
          };
        });
      } else {
        this.pastWorkouts = this.userScope === 'guest' ? INITIAL_PAST_WORKOUTS : [];
        this.save();
      }
    } catch {
      this.pastWorkouts = this.userScope === 'guest' ? INITIAL_PAST_WORKOUTS : [];
    }
  }

  private save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.pastWorkouts));
    } catch {
      // ignore
    }
  }

  public setUserScope(userId: string | null): void {
    const nextScope = userId ?? 'guest';
    if (nextScope === this.userScope) return;

    this.userScope = nextScope;
    this.storageKey = `${this.STORAGE_PREFIX}:${nextScope}`;
    this.initHistory();
    this.notify();
  }

  public getStats(filter: 'Semana' | 'Este mês' | 'Últimos 3 meses' = 'Este mês'): HistoryStats {
    const filteredWorkouts = this.getPastWorkouts(filter);
    const today = new Date();
    const todayKey = toDateKey(today);
    const last28DaysStart = new Date(today);
    last28DaysStart.setDate(today.getDate() - 27);
    const last28DaysStartKey = toDateKey(last28DaysStart);
    const workoutDays = new Set(
      this.pastWorkouts
        .map(workout => workout.dateKey)
        .filter((dateKey): dateKey is string => Boolean(dateKey)),
    );

    let activeStreakDays = 0;
    const streakDate = new Date(today);
    if (!workoutDays.has(todayKey)) streakDate.setDate(streakDate.getDate() - 1);
    while (workoutDays.has(toDateKey(streakDate))) {
      activeStreakDays += 1;
      streakDate.setDate(streakDate.getDate() - 1);
    }

    const recentWorkoutCount = this.pastWorkouts.filter(workout =>
      Boolean(workout.dateKey) &&
      workout.dateKey! >= last28DaysStartKey &&
      workout.dateKey! <= todayKey,
    ).length;
    const weeklyPace = Number((recentWorkoutCount / 4).toFixed(1)).toString();
    const completionRatePercent = filteredWorkouts.length
      ? Math.round(
        (filteredWorkouts.filter(workout => workout.status === 'Concluído').length /
          filteredWorkouts.length) * 100,
      )
      : 0;

    return {
      totalWorkouts: filteredWorkouts.length,
      weeklyPace: `${weeklyPace}x`,
      activeStreakDays,
      completionRatePercent,
      focusIncreasePercent: 0,
    };
  }

  public getPastWorkouts(filter: 'Semana' | 'Este mês' | 'Últimos 3 meses' = 'Este mês'): PastWorkoutLog[] {
    const today = new Date();
    let startDate: Date;
    if (filter === 'Semana') {
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
    } else if (filter === 'Últimos 3 meses') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const startKey = toDateKey(startDate);
    const endKey = toDateKey(today);
    return this.pastWorkouts.filter(workout =>
      Boolean(workout.dateKey) && workout.dateKey! >= startKey && workout.dateKey! <= endKey,
    );
  }

  public getWorkoutsByDateKey(dateKey: string): PastWorkoutLog[] {
    return this.pastWorkouts.filter(w => w.dateKey === dateKey);
  }

  /**
   * Adds a completed workout log with idempotency protection against rapid duplicate clicks.
   * NOTE: In the current frontend prototype, persistence is handled via localStorage.
   * When integrating a real backend, this will persist to a database via an API endpoint.
   */
  public addWorkoutLog(log: Omit<PastWorkoutLog, 'id'>) {
    const targetDateKey = log.dateKey || toDateKey(new Date());

    // Idempotency: avoid immediate identical re-logging if latest entry matches
    if (this.pastWorkouts.length > 0) {
      const latest = this.pastWorkouts[0];
      if (latest.workoutCode === log.workoutCode && latest.title === log.title && latest.dateKey === targetDateKey) {
        return;
      }
    }

    const newEntry: PastWorkoutLog = {
      ...log,
      id: `past_${crypto.randomUUID()}`,
      dateKey: targetDateKey
    };

    this.pastWorkouts.unshift(newEntry);
    this.save();
    this.notify();
  }

  /**
   * Generates calendar days for any year and month with accurate weekday alignment
   * and workout indicators matched with recorded past workouts.
   */
  public getMonthCalendarDays(year: number, month: number): CalendarDayStatus[] {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Dom, 1 = Seg, ...
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();

    const days: CalendarDayStatus[] = [];

    // Carry-over days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const dateKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

      days.push({
        dayNumber: dayNum,
        month: prevMonth,
        year: prevYear,
        dayOfWeek: (startDayOfWeek - 1 - i),
        isCurrentMonth: false,
        hasWorkout: false,
        dateKey
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (startDayOfWeek + d - 1) % 7;

      // Check if pastWorkouts contains a workout on this date
      const workout = this.pastWorkouts.find(w => w.dateKey === dateKey);
      const hasWorkout = Boolean(workout);
      const isToday = dateKey === toDateKey(new Date());

      days.push({
        dayNumber: d,
        month,
        year,
        dayOfWeek,
        isCurrentMonth: true,
        hasWorkout,
        isToday,
        dateKey,
        workoutCode: workout?.workoutCode
      });
    }

    // Optional: fill trailing days to complete grid rows
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let nextD = 1; nextD <= remainingCells; nextD++) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const dateKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextD).padStart(2, '0')}`;

        days.push({
          dayNumber: nextD,
          month: nextMonth,
          year: nextYear,
          dayOfWeek: (days.length % 7),
          isCurrentMonth: false,
          hasWorkout: false,
          dateKey
        });
      }
    }

    return days;
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

export const historyService = new HistoryService();
