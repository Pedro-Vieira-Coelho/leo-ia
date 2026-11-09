import React, { useState } from 'react';
import { historyService } from '../services/history.service';
import { PastWorkoutLog, CalendarDayStatus } from '../models/history.model';
import { useAccessibleModal } from '../shared/useAccessibleModal';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';
import {
  Trophy,
  Flame,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  X,
  FileText,
  Activity,
  Layers
} from 'lucide-react';

interface HistoryPageProps {
  onNavigateToChat: () => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onNavigateToChat
}) => {
  // Filtros de Período
  const [selectedFilter, setSelectedFilter] = useState<'Semana' | 'Este mês' | 'Últimos 3 meses'>('Este mês');
  const stats = historyService.getStats(selectedFilter);
  const pastWorkouts = historyService.getPastWorkouts(selectedFilter);

  // Navegação do Calendário
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(10); // Outubro
  const calendarDays = historyService.getMonthCalendarDays(calendarYear, calendarMonth);

  // Dia Selecionado no Calendário
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-10-27');
  const [selectedDayStatus, setSelectedDayStatus] = useState<CalendarDayStatus | null>(
    calendarDays.find(d => d.dateKey === '2026-10-27') || null
  );

  // Lista de Treinos e Modal de Detalhes
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [selectedWorkoutModal, setSelectedWorkoutModal] = useState<PastWorkoutLog | null>(null);

  const { modalRef: workoutDetailsModalRef } = useAccessibleModal({
    isOpen: !!selectedWorkoutModal,
    onClose: () => setSelectedWorkoutModal(null)
  });

  // Treinos correspondentes à data selecionada no calendário
  const selectedDateWorkouts = historyService.getWorkoutsByDateKey(selectedDateKey);

  // Navegação de Mês
  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  // Selecionar dia no calendário
  const handleSelectDay = (cell: CalendarDayStatus) => {
    setSelectedDateKey(cell.dateKey);
    setSelectedDayStatus(cell);
  };

  // Mensagem contextual e útil do Insight do LÉO baseada nos dados reais
  const getLeoInsightMessage = () => {
    if (selectedFilter === 'Semana') {
      return `Você realizou ${stats.totalWorkouts} treinos nesta semana. Continue mantendo a consistência!`;
    }
    if (selectedFilter === 'Últimos 3 meses') {
      return `Excelente histórico: ritmo médio de ${stats.weeklyPace} treinos por semana no trimestre!`;
    }
    return `Sua meta de ${stats.weeklyPace} treinos por semana está em dia. ${stats.activeStreakDays} dias de consistência ativa!`;
  };

  const displayedWorkouts = showAllWorkouts ? pastWorkouts : pastWorkouts.slice(0, 3);

  // Formatar título do dia selecionado
  const getSelectedDateTitle = () => {
    if (!selectedDayStatus) return 'Data selecionada';
    return `${selectedDayStatus.dayNumber} de ${MONTH_NAMES[selectedDayStatus.month - 1]} de ${selectedDayStatus.year}`;
  };

  return (
    <div className="space-y-4 px-4 pt-3.5 pb-safe-nav animate-fadeIn">
      {/* 1. Título & Subtítulo */}
      <header>
        <h1 className="text-xl font-heading font-extrabold text-white">
          Meu histórico
        </h1>
        <p className="text-xs text-[#A59DB5] mt-0.5">
          Acompanhe sua evolução e consistência de treinos
        </p>
      </header>

      {/* 2. Indicadores Superiores (Calculados dinamicamente) */}
      <section aria-label="Resumo de estatísticas de treino" className="grid grid-cols-3 gap-2">
        {/* TOTAL */}
        <div className="p-3 rounded-2xl bg-[#160E26] border border-white/[0.08] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#A59DB5] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">TOTAL</span>
            <Trophy className="w-3.5 h-3.5 text-[#B784E6]" />
          </div>
          <div>
            <span className="text-2xl font-heading font-extrabold text-white tabular-nums block leading-tight font-mono">
              {stats.totalWorkouts}
            </span>
            <span className="text-[10px] text-[#8C849B]">
              {selectedFilter === 'Semana' ? 'nesta semana' : 'treinos feitos'}
            </span>
          </div>
        </div>

        {/* RITMO */}
        <div className="p-3 rounded-2xl bg-[#160E26] border border-white/[0.08] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#A59DB5] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">RITMO</span>
            <CalendarIcon className="w-3.5 h-3.5 text-[#B784E6]" />
          </div>
          <div>
            <span className="text-2xl font-heading font-extrabold text-white tabular-nums block leading-tight font-mono">
              {stats.weeklyPace}
            </span>
            <span className="text-[10px] text-[#8C849B]">por semana</span>
          </div>
        </div>

        {/* CONSISTÊNCIA */}
        <div className="p-3 rounded-2xl bg-[#160E26] border border-[#2BED77]/25 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#2BED77] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A59DB5]">CONSISTÊNCIA</span>
            <Flame className="w-3.5 h-3.5 fill-[#2BED77] text-[#2BED77]" />
          </div>
          <div>
            <span className="text-2xl font-heading font-extrabold text-[#2BED77] tabular-nums block leading-tight font-mono">
              {stats.activeStreakDays}
            </span>
            <span className="text-[10px] text-[#A59DB5]">dias consistentes</span>
          </div>
        </div>
      </section>

      {/* 3. Filtros de Período Funcionais */}
      <nav aria-label="Filtro de período do histórico" className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {(['Semana', 'Este mês', 'Últimos 3 meses'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              type="button"
              aria-pressed={isActive}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
                isActive
                  ? 'bg-[#842BAF] text-white shadow-[0_0_12px_rgba(132,43,175,0.4)]'
                  : 'bg-[#160E26] text-[#A59DB5] hover:text-white border border-white/5'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </nav>

      {/* Grid Responsivo: 1 coluna no celular, 2 colunas equilibradas em tablets e desktops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* COLUNA ESQUERDA: Calendário Interativo de Atividades */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-[#160E26] border border-white/[0.08] p-4 shadow-sm">
            {/* Cabeçalho do Mês com Navegação Anterior/Próximo */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-heading font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#B784E6]" />
                <span>{MONTH_NAMES[calendarMonth - 1]} {calendarYear}</span>
              </h2>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-[#1F1433] hover:bg-[#271044] text-[#A59DB5] hover:text-white border border-white/5 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Mês anterior"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-[#1F1433] hover:bg-[#271044] text-[#A59DB5] hover:text-white border border-white/5 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Próximo mês"
                  aria-label="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#8C849B] mb-2">
              <span>D</span>
              <span>S</span>
              <span>T</span>
              <span>Q</span>
              <span>Q</span>
              <span>S</span>
              <span>S</span>
            </div>

            {/* Grade de Dias */}
            <div className="grid grid-cols-7 gap-y-2 text-center" role="grid" aria-label={`Calendário de ${MONTH_NAMES[calendarMonth - 1]} de ${calendarYear}`}>
              {calendarDays.map((cell, idx) => {
                const isCarryover = !cell.isCurrentMonth;
                const hasWorkout = cell.hasWorkout;
                const isSelected = selectedDateKey === cell.dateKey;
                const isToday = cell.isToday;

                return (
                  <div key={idx} className="flex flex-col items-center justify-center" role="gridcell">
                    <button
                      type="button"
                      onClick={() => handleSelectDay(cell)}
                      aria-pressed={isSelected}
                      aria-label={`${cell.dayNumber} de ${MONTH_NAMES[cell.month - 1]} de ${cell.year}, ${hasWorkout ? 'treino realizado' : 'descanso'}${isSelected ? ', selecionado' : ''}`}
                      className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs font-semibold relative transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
                        isSelected
                          ? 'ring-2 ring-[#B784E6] ring-offset-2 ring-offset-[#160E26] shadow-[0_0_12px_rgba(183,132,230,0.5)]'
                          : ''
                      } ${
                        hasWorkout
                          ? 'bg-[#842BAF] text-white hover:bg-[#9532c6]'
                          : isCarryover
                          ? 'text-[#8C849B] hover:bg-white/5 opacity-60'
                          : 'text-[#A59DB5] hover:bg-white/5'
                      }`}
                      title={`${cell.dayNumber} de ${MONTH_NAMES[cell.month - 1]} ${hasWorkout ? '(Treino realizado)' : '(Descanso)'}`}
                    >
                      <span className={isToday && !hasWorkout ? 'text-white font-bold' : ''}>
                        {cell.dayNumber}
                      </span>
                      {hasWorkout && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2BED77] absolute bottom-0.5 shadow-[0_0_4px_#2BED77]" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Legenda Discreta */}
            <div className="flex items-center justify-center gap-6 mt-3 pt-2.5 border-t border-white/5 text-[10px] text-[#A59DB5]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2BED77] shadow-[0_0_4px_#2BED77]" aria-hidden="true" />
                <span>Treino realizado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8C849B]" aria-hidden="true" />
                <span>Descanso</span>
              </div>
            </div>

            {/* Treinos Realizados no Dia Selecionado */}
            <div className="mt-3.5 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#B784E6]" />
                  {getSelectedDateTitle()}
                </span>
                <span className="text-[10px] text-[#A59DB5]">
                  {selectedDateWorkouts.length > 0
                    ? `${selectedDateWorkouts.length} ${selectedDateWorkouts.length === 1 ? 'treino registrado' : 'treinos registrados'}`
                    : 'Dia sem treino'}
                </span>
              </div>

              {selectedDateWorkouts.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateWorkouts.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWorkoutModal(w)}
                      className="p-3 rounded-2xl bg-[#1F1433] border border-[#842BAF]/30 hover:border-[#842BAF]/60 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#842BAF]/30 text-[#D2A0FF] border border-[#842BAF]/30">
                            {w.workoutCode}
                          </span>
                          <h4 className="text-xs font-semibold text-white truncate">
                            {w.title.replace(`${w.workoutCode} — `, '')}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A59DB5]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#A59DB5]" />
                            {w.durationMin} min
                          </span>
                          <span>•</span>
                          <span>{w.exerciseCount} exercícios</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-[#2BED77]/10 text-[#2BED77] text-[10px] font-semibold border border-[#2BED77]/20">
                          Concluído
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#B784E6]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#1F1433]/40 border border-white/5 text-center text-xs text-[#A59DB5]">
                  Dia de descanso ativo. Nenhuma sessão de treino registrada nesta data.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Insight do LÉO & Treinos Anteriores */}
        <div className="space-y-4">
          {/* Insight do LÉO (Avatar Oficial + Mensagem Útil) */}
          <div
            onClick={onNavigateToChat}
            className="p-3 rounded-2xl bg-[#1F1433] border border-[#842BAF]/30 flex items-center justify-between gap-3 cursor-pointer hover:border-[#842BAF]/60 transition-all shadow-md group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar Oficial do LÉO IA com corte circular e contorno roxo */}
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1F1433] border-2 border-[#842BAF]/60 shadow-[0_0_10px_rgba(132,43,175,0.4)] shrink-0">
                <img
                  src={LEO_OFFICIAL_AVATAR}
                  alt="LÉO IA"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#B784E6] uppercase tracking-wider">
                    Insight do LÉO
                  </span>
                  <span className="text-[10px] text-[#2BED77] font-semibold">
                    Consistência Ativa
                  </span>
                </div>
                <p className="text-xs text-[#EADDFC] truncate font-medium">
                  {getLeoInsightMessage()}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#B784E6] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* Treinos Anteriores (Histórico Geral com Detalhes) */}
          <div className="rounded-3xl bg-[#160E26] border border-white/[0.08] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-heading font-bold text-white">
                Treinos anteriores
              </h3>
              <span className="text-[11px] text-[#8C849B]">Mais recentes</span>
            </div>

            <div className="space-y-2">
              {displayedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => setSelectedWorkoutModal(workout)}
                  className="p-3 rounded-2xl bg-[#1F1433]/70 border border-white/5 hover:border-[#842BAF]/40 cursor-pointer transition-all active:scale-[0.99] shadow-xs group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#D2A0FF] transition-colors">
                      {workout.title}
                    </h4>
                    <span className="text-[10px] text-[#2BED77] bg-[#2BED77]/10 px-2 py-0.5 rounded-full border border-[#2BED77]/30 shrink-0 font-medium">
                      {workout.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#A59DB5] mt-1.5">
                    <span className="truncate">{workout.dateFormatted}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0270FF]/15 text-[#0270FF] font-semibold text-[10px] shrink-0 border border-[#0270FF]/25">
                      {workout.maxStatLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAllWorkouts(!showAllWorkouts)}
                className="w-full py-2.5 rounded-xl bg-[#1F1433] text-xs font-semibold text-[#EADDFC] border border-white/5 flex items-center justify-center gap-1.5 hover:bg-[#271044] hover:text-white transition-colors"
              >
                <span>{showAllWorkouts ? 'Mostrar menos' : 'Ver todos os treinos anteriores'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#B784E6] transition-transform ${showAllWorkouts ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Modal Completo de Detalhes do Treino (Séries, Repetições, Cargas e Observações) */}
      {selectedWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            ref={workoutDetailsModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-history-workout-title"
            tabIndex={-1}
            className="w-full max-w-sm max-h-[85vh] rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative flex flex-col overflow-hidden focus:outline-none"
          >
            {/* Header do Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#842BAF]/30 text-[#D2A0FF] border border-[#842BAF]/30 inline-block mb-1">
                  {selectedWorkoutModal.workoutCode}
                </span>
                <h3 id="modal-history-workout-title" className="text-sm font-heading font-bold text-white leading-snug">
                  {selectedWorkoutModal.title}
                </h3>
                <p className="text-xs text-[#A59DB5] mt-0.5">
                  {selectedWorkoutModal.dateFormatted}
                </p>
              </div>

              <button
                onClick={() => setSelectedWorkoutModal(null)}
                type="button"
                className="p-1.5 rounded-xl text-[#8C849B] hover:text-white bg-white/5 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                title="Fechar detalhes"
                aria-label="Fechar detalhes do treino"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Métricas Rápidas do Treino */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#160E26] border border-white/5 text-center shrink-0 mb-3">
              <div>
                <span className="text-[10px] text-[#8C849B] block">Duração</span>
                <span className="text-xs font-bold text-white">{selectedWorkoutModal.durationMin} min</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8C849B] block">Exercícios</span>
                <span className="text-xs font-bold text-white">{selectedWorkoutModal.exerciseCount} concluídos</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8C849B] block">Carga Máx.</span>
                <span className="text-xs font-bold text-[#0270FF] truncate block">{selectedWorkoutModal.maxStatLabel}</span>
              </div>
            </div>

            {/* Conteúdo Rolável: Exercícios e Séries */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
              {/* Observações Registradas (se houver) */}
              {selectedWorkoutModal.feedbackNotes && (
                <div className="p-3 rounded-2xl bg-[#160E26] border border-[#842BAF]/25 text-xs text-[#EADDFC]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#B784E6] mb-1">
                    <FileText className="w-3.5 h-3.5 text-[#2BED77]" />
                    <span>Observações do Treino</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-[#D1C2D3]">
                    {selectedWorkoutModal.feedbackNotes}
                  </p>
                </div>
              )}

              {/* Lista Detalhada de Exercícios, Séries e Cargas */}
              {selectedWorkoutModal.exercises && selectedWorkoutModal.exercises.length > 0 ? (
                <div className="space-y-2.5">
                  <span className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#B784E6]" />
                    <span>Séries e Cargas Realizadas</span>
                  </span>

                  {selectedWorkoutModal.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3 rounded-2xl bg-[#160E26] border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">
                          {ex.name}
                        </span>
                        <span className="text-[10px] text-[#8C849B]">
                          {ex.muscleGroup}
                        </span>
                      </div>

                      {/* Tabela de Séries */}
                      <div className="space-y-1">
                        {ex.sets.map((set) => (
                          <div
                            key={set.setNumber}
                            className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#1F1433]/60 text-[11px]"
                          >
                            <span className="font-semibold text-white">
                              {set.setNumber}ª série
                            </span>
                            <span className="text-[#A59DB5]">
                              {set.reps}
                            </span>
                            <span className="font-bold text-[#D2A0FF] font-mono">
                              {set.weightKg} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#160E26] border border-white/5 text-center text-xs text-[#A59DB5]">
                  Todos os {selectedWorkoutModal.exerciseCount} exercícios foram completados com sucesso nesta sessão.
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="pt-3 border-t border-white/10 shrink-0 mt-3">
              <button
                type="button"
                onClick={() => setSelectedWorkoutModal(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all"
              >
                Voltar ao histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
