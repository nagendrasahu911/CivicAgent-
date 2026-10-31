import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const configs: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    submitted: {
      label: 'Submitted',
      bg: 'bg-slate-800/80',
      text: 'text-slate-300',
      border: 'border-slate-700',
      dot: 'bg-slate-400',
    },
    under_review: {
      label: 'Under Review',
      bg: 'bg-sky-950/70',
      text: 'text-sky-300',
      border: 'border-sky-800/60',
      dot: 'bg-sky-400 animate-pulse',
    },
    more_info_required: {
      label: 'More Info Needed',
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-800/60',
      dot: 'bg-amber-400',
    },
    accepted: {
      label: 'Accepted',
      bg: 'bg-indigo-950/70',
      text: 'text-indigo-300',
      border: 'border-indigo-800/60',
      dot: 'bg-indigo-400',
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-950/70',
      text: 'text-rose-300',
      border: 'border-rose-800/60',
      dot: 'bg-rose-400',
    },
    assigned: {
      label: 'Assigned to Dept',
      bg: 'bg-purple-950/70',
      text: 'text-purple-300',
      border: 'border-purple-800/60',
      dot: 'bg-purple-400',
    },
    in_progress: {
      label: 'Work in Progress',
      bg: 'bg-blue-950/70',
      text: 'text-blue-300',
      border: 'border-blue-800/60',
      dot: 'bg-blue-400 animate-pulse',
    },
    resolved_pending_feedback: {
      label: 'Resolved — Awaiting Verification',
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-300 font-semibold',
      border: 'border-emerald-600/80 ring-1 ring-emerald-500/30',
      dot: 'bg-emerald-400 animate-ping',
    },
    closed: {
      label: 'Closed & Verified',
      bg: 'bg-slate-900',
      text: 'text-slate-400',
      border: 'border-slate-800',
      dot: 'bg-slate-500',
    },
    reopened: {
      label: 'Reopened by Citizen',
      bg: 'bg-orange-950/80',
      text: 'text-orange-300 font-semibold',
      border: 'border-orange-700/80',
      dot: 'bg-orange-400 animate-pulse',
    },
  };

  const current = configs[status] || {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
