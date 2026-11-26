import React, { useState, useEffect } from 'react';
import { workoutService } from '../services/workout.service';
import { historyService } from '../services/history.service';
import { authService } from '../services/auth.service';
import { Exercise } from '../models/workout.model';
import { ExerciseAlternativeModal } from '../components/ExerciseAlternativeModal';
import { WorkoutTimerModal } from '../components/WorkoutTimerModal';
import { useAccessibleModal } from '../shared/useAccessibleModal';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';
import {
  CheckCircle2,
  Clock,
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Plus,
  Minus,
  Video,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  FastForward,
  AlertCircle,
  Wind
} from 'lucide-react';

interface WorkoutPageProps {
  onWorkoutCompleted: () => void;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({
  onWorkoutCompleted
}) => {
  const [workouts, setWorkouts] = useState(workoutService.getWorkouts());
  const [activeWorkout, setActiveWorkout] = useState(workoutService.getActiveWorkout());
  const progress = workoutService.calculateProgress(activeWorkout);

  // Modals & Popups
  const [selectedExForAlternative, setSelectedExForAlternative] = useState<Exercise | null>(null);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [videoModalEx, setVideoModalEx] = useState<Exercise | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [completionError, setCompletionError] = useState('');

  const { modalRef: videoModalRef } = useAccessibleModal({
    isOpen: !!videoModalEx,
    onClose: () => setVideoModalEx(null)
  });

  const { modalRef: celebrationModalRef } = useAccessibleModal({
    isOpen: celebrationOpen,
    onClose: () => setCelebrationOpen(false)
  });

  // Expandable state for tips and collapsed exercises
  const [activeTipId, setActiveTipId] = useState<string | null>(null);
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});

  // Auto-Rest Timer State
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [restTotalDuration, setRestTotalDuration] = useState<number>(60);
  const [restRunning, setRestRunning] = useState<boolean>(false);

  // Subscribe to workout changes
  useEffect(() => {
    const unsub = workoutService.subscribe(() => {
      setWorkouts([...workoutService.getWorkouts()]);
      setActiveWorkout({ ...workoutService.getActiveWorkout() });
    });
    return () => unsub();
  }, []);

  // Interval for Rest Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (restRunning && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            setRestRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restRunning, restSecondsLeft]);

  // Start rest timer automatically or manually
  const startRestTimer = (seconds: number) => {
    setRestTotalDuration(seconds);
    setRestSecondsLeft(seconds);
    setRestRunning(true);
  };

  const handlePauseResumeRest = () => {
    setRestRunning((prev) => !prev);
  };

  const handleAddRestTime = (secondsToAdd: number) => {
    setRestSecondsLeft((prev) => prev + secondsToAdd);
    setRestTotalDuration((prev) => prev + secondsToAdd);
    setRestRunning(true);
  };

  const handleSkipRest = () => {
    setRestSecondsLeft(0);
    setRestRunning(false);
  };

  // Toggle individual set completion & trigger auto-rest
  const handleToggleSet = (exercise: Exercise, setNumber: number) => {
    const targetSet = exercise.sets.find((s) => s.setNumber === setNumber);
    const wasCompleted = targetSet ? targetSet.completed : false;

    workoutService.toggleSetCompletion(exercise.id, setNumber);
    setCompletionError('');

    // If user marked a set as finished, automatically trigger rest interval!
    if (!wasCompleted) {
      const userPrefRest = authService.getUser()?.leoPreferences?.restDurationSeconds;
      const restDuration = userPrefRest || exercise.defaultRestSeconds || 60;
      startRestTimer(restDuration);
    }
  };

  const handleToggleExercise = (exerciseId: string) => {
    workoutService.toggleExerciseCompletion(exerciseId);
    setCompletionError('');
  };

  const handleAdjustWeight = (exerciseId: string, setNumber: number, delta: number, currentWeight: number) => {
    workoutService.updateSetWeight(exerciseId, setNumber, Math.max(0, currentWeight + delta));
  };

  const handleSelectAlternative = (index: number) => {
    if (selectedExForAlternative) {
      workoutService.swapWithAlternative(selectedExForAlternative.id, index);
      setSelectedExForAlternative(null);
    }
  };

  const toggleExerciseCollapse = (id: string) => {
    setCollapsedExercises((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFinishWorkout = () => {
    const result = workoutService.completeFullWorkout();
    if (!result.completed) {
      const activityLabel = result.incompleteExercises === 1 ? 'exercício ainda tem' : 'exercícios ainda têm';
      setCompletionError(`Não foi possível concluir: ${result.incompleteExercises} ${activityLabel} séries pendentes. Marque somente as séries que você realizou.`);
      return;
    }

    setCompletionError('');
    historyService.addWorkoutLog({
      workoutCode: activeWorkout.code,
      title: activeWorkout.title,
      dateFormatted: `Hoje, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} • ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      durationMin: result.minutes,
      exerciseCount: activeWorkout.exercises.length,
      maxStatLabel: activeWorkout.maxWeightLabel || 'Carga máx. 24kg',
      status: 'Concluído'
    });
    setCelebrationOpen(true);
  };

  const restTimerProgress = restTotalDuration > 0
    ? Math.min(100, Math.max(0, ((restTotalDuration - restSecondsLeft) / restTotalDuration) * 100))
    : 0;

  return (
    <div className="space-y-3.5 px-4 pt-3.5 pb-safe-nav animate-fadeIn">
      {/* 1. Header do Treino Ativo & Timer Superior */}
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-[#B784E6] uppercase tracking-wider block">
            Treino Ativo
          </span>
          <h1 className="text-xl font-heading font-extrabold text-white truncate">
            {activeWorkout.code} — {activeWorkout.title}
          </h1>
        </div>

        {/* Botão de Controle do Timer Superior */}
        <button
          onClick={() => {
            if (restSecondsLeft > 0) {
              setTimerModalOpen(true);
            } else {
              startRestTimer(activeWorkout.exercises[0]?.defaultRestSeconds || 60);
            }
          }}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95 shrink-0 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
            restRunning
              ? 'bg-[#271044] border-[#2BED77]/60 text-[#2BED77] shadow-[0_0_12px_rgba(43,237,119,0.3)]'
              : restSecondsLeft > 0
              ? 'bg-[#1F1433] border-[#FFD729]/50 text-[#FFD729]'
              : 'bg-[#1F1433] border-[#842BAF]/40 text-[#B784E6] hover:text-white'
          }`}
          title="Abrir ou controlar timer de descanso"
          aria-label={restSecondsLeft > 0 ? `Descanso em andamento: ${restSecondsLeft} segundos restantes. Clique para abrir controle.` : `Iniciar timer de descanso de ${activeWorkout.exercises[0]?.defaultRestSeconds || 60} segundos`}
        >
          <Clock className={`w-3.5 h-3.5 ${restRunning ? 'animate-pulse text-[#2BED77]' : ''}`} />
          <span>
            {restSecondsLeft > 0
              ? `Descanso: ${restSecondsLeft}s`
              : `Timer (${activeWorkout.exercises[0]?.defaultRestSeconds || 60}s)`}
          </span>
        </button>
      </header>

      {/* 2. Banner de Descanso Automático Ativo (Aparece quando o timer estiver em andamento) */}
      {restSecondsLeft > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-[#271044] via-[#1F1433] to-[#160B25] border border-[#2BED77]/40 p-3 shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#2BED77]/15 border border-[#2BED77]/30 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#2BED77] animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading font-bold text-white">
                  Descanso: <span className="text-[#2BED77] tabular-nums font-mono">{restSecondsLeft}s</span>
                </span>
                <span className="text-[10px] text-[#A59DB5] hidden xs:inline">
                  {restRunning ? 'em andamento' : 'pausado'}
                </span>
              </div>
              {/* Barra de progresso do timer */}
              <div className="w-32 xs:w-40 h-1.5 rounded-full bg-[#160E26] overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-[#842BAF] to-[#2BED77] rounded-full transition-all duration-300"
                  style={{ width: `${100 - restTimerProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ações do Timer: Pausar/Continuar, +15s, Pular */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePauseResumeRest}
              type="button"
              className="p-1.5 rounded-lg bg-[#160E26] text-[#EADDFC] hover:text-white border border-white/10 active:scale-90 transition-all"
              title={restRunning ? 'Pausar descanso' : 'Continuar descanso'}
            >
              {restRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#2BED77]" />}
            </button>

            <button
              onClick={() => handleAddRestTime(15)}
              type="button"
              className="px-2 py-1 rounded-lg bg-[#160E26] text-[#D2A0FF] hover:text-white text-[11px] font-bold border border-[#842BAF]/30 active:scale-90 transition-all"
              title="Adicionar 15 segundos"
            >
              +15s
            </button>

            <button
              onClick={handleSkipRest}
              type="button"
              className="p-1.5 rounded-lg bg-[#160E26] text-[#A59DB5] hover:text-[#FFB4AB] border border-white/10 active:scale-90 transition-all"
              title="Pular descanso"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Seletor de Treinos Limpo (Treino A, B, C) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {workouts.map((w) => {
          const isActive = w.code === activeWorkout.code;
          return (
            <button
              key={w.id}
              onClick={() => workoutService.setActiveWorkoutCode(w.code)}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#842BAF] text-white shadow-[0_0_12px_rgba(132,43,175,0.4)]'
                  : 'bg-[#160E26] text-[#A59DB5] hover:text-white border border-white/5'
              }`}
            >
              {w.code}
            </button>
          );
        })}
      </div>

      {/* 4. Progresso do Treino com Diferenciação Clara */}
      <div className="rounded-2xl bg-[#160E26] border border-white/[0.08] p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-[#A59DB5]">
          <span className="font-medium text-white">
            <strong className="text-[#2BED77]">{progress.completed}</strong> de {progress.total} exercícios concluídos
          </span>
          <span className="font-bold text-[#2BED77] tabular-nums font-mono text-sm">
            {progress.percentage}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#201636] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#842BAF] to-[#2BED77] rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* 5. Lista de Exercícios (Layout Aprovado com Refinamentos de Usabilidade) */}
      <section aria-label="Lista de exercícios do treino" className="space-y-3 pt-1">
        {activeWorkout.exercises.map((ex, index) => {
          const isCollapsed = collapsedExercises[ex.id] || false;
          const completedSetsCount = ex.sets.filter((s) => s.completed).length;
          const allSetsDone = ex.sets.length > 0 && completedSetsCount === ex.sets.length;

          return (
            <article
              key={ex.id}
              aria-label={`Exercício ${index + 1}: ${ex.name}`}
              className={`rounded-3xl border transition-all ${
                ex.completed
                  ? 'bg-[#160E26]/90 border-[#2BED77]/40 shadow-sm'
                  : 'bg-[#160E26] border-white/[0.08]'
              }`}
            >
              {/* Header do Exercício */}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Botão de Conclusão Global do Exercício */}
                  <button
                    type="button"
                    onClick={() => handleToggleExercise(ex.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
                      ex.completed
                        ? 'bg-[#2BED77] text-[#0B0712] shadow-[0_0_8px_rgba(43,237,119,0.5)]'
                        : 'border border-white/20 hover:border-[#842BAF] text-transparent bg-[#1F1433]'
                    }`}
                    title={ex.completed ? 'Marcar como não concluído' : 'Concluir todas as séries'}
                    aria-label={ex.completed ? `Desmarcar exercício ${ex.name}` : `Marcar todas as séries de ${ex.name} como concluídas`}
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#8C849B]">#{index + 1}</span>
                      {/* Nome do exercício com suporte a até 2 linhas completas sem cortes bruscos */}
                      <h3
                        className={`text-sm sm:text-base font-heading font-bold leading-snug line-clamp-2 break-words ${
                          ex.completed ? 'text-[#2BED77] line-through opacity-90' : 'text-white'
                        }`}
                      >
                        {ex.name}
                      </h3>
                    </div>

                    {/* Grupo muscular e contador de séries concluídas */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[#8C849B]">
                      <span>{ex.muscleGroup}</span>
                      <span>•</span>
                      <span className={`font-medium ${allSetsDone ? 'text-[#2BED77]' : 'text-[#A59DB5]'}`}>
                        {completedSetsCount} de {ex.sets.length} séries concluídas
                      </span>
                    </div>

                    {/* Desempenho Anterior (quando houver histórico disponível) */}
                    {ex.previousPerformance && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1F1433] border border-white/5 text-[11px]">
                        <span className="text-[#8C849B]">Anterior:</span>
                        <strong className="text-[#EADDFC] font-semibold">{ex.previousPerformance}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas: Alternativas Biomecânicas, Demonstração e Recolher */}
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  {ex.alternatives && ex.alternatives.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedExForAlternative(ex)}
                      className="w-8 h-8 rounded-xl bg-[#1F1433] text-[#B784E6] hover:bg-[#842BAF] hover:text-white border border-[#842BAF]/25 flex items-center justify-center transition-all"
                      title="Ver alternativas biomecânicas"
                      aria-label="Substituir exercício"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setVideoModalEx(ex)}
                    className="w-8 h-8 rounded-xl bg-[#1F1433] text-[#0270FF] hover:bg-[#0270FF] hover:text-white border border-[#0270FF]/25 flex items-center justify-center transition-all"
                    title="Ver cadência e demonstração"
                    aria-label="Demonstração do exercício"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExerciseCollapse(ex.id)}
                    className="w-8 h-8 rounded-xl bg-[#1F1433] text-[#8C849B] hover:text-white border border-white/5 flex items-center justify-center transition-all"
                    title={isCollapsed ? 'Expandir séries' : 'Recolher séries'}
                    aria-label="Expandir ou recolher"
                  >
                    {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Conteúdo Expansível: Séries e Dicas de Postura */}
              {!isCollapsed && (
                <>
                  {/* Dica de Postura do LÉO (Expansível com Execução, Erro a Evitar e Respiração) */}
                  <div className="px-4 pb-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTipId(activeTipId === ex.id ? null : ex.id)}
                      className="text-xs text-[#B784E6] hover:text-white flex items-center gap-1.5 py-1 transition-colors group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#2BED77] group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">
                        {activeTipId === ex.id ? 'Ocultar dica de postura' : 'Dica de postura do LÉO'}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeTipId === ex.id ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </button>

                    {activeTipId === ex.id && (
                      <div className="mt-2 p-3.5 rounded-2xl bg-[#1F1433] border border-[#842BAF]/30 text-xs text-[#EADDFC] space-y-2.5 animate-fadeIn">
                        {/* 1. Orientação de Execução */}
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-md bg-[#842BAF]/30 text-[#D2A0FF] flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B784E6] block">
                              Execução Correta
                            </span>
                            <p className="text-[11px] text-[#EADDFC] leading-relaxed">
                              {ex.postureTip?.execution || ex.leoTip}
                            </p>
                          </div>
                        </div>

                        {/* 2. Erro Comum a Evitar */}
                        <div className="flex items-start gap-2 pt-1 border-t border-white/5">
                          <div className="w-5 h-5 rounded-md bg-[#FFB4AB]/20 text-[#FFB4AB] flex items-center justify-center shrink-0 mt-0.5">
                            <AlertCircle className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB4AB] block">
                              Erro a Evitar
                            </span>
                            <p className="text-[11px] text-[#D1C2D3] leading-relaxed">
                              {ex.postureTip?.avoidError || 'Evite compensações corporais com impulso lombar ou hiperflexão.'}
                            </p>
                          </div>
                        </div>

                        {/* 3. Dica de Respiração */}
                        <div className="flex items-start gap-2 pt-1 border-t border-white/5">
                          <div className="w-5 h-5 rounded-md bg-[#2BED77]/20 text-[#2BED77] flex items-center justify-center shrink-0 mt-0.5">
                            <Wind className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2BED77] block">
                              Respiração Sugerida
                            </span>
                            <p className="text-[11px] text-[#D1C2D3] leading-relaxed">
                              {ex.postureTip?.breathing || 'Expire durante o esforço concêntrico e inspire no retorno excêntrico.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tabela de Séries, Repetições e Cargas */}
                  <div className="px-4 pb-4">
                    <div className="space-y-2">
                      {/* Cabeçalho da Tabela */}
                      <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-[#8C849B] px-3 py-1 border-b border-white/5">
                        <div className="col-span-2">Série</div>
                        <div className="col-span-3">Alvo</div>
                        <div className="col-span-4 text-center">Carga (kg)</div>
                        <div className="col-span-3 text-right">Feito</div>
                      </div>

                      {/* Linhas de Séries com Botões de Carga com Área de Toque Adequada */}
                      {ex.sets.map((set) => (
                        <div
                          key={set.setNumber}
                          className={`grid grid-cols-12 items-center py-2 px-3 rounded-2xl transition-all ${
                            set.completed
                              ? 'bg-[#2BED77]/10 border border-[#2BED77]/20 shadow-xs'
                              : 'bg-[#1F1433]/50 border border-white/5'
                          }`}
                        >
                          {/* Número da Série */}
                          <div className="col-span-2 text-xs font-heading font-bold text-white">
                            {set.setNumber}ª
                          </div>

                          {/* Repetições Alvo */}
                          <div className="col-span-3 text-xs text-[#A59DB5] font-medium">
                            {set.repsTarget} reps
                          </div>

                          {/* Ajuste de Carga (+/- kg) com área de toque mínima confortável */}
                          <div className="col-span-4 flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(ex.id, set.setNumber, -2, set.weightKg)}
                              className="w-7 h-7 rounded-lg bg-[#160E26] hover:bg-[#271044] text-[#A59DB5] hover:text-white flex items-center justify-center border border-white/10 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                              title={`Diminuir 2kg na ${set.setNumber}ª série de ${ex.name}`}
                              aria-label={`Diminuir 2kg na ${set.setNumber}ª série de ${ex.name}`}
                            >
                              <Minus className="w-3 h-3 stroke-[2.5]" />
                            </button>

                            <span className="text-xs sm:text-sm font-bold text-white tabular-nums min-w-[28px] text-center font-mono">
                              {set.weightKg}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(ex.id, set.setNumber, 2, set.weightKg)}
                              className="w-7 h-7 rounded-lg bg-[#160E26] hover:bg-[#271044] text-[#A59DB5] hover:text-white flex items-center justify-center border border-white/10 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                              title={`Aumentar 2kg na ${set.setNumber}ª série de ${ex.name}`}
                              aria-label={`Aumentar 2kg na ${set.setNumber}ª série de ${ex.name}`}
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* Marcação de Concluído da Série */}
                          <div className="col-span-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleToggleSet(ex, set.setNumber)}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BED77] ${
                                set.completed
                                  ? 'bg-[#2BED77] text-[#0B0712] shadow-[0_0_10px_rgba(43,237,119,0.5)] scale-105'
                                  : 'border-2 border-white/20 hover:border-[#2BED77] bg-[#160E26] text-transparent hover:text-[#2BED77]/40'
                              }`}
                              title={set.completed ? `Desmarcar ${set.setNumber}ª série de ${ex.name}` : `Concluir ${set.setNumber}ª série de ${ex.name} e iniciar descanso`}
                              aria-label={set.completed ? `Desmarcar ${set.setNumber}ª série de ${ex.name}` : `Concluir ${set.setNumber}ª série de ${ex.name} e iniciar descanso`}
                            >
                              <CheckCircle2 className="w-4 h-4 stroke-[2.8]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </section>

      {/* 6. Botão Finalizar Sessão de Treino */}
      {activeWorkout.isTemplate && (
        <p className="rounded-xl border border-[#B784E6]/20 bg-[#B784E6]/10 px-3 py-2 text-[11px] leading-relaxed text-[#D2A0FF]" role="note">
          Esta é uma ficha inicial de exemplo e pode não refletir seu perfil ou suas necessidades.
        </p>
      )}

      {completionError && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100" role="alert">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{completionError}</p>
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={handleFinishWorkout}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#842BAF] to-[#2BED77] hover:from-[#9232c2] hover:to-[#22d667] text-white font-heading font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(43,237,119,0.3)] active:scale-[0.98] transition-all"
        >
          <Trophy className="w-4 h-4 stroke-[2.2]" />
          <span>Finalizar Sessão de Treino</span>
        </button>
      </div>

      {/* 7. Modal de Alternativas Biomecânicas (Preservado e Organizado) */}
      <ExerciseAlternativeModal
        isOpen={!!selectedExForAlternative}
        onClose={() => setSelectedExForAlternative(null)}
        exercise={selectedExForAlternative}
        onSelectAlternative={handleSelectAlternative}
      />

      {/* 8. Modal de Timer em Tela Cheia */}
      <WorkoutTimerModal
        isOpen={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
        initialSeconds={restSecondsLeft > 0 ? restSecondsLeft : activeWorkout.exercises[0]?.defaultRestSeconds || 60}
      />

      {/* 9. Modal de Demonstração e Cadência do Exercício */}
      {videoModalEx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            ref={videoModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
            tabIndex={-1}
            className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative focus:outline-none"
          >
            <button
              onClick={() => setVideoModalEx(null)}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8C849B] hover:text-white bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
              title="Fechar demonstração"
              aria-label="Fechar demonstração"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 id="video-modal-title" className="text-base font-heading font-bold text-white mb-1 pr-6 leading-snug">
              {videoModalEx.name}
            </h3>
            <p className="text-xs text-[#A59DB5] mb-3">
              Cadência biomecânica: <strong className="text-[#B784E6]">1s concêntrica • 3s excêntrica</strong>
            </p>

            {/* Espaço reservado de demonstração/vídeo */}
            <div className="h-36 rounded-2xl bg-[#160E26] border border-white/10 flex flex-col items-center justify-center text-center p-4 mb-3 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-[#842BAF]/30 border border-[#842BAF]/50 flex items-center justify-center text-[#B784E6] mb-2 shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 ml-0.5" />
              </div>
              <span className="text-xs font-semibold text-white">
                Demonstração da Postura Correta
              </span>
              <span className="text-[10px] text-[#8C849B] mt-0.5">
                Vídeo instrutivo guiado pelo padrão biomecânico LÉO
              </span>
            </div>

            {/* Dica de Postura no Modal */}
            <div className="p-3 rounded-2xl bg-[#160E26] border border-[#842BAF]/20 text-xs text-[#EADDFC] mb-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B784E6] block">
                Foco Principal
              </span>
              <p className="text-[11px] leading-relaxed">
                {videoModalEx.postureTip?.execution || videoModalEx.leoTip}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setVideoModalEx(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
            >
              Entendido, voltar ao treino
            </button>
          </div>
        </div>
      )}

      {/* 10. Tela "Treino Concluído!" com o NOVO AVATAR OFICIAL DO LÉO IA */}
      {celebrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            ref={celebrationModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebration-modal-title"
            tabIndex={-1}
            className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1F1433] to-[#160B25] border border-[#2BED77]/50 p-6 shadow-2xl text-center relative focus:outline-none"
          >
            {/* Avatar Oficial Circular do LÉO IA com Contorno Roxo e Proporções Preservadas */}
            <div className="relative mb-4 flex justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#1F1433] border-3 border-[#842BAF] shadow-[0_0_24px_rgba(132,43,175,0.6)]">
                <img
                  src={LEO_OFFICIAL_AVATAR}
                  alt="LÉO IA — Treino Concluído"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />
              </div>
            </div>

            <h3 id="celebration-modal-title" className="text-xl font-heading font-extrabold text-white mb-1.5 tracking-tight">
              Treino Concluído!
            </h3>

            <p className="text-xs text-[#A59DB5] mb-6 leading-relaxed">
              Parabéns! Sua sessão do <strong className="text-white">{activeWorkout.title}</strong> foi registrada no histórico com sucesso.
            </p>

            <button
              type="button"
              onClick={() => {
                setCelebrationOpen(false);
                onWorkoutCompleted();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#2BED77] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(43,237,119,0.3)] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BED77]"
            >
              Ver no Histórico
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
