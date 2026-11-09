/**
 * User and Profile Models
 */

export interface InstructorSharingSettings {
  recentWorkouts: boolean;
  exercisesAndWeights: boolean;
  evolutionMetrics: boolean;
  limitationsAndNotes: boolean;
  duration: 'continuous' | '30days' | '90days';
}

export interface NotificationCategories {
  workoutReminders: boolean;
  restReminders: boolean;
  leoMessages: boolean;
  instructorNotices: boolean;
}

export interface InstructorMessageRecord {
  id: string;
  date: string;
  topic: string;
  message: string;
  attachedData: string[];
  status: 'respondida' | 'aguardando';
  reply?: {
    text: string;
    date: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  memberSince: string;
  avatarUrl: string;
  verified: boolean;
  gymName: string;
  gymBranch: string;
  gymAffiliationStatus: 'Ativo' | 'Pendente' | 'Sem vínculo';
  instructorName: string;
  instructorCref: string;
  age: number;
  weightKg: number;
  heightCm: number;
  weeklyFrequency: number; // e.g. 4 days/week
  trainingDays: string[]; // ['Seg', 'Ter', 'Qui', 'Sex']
  experienceLevel: 'Iniciante' | 'Intermediário' | 'Avançado';
  experienceDetail: string; // '1 ano e meio'
  primaryGoal: 'Hipertrofia & Força Funcional' | 'Emagrecimento' | 'Condicionamento Físico' | 'Ganho de Força' | 'Saúde & Longevidade';
  availability: string; // 'Seg, Ter, Qui e Sex (manhãs, ~60 min)'
  biomechanicalFocus: string; // 'Preservação articular de ombros e lombar'
  activeLimitations: string[]; // ['Desconforto leve no Supino', 'Adaptação barra para halteres']
  additionalNotes: string;
  leoPreferences: LeoCompanionConfig;
  accountSettings: AccountSettings;
  sharingSettings: InstructorSharingSettings;
  notificationCategories: NotificationCategories;
  instructorMessages: InstructorMessageRecord[];
}

export interface LeoCompanionConfig {
  voiceTone: 'Motivador, técnico e empático' | 'Direto e focado em metas' | 'Educativo e calmo';
  restReminders: boolean;
  restDurationSeconds: number; // e.g. 60s
  customRestSeconds?: number;
  guidanceDetail: 'Foco prático e postura correta' | 'Explicações biomecânicas profundas' | 'Instruções sucintas';
  audioFeedbackEnabled: boolean;
}

export interface AccountSettings {
  pushNotifications: boolean;
  privacyInstructorShared: boolean;
  offlineSync: boolean;
  soundEffects: boolean;
}

