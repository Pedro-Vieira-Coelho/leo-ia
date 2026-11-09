import React from 'react';
import { UserProfile } from '../models/user.model';
import { workoutService } from '../services/workout.service';
import { historyService } from '../services/history.service';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';
import {
  Dumbbell,
  MessageSquare,
  Clock,
  ShieldCheck,
  ChevronRight,
  User,
  Flame
} from 'lucide-react';

interface DashboardPageProps {
  user: UserProfile;
  onNavigateTab: (tab: 'workout' | 'chat' | 'history' | 'profile') => void;
  onOpenInstructorModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onNavigateTab,
  onOpenInstructorModal
}) => {
  const activeWorkout = workoutService.getActiveWorkout();
  const progress = workoutService.calculateProgress(activeWorkout);
  const stats = historyService.getStats();

  const firstName = user.name ? user.name.split(' ')[0] : 'Carlos';
  const instructorDisplayName = user.instructorName
    ? user.instructorName.replace('Prof. ', '')
    : 'Carlos Silva';

  return (
    <div className="space-y-3.5 px-4 pt-3.5 pb-safe-nav animate-fadeIn">
      {/* Saudação & Indicador de Sequência */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold text-[#B784E6] uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[10px] text-[#B784E6]">✦</span> <time dateTime="2026-10-27">TERÇA-FEIRA</time>
          </span>
          <h1 className="text-2xl sm:text-[26px] font-heading font-extrabold text-white tracking-tight mt-0.5">
            Olá, {firstName}
          </h1>
        </div>

        {/* Indicador de Sequência de Treinos */}
        <button
          onClick={() => onNavigateTab('history')}
          type="button"
          aria-label={`Sequência ativa de ${stats.activeStreakDays} dias de treinos. Clique para ver histórico.`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#160E26] border border-white/10 hover:border-[#2BED77]/40 transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
          title="Ver histórico de sequência"
        >
          <Flame className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500]" />
          <span className="text-xs font-bold text-[#2BED77] tabular-nums">
            {stats.activeStreakDays} dias
          </span>
        </button>
      </div>

      {/* Grid Responsivo: 1 coluna no celular, 2 colunas equilibradas em tablets e desktops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* COLUNA ESQUERDA: Treino Principal & Preservação */}
        <section aria-label="Treino Principal" className="space-y-3.5">
          {/* Treino Principal (Fiel ao Design Stitch) */}
          <article aria-label={`Treino do dia: ${activeWorkout.title}`} className="rounded-3xl bg-[#160E26] border border-white/[0.08] p-4 sm:p-5 shadow-xl relative">
            {/* Badges superiores */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#2D124D] text-[#D2A0FF] border border-[#842BAF]/40">
                  {activeWorkout.code}
                </span>
                <span className="text-xs text-[#A59DB5] flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#A59DB5]" />
                  ~{activeWorkout.estimatedDurationMin} min
                </span>
              </div>

              <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-[#201636] text-[#A59DB5] border border-white/5">
                {activeWorkout.exercises.length} exercícios
              </span>
            </div>

            {/* Nome do Treino e Grupos Musculares */}
            <div className="mb-3">
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white tracking-tight">
                {activeWorkout.title}
              </h2>
              <p className="text-xs text-[#A59DB5] mt-1 font-normal">
                {activeWorkout.focusMuscles.join(' • ')}
              </p>
            </div>

            {/* Progresso Atual e Barra de Progresso */}
            <div className="pt-2 mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#A59DB5]">
                  Progresso: {progress.completed} de {progress.total} exercícios
                </span>
                <span className="font-bold text-[#2BED77] tabular-nums">
                  {progress.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 sm:h-2 rounded-full bg-[#201636] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#842BAF] to-[#2BED77] rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {/* Botão Primário: Iniciar Treino de Hoje */}
            <button
              onClick={() => onNavigateTab('workout')}
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#842BAF] to-[#681791] hover:from-[#9232c2] hover:to-[#741ca0] text-white font-heading font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(132,43,175,0.45)] active:scale-[0.98] transition-all min-h-[46px]"
            >
              <Dumbbell className="w-4 h-4 stroke-[2.2]" />
              <span>{progress.percentage > 0 ? 'Continuar Treino de Hoje' : 'Iniciar Treino de Hoje'}</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </article>

          {/* Indicador de Cuidado (Preservação Articular) */}
          <div className="px-4 py-3 rounded-2xl bg-[#160E26] border border-white/[0.08] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 truncate">
              <ShieldCheck className="w-4 h-4 text-[#2BED77] shrink-0 stroke-[2.2]" />
              <span className="text-xs font-medium text-[#EADDFC] truncate">
                {user.biomechanicalFocus || 'Preservação articular de ombros e lombar'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#2BED77]/15 border border-[#2BED77]/30 text-[#2BED77] text-[10px] font-bold tracking-wider shrink-0 ml-2">
              ATIVO
            </span>
          </div>
        </section>

        {/* COLUNA DIREITA: Card do LÉO & Atalhos Secundários */}
        <section aria-label="Assistente LÉO IA e Acompanhamento" className="space-y-3.5">
          {/* Card LÉO IA — Seu Assistente com Avatar Oficial */}
          <article aria-label="Assistente LÉO IA" className="rounded-3xl bg-[#160E26] border border-white/[0.08] p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all hover:border-[#842BAF]/30">
            <div className="flex items-center gap-3.5 relative z-10">
              {/* Avatar Oficial Circular do LÉO IA */}
              <div className="relative shrink-0">
                <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full overflow-hidden bg-[#1F1433] border-2 border-[#842BAF]/60 shadow-[0_0_16px_rgba(132,43,175,0.35)]">
                  <img
                    src={LEO_OFFICIAL_AVATAR}
                    alt="LÉO IA — Seu Assistente"
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                  />
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#2BED77] border-2 border-[#160E26] shadow-[0_0_8px_#2BED77]"
                  title="LÉO Online"
                />
              </div>

              {/* Identificação e Mensagem Contextual */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-heading font-extrabold text-white tracking-wide">
                    LÉO IA
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2D124D] text-[#D2A0FF] border border-[#842BAF]/40 tracking-wide">
                    Seu Assistente
                  </span>
                </div>
                <p className="text-xs text-[#EADDFC] leading-snug line-clamp-2">
                  &ldquo;Hoje vamos manter a postura controlada e respeitar seus limites. Vamos evoluir juntos!&rdquo;
                </p>
              </div>

              {/* Botão para Acessar a Conversa com o LÉO */}
              <button
                onClick={() => onNavigateTab('chat')}
                type="button"
                className="w-10 h-10 rounded-2xl bg-[#23173B] hover:bg-[#2F1E4F] border border-white/10 hover:border-[#842BAF]/60 flex items-center justify-center text-[#B784E6] hover:text-white transition-all active:scale-95 shrink-0 shadow-sm min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                title="Abrir conversa com LÉO IA"
                aria-label="Abrir conversa com LÉO IA"
              >
                <MessageSquare className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </article>

          {/* Cards Secundários (Histórico e Instrutor) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card Histórico */}
            <button
              onClick={() => onNavigateTab('history')}
              type="button"
              aria-label={`Ver histórico de treinos: ${stats.totalWorkouts} treinos, ritmo ${stats.weeklyPace}`}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#160E26] border border-white/[0.08] hover:border-[#842BAF]/40 transition-all text-left active:scale-[0.98] group shadow-sm min-h-[82px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A59DB5] block">
                HISTÓRICO
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-heading font-bold text-xs sm:text-sm text-white tracking-tight">
                  {stats.totalWorkouts} treinos • {stats.weeklyPace}
                </span>
                <ChevronRight className="w-4 h-4 text-[#A59DB5] group-hover:text-white transition-colors shrink-0" />
              </div>
            </button>

            {/* Card Instrutor */}
            <button
              onClick={onOpenInstructorModal}
              type="button"
              aria-label={`Acompanhamento com instrutor credenciado: ${instructorDisplayName}`}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#160E26] border border-white/[0.08] hover:border-[#842BAF]/40 transition-all text-left active:scale-[0.98] group shadow-sm min-h-[82px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A59DB5] block">
                INSTRUTOR
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-heading font-bold text-xs sm:text-sm text-white truncate tracking-tight">
                  {instructorDisplayName}
                </span>
                <div className="w-6 h-6 rounded-lg bg-[#271542] text-[#B784E6] flex items-center justify-center shrink-0 border border-[#842BAF]/30 group-hover:bg-[#351a5c] transition-colors">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
