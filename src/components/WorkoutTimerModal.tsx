import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Volume2, CheckCircle2 } from 'lucide-react';
import { useAccessibleModal } from '../shared/useAccessibleModal';

interface WorkoutTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds?: number;
}

export const WorkoutTimerModal: React.FC<WorkoutTimerModalProps> = ({
  isOpen,
  onClose,
  initialSeconds = 60
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [targetDuration, setTargetDuration] = useState(initialSeconds);

  const { modalRef } = useAccessibleModal({
    isOpen,
    onClose
  });

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(initialSeconds);
      setTargetDuration(initialSeconds);
      setIsRunning(true);
    }
  }, [isOpen, initialSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const progress = ((targetDuration - secondsLeft) / targetDuration) * 100;
  const isFinished = secondsLeft === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="timer-modal-title"
        tabIndex={-1}
        className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-6 shadow-2xl relative flex flex-col items-center text-center focus:outline-none"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Fechar cronômetro de descanso"
          className="absolute top-4 right-4 p-2 text-[#8C849B] hover:text-white rounded-full bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B784E6] animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B784E6]">
            Intervalo de Descanso LÉO
          </span>
        </div>
        <h2 id="timer-modal-title" className="text-xl font-heading font-bold text-white mb-6">
          {isFinished ? 'Descanso Finalizado!' : 'Recupere o fôlego'}
        </h2>

        {/* Circular Countdown Progress */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#171026]"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="transition-all duration-500 ease-linear"
              stroke={isFinished ? '#2BED77' : '#842BAF'}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            {isFinished ? (
              <CheckCircle2 className="w-12 h-12 text-[#2BED77] animate-bounce" />
            ) : (
              <>
                <span className="text-4xl font-heading font-extrabold text-white tabular-nums">
                  {secondsLeft}s
                </span>
                <span className="text-xs text-[#A59DB5] mt-0.5">restantes</span>
              </>
            )}
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-2 mb-6">
          {[45, 60, 90].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setTargetDuration(sec);
                setSecondsLeft(sec);
                setIsRunning(true);
              }}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                targetDuration === sec
                  ? 'bg-[#842BAF] text-white shadow-[0_0_12px_rgba(132,43,175,0.6)]'
                  : 'bg-[#171026] text-[#A59DB5] hover:text-white border border-white/5'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 w-full justify-center">
          <button
            onClick={() => {
              setSecondsLeft(targetDuration);
              setIsRunning(true);
            }}
            type="button"
            className="p-3 rounded-2xl bg-[#171026] text-[#A59DB5] hover:text-white border border-white/5 transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            type="button"
            className="flex-1 max-w-[160px] py-3 px-6 rounded-2xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(132,43,175,0.5)] active:scale-95 transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-5 h-5" /> Continuar
              </>
            )}
          </button>

          <button
            onClick={onClose}
            type="button"
            className="p-3 rounded-2xl bg-[#171026] text-[#2BED77] hover:bg-[#2BED77]/10 border border-[#2BED77]/20 transition-colors"
            title="Pronto para a próxima série"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        {/* Tip */}
        <p className="text-[11px] text-[#8C849B] mt-5">
          Dica do LÉO: Hidrate-se e faça respirações diafragmáticas profundas para acelerar a restauração neuromuscular.
        </p>
      </div>
    </div>
  );
};
