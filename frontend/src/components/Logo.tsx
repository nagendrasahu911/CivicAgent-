import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Custom Pin + Community Checkmark Motif */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-500 p-0.5 shadow-lg shadow-teal-500/20 ${iconSizes[size]}`}>
        <div className="w-full h-full bg-[#0a101d] rounded-[10px] flex items-center justify-center">
          <svg
            className="w-4/5 h-4/5 text-teal-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Location pin perimeter */}
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z" />
            {/* Integrated community checkmark inside pin */}
            <path d="m9 10 2 2 4-4" stroke="#2dd4bf" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-white ${textSizes[size]}`}>
            Civic<span className="text-teal-400">Saathi</span>
          </span>
          <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-400 -mt-0.5">
            Your Voice. Smarter Action. Accountable Communities.
          </span>
        )}
      </div>
    </div>
  );
};
