import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint, Department } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  ShieldAlert, CheckCircle, XCircle, AlertCircle, 
  UserCheck, ArrowRight, ArrowLeft, MessageSquare, Building2
} from 'lucide-react';

export const OfficerReviewQueueView: React.FC<{
  onSelectComplaint: (id: string) => void;
  onBack: () => void;
}> = ({ onSelectComplaint, onBack }) => {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State for Review Decision
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'more_info' | 'assign'>('accept');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [publicRemarks, setPublicRemarks] = useState('');
  const [internalRemarks, setInternalRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueueData = async () => {
    setIsLoading(true);
    try {
      const [compRes, deptRes, offRes] = await Promise.all([
        fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/departments'),
        fetch('/api/departments/officers', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (compRes.ok) {
        const data: Complaint[] = await compRes.json();
        // Focus on complaints needing review/action
        const pending = data.filter((c) => ['submitted', 'under_review', 'accepted', 'reopened'].includes(c.status));
        setComplaints(pending);
        if (pending.length > 0 && !selectedComplaint) {
          setSelectedComplaint(pending[0]);
          setSelectedDeptId(pending[0].assigned_department_id || '');
        }
      }
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (offRes.ok) setOfficers(await offRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, [token]);

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    let targetStatus = 'accepted';
    if (actionType === 'reject') targetStatus = 'rejected';
    else if (actionType === 'more_info') targetStatus = 'more_info_required';
    else if (actionType === 'assign') targetStatus = 'assigned';

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: targetStatus,
          public_remarks: publicRemarks || `Complaint ${targetStatus.replace(/_/g, ' ')} by reviewing officer.`,
          internal_remarks: internalRemarks || null,
          rejection_reason: actionType === 'reject' ? rejectionReason : null,
          assigned_department_id: selectedDeptId || null,
          assigned_officer_id: selectedOfficerId || null,
        }),
      });

      if (res.ok) {
        alert(`Complaint #${selectedComplaint.ticket_number} marked as ${targetStatus.replace(/_/g, ' ')}.`);
        setPublicRemarks('');
        setInternalRemarks('');
        setRejectionReason('');
        setSelectedComplaint(null);
        fetchQueueData();
      } else {
        const err = await res.json();
        alert(err.detail || "Decision failed");
      }
    } catch {
      alert("Network error processing review decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Officer Hub
        </button>

        <span className="text-xs font-mono text-slate-400">
          Pending Triage Queue: <strong className="text-white">{complaints.length} reports</strong>
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading review queue...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
          <CheckCircle className="w-10 h-10 text-teal-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Review Queue Clear!</h2>
          <p className="text-xs text-slate-400">All submitted complaints in this queue have been triaged.</p>
        </div>
      ) : (
        /* Side-by-Side Review Queue Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Complaint Cards Queue */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Incident to Review:
            </h3>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {complaints.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedComplaint(c);
                      setSelectedDeptId(c.assigned_department_id || '');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-850 border-teal-500 shadow-lg ring-1 ring-teal-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[11px] font-bold text-teal-300">{c.ticket_number}</span>
                      <PriorityBadge score={c.severity_score} label={c.severity_label} showScore={false} />
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{c.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>📍 {c.locality}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Review Decision Workbench */}
          {selectedComplaint && (
            <div className="lg:col-span-2 space-y-6">
              {/* Complaint Overview Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-400">
                        {selectedComplaint.ticket_number}
                      </span>
                      <StatusBadge status={selectedComplaint.status} />
                      <PriorityBadge score={selectedComplaint.severity_score} label={selectedComplaint.severity_label} />
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{selectedComplaint.title}</h2>
                  </div>

                  <button
                    onClick={() => onSelectComplaint(selectedComplaint.id)}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold underline"
                  >
                    Full Chronological Timeline →
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {selectedComplaint.description}
                </p>

                {/* AI Suggestions Review Box */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-800/60 text-xs space-y-2">
                  <span className="font-bold text-cyan-300 block uppercase tracking-wider text-[10px]">
                    ✨ AI Assistance Suggestions
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Suggested Category:</span>
                      <strong className="text-white">{selectedComplaint.category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Recommended Dept:</span>
                      <strong className="text-white">{selectedComplaint.department_name || 'Municipal Roads'}</strong>
                    </div>
                  </div>
                  {selectedComplaint.ai_explanation && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                      Reasoning: {selectedComplaint.ai_explanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Officer Decision Form */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-teal-400" />
                  Authorized Triage & Assignment Decision
                </h3>

                <form onSubmit={handleSubmitDecision} className="space-y-4 text-xs">
                  {/* Action Type Toggle */}
                  <div>
                    <label className="block font-semibold text-slate-200 mb-2">Triage Decision Action</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setActionType('accept')}
                        className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                          actionType === 'accept'
                            ? 'bg-teal-900 border-teal-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Accept Report
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionType('assign')}
                        className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                          actionType === 'assign'
                            ? 'bg-purple-900 border-purple-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Assign Field Team
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionType('more_info')}
                        className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                          actionType === 'more_info'
                            ? 'bg-amber-900 border-amber-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Request More Info
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionType('reject')}
                        className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                          actionType === 'reject'
                            ? 'bg-rose-900 border-rose-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Reject with Reason
                      </button>
                    </div>
                  </div>

                  {/* Department & Officer Assignment Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Confirm Department</label>
                      <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Assign Field Inspector</label>
                      <select
                        value={selectedOfficerId}
                        onChange={(e) => setSelectedOfficerId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="">Select Field Officer / Team</option>
                        {officers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} ({o.department_name || 'All-Zone'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rejection Reason if Reject */}
                  {actionType === 'reject' && (
                    <div>
                      <label className="block font-semibold text-rose-300 mb-1">
                        Reason for Rejection (Visible to Citizen) <span className="text-white">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Jurisdiction belongs to National Highways Authority (NHAI) rather than municipal corporation..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-800 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  )}

                  {/* Public Remarks */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Public Timeline Remark (Visible on ticket activity log)
                    </label>
                    <input
                      type="text"
                      value={publicRemarks}
                      onChange={(e) => setPublicRemarks(e.target.value)}
                      placeholder="e.g. Complaint accepted. Dispatched to Ward 12 Quick Response Team."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Internal Remarks */}
                  <div>
                    <label className="block font-semibold text-amber-300 mb-1">
                      🔒 Internal Officer Notes (Strictly hidden from citizen)
                    </label>
                    <input
                      type="text"
                      value={internalRemarks}
                      onChange={(e) => setInternalRemarks(e.target.value)}
                      placeholder="Internal job order code, material requisition notes..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-900/60 text-amber-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Recording Decision...' : 'Commit Triage Decision'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
