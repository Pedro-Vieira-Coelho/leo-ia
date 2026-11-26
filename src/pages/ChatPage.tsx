import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../services/chat.service';
import { workoutService } from '../services/workout.service';
import { ChatConversation, ChatMessage } from '../models/chat.model';
import { UserProfile } from '../models/user.model';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';
import { ChatHistorySidebar } from '../components/ChatHistorySidebar';
import { InstructorReferralModal } from '../components/InstructorReferralModal';
import {
  Send,
  Sparkles,
  Shuffle,
  UserCheck,
  Trophy,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  PanelLeft,
  SquarePen,
  Mic
} from 'lucide-react';

interface ChatPageProps {
  user: UserProfile;
  onNavigateToWorkout: () => void;
  onNavigateToHistory: () => void;
}

/**
 * Renderizador de Texto Natural:
 * Apresenta o texto de forma fluida e conversacional, sem transformar cada mensagem em card.
 * Usa parágrafos fluidos, numeração apenas quando há passos claros e bloco de atenção quando relevante.
 */
const NaturalMessageContent: React.FC<{ text: string; isLeo: boolean }> = ({ text, isLeo }) => {
  if (!isLeo) {
    return <p className="whitespace-pre-line text-xs text-white leading-relaxed">{text}</p>;
  }

  const renderFormattedInline = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed text-[#EADDFC]">
      {paragraphs.map((p, pIndex) => {
        const trimmed = p.trim();

        // 1. Bloco de Atenção para recomendações de segurança
        if (trimmed.startsWith('**Atenção:**') || trimmed.startsWith('Atenção:')) {
          const body = trimmed
            .replace(/^\*\*Atenção:\*\*\s*/, '')
            .replace(/^Atenção:\s*/, '');

          return (
            <div
              key={pIndex}
              className="p-2.5 rounded-xl bg-[#FFB4AB]/10 border border-[#FFB4AB]/25 text-[#FFDCD6] text-[11px] leading-relaxed my-1.5 flex items-start gap-2 shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#FFB4AB] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-[#FFB4AB] block mb-0.5">Atenção</strong>
                <span>{renderFormattedInline(body)}</span>
              </div>
            </div>
          );
        }

        // 2. Linhas de Lista Numerada (apenas quando houver instruções numeradas)
        const lines = trimmed.split('\n');
        const hasNumbers = lines.some((l) => /^\d+\.\s/.test(l.trim()));

        if (hasNumbers) {
          return (
            <div key={pIndex} className="space-y-1.5 my-1">
              {lines.map((line, lIndex) => {
                const lineTrimmed = line.trim();
                const match = lineTrimmed.match(/^(\d+)\.\s(.*)/);

                if (match) {
                  return (
                    <div key={lIndex} className="flex items-start gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full bg-[#842BAF]/30 text-[#D2A0FF] border border-[#842BAF]/40 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        {match[1]}
                      </span>
                      <span className="flex-1 leading-snug">{renderFormattedInline(match[2])}</span>
                    </div>
                  );
                }

                return (
                  <p key={lIndex} className="font-semibold text-white text-xs mt-1">
                    {renderFormattedInline(lineTrimmed)}
                  </p>
                );
              })}
            </div>
          );
        }

        // 3. Parágrafo simples e natural
        return (
          <p key={pIndex} className="text-xs text-[#EADDFC] leading-relaxed">
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const ChatPage: React.FC<ChatPageProps> = ({
  user,
  onNavigateToWorkout,
  onNavigateToHistory
}) => {
  // Estado das Conversas
  const [conversations, setConversations] = useState<ChatConversation[]>(chatService.getConversations());
  const [activeConversation, setActiveConversation] = useState<ChatConversation>(chatService.getActiveConversation());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mensagens e Digitação
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState('');
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Modais de Apoio
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [instructorMessage, setInstructorMessage] = useState('');

  // Refs de Rolagem e Input
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMsgCountRef = useRef(0);

  const activeWorkout = workoutService.getActiveWorkout();
  const suggestedPrompts = chatService.getSuggestedPrompts();

  // Sincronizar com chatService
  useEffect(() => {
    const unsub = chatService.subscribe(() => {
      setConversations([...chatService.getConversations()]);
      setActiveConversation({ ...chatService.getActiveConversation() });
    });
    return () => unsub();
  }, []);

  // Função para rolar até o final da conversa
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior
      });
      isNearBottomRef.current = true;
      setShowScrollBottomBtn(false);
    }
  }, []);

  // Monitorar rolagem manual do usuário
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const near = distanceFromBottom < 100;
    isNearBottomRef.current = near;
    setShowScrollBottomBtn(distanceFromBottom > 160);
  };

  // 1. Ao montar ou trocar de conversa: rolar diretamente para as mensagens mais recentes
  useEffect(() => {
    scrollToBottom('auto');
    prevMsgCountRef.current = activeConversation.messages.length;
  }, [activeConversation.id, scrollToBottom]);

  // 2. Quando novas mensagens chegarem:
  // Se o usuário enviou OU se já estava perto do final, acompanha para baixo.
  // Se o usuário estava lendo mensagens antigas, NÃO forçar para baixo.
  useEffect(() => {
    const currentCount = activeConversation.messages.length;
    if (currentCount > prevMsgCountRef.current) {
      const lastMsg = activeConversation.messages[currentCount - 1];
      if (lastMsg.sender === 'user' || isNearBottomRef.current) {
        scrollToBottom('smooth');
      }
      prevMsgCountRef.current = currentCount;
    }
  }, [activeConversation.messages, scrollToBottom]);

  // Enviar Mensagem
  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    setInputText('');
    setChatError('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsTyping(true);
    try {
      await chatService.sendMessage(text);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`;
    }
  };

  // Gerenciamento de Conversas
  const handleSelectConversation = (id: string) => {
    chatService.setActiveConversation(id);
    setActiveConversation(chatService.getActiveConversation());
  };

  const handleNewConversation = () => {
    chatService.createConversation('Nova conversa');
    setActiveConversation(chatService.getActiveConversation());
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    chatService.renameConversation(id, newTitle);
  };

  const handleTogglePin = (id: string) => {
    chatService.togglePinConversation(id);
  };

  const handleDeleteConversation = (id: string) => {
    chatService.deleteConversation(id);
  };

  // Ações contextuais de botões do LÉO
  const handleActionClick = (action: ChatMessage['actionButton']) => {
    if (!action) return;
    if (action.actionType === 'navigate_workout' || action.actionType === 'swap_exercise') {
      onNavigateToWorkout();
    } else if (action.actionType === 'call_instructor') {
      setInstructorMessage(
        'Olá Prof. Carlos, solicito orientação biomecânica presencial sobre ajuste de carga e postura na academia.'
      );
      setInstructorModalOpen(true);
    } else if (action.payload === 'history') {
      onNavigateToHistory();
    }
  };

  const getActionIcon = (actionType: string) => {
    if (actionType === 'swap_exercise') return <Shuffle className="w-3.5 h-3.5 text-[#2BED77]" />;
    if (actionType === 'call_instructor') return <UserCheck className="w-3.5 h-3.5 text-[#2BED77]" />;
    if (actionType === 'navigate_workout') return <Sparkles className="w-3.5 h-3.5 text-[#2BED77]" />;
    return <ArrowRight className="w-3.5 h-3.5 text-[#2BED77]" />;
  };

  return (
    <div className="flex flex-row h-[calc(100dvh-60px-68px)] max-h-[calc(100dvh-60px-68px)] w-full relative overflow-hidden select-none">
      {/* Barra Lateral Acoplada para Telas Maiores (Desktop / Notebook) */}
      <div className="hidden lg:flex shrink-0 h-full">
        <ChatHistorySidebar
          isOpen={true}
          isDocked={true}
          onClose={() => {}}
          conversations={conversations}
          activeConversationId={activeConversation.id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onRenameConversation={handleRenameConversation}
          onTogglePin={handleTogglePin}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Área Principal de Conversa */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0">
        {/* 1. REGIÃO SUPERIOR: Cabeçalho & Contexto do Treino */}
        <div className="shrink-0 h-11 px-3 flex items-center justify-between border-b border-white/[0.08] bg-[#140D22]/90 backdrop-blur-md z-20">
          {/* Botão para Abrir Histórico Lateral (Mobile / Tablet) */}
          <button
            onClick={() => setSidebarOpen(true)}
            type="button"
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1F1433] hover:bg-[#271044] border border-white/10 text-xs text-[#B784E6] hover:text-white transition-all active:scale-95 shadow-xs"
            title="Abrir histórico de conversas"
            aria-label="Abrir conversas"
          >
            <PanelLeft className="w-3.5 h-3.5 text-[#B784E6]" />
            <span className="font-semibold text-[11px] hidden xs:inline">Conversas</span>
          </button>

          {/* Indicador de Contexto Discreto do Treino */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A112B] border border-white/5 text-[11px] text-[#A59DB5] max-w-[190px] xs:max-w-[220px] truncate shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2BED77] shrink-0 animate-pulse" />
          <span className="truncate font-medium text-white">
            {activeConversation.contextWorkout || `${activeWorkout.code} · ${activeWorkout.title}`}
          </span>
        </div>

        {/* Botão Rápido de Nova Conversa */}
        <button
          onClick={handleNewConversation}
          type="button"
          className="p-1.5 rounded-xl bg-[#1F1433] hover:bg-[#842BAF] border border-white/10 text-[#B784E6] hover:text-white transition-all active:scale-95 shadow-xs"
          title="Iniciar nova conversa"
          aria-label="Nova conversa"
        >
          <SquarePen className="w-4 h-4" />
        </button>
      </div>

      {/* 2. REGIÃO CENTRAL: Área de Mensagens com Rolagem Vertical Independente */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3.5 sm:px-4 py-3 space-y-3.5 scroll-smooth overscroll-contain"
      >
        {activeConversation.messages.map((msg) => {
          const isLeo = msg.sender === 'leo';

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isLeo ? 'justify-start' : 'justify-end'}`}
            >
              {/* Avatar Oficial do LÉO IA em todas as respostas */}
              {isLeo && (
                <div className="shrink-0 mb-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1F1433] border-2 border-[#842BAF]/60 shadow-[0_0_10px_rgba(132,43,175,0.4)]">
                    <img
                      src={LEO_OFFICIAL_AVATAR}
                      alt="LÉO IA"
                      className="w-full h-full object-cover object-top"
                      loading="eager"
                    />
                  </div>
                </div>
              )}

              {/* Balão de Mensagem Natural */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] p-3.5 shadow-md ${
                  isLeo
                    ? 'bg-[#1F1433] border border-[#311C50] rounded-2xl rounded-bl-xs'
                    : 'bg-gradient-to-r from-[#842BAF] to-[#681791] text-white rounded-2xl rounded-br-xs shadow-[0_0_14px_rgba(132,43,175,0.35)]'
                }`}
              >
                {/* Nome discreto no balão do LÉO */}
                {isLeo && (
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-heading font-extrabold text-[#B784E6]">
                    <span>LÉO IA</span>
                  </div>
                )}

                {/* Conteúdo Natural da Mensagem */}
                <NaturalMessageContent text={msg.text} isLeo={isLeo} />

                {/* Ações Contextuais Preservadas */}
                {isLeo && msg.actionButton && (
                  <div className="mt-2.5 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleActionClick(msg.actionButton)}
                      type="button"
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] hover:from-[#9532c6] hover:to-[#761ea5] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-[#B784E6]/40 shadow-sm"
                    >
                      {getActionIcon(msg.actionButton.actionType)}
                      <span>{msg.actionButton.label}</span>
                    </button>
                  </div>
                )}

                {/* Horário Discreto */}
                <div
                  className={`text-[9px] mt-1 text-right font-mono ${
                    isLeo ? 'text-[#8C849B]' : 'text-white/70'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicador de Digitação do LÉO */}
        {isTyping && (
          <div className="flex items-end gap-2.5 justify-start animate-fadeIn">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#1F1433] border border-[#842BAF]/60 shrink-0">
              <img
                src={LEO_OFFICIAL_AVATAR}
                alt="LÉO IA"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="px-3.5 py-2 rounded-2xl rounded-bl-xs bg-[#1F1433] border border-[#311C50] flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B784E6] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B784E6] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B784E6] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-[#B784E6] font-medium ml-1">LÉO digitando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Botão Flutuante Discreto para Retornar ao Final (quando o usuário rolou para cima) */}
      {showScrollBottomBtn && (
        <button
          onClick={() => scrollToBottom('smooth')}
          type="button"
          className="absolute bottom-28 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F1433]/95 border border-[#842BAF]/60 text-xs font-semibold text-[#B784E6] hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.6)] active:scale-95 transition-all backdrop-blur-md animate-fadeIn"
          title="Rolar para as mensagens recentes"
        >
          <ArrowDown className="w-3.5 h-3.5 text-[#2BED77] animate-bounce" />
          <span>Mensagens recentes</span>
        </button>
      )}

      {/* 3. REGIÃO INFERIOR: Sugestões Rápidas & Campo de Mensagem Fixo */}
      <div className="shrink-0 bg-[#0B0712]/95 backdrop-blur-md border-t border-white/[0.06] z-20">
        {/* Sugestões Rápidas com Rolagem Horizontal Suave */}
        <div className="px-3 py-1.5 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => handleSend(prompt.text)}
              className="px-3 py-1 rounded-full bg-[#160E26] hover:bg-[#25173E] text-[#B784E6] hover:text-white border border-[#842BAF]/30 text-xs font-medium whitespace-nowrap active:scale-95 transition-all shrink-0 shadow-xs"
            >
              {prompt.text}
            </button>
          ))}
        </div>

        {/* Campo de Digitação com Expansão Automática e Envio Ergonômico */}
        <div className="px-3 pb-2 pt-0.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2 p-1.5 rounded-2xl bg-[#160E26] border border-[#311C50] focus-within:border-[#B784E6] focus-within:shadow-[0_0_16px_rgba(183,132,230,0.25)] transition-all shadow-lg"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Converse com o LÉO sobre postura, carga ou adaptação..."
              className="flex-1 bg-transparent text-white text-xs px-3 py-2 focus:outline-none placeholder-[#8C849B] resize-none max-h-24 leading-relaxed"
              disabled={isTyping}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] hover:from-[#9532c6] hover:to-[#761ea5] text-white disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all shadow-md min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0 mb-0.5"
              title="Enviar mensagem"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {chatError && <p role="alert" className="px-2 pt-2 text-[11px] text-red-300">{chatError}</p>}
          <p className="px-2 pt-1 text-[10px] text-[#8C849B]">
            Mensagens enviadas ao Google Gemini para gerar respostas. Não substitui orientação profissional.
          </p>
        </div>
      </div>
    </div>

      {/* Histórico Lateral de Conversas Mobile / Drawer (< lg) */}
      <div className="lg:hidden">
        <ChatHistorySidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversation.id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onRenameConversation={handleRenameConversation}
          onTogglePin={handleTogglePin}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Modal de Encaminhamento ao Instrutor Preservado */}
      <InstructorReferralModal
        isOpen={instructorModalOpen}
        onClose={() => setInstructorModalOpen(false)}
        user={user}
        defaultMessage={instructorMessage}
      />
    </div>
  );
};
