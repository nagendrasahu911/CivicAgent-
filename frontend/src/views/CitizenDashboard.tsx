import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint, IssueCluster } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  FilePlus2, FolderOpen, Layers, CheckCircle2, 
  AlertCircle, ArrowRight, PhoneCall, ShieldAlert, Clock
} from 'lucide-react';

interface CitizenDashboardProps {
  onSelectTab: (tab: string, complaintId?: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onSelectTab }) => {
  const { user, token } = useAuth();
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [nearbyClusters, setNearbyClusters] = useState<IssueCluster[]>([]);
  const [pendingVerification, setPendingVerification] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's complaints
        const compRes = await fetch('/api/complaints?my_only=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (compRes.ok) {
          const comps: Complaint[] = await compRes.json();
          setRecentComplaints(comps);
          // Check if any complaint is awaiting citizen verification
          const pending = comps.find((c) => c.status === 'resolved_pending_feedback');
          if (pending) setPendingVerification(pending);
        }

        // Fetch active clusters
        const clusRes = await fetch('/api/clusters');
        if (clusRes.ok) {
          const clus: IssueCluster[] = await clusRes.json();
          setNearbyClusters(clus.slice(0, 3));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-[#0b1120] border border-teal-800/60 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/60">
              <span>📍 {user?.locality || 'Civil Lines, Delhi'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {user?.name || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Track your reported issues with full timeline transparency, verify completed field repairs, 
              or file a new civic grievance with AI assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('new-complaint')}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <FilePlus2 className="w-4 h-4" />
              File New Complaint
            </button>
            <button
              onClick={() => onSelectTab('my-complaints')}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-teal-400" />
              My Reports ({recentComplaints.length})
            </button>
          </div>
        </div>
      </div>

      {/* ACTION REQUIRED: Citizen Resolution Verification Banner */}
      {pendingVerification && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950/70 border-2 border-emerald-500/70 p-5 shadow-lg shadow-emerald-500/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-600 text-emerald-300 shrink-0">
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Verification Needed
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    #{pendingVerification.ticket_number}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {pendingVerification.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  The municipal department reported field repairs completed. As the citizen reporter, please inspect 
                  the location and confirm if the problem is genuinely fixed or if it needs reopening.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('complaint-detail', pendingVerification.id)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-2"
            >
              Verify Resolution Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Complaints + Community Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Active Complaints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-teal-400" />
              Your Active Civic Reports
            </h2>
            <button
              onClick={() => onSelectTab('my-complaints')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium"
            >
              View All ({recentComplaints.length}) →
            </button>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-400">You haven't filed any civic complaints yet.</p>
              <button
                onClick={() => onSelectTab('new-complaint')}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
              >
                File Your First Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentComplaints.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectTab('complaint-detail', c.id)}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        {c.ticket_number}
                      </span>
                      <StatusBadge status={c.status} />
                      <PriorityBadge score={c.severity_score} label={c.severity_label} showScore={false} />
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {c.privacy_mode}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-teal-400 transition-colors">
                      {c.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>📍 {c.locality}</span>
                      <span>📂 {c.category}</span>
                      {c.department_name && <span>🏛️ {c.department_name}</span>}
                    </div>
                  </div>

                  <div className="shrink-0 text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span className="text-[11px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-teal-400 font-medium flex items-center gap-1 mt-1">
                      Track Timeline <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Community Clusters & Emergency Contacts */}
        <div className="space-y-6">
          {/* Active Local Clusters */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Active Local Clusters
              </h3>
              <button
                onClick={() => onSelectTab('community-clusters')}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                All Clusters →
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Support recurring issues in your ward to escalate priority without duplicate paperwork:
            </p>

            <div className="space-y-2.5">
              {nearbyClusters.map((cl) => (
                <div
                  key={cl.id}
                  onClick={() => onSelectTab('community-clusters')}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-800/60 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white line-clamp-1">{cl.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>📍 {cl.locality}</span>
                    <span className="font-semibold text-cyan-400">
                      👥 {cl.support_count} supporters
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Municipal Emergency Contacts */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Emergency Civic Helplines
            </h3>
            <p className="text-xs text-slate-400">
              For immediate life safety or high-voltage emergencies:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-300">Live Electricity Hazard</span>
                <span className="font-mono font-bold text-amber-400">1912</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-300">Water Main Pipeline Burst</span>
                <span className="font-mono font-bold text-cyan-400">1916</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-300">Central Disaster Control</span>
                <span className="font-mono font-bold text-rose-400">112</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
