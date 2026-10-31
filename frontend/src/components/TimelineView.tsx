import React from 'react';
import { TimelineItem } from '../types';
import { 
  Clock, CheckCircle, AlertOctagon, UserCheck, 
  RotateCcw, MessageSquare, ShieldCheck, FileImage
} from 'lucide-react';

interface TimelineViewProps {
  timeline: TimelineItem[];
  userRole?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline, userRole }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm italic">
        No activity milestones recorded yet.
      </div>
    );
  }

  const getIcon = (action: string, newStatus?: string | null) => {
    if (action === 'reopened' || newStatus === 'reopened') {
      return <RotateCcw className="w-4 h-4 text-orange-400" />;
    }
    if (newStatus === 'resolved_pending_feedback') {
      return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
    if (newStatus === 'closed') {
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
    if (newStatus === 'rejected') {
      return <AlertOctagon className="w-4 h-4 text-rose-400" />;
    }
    if (action === 'assignment' || newStatus === 'assigned') {
      return <UserCheck className="w-4 h-4 text-purple-400" />;
    }
    if (action === 'citizen_feedback') {
      return <MessageSquare className="w-4 h-4 text-teal-400" />;
    }
    return <Clock className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:top-2 before:left-2.5 before:w-0.5 before:bg-slate-800">
      {timeline.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          {/* Milestone bullet icon */}
          <div className="absolute -left-6 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#0a101d] border-2 border-slate-700 group-hover:border-teal-500 transition-colors">
            {getIcon(item.action, item.new_status)}
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white capitalize">
                  {item.action === 'status_change' && item.new_status
                    ? `Status updated to ${item.new_status.replace(/_/g, ' ')}`
                    : item.action.replace(/_/g, ' ')}
                </span>
                {item.actor_role && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                    {item.actor_role}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(item.created_at).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>

            {/* Actor name */}
            {item.actor_name && (
              <p className="text-xs text-slate-400 mb-2">
                Action by: <span className="text-slate-300 font-medium">{item.actor_name}</span>
              </p>
            )}

            {/* Public remarks */}
            {item.public_remarks && (
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                {item.public_remarks}
              </p>
            )}

            {/* Internal remarks - Only for authorized officials */}
            {item.internal_remarks && ['officer', 'moderator', 'admin'].includes(userRole || '') && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs">
                <span className="font-bold uppercase tracking-wider text-[10px] block text-amber-400 mb-1">
                  🔒 Internal Authorized Notes (Restricted)
                </span>
                {item.internal_remarks}
              </div>
            )}

            {/* Evidence link / thumbnail */}
            {item.evidence_url && (
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={item.evidence_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 bg-teal-950/60 px-2.5 py-1.5 rounded-md border border-teal-800/60"
                >
                  <FileImage className="w-3.5 h-3.5" />
                  View Photographic Resolution Evidence
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
