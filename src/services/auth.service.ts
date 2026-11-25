import type { User } from '@supabase/supabase-js';
import { INITIAL_USER_PROFILE } from '../shared/constants';
import type { UserProfile } from '../models/user.model';
import { getSupabaseClient } from './supabase.client';

type RegistrationData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  age: number;
  weightKg?: number;
  heightCm?: number;
  experienceLevel: UserProfile['experienceLevel'];
  weeklyFrequency: number;
  trainingDays: string[];
  provider?: 'email' | 'google' | 'apple';
};

function createDefaultProfile(id = '', email = '', name = ''): UserProfile {
  return {
    ...INITIAL_USER_PROFILE,
    id,
    email,
    name,
    phone: '',
    memberSince: `Membro desde ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
    gymName: 'Treino Autônomo',
    gymBranch: 'Sem academia vinculada',
    gymAffiliationStatus: 'Sem vínculo',
    instructorName: 'Nenhum instrutor vinculado',
    instructorCref: '—',
    verified: false,
    age: 0,
    weightKg: 0,
    heightCm: 0,
    weeklyFrequency: 0,
    trainingDays: [],
    experienceDetail: '',
    availability: '',
    biomechanicalFocus: '',
    activeLimitations: [],
    additionalNotes: '',
    accountSettings: {
      ...INITIAL_USER_PROFILE.accountSettings,
      privacyInstructorShared: false,
    },
    sharingSettings: {
      recentWorkouts: false,
      exercisesAndWeights: false,
      evolutionMetrics: false,
      limitationsAndNotes: false,
      duration: 'continuous',
    },
    instructorMessages: [],
  };
}

class AuthService {
  private currentUser: UserProfile = INITIAL_USER_PROFILE;
  private authenticated = false;
  private listeners: Array<() => void> = [];
  private profileSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    const client = getSupabaseClient();
    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        void this.loadUser(session?.user ?? null).catch((error: unknown) => this.reportError(error));
      }, 0);
    });

    const { data, error } = await client.auth.getSession();
    if (error) {
      authListener.subscription.unsubscribe();
      throw error;
    }

    try {
      await this.loadUser(data.session?.user ?? null);
      this.initialized = true;
    } catch (error) {
      authListener.subscription.unsubscribe();
      throw error;
    }
  }

  private async loadUser(user: User | null): Promise<void> {
    this.authenticated = Boolean(user);

    if (!user) {
      this.currentUser = INITIAL_USER_PROFILE;
      this.notify();
      return;
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('profiles')
      .select('profile')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    const metadataProfile = user.user_metadata?.profile as Partial<UserProfile> | undefined;
    const storedProfile = data?.profile as Partial<UserProfile> | null;
    const defaults = createDefaultProfile(
      user.id,
      user.email ?? '',
      metadataProfile?.name ?? user.user_metadata?.full_name ?? '',
    );
    this.currentUser = {
      ...defaults,
      ...metadataProfile,
      ...storedProfile,
      id: user.id,
      email: user.email ?? '',
      leoPreferences: {
        ...defaults.leoPreferences,
        ...metadataProfile?.leoPreferences,
        ...storedProfile?.leoPreferences,
      },
      accountSettings: {
        ...defaults.accountSettings,
        ...metadataProfile?.accountSettings,
        ...storedProfile?.accountSettings,
      },
      sharingSettings: {
        ...defaults.sharingSettings,
        ...metadataProfile?.sharingSettings,
        ...storedProfile?.sharingSettings,
      },
      notificationCategories: {
        ...defaults.notificationCategories,
        ...metadataProfile?.notificationCategories,
        ...storedProfile?.notificationCategories,
      },
      instructorMessages: storedProfile?.instructorMessages ?? metadataProfile?.instructorMessages ?? [],
    };

    if (!data) {
      await this.persistProfile();
    }
    this.notify();
  }

  public isAuthenticated(): boolean {
    return this.authenticated;
  }

  public getUser(): UserProfile {
    return this.currentUser;
  }

  public async login(email: string, password: string): Promise<void> {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) await this.loadUser(data.user);
  }

  public async loginWithProvider(provider: 'google' | 'apple'): Promise<void> {
    const { error } = await getSupabaseClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  public async register(data: RegistrationData): Promise<{ requiresEmailConfirmation: boolean }> {
    const { password, ...profileData } = data;
    const profile: UserProfile = {
      ...createDefaultProfile('', data.email, data.name),
      ...profileData,
      id: '',
      email: data.email,
      availability: `${data.trainingDays.join(', ')} (~60 min)`,
      instructorMessages: [],
    };

    const { data: result, error } = await getSupabaseClient().auth.signUp({
      email: data.email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { profile },
      },
    });

    if (error) throw error;
    if (result.session && result.user) {
      await this.loadUser(result.user);
    }

    return { requiresEmailConfirmation: !result.session };
  }

  public async resetPassword(email: string): Promise<void> {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?recovery=1`,
    });
    if (error) throw error;
  }

  public async updatePassword(password: string): Promise<void> {
    const { error } = await getSupabaseClient().auth.updateUser({ password });
    if (error) throw error;
  }

  public updateUser(partial: Partial<UserProfile>): UserProfile {
    const { email, ...profileChanges } = partial;
    this.currentUser = { ...this.getUser(), ...profileChanges };
    this.scheduleProfileSave();
    this.notify();

    if (email?.trim() && email.trim().toLowerCase() !== this.currentUser.email.toLowerCase()) {
      void this.updateAuthEmail(email.trim()).catch((error: unknown) => this.reportError(error));
    }

    return this.currentUser;
  }

  public updateLeoPreferences(prefs: Partial<UserProfile['leoPreferences']>): void {
    this.updateUser({
      leoPreferences: { ...this.currentUser.leoPreferences, ...prefs },
    });
  }

  public updateSharingSettings(prefs: Partial<UserProfile['sharingSettings']>): void {
    this.updateUser({
      sharingSettings: { ...this.currentUser.sharingSettings, ...prefs },
    });
  }

  public updateNotificationCategories(prefs: Partial<UserProfile['notificationCategories']>): void {
    this.updateUser({
      notificationCategories: {
        ...this.currentUser.notificationCategories,
        ...prefs,
      },
    });
  }

  public changeGym(gymName: string, gymBranch: string, instructorName: string, instructorCref: string) {
    return this.updateUser({
      gymName,
      gymBranch,
      instructorName,
      instructorCref,
      gymAffiliationStatus: 'Ativo',
    });
  }

  public leaveGym() {
    return this.updateUser({
      gymName: 'Treino Autônomo',
      gymBranch: 'Sem academia vinculada',
      instructorName: 'Nenhum instrutor vinculado',
      instructorCref: '—',
      gymAffiliationStatus: 'Sem vínculo',
    });
  }

  public sendInstructorMessage(topic: string, message: string, attachedData: string[]) {
    const newMsg = {
      id: `msg_${crypto.randomUUID()}`,
      date: 'Hoje • ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      topic,
      message,
      attachedData,
      status: 'aguardando' as const,
    };
    this.updateUser({
      instructorMessages: [newMsg, ...this.currentUser.instructorMessages],
    });
    return newMsg;
  }

  public savePreferences(goals: {
    primaryGoal: UserProfile['primaryGoal'];
    biomechanicalFocus: string;
    activeLimitations: string[];
    additionalNotes: string;
  }): void {
    this.updateUser(goals);
  }

  public async logout(): Promise<void> {
    if (this.profileSaveTimeout) {
      clearTimeout(this.profileSaveTimeout);
      this.profileSaveTimeout = null;
      try {
        await this.persistProfile();
      } catch (error) {
        this.reportError(error);
      }
    }

    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((current) => current !== listener);
    };
  }

  private scheduleProfileSave(): void {
    if (!this.authenticated) return;
    if (this.profileSaveTimeout) clearTimeout(this.profileSaveTimeout);
    this.profileSaveTimeout = setTimeout(() => {
      this.profileSaveTimeout = null;
      void this.persistProfile().catch((error: unknown) => this.reportError(error));
    }, 300);
  }

  private async persistProfile(): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('profiles')
      .upsert(
        { id: this.currentUser.id, profile: this.currentUser, updated_at: new Date().toISOString() },
        { onConflict: 'id' },
      );
    if (error) throw error;
  }

  private async updateAuthEmail(email: string): Promise<void> {
    const { error } = await getSupabaseClient().auth.updateUser({ email });
    if (error) throw error;
    window.dispatchEvent(new CustomEvent(
      'app:notice',
      { detail: 'Enviamos um link de confirmação para o novo e-mail.' },
    ));
  }

  private reportError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao salvar seus dados.';
    window.dispatchEvent(new CustomEvent('app:error', { detail: message }));
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const authService = new AuthService();
