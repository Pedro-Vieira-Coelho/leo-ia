import React from 'react';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';

export type LeoPose =
  | 'official'
  | 'face-smiling'
  | 'face-thinking'
  | 'full-body'
  | 'waving'
  | 'clipboard'
  | 'pointing';

interface LeoAvatarProps {
  pose?: LeoPose;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showOnlineBadge?: boolean;
  className?: string;
  glow?: boolean;
}

export const LeoAvatar: React.FC<LeoAvatarProps> = ({
  pose = 'official',
  size = 'md',
  showOnlineBadge = false,
  className = '',
  glow = false,
}) => {
  // Size dimensions
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    hero: 'w-36 h-36 sm:w-44 sm:h-44',
  }[size];

  // Official character image (/assets/leo/l_o-perfil_6168415a.png)

  const getStyleForPose = (_currentPose: LeoPose): React.CSSProperties => {
    return {
      backgroundImage: `url(${LEO_OFFICIAL_AVATAR})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
    };
  };

  const isFullBodyHero = size === 'hero' && pose === 'full-body';

  if (isFullBodyHero) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#271044]/60 to-[#171026] border border-[#B784E6]/20 ${glow ? 'glow-purple' : ''} ${className}`}
      >
        <div
          className="w-full h-56 sm:h-64 bg-no-repeat bg-contain bg-center transition-transform duration-300 hover:scale-105"
          style={getStyleForPose('full-body')}
          role="img"
          aria-label="LÉO IA Personal Companion"
        />
        {showOnlineBadge && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#110A20]/90 border border-[#2BED77]/40 text-[#2BED77] text-[10px] font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2BED77] animate-pulse"></span>
            LÉO ATIVO
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
    >
      <div
        className={`w-full h-full rounded-full overflow-hidden bg-[#1F1433] border-2 border-[#842BAF]/60 transition-all ${glow ? 'glow-purple' : ''}`}
        style={getStyleForPose(pose)}
        role="img"
        aria-label="LÉO IA Avatar"
      />
      {showOnlineBadge && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2BED77] border-2 border-[#0B0712]"
          title="LÉO Online"
        />
      )}
    </div>
  );
};
