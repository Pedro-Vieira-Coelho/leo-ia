import React, { useState } from 'react';
import { UserProfile } from '../models/user.model';
import { NavTab } from './BottomNav';
import { User, Bell, X, CheckCircle2 } from 'lucide-react';
import { FulcroDeMovimento } from './FulcroDeMovimento';
import { useAccessibleModal } from '../shared/useAccessibleModal';

interface HeaderProps {
  currentScreen?: NavTab;
  user?: UserProfile;
  onAvatarClick?: () => void;
  onLogoClick?: () => void;
  onInstructorClick?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'workout' | 'instructor' | 'streak';
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onAvatarClick,
  onLogoClick
}) => {
  const isProfile = currentScreen === 'profile';
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { modalRef } = useAccessibleModal({
    isOpen: notificationsOpen,
    onClose: () => setNotificationsOpen(false)
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Orientação Biomecânica LÉO',
      description: 'Lembre-se de priorizar a pegada neutra no supino para proteger seus ombros.',
      time: 'Há 15 min',
      read: false,
      type: 'workout'
    },
    {
      id: 'n2',
      title: 'Prof. Carlos Silva (CREF)',
      description: 'Acompanhamento de rotina aprovado na Academia Viva Jardins.',
      time: 'Há 1 hora',
      read: false,
      type: 'instructor'
    },
    {
      id: 'n3',
      title: 'Sequência de 14 Dias Ativos!',
      description: 'Parabéns pela consistência na sua meta de 4 treinos semanais.',
      time: 'Ontem',
      read: true,
      type: 'streak'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-[60px] bg-gradient-to-r from-[#160B25]/96 via-[#0B0712]/96 to-[#160B25]/96 backdrop-blur-md border-b border-white/[0.08] px-3.5 sm:px-4 flex items-center justify-between transition-all">
        {/* 1. LADO ESQUERDO: Símbolo Oficial "Fulcro de Movimento" + LÉO IA + Texto Complementar */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2.5 focus:outline-none group text-left min-h-[44px] py-1 select-none"
          type="button"
          aria-label="LÉO IA - Página Inicial"
        >
          {/* Símbolo Oficial: Fulcro de Movimento (Stitch Design System) */}
          <FulcroDeMovimento size={22} showContainer={true} />

          {/* Bloco de Nome e Texto Oficial: "EXPERIÊNCIA QUE ORIENTA" */}
          <div className="flex flex-col text-left justify-center min-w-0">
            <div className="flex items-center tracking-tight leading-none">
              <span className="font-heading font-extrabold text-[15px] sm:text-base text-white tracking-wide">
                LÉO <span className="text-[#B784E6]">IA</span>
              </span>
            </div>
            <span className="text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.14em] uppercase text-[#B784E6]/90 font-heading mt-1 truncate">
              EXPERIÊNCIA QUE ORIENTA
            </span>
          </div>
        </button>

        {/* 2. LADO DIREITO: Notificações (Sino) + Ícone de Perfil Personalizado */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sino de Notificações */}
          <button
            onClick={() => setNotificationsOpen(true)}
            type="button"
            aria-label="Abrir Notificações"
            title="Notificações"
            className="relative w-9 h-9 rounded-full bg-[#171026] hover:bg-[#1F1433] text-[#A59DB5] hover:text-white border border-white/10 hover:border-[#842BAF]/50 flex items-center justify-center transition-all active:scale-95 shadow-sm min-h-[44px] min-w-[44px]"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B784E6] border border-[#0B0712] shadow-[0_0_8px_#B784E6]"></span>
            )}
          </button>

          {/* Ícone de Perfil Discreto e Personalizado (Roxo / Lilás) */}
          <button
            onClick={onAvatarClick}
            type="button"
            aria-label="Acessar Perfil e Configurações"
            title="Perfil e Configurações"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 min-h-[44px] min-w-[44px] p-2 ${
              isProfile
                ? 'bg-[#1F1433] text-[#B784E6] border border-[#842BAF] shadow-[0_0_12px_rgba(132,43,175,0.4)]'
                : 'bg-[#171026] text-[#A59DB5] hover:text-[#B784E6] border border-white/10 hover:border-[#842BAF]/50'
            }`}
          >
            <div className="w-full h-full rounded-full bg-[#271044]/60 flex items-center justify-center border border-[#842BAF]/30">
              <User className="w-3.5 h-3.5 stroke-[2.2] text-[#B784E6]" />
            </div>
          </button>
        </div>
      </header>

      {/* 3. MODAL DE NOTIFICAÇÕES (Preservado e integrado ao Sino) */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-dialog-title"
            tabIndex={-1}
            className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative focus:outline-none"
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#842BAF]/30 text-[#B784E6] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="notifications-dialog-title" className="text-sm font-heading font-bold text-white">
                    Notificações
                  </h2>
                  <p className="text-[10px] text-[#A59DB5]">
                    Avisos do LÉO e da academia
                  </p>
                </div>
              </div>

              <button
                onClick={() => setNotificationsOpen(false)}
                type="button"
                className="p-1.5 rounded-full text-[#8C849B] hover:text-white bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                title="Fechar"
                aria-label="Fechar notificações"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Notificações */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    item.read
                      ? 'bg-[#171026]/70 border-white/5 opacity-80'
                      : 'bg-[#171026] border-[#842BAF]/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B784E6] shrink-0"></span>
                      )}
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[#8C849B] shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-[#A59DB5] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Ações Inferiores */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-[#B784E6] hover:text-white font-medium flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Marcar todas como lidas</span>
                </button>
              ) : (
                <span className="text-[11px] text-[#8C849B]">Todas as mensagens lidas</span>
              )}

              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-[#842BAF] text-white text-xs font-semibold hover:bg-[#681791] transition-all"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
