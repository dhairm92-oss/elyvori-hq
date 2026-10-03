import React from 'react';

interface QuantumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  glowColor?: string;
  isFullWidth?: boolean;
}

export const QuantumButton: React.FC<QuantumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  isFullWidth = false,
  type = 'button',
  onClick,
  id,
  ...props
}) => {
  // Balanced responsive sizing for mobile touch, iPad, and desktop cursor
  const sizeClasses = {
    sm: 'px-3.5 sm:px-4 py-2 text-xs',
    md: 'px-4 sm:px-5 py-2.5 text-xs sm:text-sm',
    lg: 'px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base',
  };

  const isPrimary = variant === 'primary';
  const isAccent = variant === 'accent';
  const isSecondary = variant === 'secondary';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${
        isFullWidth ? 'w-full' : 'w-auto'
      }`}
    >
      {/* 1. Static, Elegant, Deep Ambient Neon Glow (Non-distracting, stable, high-end) */}
      {!disabled && (
        <div
          className={`absolute -inset-1 rounded-2xl opacity-65 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none ${
            isPrimary
              ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600'
              : isAccent
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
              : 'bg-gradient-to-r from-slate-600/40 via-cyan-500/30 to-indigo-600/40'
          }`}
        />
      )}

      {/* 2. Static Crystal Neon Border (No spinning lines, perfectly stable and clean) */}
      {!disabled && (
        <div
          className={`absolute -inset-[1px] rounded-2xl pointer-events-none transition-all duration-300 ${
            isPrimary
              ? 'border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : isAccent
              ? 'border border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'border border-slate-700/80'
          }`}
        />
      )}

      {/* 3. Core Solid Button Body with Rich Internal Sheen */}
      <button
        id={id}
        type={type}
        disabled={disabled}
        onClick={onClick}
        {...props}
        className={`relative z-10 flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide transition-all duration-200 select-none ${
          sizeClasses[size]
        } ${isFullWidth ? 'w-full' : 'w-auto'} ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400'
            : isPrimary
            ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-950/40 hover:scale-[1.02] active:scale-[0.98]'
            : isAccent
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700/80 hover:border-cyan-500/50 hover:scale-[1.01] active:scale-[0.98]'
        } ${className}`}
      >
        {/* Soft Glass highlight reflection on top edge */}
        {!disabled && (
          <span
            className="absolute top-0 inset-x-0 h-[40%] rounded-t-xl opacity-20 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)',
            }}
          />
        )}

        {/* Content with high contrast */}
        <span className="relative z-20 flex items-center justify-center gap-2 text-shadow-sm">
          {children}
        </span>
      </button>
    </div>
  );
};
