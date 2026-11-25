import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { UserProfile } from '../models/user.model';
import { ArrowRight, ArrowLeft, Target, Shield, Check, Heart, Zap, Sparkles } from 'lucide-react';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';
import { FulcroDeMovimento } from '../components/FulcroDeMovimento';

interface PreferencesPageProps {
  onComplete: () => void;
  onBack: () => void;
}

export const PreferencesPage: React.FC<PreferencesPageProps> = ({
  onComplete,
  onBack
}) => {
  const [primaryGoal, setPrimaryGoal] = useState<UserProfile['primaryGoal']>('Hipertrofia & Força Funcional');
  const [biomechanicalFocus, setBiomechanicalFocus] = useState('');
  const [limitations, setLimitations] = useState<string[]>([]);
  const [customLimitation, setCustomLimitation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const goalsList: Array<{ title: UserProfile['primaryGoal']; desc: string; icon: any }> = [
    { title: 'Hipertrofia & Força Funcional', desc: 'Aumento de massa magra com amplitude e proteção articular', icon: Zap },
    { title: 'Emagrecimento', desc: 'Gasto calórico elevado e aceleração metabólica', icon: Target },
    { title: 'Condicionamento Físico', desc: 'Resistência cardiorrespiratória e vascular', icon: Heart },
    { title: 'Ganho de Força', desc: 'Adaptações neurais e cargas progressivas com técnica segura', icon: Shield },
    { title: 'Saúde & Longevidade', desc: 'Mobilidade articular, densidade óssea e bem-estar', icon: Sparkles }
  ];

  const commonLimitations = [
    'Desconforto leve no Supino',
    'Adaptação barra para halteres',
    'Sensibilidade lombar em agachamento livre',
    'Condromalácia patelar / evitar agachamento profundo',
    'Túnel do carpo / sensibilidade nos punhos'
  ];

  const toggleLimitation = (item: string) => {
    if (limitations.includes(item)) {
      setLimitations(limitations.filter(l => l !== item));
    } else {
      setLimitations([...limitations, item]);
    }
  };

  const addCustomLimitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLimitation.trim() && !limitations.includes(customLimitation.trim())) {
      setLimitations([...limitations, customLimitation.trim()]);
      setCustomLimitation('');
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    authService.savePreferences({
      primaryGoal,
      biomechanicalFocus,
      activeLimitations: limitations,
      additionalNotes
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#0B0712] flex flex-col justify-between p-4 sm:p-6 lg:p-10 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto relative select-none">
      <div className="relative z-10 w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={onBack}
            type="button"
            className="flex items-center gap-1.5 text-xs text-[#A59DB5] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao passo 1</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B784E6]">
            <span>Passo 2 de 2</span>
            <span className="w-2 h-2 rounded-full bg-[#B784E6]" />
            <span className="w-2 h-2 rounded-full bg-[#B784E6]" />
          </div>
        </div>

        {/* LÉO Advice com Avatar Oficial */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#160E26] border border-[#842BAF]/30 flex items-center gap-3 mb-5 shadow-sm">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#842BAF] bg-[#1F1433] shrink-0">
            <img
              src={LEO_OFFICIAL_AVATAR}
              alt="LÉO IA"
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
          </div>
          <div className="text-xs min-w-0">
            <span className="text-[#B784E6] font-heading font-bold block">Configuração Biomecânica</span>
            <p className="text-[#A59DB5] leading-snug mt-0.5">
              Essas informações ajustam as sugestões de exercícios alternativos, pegadas e ângulos articulares que vou te orientar.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              Objetivos & Preferências
            </h2>
            <p className="text-xs text-[#A59DB5] mt-0.5">
              Qual é o seu foco principal e quais cuidados anatômicos devemos priorizar?
            </p>
          </div>
          <FulcroDeMovimento size={20} showContainer={true} className="hidden sm:flex" />
        </div>

        <form onSubmit={handleFinish} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* COLUNA 1: OBJETIVO PRINCIPAL */}
            <div className="p-4 rounded-3xl bg-[#160E26] border border-white/5 space-y-3">
              <h2 className="text-xs font-heading font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Target className="w-3.5 h-3.5 text-[#B784E6]" />
                <span>Objetivo Principal</span>
              </h2>

              <div className="space-y-2" role="radiogroup" aria-label="Objetivo principal">
                {goalsList.map((g) => {
                  const Icon = g.icon;
                  const isSelected = primaryGoal === g.title;
                  return (
                    <button
                      key={g.title}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setPrimaryGoal(g.title)}
                      className={`w-full p-3 rounded-2xl text-left border flex items-center justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#1F1433] to-[#281B42] border-[#842BAF] shadow-[0_0_14px_rgba(132,43,175,0.35)]'
                          : 'bg-[#171026] border-[#311C50] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-[#842BAF] text-white' : 'bg-white/5 text-[#A59DB5]'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white truncate block">{g.title}</span>
                          <p className="text-[10px] text-[#A59DB5] mt-0.5 line-clamp-1">{g.desc}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#2BED77] flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-2.5 h-2.5 text-[#0B0712] stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLUNA 2: FOCO BIOMECÂNICO & LIMITAÇÕES */}
            <div className="p-4 rounded-3xl bg-[#160E26] border border-white/5 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <h2 className="text-xs font-heading font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Shield className="w-3.5 h-3.5 text-[#2BED77]" />
                  <span>Cuidados & Limitações Relatadas</span>
                </h2>

                {/* Foco Biomecânico */}
                <div>
                  <label htmlFor="pref-biomechanical-focus" className="block text-[11px] font-semibold text-[#A59DB5] mb-1">
                    Foco Biomecânico & Cuidados Articulares
                  </label>
                  <input
                    id="pref-biomechanical-focus"
                    type="text"
                    value={biomechanicalFocus}
                    onChange={(e) => setBiomechanicalFocus(e.target.value)}
                    placeholder="Ex: Preservação articular de ombros e lombar"
                    className="w-full bg-[#1F1433] border border-[#311C50] focus:border-[#B784E6] text-white text-xs rounded-xl p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5]"
                  />
                </div>

                {/* Dificuldades & Limitações */}
                <div>
                  <span className="block text-[11px] font-semibold text-[#A59DB5] mb-1.5">
                    Restrições Articulares Relatadas
                  </span>
                  <div className="flex flex-wrap gap-1.5 mb-2" role="group" aria-label="Restrições articulares">
                    {commonLimitations.map((item) => {
                      const active = limitations.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleLimitation(item)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
                            active
                              ? 'bg-[#2BED77]/15 text-[#2BED77] border-[#2BED77]/40 shadow-xs'
                              : 'bg-[#1F1433] text-[#A59DB5] border-[#311C50] hover:text-white'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom limitation */}
                  <div className="flex gap-1.5">
                    <label htmlFor="pref-custom-limitation" className="sr-only">Outra restrição específica</label>
                    <input
                      id="pref-custom-limitation"
                      type="text"
                      value={customLimitation}
                      onChange={(e) => setCustomLimitation(e.target.value)}
                      placeholder="Outra restrição específica..."
                      className="flex-1 bg-[#1F1433] border border-[#311C50] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5]"
                    />
                    <button
                      type="button"
                      onClick={addCustomLimitation}
                      className="px-3 py-2 rounded-xl bg-[#281B42] text-xs font-semibold text-[#B784E6] border border-[#842BAF]/40 hover:bg-[#342255] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Observações livres */}
                <div>
                  <label htmlFor="pref-additional-notes" className="block text-[11px] font-semibold text-[#A59DB5] mb-1">
                    Observações Adicionais para o LÉO e Instrutor
                  </label>
                  <textarea
                    id="pref-additional-notes"
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Ex: Histórico prévio de cirurgia, preferência por treinos mais curtos..."
                    className="w-full bg-[#1F1433] border border-[#311C50] focus:border-[#B784E6] text-white text-xs rounded-xl p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5] resize-none"
                  />
                </div>
              </div>

              {/* Botão Finalizar */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(132,43,175,0.4)] hover:shadow-[0_0_28px_rgba(183,132,230,0.6)] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                >
                  <span>Finalizar & Acessar Meu Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Selo Inferior */}
      <div className="relative z-10 py-3 flex items-center justify-center gap-2 text-[11px] text-[#8C849B] text-center mt-3">
        <Shield className="w-3.5 h-3.5 text-[#2BED77] shrink-0" />
        <span>Informações utilizadas exclusivamente para calibrar sua segurança e periodização.</span>
      </div>
    </div>
  );
};
