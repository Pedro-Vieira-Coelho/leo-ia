import React from 'react';
import { Home, Dumbbell, Calendar, User, MessageCircle, Sparkles } from 'lucide-react';

export type NavTab = 'home' | 'workout' | 'chat' | 'history' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab
}) => {
  return (
    <nav aria-label="Navegação Principal" className="fixed bottom-0 left-0 right-0 z-40 bg-[#140D22]/96 backdrop-blur-xl border-t border-white/10 max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto shadow-2xl pt-1.5 pb-[max(env(safe-area-inset-bottom,8px),8px)] transition-all">
      <div className="grid grid-cols-5 items-end justify-items-center w-full px-1 max-w-lg mx-auto">
        {/* 1. Início */}
        <button
          onClick={() => onSelectTab('home')}
          type="button"
          aria-label="Aba Início"
          aria-current={currentTab === 'home' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
            currentTab === 'home'
              ? 'text-[#B784E6]'
              : 'text-[#A59DB5] hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${currentTab === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-full">
            Início
          </span>
          {currentTab === 'home' ? (
            <span className="w-1 h-1 rounded-full bg-[#B784E6] mt-0.5"></span>
          ) : (
            <span className="w-1 h-1 mt-0.5 opacity-0"></span>
          )}
        </button>

        {/* 2. Meu treino */}
        <button
          onClick={() => onSelectTab('workout')}
          type="button"
          aria-label="Aba Meu treino"
          aria-current={currentTab === 'workout' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
            currentTab === 'workout'
              ? 'text-[#B784E6]'
              : 'text-[#A59DB5] hover:text-white'
          }`}
        >
          <Dumbbell className={`w-5 h-5 transition-transform ${currentTab === 'workout' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-full">
            Meu treino
          </span>
          {currentTab === 'workout' ? (
            <span className="w-1 h-1 rounded-full bg-[#B784E6] mt-0.5"></span>
          ) : (
            <span className="w-1 h-1 mt-0.5 opacity-0"></span>
          )}
        </button>

        {/* 3. LÉO IA - Central FAB com MessageCircle + Sparkles */}
        <button
          onClick={() => onSelectTab('chat')}
          type="button"
          aria-label="Aba Conversar com LÉO IA"
          aria-current={currentTab === 'chat' ? 'page' : undefined}
          className="flex flex-col items-center justify-center w-full min-h-[44px] pb-1 -mt-3.5 group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] rounded-full"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#681791] via-[#842BAF] to-[#B784E6] p-0.5 shadow-[0_0_18px_rgba(132,43,175,0.6)] active:scale-95 transition-all group-hover:shadow-[0_0_24px_rgba(183,132,230,0.8)] border border-white/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-[#842BAF] flex items-center justify-center group-hover:bg-[#681791] transition-colors relative">
              <MessageCircle className="w-5 h-5 text-white stroke-[2.2]" />
              <Sparkles className="w-2.5 h-2.5 text-[#2BED77] absolute top-2 right-2 fill-[#2BED77]" />
            </div>
          </div>
          <span className={`text-[10px] font-bold tracking-tight mt-0.5 truncate max-w-full ${
            currentTab === 'chat' ? 'text-[#B784E6]' : 'text-white'
          }`}>
            LÉO IA
          </span>
          {currentTab === 'chat' ? (
            <span className="w-1 h-1 rounded-full bg-[#B784E6] mt-0.5"></span>
          ) : (
            <span className="w-1 h-1 mt-0.5 opacity-0"></span>
          )}
        </button>

        {/* 4. Histórico */}
        <button
          onClick={() => onSelectTab('history')}
          type="button"
          aria-label="Aba Histórico"
          aria-current={currentTab === 'history' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
            currentTab === 'history'
              ? 'text-[#B784E6]'
              : 'text-[#A59DB5] hover:text-white'
          }`}
        >
          <Calendar className={`w-5 h-5 transition-transform ${currentTab === 'history' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-full">
            Histórico
          </span>
          {currentTab === 'history' ? (
            <span className="w-1 h-1 rounded-full bg-[#B784E6] mt-0.5"></span>
          ) : (
            <span className="w-1 h-1 mt-0.5 opacity-0"></span>
          )}
        </button>

        {/* 5. Perfil */}
        <button
          onClick={() => onSelectTab('profile')}
          type="button"
          aria-label="Aba Perfil"
          aria-current={currentTab === 'profile' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
            currentTab === 'profile'
              ? 'text-[#B784E6]'
              : 'text-[#A59DB5] hover:text-white'
          }`}
        >
          <User className={`w-5 h-5 transition-transform ${currentTab === 'profile' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-full">
            Perfil
          </span>
          {currentTab === 'profile' ? (
            <span className="w-1 h-1 rounded-full bg-[#B784E6] mt-0.5"></span>
          ) : (
            <span className="w-1 h-1 mt-0.5 opacity-0"></span>
          )}
        </button>
      </div>
    </nav>
  );
};
