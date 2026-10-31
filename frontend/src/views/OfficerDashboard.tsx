import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  ShieldAlert, Clock, CheckCircle2, AlertOctagon, 
  ArrowRight, Users, Flame, Building2
} from 'lucide-react';

interface OfficerDashboardProps {
  onSelectComplaint: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  onSelectComplaint,
  onNavigateTab,
}) => {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/complaints', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: Complaint[] = await res.json();
          setComplaints(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueue();
  }, [token]);

  const pendingTriage = complaints.filter((c) => ['submitted', 'under_review'].includes(c.status));
  const highPriority = complaints.filter((c) => c.severity_score >= 70 && !['closed', 'rejected'].includes(c.status));
  const inProgress = complaints.filter((c) => c.status === 'in_progress');
  const awaitingFeedback = complaints.filter((c) => c.status === 'resolved_pending_feedback');
  const reopenedCases = complaints.filter((c) => c.status === 'reopened');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0b1426] to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono bg-teal-950 px-2.5 py-0.5 rounded border border-teal-800">
                Department Triage Hub
              </span>
              <span className="text-xs text-slate-400">
                {user?.department_name || 'Municipal Roads & Engineering'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Authorized Officer Command Center
            </h1>
            <p className="text-xs text-slate-300">
              Logged in as <strong className="text-white">{user?.name}</strong> ({user?.role}). Manage departmental review queues, assign work, and log completion evidence.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('officer-queue')}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2"
            >
              Open Review Queue ({pendingTriage.length})
            </button>
            <button
              onClick={() => onNavigateTab('clusters-management')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              Cluster Operations
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div 
          onClick={() => onNavigateTab('officer-queue')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
        >
          <span className="text-xs text-slate-400 font-medium">Pending Triage</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">{pendingTriage.length}</div>
          <span className="text-[11px] text-teal-400">Needs officer review</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">High / Urgent Priority</span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1 flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-rose-500" />
            {highPriority.length}
          </div>
          <span className="text-[11px] text-rose-400/80">Hazard score &gt;= 70</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Work in Progress</span>
          <div className="text-2xl font-bold text-blue-400 font-mono mt-1">{inProgress.length}</div>
          <span className="text-[11px] text-blue-400">Crew deployed</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Awaiting Verification</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{awaitingFeedback.length}</div>
          <span className="text-[11px] text-emerald-400">Citizen inspection</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Citizen Reopened</span>
          <div className="text-2xl font-bold text-orange-400 font-mono mt-1">{reopenedCases.length}</div>
          <span className="text-[11px] text-orange-400">Escalated back to dept</span>
        </div>
      </div>

      {/* High Priority & Pending Review Queue Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-teal-400" />
            Department Triage Queue
          </h2>
          <button
            onClick={() => onNavigateTab('officer-queue')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium"
          >
            Manage Queue View →
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
          <div className="divide-y divide-slate-800">
            {complaints.slice(0, 6).map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c.id)}
                className="p-4 hover:bg-slate-850 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-teal-400">
                      {c.ticket_number}
                    </span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge score={c.severity_score} label={c.severity_label} />
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {c.privacy_mode}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{c.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span>📍 {c.locality}</span>
                    <span>📂 {c.category}</span>
                    {c.cluster_id && (
                      <span className="text-cyan-400 font-semibold">
                        👥 Part of Cluster ({c.cluster_support_count || 1} supporters)
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-teal-400 font-semibold flex items-center gap-1 mt-1">
                    Review / Action <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
