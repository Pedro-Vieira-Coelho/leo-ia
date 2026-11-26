import React, { useState } from 'react';
import { Clock, History, MessageSquare, Paperclip, Shield, UserCheck, X } from 'lucide-react';
import { UserProfile } from '../models/user.model';
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
  initialTab = 'compose',
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>(initialTab);
  const { modalRef } = useAccessibleModal({ isOpen, onClose });

  if (!isOpen) return null;

  const messagesList = user.instructorMessages || [];

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
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-[#8C849B] hover:text-white rounded-full bg-white/5 transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
          title="Fechar"
          aria-label="Fechar acompanhamento profissional"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-white/10 shrink-0 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#842BAF]/20 border border-[#842BAF]/40 flex items-center justify-center text-[#B784E6] shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 id="instructor-modal-title" className="text-sm font-heading font-bold text-white truncate">
              Acompanhamento profissional
            </h2>
            <p className="text-xs text-[#A59DB5] truncate">Integração com instrutores em preparação</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            aria-pressed={activeTab === 'compose'}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'compose'
                ? 'bg-[#842BAF] text-white shadow-sm'
                : 'bg-[#171026] text-[#A59DB5] hover:text-white border border-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Disponibilidade</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            aria-pressed={activeTab === 'history'}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-[#842BAF] text-white shadow-sm'
                : 'bg-[#171026] text-[#A59DB5] hover:text-white border border-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Registros ({messagesList.length})</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto mt-3 pr-1 space-y-3.5 scrollbar-none">
          {activeTab === 'compose' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#171026] border border-[#842BAF]/25">
                <Shield className="w-4 h-4 shrink-0 text-[#B784E6] mt-0.5" />
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-white">Envio de mensagens indisponível</h3>
                  <p className="text-[11px] leading-relaxed text-[#A59DB5]">
                    O app ainda não está conectado a uma área de instrutores. Nenhuma mensagem ou dado de treino será enviado por esta tela.
                  </p>
                </div>
              </div>
              <p className="text-[10px] leading-relaxed text-[#8C849B]">
                A integração futura depende de vínculo confirmado com academia e instrutor, além de regras de consentimento e acesso aos dados.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white border border-white/5 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : messagesList.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#171026] border border-white/5 text-center text-xs text-[#A59DB5]">
              Não há registros de mensagens no perfil.
            </div>
          ) : (
            <>
              <p className="p-3 rounded-xl bg-[#171026] border border-white/5 text-[11px] leading-relaxed text-[#A59DB5]" role="note">
                Estes registros estão armazenados no perfil. O app não confirma envio ao instrutor nem recebimento de respostas.
              </p>
              {messagesList.map((msg) => (
                <article
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-[#171026] border border-white/5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#842BAF]/25 text-[#D2A0FF] border border-[#842BAF]/30">
                      {msg.topic}
                    </span>
                    <span className="text-[10px] text-[#8C849B] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {msg.date}
                    </span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">{msg.message}</p>
                  {msg.attachedData?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.attachedData?.map((item, index) => (
                        <span key={`${msg.id}-${index}`} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1F1433] text-[#A59DB5] border border-white/5 flex items-center gap-1">
                          <Paperclip className="w-2.5 h-2.5 text-[#B784E6]" />
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.reply && (
                    <div className="p-3 rounded-xl bg-[#1F1433] border border-white/5 space-y-1">
                      <p className="text-[10px] font-semibold text-[#B784E6]">Resposta registrada no perfil</p>
                      <p className="text-[11px] text-[#EADDFC] leading-relaxed">{msg.reply.text}</p>
                      <p className="text-[10px] text-[#8C849B]">{msg.reply.date}</p>
                    </div>
                  )}
                </article>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
