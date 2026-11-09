import { HistoryStats, CalendarDayStatus, PastWorkoutLog } from '../models/history.model';
import { INITIAL_HISTORY_STATS, INITIAL_PAST_WORKOUTS } from '../shared/constants';

class HistoryService {
  private readonly STORAGE_KEY = 'leo_ia_history_logs_v2';
  private stats: HistoryStats = INITIAL_HISTORY_STATS;
  private pastWorkouts: PastWorkoutLog[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.initHistory();
  }

  private initHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
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
        this.pastWorkouts = INITIAL_PAST_WORKOUTS;
        this.save();
      }
    } catch {
      this.pastWorkouts = INITIAL_PAST_WORKOUTS;
    }
  }

  private save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pastWorkouts));
    } catch {
      // ignore
    }
  }

  public getStats(filter: 'Semana' | 'Este mês' | 'Últimos 3 meses' = 'Este mês'): HistoryStats {
    const totalCount = this.pastWorkouts.length;
    
    if (filter === 'Semana') {
      return {
        totalWorkouts: Math.min(4, totalCount),
        weeklyPace: '4x',
        activeStreakDays: this.stats.activeStreakDays,
        completionRatePercent: 100,
        focusIncreasePercent: 18
      };
    }

    if (filter === 'Últimos 3 meses') {
      return {
        totalWorkouts: this.stats.totalWorkouts + (totalCount - INITIAL_PAST_WORKOUTS.length),
        weeklyPace: '4.1x',
        activeStreakDays: this.stats.activeStreakDays,
        completionRatePercent: 96,
        focusIncreasePercent: 22
      };
    }

    // 'Este mês'
    return {
      totalWorkouts: this.stats.totalWorkouts + (totalCount - INITIAL_PAST_WORKOUTS.length),
      weeklyPace: '4x',
      activeStreakDays: this.stats.activeStreakDays,
      completionRatePercent: 96,
      focusIncreasePercent: 18
    };
  }

  public getPastWorkouts(filter: 'Semana' | 'Este mês' | 'Últimos 3 meses' = 'Este mês'): PastWorkoutLog[] {
    if (filter === 'Semana') {
      return this.pastWorkouts.slice(0, 3);
    }
    if (filter === 'Últimos 3 meses') {
      return this.pastWorkouts;
    }
    return this.pastWorkouts;
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
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const targetDateKey = log.dateKey || dateKey;

    // Idempotency: avoid immediate identical re-logging if latest entry matches
    if (this.pastWorkouts.length > 0) {
      const latest = this.pastWorkouts[0];
      if (latest.workoutCode === log.workoutCode && latest.title === log.title && latest.dateKey === targetDateKey) {
        return;
      }
    }

    const newEntry: PastWorkoutLog = {
      ...log,
      id: `past_${Date.now()}`,
      dateKey: targetDateKey
    };

    this.pastWorkouts.unshift(newEntry);
    this.stats.totalWorkouts += 1;
    this.stats.activeStreakDays += 1;
    this.save();
    this.notify();
  }

  /**
   * Generates calendar days for any year and month with accurate weekday alignment
   * and workout indicators matched with recorded past workouts.
   */
  public getMonthCalendarDays(year: number, month: number): CalendarDayStatus[] {
    // Reference workout days in October 2026:
    const defaultOctWorkoutDays = new Set([2, 4, 6, 8, 9, 11, 13, 15, 16, 18, 20, 22, 23, 25, 27]);

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
      const hasRecordedWorkout = this.pastWorkouts.some(w => w.dateKey === dateKey);
      const isOctWorkout = year === 2026 && month === 10 && defaultOctWorkoutDays.has(d);
      const hasWorkout = hasRecordedWorkout || isOctWorkout;

      const isToday = (year === 2026 && month === 10 && d === 27);

      days.push({
        dayNumber: d,
        month,
        year,
        dayOfWeek,
        isCurrentMonth: true,
        hasWorkout,
        isToday,
        dateKey,
        workoutCode: hasWorkout ? (d % 3 === 0 ? 'Treino B' : d % 2 === 0 ? 'Treino A' : 'Treino C') : undefined
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
