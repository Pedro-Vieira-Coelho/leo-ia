import React, { useState } from 'react';
import { UserProfile, InstructorSharingSettings, NotificationCategories } from '../models/user.model';
import { authService } from '../services/auth.service';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';
import {
  Edit3,
  Share2,
  MapPin,
  Award,
  Clock,
  Shield,
  Bot,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Sliders,
  Scale,
  Building2,
  UserCheck,
  ChevronDown,
  X,
  AlertTriangle,
  Send,
  Check,
  Phone,
  Mail,
  User,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenPreferences: () => void;
  onOpenInstructorModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onLogout,
  onOpenPreferences,
  onOpenInstructorModal
}) => {
  // Modais de Controle
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [leoPrefsOpen, setLeoPrefsOpen] = useState(false);
  const [gymAffiliationModalOpen, setGymAffiliationModalOpen] = useState(false);
  const [leaveGymConfirmOpen, setLeaveGymConfirmOpen] = useState(false);
  const [sharingModalOpen, setSharingModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [helpSupportModalOpen, setHelpSupportModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [biomechanicsModalOpen, setBiomechanicsModalOpen] = useState(false);

  // Feedback de compartilhamento de perfil
  const [shareFeedback, setShareFeedback] = useState(false);

  // Estados dos Campos de Edição de Dados Pessoais
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [age, setAge] = useState(user.age);
  const [weight, setWeight] = useState(user.weightKg);
  const [height, setHeight] = useState(user.heightCm);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  // Estados de Personalização do LÉO IA
  const [voiceTone, setVoiceTone] = useState(user.leoPreferences.voiceTone);
  const [restDuration, setRestDuration] = useState(user.leoPreferences.restDurationSeconds);
  const [customRestInput, setCustomRestInput] = useState(String(user.leoPreferences.customRestSeconds || user.leoPreferences.restDurationSeconds));
  const [isCustomRestMode, setIsCustomRestMode] = useState(![45, 60, 90, 120].includes(user.leoPreferences.restDurationSeconds));

  // Configurações de Notificação
  const [notificationCategories, setNotificationCategories] = useState<NotificationCategories>(
    user.notificationCategories || {
      workoutReminders: true,
      restReminders: true,
      leoMessages: true,
      instructorNotices: true,
    }
  );

  // Configurações de Compartilhamento com Instrutor
  const [sharingSettings, setSharingSettings] = useState<InstructorSharingSettings>(
    user.sharingSettings || {
      recentWorkouts: true,
      exercisesAndWeights: true,
      evolutionMetrics: true,
      limitationsAndNotes: true,
      duration: 'continuous',
    }
  );

  // Edição Biomecânica Rápida
  const [primaryGoal, setPrimaryGoal] = useState(user.primaryGoal);
  const [biomechanicalFocus, setBiomechanicalFocus] = useState(user.biomechanicalFocus);
  const [limitations, setLimitations] = useState<string[]>(user.activeLimitations);
  const [newLimitationText, setNewLimitationText] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState(user.additionalNotes);

  // FAQ Expandido no Suporte
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [supportCategory, setSupportCategory] = useState('Falha na interface');
  const [supportDescription, setSupportDescription] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Academias Parceiras para Simulação de Troca
  const availableGyms = [
    { name: 'Academia Viva', branch: 'Unidade Jardins', instructor: 'Prof. Carlos Silva', cref: 'CREF 084920-G/SP' },
    { name: 'SmartFit', branch: 'Unidade Paulista', instructor: 'Profa. Mariana Costa', cref: 'CREF 091440-G/SP' },
    { name: 'Bio Ritmo', branch: 'Unidade Itaim Bibi', instructor: 'Prof. Roberto Albuquerque', cref: 'CREF 076510-G/SP' },
    { name: 'Bodytech', branch: 'Unidade Faria Lima', instructor: 'Profa. Juliana Prado', cref: 'CREF 082330-G/SP' },
  ];

  // 1. Salvar Dados Pessoais
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authService.updateUser({
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      phone: phone.trim(),
      age: Number(age) || user.age,
      weightKg: Number(weight) || user.weightKg,
      heightCm: Number(height) || user.heightCm,
      avatarUrl: avatarUrl.trim() || user.avatarUrl
    });
    setEditProfileOpen(false);
  };

  // 2. Salvar Preferências do LÉO IA
  const handleSaveLeoPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    let finalRest = Number(restDuration);
    if (isCustomRestMode) {
      const parsedCustom = parseInt(customRestInput, 10);
      if (!isNaN(parsedCustom) && parsedCustom >= 15 && parsedCustom <= 300) {
        finalRest = parsedCustom;
      }
    }
    authService.updateLeoPreferences({
      voiceTone: voiceTone as any,
      restDurationSeconds: finalRest,
      customRestSeconds: finalRest
    });
    setRestDuration(finalRest);
    setLeoPrefsOpen(false);
  };

  // 3. Salvar Preferências Biomecânicas
  const handleSaveBiomechanics = (e: React.FormEvent) => {
    e.preventDefault();
    authService.savePreferences({
      primaryGoal,
      biomechanicalFocus,
      activeLimitations: limitations,
      additionalNotes
    });
    setBiomechanicsModalOpen(false);
  };

  const handleAddLimitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLimitationText.trim() && !limitations.includes(newLimitationText.trim())) {
      setLimitations([...limitations, newLimitationText.trim()]);
      setNewLimitationText('');
    }
  };

  const handleRemoveLimitation = (item: string) => {
    setLimitations(limitations.filter(l => l !== item));
  };

  // 4. Trocar Academia
  const handleSelectGym = (gym: typeof availableGyms[0]) => {
    authService.changeGym(gym.name, gym.branch, gym.instructor, gym.cref);
    setGymAffiliationModalOpen(false);
  };

  // 5. Encerrar Vínculo com Academia (Preservando 100% dos dados)
  const handleConfirmLeaveGym = () => {
    authService.leaveGym();
    setLeaveGymConfirmOpen(false);
  };

  // 6. Salvar Compartilhamento
  const handleToggleSharingCategory = (key: keyof Omit<InstructorSharingSettings, 'duration'>) => {
    const updated = { ...sharingSettings, [key]: !sharingSettings[key] };
    setSharingSettings(updated);
    authService.updateSharingSettings(updated);
  };

  const handleSetSharingDuration = (duration: InstructorSharingSettings['duration']) => {
    const updated = { ...sharingSettings, duration };
    setSharingSettings(updated);
    authService.updateSharingSettings(updated);
  };

  const handleRevokeAllSharing = () => {
    const revoked: InstructorSharingSettings = {
      recentWorkouts: false,
      exercisesAndWeights: false,
      evolutionMetrics: false,
      limitationsAndNotes: false,
      duration: 'continuous'
    };
    setSharingSettings(revoked);
    authService.updateSharingSettings(revoked);
  };

  // 7. Notificações
  const handleToggleNotificationCategory = (key: keyof NotificationCategories) => {
    const updated = { ...notificationCategories, [key]: !notificationCategories[key] };
    setNotificationCategories(updated);
    authService.updateNotificationCategories(updated);
  };

  const handleToggleGeneralPush = () => {
    const newState = !user.accountSettings.pushNotifications;
    authService.updateUser({
      accountSettings: {
        ...user.accountSettings,
        pushNotifications: newState
      }
    });
  };

  // 8. Relatar Problema
  const handleSendSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportDescription.trim()) return;
    setSupportSuccess(true);
    setTimeout(() => {
      setSupportSuccess(false);
      setSupportDescription('');
      setHelpSupportModalOpen(false);
    }, 2000);
  };

  const handleShare = () => {
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2500);
  };

  const isAffiliated = user.gymAffiliationStatus !== 'Sem vínculo' && user.gymName !== 'Treino Autônomo';

  return (
    <div className="space-y-4 px-4 pt-3.5 pb-safe-nav animate-fadeIn">
      {/* 1. Header do Aluno & Biometria Unificada */}
      <div className="rounded-3xl bg-[#160E26] border border-white/10 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3.5 mb-3.5">
          {/* Avatar com verificação */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#842BAF] bg-[#1F1433] shadow-md">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {user.verified && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#2BED77] flex items-center justify-center border-2 border-[#160E26] shadow-xs"
                title="Perfil Verificado"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0B0712] stroke-[3]" />
              </div>
            )}
          </div>

          {/* Nome, e-mail e vínculo */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-heading font-bold text-white truncate">
              {user.name}
            </h1>
            <p className="text-[11px] text-[#A59DB5] truncate mt-0.5 flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#8C849B] shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
            <p className="text-[11px] text-[#A59DB5] flex items-center gap-1 truncate mt-0.5">
              <MapPin className="w-3 h-3 text-[#8C849B] shrink-0" />
              <span className="truncate">
                {isAffiliated ? `${user.gymName} — ${user.gymBranch}` : 'Treino Autônomo'}
              </span>
            </p>
          </div>
        </div>

        {/* Biometria em Grade Limpa com Unidades Padronizadas */}
        <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-2xl bg-[#1F1433]/70 border border-white/5 text-center mb-3">
          <div>
            <span className="text-[10px] text-[#8C849B] block">Idade</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{user.age} anos</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8C849B] block">Ritmo</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{user.weeklyFrequency}x/sem</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8C849B] block">Nível</span>
            <span className="text-xs font-bold text-white mt-0.5 block truncate px-1">
              {user.experienceLevel}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#8C849B] block">Peso</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{user.weightKg} kg</span>
          </div>
        </div>

        {/* Ações: Editar Dados e Compartilhar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditProfileOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-[#842BAF] hover:bg-[#681791] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Dados da Conta</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#1F1433] text-[#A59DB5] hover:text-white border border-white/10 transition-colors"
            title="Compartilhar Perfil"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {shareFeedback && (
          <p className="mt-2 text-center text-xs text-[#2BED77] animate-fadeIn">
            Link do perfil copiado com sucesso!
          </p>
        )}
      </div>

      {/* Grid Responsivo para Tablets e Desktops (1 coluna no mobile, 2 colunas equilibradas em md/lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* COLUNA ESQUERDA: Vínculo com Academia & Configurações da Conta */}
        <div className="space-y-4">
          {/* 2. Vínculo com Academia & Instrutor (Separado dos Dados Pessoais) */}
          <div className="rounded-3xl bg-[#160E26] border border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#B784E6]" />
                <h2 className="text-sm font-heading font-bold text-white">
                  Vínculo com Academia
                </h2>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isAffiliated
                    ? 'bg-[#2BED77]/15 text-[#2BED77] border-[#2BED77]/30'
                    : 'bg-white/10 text-[#A59DB5] border-white/10'
                }`}
              >
                {user.gymAffiliationStatus || (isAffiliated ? 'Ativo' : 'Sem vínculo')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#1F1433]/60 border border-white/5 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-[#8C849B] block">Academia Atual</span>
                  <span className="text-white font-semibold">
                    {isAffiliated ? `${user.gymName} (${user.gymBranch})` : 'Treino Autônomo'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGymAffiliationModalOpen(true)}
                  className="text-xs text-[#B784E6] hover:text-white font-semibold underline underline-offset-2"
                >
                  Trocar
                </button>
              </div>

              <div className="pt-1 border-t border-white/5 flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-[#8C849B] block">Profissional Vinculado</span>
                  <span className="text-white font-semibold">
                    {isAffiliated ? `${user.instructorName} • ${user.instructorCref}` : 'Sem instrutor vinculado'}
                  </span>
                </div>
                {isAffiliated && (
                  <button
                    type="button"
                    onClick={() => setLeaveGymConfirmOpen(true)}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Encerrar vínculo
                  </button>
                )}
              </div>
            </div>

            {/* Garantia de Soberania do Histórico */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#171026] text-[11px] text-[#D2A0FF] border border-[#842BAF]/20">
              <Shield className="w-4 h-4 shrink-0 text-[#2BED77] mt-0.5" />
              <span className="leading-snug">
                Sua conta é 100% sua: ao trocar ou encerrar a academia, seus treinos, histórico e evolução permanecem intactos.
              </span>
            </div>
          </div>

          {/* 6. Configurações da Conta & Preferências do App */}
          <div className="rounded-3xl bg-[#160E26] border border-white/10 p-2 shadow-sm divide-y divide-white/5">
            {/* Notificações push */}
            <div
              onClick={() => setNotificationsModalOpen(true)}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] text-xs text-white"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#B784E6]" />
                <div>
                  <span className="block font-medium">Notificações e Avisos</span>
                  <span className="text-[10px] text-[#8C849B]">Treinos, descanso e instrutor</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    user.accountSettings.pushNotifications
                      ? 'bg-[#2BED77]/20 text-[#2BED77] border-[#2BED77]/30'
                      : 'bg-white/5 text-[#A59DB5] border-white/10'
                  }`}
                >
                  {user.accountSettings.pushNotifications ? 'Ativadas' : 'Desativadas'}
                </span>
                <ChevronRight className="w-4 h-4 text-[#8C849B]" />
              </div>
            </div>

            {/* Ajuda e Suporte */}
            <div
              onClick={() => setHelpSupportModalOpen(true)}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] text-xs text-white"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#B784E6]" />
                <div>
                  <span className="block font-medium">Ajuda e Suporte</span>
                  <span className="text-[10px] text-[#8C849B]">Perguntas frequentes e contato</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C849B]" />
            </div>

            {/* Sair da Conta */}
            <div className="p-2 pt-3">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Preferências & Biomecânica + Assistente LÉO IA + Acompanhamento Profissional */}
        <div className="space-y-4">
          {/* 3. Preferências de Treino & Configuração Biomecânica */}
          <div className="rounded-3xl bg-[#160E26] border border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#2BED77]" />
                <h2 className="text-sm font-heading font-bold text-white">
                  Preferências & Biomecânica
                </h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2BED77]/15 text-[#2BED77] font-semibold">
                Ativo
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#1F1433]/60 border border-white/5">
                <span className="text-[10px] text-[#8C849B] block">Objetivo Principal</span>
                <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B784E6]" />
                  {user.primaryGoal}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1F1433]/60 border border-white/5">
                <span className="text-[10px] text-[#8C849B] block">Foco Biomecânico Relatado</span>
                <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-[#2BED77]" />
                  {user.biomechanicalFocus}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8C849B] block mb-1.5">
                  Limitações Ativas Relatadas ({user.activeLimitations.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.activeLimitations.map((lim, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[11px]"
                    >
                      {lim}
                    </span>
                  ))}
                </div>
              </div>

              {user.additionalNotes && (
                <div className="p-2.5 rounded-xl bg-[#171026] border border-white/5 text-[11px] text-[#D1C2D3]">
                  <span className="text-[10px] text-[#8C849B] block mb-0.5">Observações para o LÉO</span>
                  <p className="italic">"{user.additionalNotes}"</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setBiomechanicsModalOpen(true)}
              className="w-full text-left text-xs font-semibold text-[#B784E6] hover:text-white flex items-center justify-between pt-2.5 border-t border-white/5 transition-colors"
            >
              <span>Gerenciar limitações e objetivos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Assistente LÉO IA & Intervalos de Descanso */}
          <div className="rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Avatar Oficial do LÉO IA */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1F1433] border-2 border-[#842BAF]/60 shadow-[0_0_10px_rgba(132,43,175,0.4)] shrink-0">
                  <img
                    src={LEO_OFFICIAL_AVATAR}
                    alt="LÉO IA"
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-bold text-white leading-tight">
                    Assistente LÉO IA
                  </h3>
                  <span className="text-[10px] text-[#2BED77] font-semibold">
                    Personalizado para você
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-[#B784E6] bg-[#842BAF]/20 px-2 py-0.5 rounded-full border border-[#842BAF]/30 font-medium">
                Ativo
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#A59DB5] p-3 rounded-2xl bg-[#160E26]/80 border border-white/5">
              <p>
                <span className="text-white font-medium">Tom de voz:</span> {user.leoPreferences.voiceTone}
              </p>
              <p>
                <span className="text-white font-medium">Descanso padrão:</span> {user.leoPreferences.restDurationSeconds} segundos
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLeoPrefsOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] hover:brightness-110 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajustar Tom e Intervalo de Descanso</span>
            </button>
          </div>

          {/* 5. Acompanhamento Profissional (Substituição de Compartilhamento) */}
          <div className="rounded-3xl bg-[#160E26] border border-white/10 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#B784E6]" />
                <h3 className="text-sm font-heading font-bold text-white">
                  Acompanhamento Profissional
                </h3>
              </div>
              <span className="text-[10px] text-[#2BED77] bg-[#2BED77]/10 px-2 py-0.5 rounded-full border border-[#2BED77]/25 font-semibold">
                {isAffiliated ? 'Conectado' : 'Treino Autônomo'}
              </span>
            </div>

            <p className="text-xs text-[#A59DB5] leading-relaxed">
              Controle exatamente quais dados de treino são compartilhados com {user.instructorName} e envie comunicados sobre dores ou ajustes.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSharingModalOpen(true)}
                className="p-2.5 rounded-xl bg-[#1F1433] border border-white/5 text-left hover:border-[#842BAF]/40 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-[#B784E6] mb-1" />
                <span className="text-xs font-semibold text-white block">Permissões de Dados</span>
                <span className="text-[10px] text-[#8C849B]">4 categorias</span>
              </button>

              <button
                type="button"
                onClick={onOpenInstructorModal}
                className="p-2.5 rounded-xl bg-[#1F1433] border border-white/5 text-left hover:border-[#842BAF]/40 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-[#2BED77] mb-1" />
                <span className="text-xs font-semibold text-white block">Falar com Instrutor</span>
                <span className="text-[10px] text-[#8C849B]">Mensagens & Histórico</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé Informativo */}
      <div className="text-center pt-1 text-[10px] text-[#8C849B]">
        LÉO IA Fitness Companion • v2.5.0 • Luminous Nocturne
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Editar Dados Pessoais                                            */}
      {/* ========================================================================= */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-heading font-bold text-white">
                Editar Dados da Conta
              </h3>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="p-1 rounded-lg text-[#8C849B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 scrollbar-none">
              {/* Foto de Perfil */}
              <div>
                <label htmlFor="profile-avatar-url" className="text-[11px] text-[#A59DB5] block mb-1">URL da Foto de Perfil</label>
                <input
                  id="profile-avatar-url"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:border-[#B784E6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                />
              </div>

              {/* Nome */}
              <div>
                <label htmlFor="profile-name" className="text-[11px] text-[#A59DB5] block mb-1">Nome Completo</label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:border-[#B784E6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                />
              </div>

              {/* E-mail */}
              <div>
                <label htmlFor="profile-email" className="text-[11px] text-[#A59DB5] block mb-1">E-mail da Conta</label>
                <input
                  id="profile-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:border-[#B784E6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                />
              </div>

              {/* Telefone (opcional) */}
              <div>
                <label htmlFor="profile-phone" className="text-[11px] text-[#A59DB5] block mb-1">Telefone (opcional)</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:border-[#B784E6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                />
              </div>

              {/* Idade e Altura */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="profile-age" className="text-[11px] text-[#A59DB5] block mb-1">Idade (anos)</label>
                  <input
                    id="profile-age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:border-[#B784E6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                  />
                </div>
                <div>
                  <label htmlFor="profile-height" className="text-[11px] text-[#A59DB5] block mb-1">Altura (cm)</label>
                  <input
                    id="profile-height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:border-[#B784E6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                  />
                </div>
              </div>

              {/* Peso em kg */}
              <div>
                <label htmlFor="profile-weight" className="text-[11px] text-[#A59DB5] block mb-1">Peso (kg)</label>
                <input
                  id="profile-weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:border-[#B784E6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#842BAF] text-xs font-semibold text-white hover:bg-[#681791]"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Preferências do LÉO IA (Tom + Descanso Personalizado)            */}
      {/* ========================================================================= */}
      {leoPrefsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#842BAF]">
                  <img src={LEO_OFFICIAL_AVATAR} alt="LÉO IA" className="w-full h-full object-cover object-top" />
                </div>
                <h3 className="text-sm font-heading font-bold text-white">
                  Personalização do LÉO IA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLeoPrefsOpen(false)}
                className="p-1 rounded-lg text-[#8C849B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLeoPrefs} className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 scrollbar-none">
              {/* Tom de Voz */}
              <div>
                <label className="text-xs font-semibold text-white block mb-2">
                  Tom de Voz do Assistente
                </label>
                <div className="space-y-2">
                  {[
                    {
                      tone: 'Motivador, técnico e empático',
                      desc: 'Incentivo constante com explicações anatômicas claras e acolhedoras.'
                    },
                    {
                      tone: 'Direto e focado em metas',
                      desc: 'Comunicação objetiva, foco em carga, repetições e disciplina.'
                    },
                    {
                      tone: 'Educativo e calmo',
                      desc: 'Foco no aprendizado biomecânico do movimento, ritmo desacelerado e paciência.'
                    }
                  ].map((item) => (
                    <div
                      key={item.tone}
                      onClick={() => setVoiceTone(item.tone as any)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        voiceTone === item.tone
                          ? 'bg-[#842BAF]/25 border-[#842BAF] text-white shadow-xs'
                          : 'bg-[#171026] border-white/5 text-[#A59DB5] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{item.tone}</span>
                        {voiceTone === item.tone && (
                          <Check className="w-4 h-4 text-[#2BED77] stroke-[3]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#A59DB5] mt-1 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intervalo de Descanso */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white block">
                    Intervalo de Descanso Padrão
                  </label>
                  <span className="text-xs font-bold text-[#2BED77] font-mono">
                    {isCustomRestMode ? `${customRestInput || 60}s` : `${restDuration}s`}
                  </span>
                </div>

                {/* Atalhos Rápidos */}
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {[45, 60, 90, 120].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setIsCustomRestMode(false);
                        setRestDuration(s);
                        setCustomRestInput(String(s));
                      }}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        !isCustomRestMode && restDuration === s
                          ? 'bg-[#842BAF] text-white border-[#B784E6] shadow-xs'
                          : 'bg-[#171026] text-[#A59DB5] border-white/5 hover:text-white'
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>

                {/* Opção Personalizada */}
                <div className="p-3 rounded-2xl bg-[#171026] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">Intervalo personalizado</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomRestMode(true)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isCustomRestMode
                          ? 'bg-[#842BAF] text-white'
                          : 'bg-white/5 text-[#A59DB5]'
                      }`}
                    >
                      {isCustomRestMode ? 'Ativo' : 'Definir'}
                    </button>
                  </div>

                  {isCustomRestMode && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="15"
                        max="300"
                        value={customRestInput}
                        onChange={(e) => setCustomRestInput(e.target.value)}
                        placeholder="Ex: 75, 150"
                        className="flex-1 bg-[#1F1433] border border-[#842BAF]/40 text-white text-xs rounded-xl px-3 py-2 focus:outline-none font-mono"
                      />
                      <span className="text-xs text-[#A59DB5] font-semibold">segundos</span>
                    </div>
                  )}

                  <p className="text-[10px] text-[#8C849B]">
                    O tempo escolhido será utilizado no cronômetro da tela Meu Treino e pode ser alterado durante o treino.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setLeoPrefsOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#842BAF] text-xs font-semibold text-white hover:bg-[#681791]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Trocar Academia (Mantendo todo o histórico pessoal)              */}
      {/* ========================================================================= */}
      {gymAffiliationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#B784E6]" />
                <h3 className="text-sm font-heading font-bold text-white">
                  Alterar Academia Vinculada
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGymAffiliationModalOpen(false)}
                className="p-1 rounded-lg text-[#8C849B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 scrollbar-none text-xs">
              <div className="p-2.5 rounded-xl bg-[#171026] text-[11px] text-[#2BED77] border border-[#2BED77]/20 flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Seu histórico de treinos e métricas são preservados integralmente.</span>
              </div>

              <div className="space-y-2">
                {availableGyms.map((gym, idx) => {
                  const isCurrent = user.gymName === gym.name && user.gymBranch === gym.branch;
                  return (
                    <div
                      key={idx}
                      onClick={() => !isCurrent && handleSelectGym(gym)}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#842BAF]/20 border-[#842BAF] cursor-default'
                          : 'bg-[#171026] border-white/5 hover:border-white/20 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{gym.name}</span>
                        {isCurrent ? (
                          <span className="text-[10px] text-[#2BED77] font-bold">Atual</span>
                        ) : (
                          <span className="text-[10px] text-[#B784E6] font-semibold">Selecionar</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A59DB5] mt-0.5">{gym.branch}</p>
                      <p className="text-[10px] text-[#8C849B] mt-1">Instrutor: {gym.instructor} ({gym.cref})</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setGymAffiliationModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Confirmação de Encerramento de Vínculo                           */}
      {/* ========================================================================= */}
      {leaveGymConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-orange-500/30 p-5 shadow-2xl relative space-y-3">
            <div className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-heading font-bold text-white">
                Encerrar vínculo com a academia?
              </h3>
            </div>

            <p className="text-xs text-[#A59DB5] leading-relaxed">
              Você passará a utilizar o LÉO IA em modo <strong className="text-white">Treino Autônomo</strong>.
            </p>

            <div className="p-3 rounded-2xl bg-[#171026] border border-white/5 text-[11px] text-[#EADDFC] space-y-1">
              <p className="flex items-center gap-1.5 text-[#2BED77]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Seu histórico de treinos e cargas é 100% mantido.</span>
              </p>
              <p className="flex items-center gap-1.5 text-[#2BED77]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Suas metas e limitações cadastradas continuam ativas.</span>
              </p>
              <p className="flex items-center gap-1.5 text-[#A59DB5]">
                <Info className="w-3.5 h-3.5 shrink-0 text-[#B784E6]" />
                <span>O compartilhamento com {user.instructorName} será revogado.</span>
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLeaveGymConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmLeaveGym}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-semibold text-white shadow-md"
              >
                Confirmar Encerramento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Permissões de Compartilhamento com Instrutor                     */}
      {/* ========================================================================= */}
      {sharingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#B784E6]" />
                <h3 className="text-sm font-heading font-bold text-white">
                  Compartilhamento com Instrutor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSharingModalOpen(false)}
                className="p-1 rounded-lg text-[#8C849B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 scrollbar-none text-xs">
              <p className="text-xs text-[#A59DB5]">
                Escolha individualmente quais categorias de dados são acessíveis pelo seu instrutor credenciado ({user.instructorName}):
              </p>

              {/* Categorias */}
              <div className="space-y-2">
                {[
                  {
                    key: 'recentWorkouts' as const,
                    title: 'Resumo dos treinos recentes',
                    desc: 'Frequência, duração e datas dos treinos realizados.'
                  },
                  {
                    key: 'exercisesAndWeights' as const,
                    title: 'Exercícios, séries e cargas',
                    desc: 'Cargas registradas em kg e repetições de cada série.'
                  },
                  {
                    key: 'evolutionMetrics' as const,
                    title: 'Evolução e indicadores de desempenho',
                    desc: 'Gráficos de consistência, ritmo semanal e volume.'
                  },
                  {
                    key: 'limitationsAndNotes' as const,
                    title: 'Limitações e observações de treino',
                    desc: 'Dores relatadas e histórico de adaptações articulares.'
                  }
                ].map((item) => {
                  const active = sharingSettings[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleSharingCategory(item.key)}
                      className="p-3 rounded-2xl bg-[#171026] border border-white/5 flex items-center justify-between gap-3 cursor-pointer hover:border-white/20 transition-all"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-white block text-xs">{item.title}</span>
                        <span className="text-[11px] text-[#8C849B] leading-snug block mt-0.5">{item.desc}</span>
                      </div>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                          active ? 'bg-[#842BAF]' : 'bg-white/10'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                            active ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Duração */}
              <div className="p-3 rounded-2xl bg-[#171026] border border-white/5 space-y-2">
                <span className="text-xs font-semibold text-white block">Duração do Acesso</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'continuous' as const, label: 'Contínuo' },
                    { id: '30days' as const, label: '30 dias' },
                    { id: '90days' as const, label: '90 dias' }
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => handleSetSharingDuration(dur.id)}
                      className={`py-1.5 rounded-xl text-[11px] font-semibold border ${
                        sharingSettings.duration === dur.id
                          ? 'bg-[#842BAF] text-white border-[#B784E6]'
                          : 'bg-[#1F1433] text-[#A59DB5] border-white/5'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revogar */}
              <button
                type="button"
                onClick={handleRevokeAllSharing}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/20 transition-colors"
              >
                Revogar todo o acesso compartilhado
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setSharingModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#842BAF] text-xs font-semibold text-white hover:bg-[#681791]"
              >
                Salvar Permissões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: Notificações Push por Categoria                                  */}
      {/* ========================================================================= */}
      {notificationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#B784E6]" />
                <h3 className="text-sm font-heading font-bold text-white">
                  Configurações de Notificações
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(false)}
                className="p-1 rounded-lg text-[#8C849B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 scrollbar-none text-xs">
              {/* Toggle Geral */}
              <div className="p-3 rounded-2xl bg-[#171026] border border-[#842BAF]/30 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Notificações Gerais</span>
                  <span className="text-[10px] text-[#A59DB5]">Controle master de alertas no celular</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleGeneralPush}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                    user.accountSettings.pushNotifications
                      ? 'bg-[#2BED77]/20 text-[#2BED77] border-[#2BED77]/30'
                      : 'bg-white/5 text-[#A59DB5] border-white/10'
                  }`}
                >
                  {user.accountSettings.pushNotifications ? 'Ativadas' : 'Desativadas'}
                </button>
              </div>

              {/* Categorias individuais */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-white block">Categorias de Alerta</span>
                {[
                  {
                    key: 'workoutReminders' as const,
                    title: 'Lembretes de Treino',
                    desc: 'Avisos nos dias agendados da sua rotina semanal.'
                  },
                  {
                    key: 'restReminders' as const,
                    title: 'Lembretes de Descanso',
                    desc: 'Alertas para respeitar os intervalos entre séries e recuperação.'
                  },
                  {
                    key: 'leoMessages' as const,
                    title: 'Mensagens do LÉO IA',
                    desc: 'Insights de consistência e sugestões posturais personalizadas.'
                  },
                  {
                    key: 'instructorNotices' as const,
                    title: 'Avisos do Instrutor',
                    desc: 'Respostas a recados e orientações da academia.'
                  }
                ].map((cat) => {
                  const active = notificationCategories[cat.key];
                  return (
                    <div
                      key={cat.key}
                      onClick={() => handleToggleNotificationCategory(cat.key)}
                      className="p-3 rounded-2xl bg-[#171026] border border-white/5 flex items-center justify-between gap-3 cursor-pointer hover:border-white/20 transition-all"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-white block text-xs">{cat.title}</span>
                        <span className="text-[11px] text-[#8C849B] block mt-0.5">{cat.desc}</span>
                      </div>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                          active && user.accountSettings.pushNotifications ? 'bg-[#842BAF]' : 'bg-white/10'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                            active && user.accountSettings.pushNotifications ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#842BAF] text-xs font-semibold text-white hover:bg-[#681791]"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: Ajuda e Suporte (FAQ + Relatar Problema + Contato)               */}
      {/* ========================================================================= */}
      {helpSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#B784E6]" />
                <h3 className="text-sm font-heading font-bold text-white">
                  Ajuda e Suporte LÉO IA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpSupportModalOpen(false)}
                className="p-1 rounded-lg text-[#8C849B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 scrollbar-none text-xs">
              {/* 1. FAQ Accordion */}
              <div>
                <span className="text-xs font-semibold text-white block mb-2">
                  Perguntas Frequentes
                </span>
                <div className="space-y-1.5">
                  {[
                    {
                      q: 'Como configurar meu treino?',
                      a: 'Acesse a aba "Meu treino" e toque nas séries para marcar repetições e cargas. Você também pode tocar no ícone de troca para solicitar exercícios alternativos adaptados à sua biomecânica.'
                    },
                    {
                      q: 'Como alterar minhas preferências?',
                      a: 'No seu perfil, acesse o card "Preferências & Biomecânica" para atualizar seu objetivo principal, restrições articulares e observações para o LÉO.'
                    },
                    {
                      q: 'Como funciona o acompanhamento com o instrutor?',
                      a: 'Você escolhe quais dados compartilhar pelo menu de permissões. Pode enviar mensagens com anexos de treino e receber orientações diretamente na plataforma.'
                    },
                    {
                      q: 'Como consultar meu histórico?',
                      a: 'Na aba "Histórico", você pode navegar pelo calendário mês a mês, clicar em dias específicos para inspecionar as sessões e ver todas as cargas salvas.'
                    },
                    {
                      q: 'Como alterar minha academia?',
                      a: 'No card "Vínculo com Academia", clique em "Trocar" ou "Encerrar vínculo". Sua conta é de sua propriedade e 100% do seu histórico permanece com você.'
                    }
                  ].map((faq, idx) => {
                    const isOpen = expandedFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-[#171026] border border-white/5 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                          className="w-full p-3 text-left flex items-center justify-between text-xs font-semibold text-white hover:text-[#D2A0FF]"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-[#B784E6] transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 text-[11px] text-[#A59DB5] leading-relaxed border-t border-white/5 pt-2">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Relatar um Problema */}
              <div className="p-3.5 rounded-2xl bg-[#171026] border border-white/5 space-y-2.5">
                <span className="text-xs font-semibold text-white block">
                  Relatar um Problema
                </span>

                {supportSuccess ? (
                  <div className="p-3 rounded-xl bg-[#2BED77]/15 text-[#2BED77] text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Relato enviado com sucesso! Obrigado pelo feedback.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendSupportTicket} className="space-y-2">
                    <div>
                      <label className="text-[10px] text-[#8C849B] block mb-1">Categoria</label>
                      <select
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        className="w-full bg-[#1F1433] border border-white/10 text-white text-xs rounded-xl p-2 focus:outline-none"
                      >
                        <option value="Falha na interface">Falha na interface</option>
                        <option value="Dúvida de exercício">Dúvida de exercício ou postura</option>
                        <option value="Sincronização de dados">Sincronização de dados e histórico</option>
                        <option value="Outro">Outro assunto</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#8C849B] block mb-1">Descreva o ocorrido</label>
                      <textarea
                        rows={2}
                        required
                        value={supportDescription}
                        onChange={(e) => setSupportDescription(e.target.value)}
                        placeholder="Explique o que aconteceu..."
                        className="w-full bg-[#1F1433] border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none placeholder-[#8C849B] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-[#842BAF] hover:bg-[#681791] text-white text-xs font-semibold transition-colors"
                    >
                      Enviar Relato
                    </button>
                  </form>
                )}
              </div>

              {/* 3. Contato Oficial */}
              <div className="p-3 rounded-2xl bg-[#171026] border border-white/5 space-y-1.5">
                <span className="text-xs font-semibold text-white block">
                  Canais de Atendimento
                </span>
                <p className="text-[11px] text-[#A59DB5] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#B784E6]" />
                  <span>suporte@leoia.fitness</span>
                </p>
                <p className="text-[10px] text-[#8C849B]">
                  Atendimento de segunda a sexta, das 08h às 20h.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setHelpSupportModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: Confirmação de Sair da Conta                                     */}
      {/* ========================================================================= */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-red-500/30 p-5 shadow-2xl relative space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <LogOut className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-heading font-bold text-white">
                Sair da sua conta?
              </h3>
            </div>

            <p className="text-xs text-[#A59DB5] leading-relaxed">
              Tem certeza de que deseja sair da sua conta? Seus dados, preferências e histórico de treinos permanecem salvos em segurança neste dispositivo.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-md transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: Gerenciar Limitações & Objetivos                                 */}
      {/* ========================================================================= */}
      {biomechanicsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#2BED77]" />
                <h3 className="text-sm font-heading font-bold text-white">
                  Limitações & Biomecânica
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBiomechanicsModalOpen(false)}
                className="p-1 rounded-lg text-[#8C849B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBiomechanics} className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 scrollbar-none text-xs">
              {/* Aviso amigável */}
              <div className="p-2.5 rounded-xl bg-[#171026] text-[11px] text-[#A59DB5] border border-white/5 leading-snug">
                As limitações cadastradas servem como orientações relatadas por você para adaptar ângulos, pegadas e exercícios com cautela, sem caráter de diagnóstico médico.
              </div>

              {/* Objetivo Principal */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Objetivo Principal
                </label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value as any)}
                  className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="Hipertrofia & Força Funcional">Hipertrofia & Força Funcional</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Condicionamento Físico">Condicionamento Físico</option>
                  <option value="Ganho de Força">Ganho de Força</option>
                  <option value="Saúde & Longevidade">Saúde & Longevidade</option>
                </select>
              </div>

              {/* Foco Biomecânico */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1">
                  Foco Biomecânico & Cuidados
                </label>
                <input
                  type="text"
                  value={biomechanicalFocus}
                  onChange={(e) => setBiomechanicalFocus(e.target.value)}
                  className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              {/* Limitações Ativas */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Limitações Ativas
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {limitations.map((lim, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30 text-[11px]"
                    >
                      <span>{lim}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLimitation(lim)}
                        className="hover:text-white"
                        title="Remover"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Adicionar nova limitação */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newLimitationText}
                    onChange={(e) => setNewLimitationText(e.target.value)}
                    placeholder="Adicionar limitação..."
                    className="flex-1 bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl px-3 py-2 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLimitation}
                    className="px-3 py-2 rounded-xl bg-[#842BAF] text-xs font-semibold text-white"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Observações Livres */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1">
                  Observações para o LÉO e Instrutor
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-2.5 focus:outline-none resize-none placeholder-[#8C849B]"
                  placeholder="Ex: Priorizar pegada neutra..."
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBiomechanicsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#842BAF] text-xs font-semibold text-white hover:bg-[#681791]"
                >
                  Salvar Preferências
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
