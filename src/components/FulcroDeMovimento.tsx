import React from 'react';

interface FulcroDeMovimentoProps {
  size?: number;
  className?: string;
  showContainer?: boolean;
}

/**
 * Símbolo Oficial do LÉO IA: "Fulcro de Movimento" (Stitch Design System)
 * Composto por três traços diagonais com extremidades arredondadas:
 * - 1º traço em roxo (#842BAF / #681791)
 * - 2º traço em lilás (#B784E6)
 * - 3º traço em verde (#2BED77 / #15E46F)
 * Alojado em quadrado com cantos arredondados, fundo roxo escuro e iluminação sutil.
 */
export const FulcroDeMovimento: React.FC<FulcroDeMovimentoProps> = ({
  size = 24,
  className = '',
  showContainer = true
}) => {
  const svgContent = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-label="Fulcro de Movimento - Símbolo Oficial LÉO IA"
    >
      {/* 1º Traço Diagonal: Roxo (Força e Base de Impulso) */}
      <path
        d="M5.5 17.5L10.5 12.5"
        stroke="url(#fulcro-roxo)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2º Traço Diagonal: Lilás (Fulcro Central e Conexão Inteligente) */}
      <path
        d="M9 16L15.5 9.5"
        stroke="url(#fulcro-lilas)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3º Traço Diagonal: Verde (Ápice, Evolução e Superação da Meta) */}
      <path
        d="M13.5 12.5L18.5 7.5"
        stroke="url(#fulcro-verde)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <defs>
        {/* Gradiente do 1º Traço (Roxo Primário Stitch) */}
        <linearGradient id="fulcro-roxo" x1="5.5" y1="17.5" x2="10.5" y2="12.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#681791" />
          <stop offset="1" stopColor="#842BAF" />
        </linearGradient>

        {/* Gradiente do 2º Traço (Lilás Luminoso) */}
        <linearGradient id="fulcro-lilas" x1="9" y1="16" x2="15.5" y2="9.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#842BAF" />
          <stop offset="1" stopColor="#B784E6" />
        </linearGradient>

        {/* Gradiente do 3º Traço (Verde Neon de Performance) */}
        <linearGradient id="fulcro-verde" x1="13.5" y1="12.5" x2="18.5" y2="7.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#15E46F" />
          <stop offset="1" stopColor="#2BED77" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (!showContainer) {
    return svgContent;
  }

  return (
    <div
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#271044] via-[#1F1433] to-[#160B25] border border-[#842BAF]/50 flex items-center justify-center shadow-[0_0_14px_rgba(132,43,175,0.35)] shrink-0 transition-all hover:border-[#B784E6]/80 hover:shadow-[0_0_20px_rgba(183,132,230,0.5)] ${className}`}
    >
      {svgContent}
    </div>
  );
};
