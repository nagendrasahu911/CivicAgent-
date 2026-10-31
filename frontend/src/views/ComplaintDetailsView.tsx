import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TimelineView } from '../components/TimelineView';
import { GoogleMap } from '../components/GoogleMap';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Building2, 
  User, CheckCircle2, AlertOctagon, RotateCcw, 
  Star, FileImage, ShieldCheck, Sparkles, Send, Volume2
} from 'lucide-react';

interface ComplaintDetailsViewProps {
  complaintId: string;
  onBack: () => void;
}

export const ComplaintDetailsView: React.FC<ComplaintDetailsViewProps> = ({ complaintId, onBack }) => {
  const { user, token } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Citizen verification form state
  const [rating, setRating] = useState<number>(5);
  const [feedbackStatus, setFeedbackStatus] = useState<'fully_resolved' | 'partially_resolved' | 'not_resolved'>('fully_resolved');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Officer action state
  const [officerStatus, setOfficerStatus] = useState<string>('');
  const [officerPublicNote, setOfficerPublicNote] = useState('');
  const [officerInternalNote, setOfficerInternalNote] = useState('');
  const [resolutionEvidenceUrl, setResolutionEvidenceUrl] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Complaint = await res.json();
        setComplaint(data);
        setOfficerStatus(data.status);
      } else {
        alert("Unable to load complaint. It may be restricted by privacy authorization.");
        onBack();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [complaintId, token]);

  const handleCitizenFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          feedback_status: feedbackStatus,
          comments: feedbackComments,
          reopen_requested: feedbackStatus === 'not_resolved',
          reopen_reason: feedbackStatus === 'not_resolved' ? reopenReason : null,
        }),
      });

      if (res.ok) {
        alert(
          feedbackStatus === 'not_resolved'
            ? "Complaint successfully reopened and escalated to department."
            : "Thank you! Your resolution verification has been recorded."
        );
        fetchDetails();
      } else {
        const err = await res.json();
        alert(err.detail || "Verification submission failed");
      }
    } catch {
      alert("Error submitting feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleOfficerStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'patch',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: officerStatus,
          public_remarks: officerPublicNote,
          internal_remarks: officerInternalNote,
          resolution_notes: officerStatus === 'resolved_pending_feedback' ? officerPublicNote : null,
          resolution_evidence_url: resolutionEvidenceUrl || null,
        }),
      });

      if (res.ok) {
        alert(`Status updated to ${officerStatus.replace(/_/g, ' ')}`);
        setOfficerPublicNote('');
        setOfficerInternalNote('');
        fetchDetails();
      } else {
        const err = await res.json();
        alert(err.detail || "Status update failed");
      }
    } catch {
      alert("Error updating status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading || !complaint) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400 text-sm">
        Loading complaint records and chronological activity timeline...
      </div>
    );
  }

  const isOwner = user?.id === complaint.user_id;
  const isOfficial = user && ['officer', 'moderator', 'admin'].includes(user.role);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Complaint Feed
      </button>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950 px-3 py-1 rounded-lg border border-teal-800">
              {complaint.ticket_number}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge score={complaint.severity_score} label={complaint.severity_label} />
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              🔒 Privacy: {complaint.privacy_mode}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Filed on: {new Date(complaint.created_at).toLocaleString()}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
          {complaint.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          {complaint.description}
        </p>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Locality & Area</span>
            <span className="font-semibold text-white">📍 {complaint.locality}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Civic Category</span>
            <span className="font-semibold text-teal-300">📂 {complaint.category}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Assigned Department</span>
            <span className="font-semibold text-cyan-300">🏛️ {complaint.department_name || 'Triage Pending'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Reporter Identity</span>
            <span className="font-semibold text-slate-300">
              👤 {complaint.user_name || 'Anonymous Citizen'}
            </span>
          </div>
        </div>

        {/* Selected Address Strip if present */}
        {complaint.selected_address && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-slate-300">
                <strong className="text-white">Pinpointed Incident Address:</strong> {complaint.selected_address}
              </span>
            </div>
            {complaint.location_selection_method && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 shrink-0">
                Fix: {complaint.location_selection_method.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        )}

        {/* Photo Evidence if attached */}
        {complaint.image_url && (
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Complainant Evidence Photo</span>
            <img
              src={complaint.image_url}
              alt="Incident Proof"
              className="max-h-64 rounded-xl border border-slate-800 object-cover shadow"
            />
          </div>
        )}
      </div>

      {/* CITIZEN RESOLUTION VERIFICATION WORKFLOW (Key Signature Feature) */}
      {complaint.status === 'resolved_pending_feedback' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-emerald-950/40 border-2 border-emerald-500 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Citizen Accountability Verification
              </span>
              <h2 className="text-lg font-bold text-white">
                Field Repairs Completed — Does this resolve the problem?
              </h2>
            </div>
          </div>

          {/* Show Officer Completion Evidence */}
          {complaint.resolution_notes && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-800/60 text-xs space-y-2">
              <span className="font-semibold text-emerald-300 block">Department Completion Report:</span>
              <p className="text-slate-200">{complaint.resolution_notes}</p>
              {complaint.resolution_evidence_url && (
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1 text-[11px]">Officer Before/After Photo Evidence:</span>
                  <img
                    src={complaint.resolution_evidence_url}
                    alt="Work completion evidence"
                    className="max-h-56 rounded-lg border border-slate-700 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Verification Form */}
          {isOwner || isOfficial ? (
            <form onSubmit={handleCitizenFeedback} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  How would you classify the resolution? <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackStatus('fully_resolved')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      feedbackStatus === 'fully_resolved'
                        ? 'bg-emerald-900 border-emerald-400 text-white ring-1 ring-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                    <div>Fully Resolved</div>
                    <div className="text-[10px] text-slate-400 font-normal">Close complaint permanently</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackStatus('partially_resolved')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      feedbackStatus === 'partially_resolved'
                        ? 'bg-amber-950 border-amber-400 text-white ring-1 ring-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <AlertOctagon className="w-4 h-4 text-amber-400 mb-1" />
                    <div>Partially Resolved</div>
                    <div className="text-[10px] text-slate-400 font-normal">Work started but incomplete</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackStatus('not_resolved')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      feedbackStatus === 'not_resolved'
                        ? 'bg-rose-950 border-rose-400 text-white ring-1 ring-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400 mb-1" />
                    <div>Not Resolved (Reopen)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Reopen with escalation note</div>
                  </button>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Citizen Satisfaction Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        star <= rating
                          ? 'bg-amber-950 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-mono text-slate-300 font-semibold">{rating} / 5</span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Citizen Feedback Remarks
                </label>
                <textarea
                  rows={2}
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder="Share details of your site inspection..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Reopen Escalation Reason if Not Resolved */}
              {feedbackStatus === 'not_resolved' && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-700/80 space-y-2">
                  <label className="block text-xs font-bold text-rose-300">
                    Why is the issue still unresolved? (Required for Escalation) <span className="text-white">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="e.g. Contractor only filled mud over the leak without repairing the collar clamp..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-800 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingFeedback ? 'Recording Verification...' : 'Submit Resolution Verification'}
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Verification is awaiting action by the reporting citizen ({complaint.user_name}).
            </p>
          )}
        </div>
      )}

      {/* Show Citizen Verification Record if Closed or Reopened */}
      {complaint.citizen_feedback_status && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-teal-400 uppercase tracking-wider">
              Citizen Verification Record
            </span>
            <span className="font-semibold text-white">
              Status: {complaint.citizen_feedback_status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
            Rating: {'★'.repeat(complaint.citizen_rating || 5)}{'☆'.repeat(5 - (complaint.citizen_rating || 5))}
          </div>
          {complaint.citizen_feedback_notes && (
            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
              "{complaint.citizen_feedback_notes}"
            </p>
          )}
          {complaint.reopen_reason && (
            <div className="p-3 rounded-lg bg-orange-950/60 border border-orange-800 text-orange-200 text-xs">
              <strong>Reopening Escalation Reason:</strong> {complaint.reopen_reason}
            </div>
          )}
        </div>
      )}

      {/* OFFICER ROLE-PROTECTED CONTROLS */}
      {isOfficial && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Authorized Officer Actions</h3>
          </div>

          <form onSubmit={handleOfficerStatusUpdate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Lifecycle Status Transition</label>
                <select
                  value={officerStatus}
                  onChange={(e) => setOfficerStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="more_info_required">More Information Required</option>
                  <option value="accepted">Accepted for Municipal Action</option>
                  <option value="assigned">Assigned to Field Team</option>
                  <option value="in_progress">Work in Progress</option>
                  <option value="resolved_pending_feedback">Resolved — Awaiting Citizen Feedback</option>
                  <option value="rejected">Reject with Reason</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Resolution Proof Photo URL (For Resolved state)
                </label>
                <input
                  type="text"
                  value={resolutionEvidenceUrl}
                  onChange={(e) => setResolutionEvidenceUrl(e.target.value)}
                  placeholder="Paste photo URL showing completed repairs"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Public Milestone Note</label>
              <input
                type="text"
                value={officerPublicNote}
                onChange={(e) => setOfficerPublicNote(e.target.value)}
                placeholder="Remarks visible to the citizen and public timeline..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-amber-300 mb-1">
                🔒 Internal Officer Notes (Restricted from Citizen View)
              </label>
              <input
                type="text"
                value={officerInternalNote}
                onChange={(e) => setOfficerInternalNote(e.target.value)}
                placeholder="Internal contractor notes, budget code, or inspection details..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-900/60 text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors flex items-center gap-2"
            >
              {isUpdatingStatus ? 'Updating...' : 'Commit Status & Timeline Milestone'}
            </button>
          </form>
        </div>
      )}

      {/* Map & Chronological Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Location Map */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-400" />
            Geographic Location
          </h3>
          {complaint.latitude && complaint.longitude ? (
            <div className="space-y-2">
              <GoogleMap
                mode="display"
                center={[complaint.latitude, complaint.longitude]}
                zoom={15}
                markers={[
                  {
                    id: complaint.id,
                    lat: complaint.latitude,
                    lon: complaint.longitude,
                    title: complaint.title,
                    category: complaint.category,
                    status: complaint.status,
                    severity_label: complaint.severity_label,
                    ticket_number: complaint.ticket_number,
                    address: complaint.selected_address || `${complaint.locality}${complaint.landmark ? ', ' + complaint.landmark : ''}`,
                  },
                ]}
                height="300px"
              />
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-teal-400">
                  <span>GPS: {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}</span>
                  {complaint.location_selection_method && (
                    <span className="uppercase text-slate-400">Method: {complaint.location_selection_method.replace(/_/g, ' ')}</span>
                  )}
                </div>
                {complaint.selected_address && (
                  <p className="text-slate-300 font-sans text-xs">
                    {complaint.selected_address}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              No exact coordinates available
            </div>
          )}
        </div>

        {/* Right 2 cols: Full Chronological Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            Chronological Activity History & Audit Timeline
          </h3>
          <TimelineView timeline={complaint.timeline || []} userRole={user?.role} />
        </div>
      </div>
    </div>
  );
};
