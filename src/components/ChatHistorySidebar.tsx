import React, { useState, useMemo } from 'react';
import { ChatConversation } from '../models/chat.model';
import {
  X,
  Plus,
  Search,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  MessageSquare,
  MoreVertical,
  Check,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  isDocked?: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  isDocked = false,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onTogglePin,
  onDeleteConversation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Real-time search across conversation title and message contents
  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;

    return conversations.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchContext = c.contextWorkout ? c.contextWorkout.toLowerCase().includes(q) : false;
      const matchContent = c.messages.some((m) => m.text.toLowerCase().includes(q));
      return matchTitle || matchContext || matchContent;
    });
  }, [conversations, searchQuery]);

  // Group by categories: Fixadas, Hoje, Ontem, Últimos 7 dias, Mais antigas
  const categorizedGroups = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfLast7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

    const pinned: ChatConversation[] = [];
    const today: ChatConversation[] = [];
    const yesterday: ChatConversation[] = [];
    const last7Days: ChatConversation[] = [];
    const older: ChatConversation[] = [];

    filteredConversations.forEach((conv) => {
      if (conv.isPinned) {
        pinned.push(conv);
      }

      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();

      if (convTime >= startOfToday) {
        today.push(conv);
      } else if (convTime >= startOfYesterday) {
        yesterday.push(conv);
      } else if (convTime >= startOfLast7Days) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    });

    return {
      pinned,
      today: today.filter((c) => !c.isPinned),
      yesterday: yesterday.filter((c) => !c.isPinned),
      last7Days: last7Days.filter((c) => !c.isPinned),
      older: older.filter((c) => !c.isPinned)
    };
  }, [filteredConversations]);

  const handleStartRename = (conv: ChatConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setOpenMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteConversation(deleteConfirmId);
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    }
  };

  if (!isOpen && !isDocked) return null;

  const sidebarContent = (
    <div className={`relative w-full ${isDocked ? 'w-64 lg:w-72 border-r border-[#842BAF]/25 shrink-0' : 'max-w-[320px] sm:max-w-[340px] border-r border-[#842BAF]/30 shadow-2xl animate-slideRight'} h-full bg-[#140D22] flex flex-col z-10`}>
      {/* Header da Barra Lateral */}
      <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#842BAF]/30 text-[#B784E6] flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h2 className="font-heading font-extrabold text-sm text-white tracking-wide">
            Conversas
          </h2>
        </div>

        {!isDocked && (
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl text-[#8C849B] hover:text-white bg-white/5 transition-colors"
            title="Fechar menu"
            aria-label="Fechar histórico"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Botão Nova Conversa */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewConversation();
            if (!isDocked) onClose();
          }}
          type="button"
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] hover:from-[#9532c6] hover:to-[#761ea5] text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(132,43,175,0.4)] active:scale-[0.98] transition-all border border-[#B784E6]/30"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova conversa</span>
        </button>
      </div>

        {/* Campo de Pesquisa em Tempo Real */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#8C849B] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar conversas..."
              className="w-full bg-[#1A112B] text-white text-xs pl-8 pr-8 py-2 rounded-xl border border-white/[0.08] focus:border-[#B784E6] focus:outline-none placeholder-[#8C849B] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                type="button"
                className="absolute right-2.5 text-[#8C849B] hover:text-white p-1"
                title="Limpar pesquisa"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de Conversas com Rolagem */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 scrollbar-none">
          {/* Caso de busca sem resultados */}
          {filteredConversations.length === 0 && (
            <div className="py-8 px-4 text-center">
              <p className="text-xs text-[#A59DB5] leading-relaxed">
                Nenhuma conversa encontrada para <strong className="text-white">&ldquo;{searchQuery}&rdquo;</strong>.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                type="button"
                className="mt-2 text-[11px] text-[#B784E6] hover:underline"
              >
                Limpar busca
              </button>
            </div>
          )}

          {/* Renderização das Seções */}
          {categorizedGroups.pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#B784E6]">
                <Pin className="w-3 h-3 text-[#B784E6]" />
                <span>Fixadas</span>
              </div>
              <div className="space-y-1 mt-1">
                {categorizedGroups.pinned.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {categorizedGroups.today.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C849B]">
                Hoje
              </div>
              <div className="space-y-1 mt-1">
                {categorizedGroups.today.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {categorizedGroups.yesterday.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C849B]">
                Ontem
              </div>
              <div className="space-y-1 mt-1">
                {categorizedGroups.yesterday.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {categorizedGroups.last7Days.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C849B]">
                Últimos 7 dias
              </div>
              <div className="space-y-1 mt-1">
                {categorizedGroups.last7Days.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {categorizedGroups.older.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C849B]">
                Mais antigas
              </div>
              <div className="space-y-1 mt-1">
                {categorizedGroups.older.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé da Barra Lateral */}
        <div className="p-3 border-t border-white/[0.08] text-[10px] text-[#8C849B] text-center">
          LÉO IA • Histórico salvo no dispositivo
        </div>
      </div>
    );

    const deleteModal = deleteConfirmId && (
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-xs rounded-2xl bg-[#1F1433] border border-[#FFB4AB]/40 p-4 shadow-2xl text-center">
          <div className="w-10 h-10 rounded-full bg-[#FFB4AB]/15 text-[#FFB4AB] flex items-center justify-center mx-auto mb-2.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-heading font-bold text-white mb-1">
            Excluir conversa?
          </h3>
          <p className="text-xs text-[#A59DB5] mb-4 leading-relaxed">
            Esta ação removerá as mensagens desta conversa. Não será possível recuperá-la.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#EADDFC] font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="flex-1 py-2 rounded-xl bg-[#93000A] hover:bg-[#B3261E] text-xs text-white font-bold transition-all shadow-md"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    );

    if (isDocked) {
      return (
        <>
          {sidebarContent}
          {deleteModal}
        </>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex animate-fadeIn">
        {/* Backdrop transparente / escurecido */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        />
        {sidebarContent}
        {deleteModal}
      </div>
    );

  function renderConversationItem(conv: ChatConversation) {
    const isActive = conv.id === activeConversationId;
    const isEditing = editingId === conv.id;
    const isMenuOpen = openMenuId === conv.id;

    if (isEditing) {
      return (
        <div
          key={conv.id}
          className="p-1.5 rounded-xl bg-[#1A112B] border border-[#B784E6] flex items-center gap-1.5"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(conv.id);
              if (e.key === 'Escape') setEditingId(null);
            }}
            autoFocus
            className="flex-1 bg-transparent text-xs text-white px-2 py-1 focus:outline-none"
          />
          <button
            onClick={() => handleSaveRename(conv.id)}
            type="button"
            className="p-1.5 rounded-lg bg-[#842BAF] text-white hover:bg-[#681791]"
            title="Salvar"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEditingId(null)}
            type="button"
            className="p-1.5 rounded-lg text-[#8C849B] hover:text-white"
            title="Cancelar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={conv.id}
        className={`group relative rounded-xl transition-all ${
          isActive
            ? 'bg-[#271044] border border-[#842BAF]/60 text-white shadow-sm'
            : 'hover:bg-[#1A112B] text-[#A59DB5] border border-transparent'
        }`}
      >
        <button
          onClick={() => {
            onSelectConversation(conv.id);
            if (!isDocked) onClose();
          }}
          type="button"
          className="w-full p-2.5 text-left flex items-start gap-2.5 pr-8 min-h-[44px]"
        >
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
              isActive ? 'text-[#B784E6]' : 'text-[#8C849B] group-hover:text-white'
            }`}
          />
          <div className="flex-1 min-w-0">
            <span
              className={`text-xs block truncate ${
                isActive ? 'font-semibold text-white' : 'group-hover:text-white'
              }`}
            >
              {conv.title}
            </span>
            {conv.contextWorkout && (
              <span className="text-[10px] text-[#8C849B] block truncate mt-0.5">
                {conv.contextWorkout}
              </span>
            )}
          </div>

          {conv.isPinned && (
            <Pin className="w-3 h-3 text-[#B784E6] shrink-0 mt-0.5" />
          )}
        </button>

        {/* Menu de Ações (3 Pontinhos) */}
        <div className="absolute right-1 top-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(isMenuOpen ? null : conv.id);
            }}
            type="button"
            className="p-1.5 rounded-lg text-[#8C849B] hover:text-white hover:bg-white/10 transition-colors opacity-80 group-hover:opacity-100"
            title="Opções da conversa"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-30 w-36 rounded-xl bg-[#1F1433] border border-[#842BAF]/40 shadow-xl py-1 text-xs text-[#EADDFC] animate-fadeIn"
            >
              <button
                onClick={() => handleStartRename(conv)}
                type="button"
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-[#B784E6]" />
                <span>Renomear</span>
              </button>

              <button
                onClick={() => {
                  onTogglePin(conv.id);
                  setOpenMenuId(null);
                }}
                type="button"
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                {conv.isPinned ? (
                  <>
                    <PinOff className="w-3.5 h-3.5 text-[#A59DB5]" />
                    <span>Desafixar</span>
                  </>
                ) : (
                  <>
                    <Pin className="w-3.5 h-3.5 text-[#B784E6]" />
                    <span>Fixar</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setDeleteConfirmId(conv.id);
                  setOpenMenuId(null);
                }}
                type="button"
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-[#FFB4AB] hover:bg-[#FFB4AB]/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
};
