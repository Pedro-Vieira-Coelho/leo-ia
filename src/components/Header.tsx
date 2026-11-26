import React from 'react';
import { User } from 'lucide-react';
import { UserProfile } from '../models/user.model';
import { NavTab } from './BottomNav';
import { FulcroDeMovimento } from './FulcroDeMovimento';

interface HeaderProps {
  currentScreen?: NavTab;
  user?: UserProfile;
  onAvatarClick?: () => void;
  onLogoClick?: () => void;
  onInstructorClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onAvatarClick,
  onLogoClick,
}) => {
  const isProfile = currentScreen === 'profile';

  return (
    <header className="sticky top-0 z-30 w-full h-[60px] bg-gradient-to-r from-[#160B25]/96 via-[#0B0712]/96 to-[#160B25]/96 backdrop-blur-md border-b border-white/[0.08] px-3.5 sm:px-4 flex items-center justify-between transition-all">
      <button
        onClick={onLogoClick}
        className="flex items-center gap-2.5 focus:outline-none group text-left min-h-[44px] py-1 select-none"
        type="button"
        aria-label="LÉO IA - Página Inicial"
      >
        <FulcroDeMovimento size={22} showContainer={true} />
        <div className="flex flex-col text-left justify-center min-w-0">
          <span className="font-heading font-extrabold text-[15px] sm:text-base text-white tracking-wide leading-none">
            LÉO <span className="text-[#B784E6]">IA</span>
          </span>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.14em] uppercase text-[#B784E6]/90 font-heading mt-1 truncate">
            EXPERIÊNCIA QUE ORIENTA
          </span>
        </div>
      </button>

      <button
        onClick={onAvatarClick}
        type="button"
        aria-label="Acessar perfil e configurações"
        title="Perfil e configurações"
        className={`rounded-full flex items-center justify-center transition-all active:scale-95 min-h-[44px] min-w-[44px] p-2 ${
          isProfile
            ? 'bg-[#1F1433] text-[#B784E6] border border-[#842BAF] shadow-[0_0_12px_rgba(132,43,175,0.4)]'
            : 'bg-[#171026] text-[#A59DB5] hover:text-[#B784E6] border border-white/10 hover:border-[#842BAF]/50'
        }`}
      >
        <span className="w-full h-full rounded-full bg-[#271044]/60 flex items-center justify-center border border-[#842BAF]/30">
          <User className="w-3.5 h-3.5 stroke-[2.2] text-[#B784E6]" />
        </span>
      </button>
    </header>
  );
};
