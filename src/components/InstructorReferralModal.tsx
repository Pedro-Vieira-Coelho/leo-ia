import React, { useState } from 'react';
import {
  X,
  Send,
  UserCheck,
  Shield,
  CheckCircle2,
  Clock,
  Paperclip,
  MessageSquare,
  History,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../models/user.model';
import { authService } from '../services/auth.service';

import { useAccessibleModal } from '../shared/useAccessibleModal';

interface InstructorReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  defaultMessage?: string;
  initialTab?: 'compose' | 'history';
}

export const InstructorReferralModal: React.FC<InstructorReferralModalProps> = ({
  isOpen,
  onClose,
  user,
  defaultMessage = '',
  initialTab = 'compose'
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>(initialTab);
  const [message, setMessage] = useState(defaultMessage);
  const [topic, setTopic] = useState('Desconforto Articular');
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Opções de anexos de treino
  const [attachRecentWorkout, setAttachRecentWorkout] = useState(true);
  const [attachLoads, setAttachLoads] = useState(true);
  const [attachLimitations, setAttachLimitations] = useState(true);

  const handleResetAndClose = () => {
    setIsSent(false);
    setMessage('');
    setErrorMessage('');
    onClose();
  };

  const { modalRef } = useAccessibleModal({
    isOpen,
    onClose: handleResetAndClose
  });

  if (!isOpen) return null;

  const messagesList = user.instructorMessages || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Por favor, escreva uma mensagem antes de enviar.');
      return;
    }
    setErrorMessage('');

    const attachments: string[] = [];
    if (attachRecentWorkout) attachments.push('Último Treino Registrado (Treino A)');
    if (attachLoads) attachments.push('Séries e Cargas Recentes');
    if (attachLimitations) attachments.push('Limitações Articulares Relatadas');

    authService.sendInstructorMessage(topic, message.trim(), attachments);
    setIsSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructor-modal-title"
        tabIndex={-1}
        className="w-full max-w-md max-h-[90vh] rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 sm:p-6 shadow-2xl relative flex flex-col overflow-hidden focus:outline-none"
      >
        {/* Botão Fechar */}
        <button
          onClick={handleResetAndClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-[#8C849B] hover:text-white rounded-full bg-white/5 transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
          title="Fechar"
          aria-label="Fechar diálogo de acompanhamento profissional"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do Profissional */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10 shrink-0 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#842BAF]/20 border border-[#842BAF]/40 flex items-center justify-center text-[#B784E6] shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 id="instructor-modal-title" className="text-sm font-heading font-bold text-white truncate">
              Acompanhamento Profissional
            </h2>
            <p className="text-xs text-[#A59DB5] truncate">
              {user.instructorName} • {user.instructorCref}
            </p>
          </div>
        </div>

        {/* Abas: Nova Mensagem vs Histórico de Acompanhamento */}
        {!isSent && (
          <div className="flex items-center gap-2 mt-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'compose'
                  ? 'bg-[#842BAF] text-white shadow-sm'
                  : 'bg-[#171026] text-[#A59DB5] hover:text-white border border-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Enviar Recado</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-[#842BAF] text-white shadow-sm'
                  : 'bg-[#171026] text-[#A59DB5] hover:text-white border border-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico ({messagesList.length})</span>
            </button>
          </div>
        )}

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3.5 scrollbar-none">
          {isSent ? (
            <div className="py-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#2BED77]/15 border border-[#2BED77]/30 flex items-center justify-center text-[#2BED77] mb-3 shadow-[0_0_16px_rgba(43,237,119,0.3)]">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-heading font-bold text-white mb-1.5">
                Mensagem Encaminhada!
              </h3>
              <p className="text-xs text-[#A59DB5] max-w-xs leading-relaxed mb-4">
                O {user.instructorName} recebeu seu comunicado junto com as informações que você autorizou anexar. A resposta aparecerá no seu histórico de acompanhamento.
              </p>
              <div className="flex items-center gap-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setActiveTab('history');
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#171026] text-xs font-semibold text-[#B784E6] border border-[#842BAF]/30 hover:bg-[#271044] transition-colors"
                >
                  Ver Histórico
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="flex-1 py-2 rounded-xl bg-[#842BAF] text-xs font-semibold text-white hover:bg-[#681791] transition-colors"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : activeTab === 'compose' ? (
            <form onSubmit={handleSend} className="space-y-3.5">
              {/* Aviso de Transparência */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#171026] text-[11px] text-[#D2A0FF] border border-[#842BAF]/25">
                <Shield className="w-4 h-4 shrink-0 text-[#2BED77] mt-0.5" />
                <span className="leading-snug">
                  Você tem controle total sobre quais dados de treino são anexados ao seu recado. Nenhuma informação é enviada sem sua permissão.
                </span>
              </div>

              {/* Motivo do Contato */}
              <div>
                <label htmlFor="instructor-topic-select" className="block text-xs font-semibold text-[#A59DB5] mb-1.5">
                  Motivo do Contato
                </label>
                <select
                  id="instructor-topic-select"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#171026] border border-[#311C50] focus:border-[#B784E6] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                >
                  <option value="Desconforto Articular">Desconforto Articular ou Dor</option>
                  <option value="Ajuste de Ficha de Treino">Solicitar Novo Ciclo / Ajuste de Ficha</option>
                  <option value="Dúvida de Execução">Dúvida sobre Postura ou Carga</option>
                  <option value="Revisão de Biometria">Reavaliação Física Periódica</option>
                  <option value="Outro assunto">Outro assunto</option>
                </select>
              </div>

              {/* Mensagem com validação */}
              <div>
                <label htmlFor="instructor-message-text" className="block text-xs font-semibold text-[#A59DB5] mb-1.5">
                  Sua Mensagem ou Pergunta <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="instructor-message-text"
                  rows={3}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  aria-describedby={errorMessage ? 'instructor-error-msg' : undefined}
                  aria-invalid={errorMessage ? true : false}
                  placeholder="Ex: Professor, notei uma leve sensibilidade no ombro durante a 3ª série do supino inclinado..."
                  className={`w-full bg-[#171026] border ${
                    errorMessage ? 'border-red-500' : 'border-[#311C50] focus:border-[#B784E6]'
                  } text-white text-xs rounded-xl p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5] resize-none leading-relaxed`}
                />
                {errorMessage && (
                  <p id="instructor-error-msg" className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>

              {/* Seleção de Anexos */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#171026] border border-white/5">
                <span className="text-xs font-semibold text-white block mb-1 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#B784E6]" />
                  <span>Anexar Informações de Treino</span>
                </span>

                <label className="flex items-center justify-between text-xs text-[#EADDFC] cursor-pointer py-1">
                  <span>Último treino registrado ({user.primaryGoal})</span>
                  <input
                    type="checkbox"
                    checked={attachRecentWorkout}
                    onChange={(e) => setAttachRecentWorkout(e.target.checked)}
                    className="accent-[#842BAF] w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-[#EADDFC] cursor-pointer py-1">
                  <span>Séries e cargas recentes</span>
                  <input
                    type="checkbox"
                    checked={attachLoads}
                    onChange={(e) => setAttachLoads(e.target.checked)}
                    className="accent-[#842BAF] w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-[#EADDFC] cursor-pointer py-1">
                  <span>Limitações articulares ativas ({user.activeLimitations.length})</span>
                  <input
                    type="checkbox"
                    checked={attachLimitations}
                    onChange={(e) => setAttachLimitations(e.target.checked)}
                    className="accent-[#842BAF] w-4 h-4 rounded"
                  />
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-[#A59DB5] hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white text-xs font-semibold shadow-[0_0_16px_rgba(132,43,175,0.4)] active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Recado</span>
                </button>
              </div>
            </form>
          ) : (
            /* Histórico de Acompanhamento */
            <div className="space-y-3">
              {messagesList.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#171026] border border-white/5 text-center text-xs text-[#A59DB5]">
                  Nenhum recado enviado ainda. Quando você enviar mensagens ao seu instrutor, elas e as orientações recebidas aparecerão aqui.
                </div>
              ) : (
                messagesList.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-2xl bg-[#171026] border border-white/5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#842BAF]/25 text-[#D2A0FF] border border-[#842BAF]/30">
                        {msg.topic}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          msg.status === 'respondida'
                            ? 'bg-[#2BED77]/15 text-[#2BED77] border border-[#2BED77]/30'
                            : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                        }`}
                      >
                        {msg.status === 'respondida' ? 'Respondida' : 'Aguardando instrutor'}
                      </span>
                    </div>

                    <p className="text-xs text-white leading-relaxed font-normal">
                      "{msg.message}"
                    </p>

                    {msg.attachedData && msg.attachedData.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {msg.attachedData.map((att, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#1F1433] text-[#A59DB5] border border-white/5 flex items-center gap-1"
                          >
                            <Paperclip className="w-2.5 h-2.5 text-[#B784E6]" />
                            {att}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-[#8C849B] flex items-center gap-1 pt-0.5">
                      <Clock className="w-3 h-3 text-[#8C849B]" />
                      <span>{msg.date}</span>
                    </div>

                    {/* Resposta do Instrutor */}
                    {msg.reply && (
                      <div className="p-3 rounded-xl bg-[#1F1433] border border-[#2BED77]/25 text-xs mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#2BED77]">
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Orientação de {user.instructorName}
                          </span>
                          <span className="text-[#8C849B] font-normal">{msg.reply.date}</span>
                        </div>
                        <p className="text-[#EADDFC] text-[11px] leading-relaxed">
                          {msg.reply.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className="w-full py-2.5 rounded-xl bg-[#842BAF] text-xs font-semibold text-white flex items-center justify-center gap-2 hover:bg-[#681791] transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Escrever Novo Recado</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
