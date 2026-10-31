import React from 'react';
import { ShieldCheck, Lock, Eye, HelpCircle, AlertTriangle, FileText } from 'lucide-react';

export const PrivacyHelpView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-400" />
          Privacy Architecture & Civic Rights Guide
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed transparency disclosure on the 3 complaint privacy modes, data security, and platform independence.
        </p>
      </div>

      {/* 3 Privacy Modes In-Depth */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <h2 className="text-base font-bold text-white">Three Distinct Complaint Privacy Modes</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          CivicSaathi AI enforces strict privacy boundaries at the backend database query level. 
          Private data is never transferred to public client bundles.
        </p>

        <div className="space-y-4">
          {/* Mode 1 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-teal-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">1. Public Complaint Mode</h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800">
                Community Visible
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed for common street hazards (potholes, garbage vats, broken streetlights). 
              A sanitized summary appears in the Public Feed, Community Issue Clusters, and Civic Risk Radar. 
              Fellow community members can upvote and support the issue to heighten prioritization. Personal phone numbers and email addresses remain masked.
            </p>
          </div>

          {/* Mode 2 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white">2. Private Complaint Mode</h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                Restricted Visibility
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed for sensitive domestic or property-adjacent grievances (e.g., sewer backflow into private yard, localized drainage disputes). 
              <strong>Strictly restricted:</strong> Visible only to the reporting citizen and explicitly authorized department field officers. 
              Private complaints NEVER appear in public clusters, search results, or public heatmaps.
            </p>
          </div>

          {/* Mode 3 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">3. Confidential Public-Interest (Whistleblower)</h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                Whistleblower Protection
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed for critical public-safety hazards where whistleblower anonymity is paramount (e.g. cracked pedestrian bridge supports, hazardous illegal chemical dumping). 
              Original narrative, citizen identity, and exact coordinates remain confidential. A moderator reviews and releases an anonymized public notice once verified.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Independence Notice */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Independent Civic Technology Platform Notice
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          CivicSaathi AI is an independent open-technology research and civic engagement platform developed for hackathon demonstration. 
          CivicSaathi AI does not represent, claim endorsement by, or act as an official agency of any national, state, or municipal government entity. 
          Official complaint delivery operates only when verified integration agreements and administrative credentials are in place.
        </p>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white">Why does marking a complaint resolved not close it automatically?</h4>
            <p className="text-slate-300 leading-relaxed">
              In traditional portals, issues are frequently marked "Resolved" by contractors without citizen satisfaction. 
              CivicSaathi AI introduces <strong>Citizen-Verified Closure</strong>: tickets transition to "Awaiting Citizen Feedback" so 
              the reporting citizen can test the repair, upload verification photos, or reopen the ticket with an escalation reason.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white">How does Smart Duplicate Detection prevent duplicate tickets?</h4>
            <p className="text-slate-300 leading-relaxed">
              We combine bilingual TF-IDF semantic token mapping (matching English and Hindi synonyms like "pothole" and "गड्ढा") 
              with Haversine distance geofencing (150m immediate vicinity). When a match is found, citizens can upvote the existing community cluster instead of filling out separate forms.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white">Can public upvotes alter emergency response priority?</h4>
            <p className="text-slate-300 leading-relaxed">
              No. Public upvotes are an engagement and clustering signal, not an emergency triage algorithm. 
              Critical safety hazards (such as live 11kV electrical cables) are assigned maximum safety scores (80-100) regardless of vote count.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
