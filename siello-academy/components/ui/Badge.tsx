'use client';

import { ScoutingStatus } from '@/lib/types';
import { Lang, t } from '@/lib/i18n';

const STATUS_CONFIG: Record<ScoutingStatus, { bg: string; text: string; border: string; dot: string }> = {
  ELITE_POTENTIAL: {
    bg: 'rgba(245,166,35,0.1)',
    text: '#F5A623',
    border: 'rgba(245,166,35,0.3)',
    dot: '#F5A623',
  },
  SIGN_NOW: {
    bg: 'rgba(20,184,166,0.1)',
    text: '#14B8A6',
    border: 'rgba(20,184,166,0.3)',
    dot: '#14B8A6',
  },
  FOLLOW: {
    bg: 'rgba(99,102,241,0.1)',
    text: '#818CF8',
    border: 'rgba(99,102,241,0.3)',
    dot: '#818CF8',
  },
  INITIAL_FILTER: {
    bg: 'rgba(251,191,36,0.08)',
    text: '#FCD34D',
    border: 'rgba(251,191,36,0.25)',
    dot: '#FCD34D',
  },
  PASS: {
    bg: 'rgba(239,68,68,0.08)',
    text: '#F87171',
    border: 'rgba(239,68,68,0.2)',
    dot: '#F87171',
  },
  PENDING: {
    bg: 'rgba(113,113,122,0.1)',
    text: '#A1A1AA',
    border: 'rgba(113,113,122,0.2)',
    dot: '#A1A1AA',
  },
};

interface StatusBadgeProps {
  status: ScoutingStatus;
  lang?: Lang;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, lang = 'es', size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const label = t(lang, status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
    lg: 'px-4 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-widest uppercase ${sizeClasses[size]}`}
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="rounded-full animate-pulse"
        style={{
          width: size === 'lg' ? 7 : 5,
          height: size === 'lg' ? 7 : 5,
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

interface ScorePillProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScorePill({ score, size = 'md' }: ScorePillProps) {
  const color = score >= 8 ? '#14B8A6' : score >= 6 ? '#F5A623' : score >= 4 ? '#FCD34D' : '#F87171';
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold font-['Outfit']`}
      style={{
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        border: `2px solid ${color}`,
        color,
        boxShadow: `0 0 16px ${color}40`,
      }}
    >
      {score.toFixed(1)}
    </div>
  );
}
