import React from 'react';
import { AlertTriangle, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  score?: number;
  label?: string;
  showScore?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  score,
  label,
  showScore = true,
  className = '',
}) => {
  // Infer label if only score is provided
  let effectiveLabel = label;
  if (!effectiveLabel && score !== undefined) {
    if (score >= 80) effectiveLabel = 'Urgent Review';
    else if (score >= 60) effectiveLabel = 'High';
    else if (score >= 30) effectiveLabel = 'Medium';
    else effectiveLabel = 'Normal';
  }

  const configs: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    'Urgent Review': {
      bg: 'bg-rose-950/80',
      text: 'text-rose-200',
      border: 'border-rose-700/80 ring-1 ring-rose-500/20',
      icon: Flame,
    },
    High: {
      bg: 'bg-amber-950/70',
      text: 'text-amber-200',
      border: 'border-amber-700/70',
      icon: ShieldAlert,
    },
    Medium: {
      bg: 'bg-cyan-950/70',
      text: 'text-cyan-200',
      border: 'border-cyan-800/60',
      icon: AlertTriangle,
    },
    Normal: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-800/50',
      icon: CheckCircle2,
    },
  };

  const current = configs[effectiveLabel || 'Normal'] || configs['Normal'];
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{effectiveLabel || 'Normal'}</span>
      {showScore && score !== undefined && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
          {score}/100
        </span>
      )}
    </span>
  );
};
