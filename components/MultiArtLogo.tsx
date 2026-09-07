import React from 'react';

interface MultiArtLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const MultiArtLogo: React.FC<MultiArtLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textStyles = {
    sm: { title: 'text-lg', subtitle: 'text-[9px] tracking-[0.25em]' },
    md: { title: 'text-xl', subtitle: 'text-[10px] tracking-[0.28em]' },
    lg: { title: 'text-2xl', subtitle: 'text-[11px] tracking-[0.3em]' }
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Non-AI Geometric Art Studio Emblem */}
      <div className={`relative ${iconDimensions[size]} shrink-0 flex items-center justify-center`}>
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(249,115,22,0.22)]"
        >
          <defs>
            {/* Rich Sunset Gradients */}
            <linearGradient id="sunsetGrad1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            
            <linearGradient id="sunsetGrad2" x1="12" y1="36" x2="36" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C2410C" />
              <stop offset="70%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>

            <linearGradient id="sunDisc" x1="24" y1="12" x2="36" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>

          {/* Minimalist Studio Frame - Subtle Base Canvas */}
          <rect 
            x="4" 
            y="4" 
            width="40" 
            height="40" 
            rx="12" 
            fill="#FFF7ED"
            stroke="#FFEDD5"
            strokeWidth="1.5"
          />

          {/* Golden Sunset Aperture / Sun Motif */}
          <circle 
            cx="31" 
            cy="17" 
            r="6" 
            fill="url(#sunDisc)"
          />

          {/* Architectural "M" Canvas Fold - First Column / Ribbon */}
          <path 
            d="M13 35V19C13 16.7909 14.7909 15 17 15H17.5C19.1569 15 20.5 16.3431 20.5 18V35" 
            stroke="url(#sunsetGrad1)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Architectural "M" Canvas Fold - Diagonal Apex & Right Column */}
          <path 
            d="M20.5 21L26 28.5C26.8 29.6 28.4 29.6 29.2 28.5L34.5 21V35" 
            stroke="url(#sunsetGrad2)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Ground Horizon Bar */}
          <line 
            x1="13" 
            y1="35" 
            x2="35" 
            y2="35" 
            stroke="#EA580C" 
            strokeWidth="3.5" 
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className={`font-display font-bold text-stone-900 ${textStyles[size].title} tracking-tight`}>
              Multi
            </span>
            <span className={`font-display font-extrabold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent ${textStyles[size].title} tracking-tight ml-0.5`}>
              Art
            </span>
          </div>
          <span className={`font-semibold uppercase text-stone-400 ${textStyles[size].subtitle}`}>
            Creative Studio
          </span>
        </div>
      )}
    </div>
  );
};

export default MultiArtLogo;
