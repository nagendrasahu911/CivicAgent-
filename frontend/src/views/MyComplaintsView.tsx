import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  FolderOpen, Search, Filter, ArrowRight, 
  FileText, CheckCircle2, ShieldCheck, AlertCircle
} from 'lucide-react';

interface MyComplaintsViewProps {
  onSelectComplaint: (id: string) => void;
  onNewComplaint: () => void;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({ onSelectComplaint, onNewComplaint }) => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [privacyFilter, setPrivacyFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/complaints?my_only=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: Complaint[] = await res.json();
          setComplaints(data);
          setFiltered(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, [token]);

  useEffect(() => {
    let result = complaints;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.ticket_number.toLowerCase().includes(q) ||
          c.locality.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (privacyFilter !== 'all') {
      result = result.filter((c) => c.privacy_mode === privacyFilter);
    }
    setFiltered(result);
  }, [searchTerm, statusFilter, privacyFilter, complaints]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-teal-400" />
            My Civic Grievance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time departmental progress, review activity logs, and verify completed resolutions.
          </p>
        </div>

        <button
          onClick={onNewComplaint}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          + File New Report
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket #, title, or locality..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses ({complaints.length})</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">Work in Progress</option>
            <option value="resolved_pending_feedback">Awaiting My Verification</option>
            <option value="reopened">Reopened</option>
            <option value="closed">Closed & Verified</option>
          </select>
        </div>

        {/* Privacy Filter */}
        <div>
          <select
            value={privacyFilter}
            onChange={(e) => setPrivacyFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Privacy Modes</option>
            <option value="public">Public Complaints</option>
            <option value="private">Private Complaints</option>
            <option value="confidential">Confidential Whistleblower</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading your reports...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No complaints match your active filter.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPrivacyFilter('all');
            }}
            className="text-xs text-teal-400 underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectComplaint(c.id)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded border border-teal-800">
                    {c.ticket_number}
                  </span>
                  <StatusBadge status={c.status} />
                  <PriorityBadge score={c.severity_score} label={c.severity_label} />
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {c.privacy_mode}
                  </span>
                  {c.status === 'resolved_pending_feedback' && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Action Required: Verify Repairs
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white hover:text-teal-400 transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                  <span>📍 {c.locality}</span>
                  <span>📂 {c.category}</span>
                  {c.department_name && <span>🏛️ {c.department_name}</span>}
                  {c.cluster_support_count ? (
                    <span className="text-cyan-400 font-semibold">
                      👥 Community Cluster ({c.cluster_support_count} supporters)
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs text-teal-400 font-semibold flex items-center gap-1 mt-2">
                  Inspect Timeline <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
