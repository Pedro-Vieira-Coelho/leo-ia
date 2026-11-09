import { UserProfile } from '../models/user.model';
import { INITIAL_USER_PROFILE } from '../shared/constants';

class AuthService {
  private readonly STORAGE_KEY = 'leo_ia_user_profile';
  private readonly AUTH_STATE_KEY = 'leo_ia_auth_logged_in';
  private currentUser: UserProfile | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.initUser();
  }

  private initUser() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentUser = {
          ...INITIAL_USER_PROFILE,
          ...parsed,
          leoPreferences: {
            ...INITIAL_USER_PROFILE.leoPreferences,
            ...(parsed.leoPreferences || {})
          },
          accountSettings: {
            ...INITIAL_USER_PROFILE.accountSettings,
            ...(parsed.accountSettings || {})
          },
          sharingSettings: {
            ...INITIAL_USER_PROFILE.sharingSettings,
            ...(parsed.sharingSettings || {})
          },
          notificationCategories: {
            ...INITIAL_USER_PROFILE.notificationCategories,
            ...(parsed.notificationCategories || {})
          },
          instructorMessages: parsed.instructorMessages || INITIAL_USER_PROFILE.instructorMessages
        };
      } else {
        this.currentUser = INITIAL_USER_PROFILE;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
      }
    } catch {
      this.currentUser = INITIAL_USER_PROFILE;
    }
  }

  public isAuthenticated(): boolean {
    const isLogged = localStorage.getItem(this.AUTH_STATE_KEY);
    return isLogged !== 'false'; // default true for smooth demo preview
  }

  public getUser(): UserProfile {
    if (!this.currentUser) {
      this.initUser();
    }
    return this.currentUser || INITIAL_USER_PROFILE;
  }

  public updateUser(partial: Partial<UserProfile>): UserProfile {
    const current = this.getUser();
    const updated: UserProfile = { ...current, ...partial };
    this.currentUser = updated;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  public updateLeoPreferences(prefs: Partial<UserProfile['leoPreferences']>) {
    const current = this.getUser();
    const updated: UserProfile = {
      ...current,
      leoPreferences: { ...current.leoPreferences, ...prefs }
    };
    this.currentUser = updated;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.notify();
  }

  public updateSharingSettings(prefs: Partial<UserProfile['sharingSettings']>) {
    const current = this.getUser();
    const updated: UserProfile = {
      ...current,
      sharingSettings: { ...current.sharingSettings, ...prefs }
    };
    this.currentUser = updated;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.notify();
  }

  public updateNotificationCategories(prefs: Partial<UserProfile['notificationCategories']>) {
    const current = this.getUser();
    const updated: UserProfile = {
      ...current,
      notificationCategories: { ...current.notificationCategories, ...prefs }
    };
    this.currentUser = updated;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.notify();
  }

  public changeGym(gymName: string, gymBranch: string, instructorName: string, instructorCref: string) {
    return this.updateUser({
      gymName,
      gymBranch,
      instructorName,
      instructorCref,
      gymAffiliationStatus: 'Ativo'
    });
  }

  public leaveGym() {
    return this.updateUser({
      gymName: 'Treino Autônomo',
      gymBranch: 'Sem academia vinculada',
      instructorName: 'Nenhum instrutor vinculado',
      instructorCref: '—',
      gymAffiliationStatus: 'Sem vínculo'
    });
  }

  public sendInstructorMessage(topic: string, message: string, attachedData: string[]) {
    const current = this.getUser();
    const newMsg = {
      id: `msg_${Date.now()}`,
      date: 'Hoje • ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      topic,
      message,
      attachedData,
      status: 'aguardando' as const
    };
    const updated: UserProfile = {
      ...current,
      instructorMessages: [newMsg, ...(current.instructorMessages || [])]
    };
    this.currentUser = updated;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.notify();
    return newMsg;
  }

  public login(email: string, _password: string): boolean {
    localStorage.setItem(this.AUTH_STATE_KEY, 'true');
    const user = this.getUser();
    this.updateUser({ email });
    this.notify();
    return true;
  }

  public register(data: {
    name: string;
    email: string;
    phone?: string;
    age: number;
    weightKg?: number;
    heightCm?: number;
    experienceLevel: UserProfile['experienceLevel'];
    weeklyFrequency: number;
    trainingDays: string[];
    provider?: 'email' | 'google' | 'apple';
  }): void {
    const current = this.getUser();
    const updated: UserProfile = {
      ...current,
      ...data,
      availability: `${data.trainingDays.join(', ')} (~60 min)`
    };
    this.currentUser = updated;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(this.AUTH_STATE_KEY, 'true');
    this.notify();
  }

  public savePreferences(goals: {
    primaryGoal: UserProfile['primaryGoal'];
    biomechanicalFocus: string;
    activeLimitations: string[];
    additionalNotes: string;
  }): void {
    this.updateUser(goals);
  }

  public logout(): void {
    localStorage.setItem(this.AUTH_STATE_KEY, 'false');
    this.notify();
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

export const authService = new AuthService();
