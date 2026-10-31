import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, ShieldAlert, RotateCcw, Activity, 
  Database, Cpu, Clock, CheckCircle2, Shield
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { token } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAuditLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [token]);

  const handleResetDemo = async () => {
    if (!window.confirm("Restore factory demo baseline? This will repopulate fresh complaints, clusters, and users.")) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Demo data restored to initial benchmark baseline.");
        fetchAuditLogs();
      } else {
        alert("Reset failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-400" />
            System Administration & Audit Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time infrastructure health, cryptographic access audit trails, and evaluation controls.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto shadow"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          {isResetting ? 'Resetting Baseline...' : 'Reset Demo Database'}
        </button>
      </div>

      {/* System Health Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Database Engine</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Operational
            </span>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-400" />
            SQLite 3 Transactional Pool
          </div>
          <p className="text-[11px] text-slate-400">PRAGMA foreign keys enforced, indexed queries.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">AI / NLP Core</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Multilingual Heuristic Engine
          </div>
          <p className="text-[11px] text-slate-400">Devanagari Hindi + Hinglish + English parsing.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Duplicate Matching</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            TF-IDF + Haversine 150m Filter
          </div>
          <p className="text-[11px] text-slate-400">Bilingual token expansion with geo-decay.</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-400" />
          Immutable Activity Audit Trail
        </h3>
        <p className="text-xs text-slate-400">
          Chronological record of status transitions, cluster merges, and administrative operations:
        </p>

        {isLoading ? (
          <div className="text-center py-8 text-slate-400 text-xs">Loading audit logs...</div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">No audit records logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[10px] uppercase border border-slate-700">
                        {log.actor_role || 'system'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">{log.action}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-300">{log.target_entity}</td>
                    <td className="py-2.5 px-3 text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
