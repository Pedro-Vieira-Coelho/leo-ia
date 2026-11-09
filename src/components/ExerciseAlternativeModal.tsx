import React from 'react';
import { Exercise, ExerciseAlternative } from '../models/workout.model';
import { X, ArrowRight, ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';
import { useAccessibleModal } from '../shared/useAccessibleModal';

interface ExerciseAlternativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  onSelectAlternative: (index: number) => void;
}

export const ExerciseAlternativeModal: React.FC<ExerciseAlternativeModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onSelectAlternative
}) => {
  const { modalRef } = useAccessibleModal({
    isOpen: isOpen && !!exercise,
    onClose
  });

  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alternative-modal-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto focus:outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B784E6]" />
            <div>
              <h2 id="alternative-modal-title" className="text-base font-heading font-bold text-white">
                Alternativas Biomecânicas
              </h2>
              <p className="text-xs text-[#A59DB5]">
                Substituição para: <span className="text-white font-medium">{exercise.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Fechar alternativas"
            className="p-2 text-[#8C849B] hover:text-white rounded-full bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#A59DB5] mb-4">
          O LÉO selecionou estas opções considerando sua meta de preservação articular de ombros e o mesmo padrão neuromuscular:
        </p>

        {exercise.alternatives.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#171026] text-center text-xs text-[#A59DB5]">
            Nenhuma alternativa adicional cadastrada para este exercício.
          </div>
        ) : (
          <div className="space-y-3">
            {exercise.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#171026] border border-white/5 hover:border-[#842BAF]/60 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#B784E6]" />
                    <h4 className="text-sm font-semibold text-white">
                      {alt.name}
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#842BAF]/20 text-[#B784E6] border border-[#842BAF]/30 font-medium">
                    {alt.focus}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-[#2BED77] mb-2 bg-[#2BED77]/10 p-2 rounded-lg border border-[#2BED77]/20">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{alt.reason}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#A59DB5] mt-3 pt-2 border-t border-white/5">
                  <span className="text-[11px]">Equipamento: {alt.equipment}</span>
                  <button
                    onClick={() => {
                      onSelectAlternative(idx);
                      onClose();
                    }}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Substituir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-xs font-medium text-[#A59DB5] hover:text-white"
          >
            Manter Exercício Atual
          </button>
        </div>
      </div>
    </div>
  );
};
