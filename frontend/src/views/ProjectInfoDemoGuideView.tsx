import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, CheckCircle, ArrowRight, Play, Layers, 
  ShieldAlert, CheckCircle2, RotateCcw, Cpu, Database, 
  ExternalLink, HelpCircle
} from 'lucide-react';

interface ProjectInfoDemoGuideProps {
  onNavigateTab: (tab: string, complaintId?: string) => void;
}

export const ProjectInfoDemoGuideView: React.FC<ProjectInfoDemoGuideProps> = ({ onNavigateTab }) => {
  const { switchDemoRole } = useAuth();
  const [activeStep, setActiveStep] = useState<number>(1);

  const presentationSteps = [
    {
      step: 1,
      title: "1. Citizen Submits a Pothole Complaint in Hindi",
      description: "A citizen opens the New Complaint wizard and speaks or chooses the Hindi Voice Preset (\"सिविल लाइन्स मेन रोड पर गहरा गड्ढा है...\").",
      role: "citizen",
      actionLabel: "Try Step 1: Open Report Wizard with Voice Preset",
      action: async () => {
        await switchDemoRole('citizen');
        onNavigateTab('new-complaint');
      },
    },
    {
      step: 2,
      title: "2. Multilingual AI Analyzes & Summarizes the Report",
      description: "AI extracts category (\"Potholes and damaged roads\"), computes 0–100 explainable severity breakdown (Safety 40, Impact 25, Time 15, Evidence 10, Cluster 10), and flags missing landmark info.",
      role: "citizen",
      actionLabel: "Try Step 2: Test Live AI Analysis on Report",
      action: async () => {
        await switchDemoRole('citizen');
        onNavigateTab('new-complaint');
      },
    },
    {
      step: 3,
      title: "3. Smart Duplicate Detection Identifies Existing Cluster",
      description: "TF-IDF bilingual mapping aligns Hindi \"गड्ढा\" with English \"pothole\". Haversine formula calculates 59m proximity to existing ticket CIVIC-2026-10442.",
      role: "citizen",
      actionLabel: "Try Step 3: Trigger Duplicate Warning in Wizard",
      action: async () => {
        await switchDemoRole('citizen');
        onNavigateTab('new-complaint');
      },
    },
    {
      step: 4,
      title: "4. Citizen Supports Existing Community Cluster",
      description: "Citizen clicks \"Support This Existing Issue\" to back the Civil Lines Road Crater cluster (CLS-CIVIL-LINES-POTHOLE) rather than generating duplicate paperwork.",
      role: "citizen",
      actionLabel: "Try Step 4: View & Upvote Community Clusters",
      action: async () => {
        await switchDemoRole('citizen');
        onNavigateTab('community-clusters');
      },
    },
    {
      step: 5,
      title: "5. Officer Hub Displays Cluster Priority & Queue",
      description: "Switch to Field Officer persona (Er. Rajesh Kumar). The Officer Dashboard shows high-priority queue, active backlog, and cluster details.",
      role: "officer",
      actionLabel: "Try Step 5: Switch to Field Officer Dashboard",
      action: async () => {
        await switchDemoRole('officer');
        onNavigateTab('officer-dashboard');
      },
    },
    {
      step: 6,
      title: "6. Officer Reviews and Assigns the Complaint",
      description: "Officer opens the Review Queue, verifies department jurisdiction (Municipal Roads), assigns the field inspection crew, and adds internal job notes.",
      role: "officer",
      actionLabel: "Try Step 6: Open Officer Review Queue",
      action: async () => {
        await switchDemoRole('officer');
        onNavigateTab('officer-queue');
      },
    },
    {
      step: 7,
      title: "7. Officer Records Work Progress & Photo Proof",
      description: "Field repairs are executed. Officer marks the status \"Resolved — Awaiting Citizen Feedback\" and attaches photo proof of the completed patch work.",
      role: "officer",
      actionLabel: "Try Step 7: Inspect Pre-Resolved Ticket Proof",
      action: async () => {
        await switchDemoRole('officer');
        onNavigateTab('complaint-detail', 'cmp-garbage-resolved-pending');
      },
    },
    {
      step: 8,
      title: "8. Citizen Verifies Resolution or Reopens with Escalation",
      description: "Citizen reporter receives an in-app prompt. They inspect repairs, submit 1–5 stars, or reopen with an accountable escalation reason.",
      role: "citizen",
      actionLabel: "Try Step 8: Citizen Resolution Verification Action",
      action: async () => {
        await switchDemoRole('citizen');
        onNavigateTab('complaint-detail', 'cmp-garbage-resolved-pending');
      },
    },
    {
      step: 9,
      title: "9. Records & Civic Risk Radar Update in Real-Time",
      description: "Chronological activity timeline preserves all historic milestones. Civic Risk Radar updates spatial hotspots, recurring categories, and department SLAs.",
      role: "all",
      actionLabel: "Try Step 9: View Real-Time Civic Risk Radar",
      action: async () => {
        onNavigateTab('civic-radar');
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Interactive Evaluator & Hackathon Mentors Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          CivicSaathi AI — Platform Architecture & Live Demo Flow
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          This guided walkthrough provides judges and evaluators a complete step-by-step path 
          to test all 3 signature features and observe full bidirectional accountability in action.
        </p>
      </div>

      {/* 9-Step Interactive Presentation Guide */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-teal-400" />
              9-Step Verified Presentation Flow
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Follow these sequential steps to demonstrate end-to-end civic accountability:
            </p>
          </div>
          <span className="text-xs font-mono text-teal-400 bg-teal-950 px-2.5 py-1 rounded border border-teal-800">
            Step {activeStep} of 9
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step Selector List */}
          <div className="space-y-2">
            {presentationSteps.map((s) => (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`w-full p-3 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between border ${
                  activeStep === s.step
                    ? 'bg-teal-950/80 border-teal-500 text-white font-bold ring-1 ring-teal-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="line-clamp-1">{s.title}</span>
                {activeStep === s.step && <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1" />}
              </button>
            ))}
          </div>

          {/* Active Step Detail Card */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
                  Presentation Milestone {activeStep}
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                  Persona: {presentationSteps[activeStep - 1].role}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">
                {presentationSteps[activeStep - 1].title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {presentationSteps[activeStep - 1].description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 text-xs"
              >
                Previous Step
              </button>

              <button
                onClick={presentationSteps[activeStep - 1].action}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <span>{presentationSteps[activeStep - 1].actionLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveStep(Math.min(9, activeStep + 1))}
                disabled={activeStep === 9}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 text-xs"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Working Features vs Future Roadmap Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Engineering Deliverables & Feature Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Honest disclosure of implemented production capabilities, demo presets, and future municipal integrations:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-3">System Capability</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Implementation Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Multilingual Complaint Intake</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Fully Operational</td>
                <td className="py-2.5 px-3 text-slate-400">Hindi Devanagari, Hinglish, & English keyword synsets with auto-categorization.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Smart Duplicate Detection</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Fully Operational</td>
                <td className="py-2.5 px-3 text-slate-400">TF-IDF vectorizer + bilingual synset expansion + Haversine geo-distance 150m decay.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Community Issue Clustering</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Fully Operational</td>
                <td className="py-2.5 px-3 text-slate-400">Server-side deduplicated support voting per citizen account, officer merge/split controls.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Explainable 0–100 Priority Scoring</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Fully Operational</td>
                <td className="py-2.5 px-3 text-slate-400">Transparent formula: Safety (40), Public Impact (25), Time (15), Evidence (10), Cluster (10).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Citizen-Verified Resolution Closure</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Fully Operational</td>
                <td className="py-2.5 px-3 text-slate-400">Resolved Pending Feedback state; 1-5 rating; accountable reopening with preserved history.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">3 Distinct Privacy Modes</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Fully Operational</td>
                <td className="py-2.5 px-3 text-slate-400">Public, Private, Confidential enforced in SQLite database queries (zero-knowledge sanitization).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Google Maps & Places Geocoding</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Fully Operational</td>
                <td className="py-2.5 px-3 text-slate-400">Official Google Maps JS API with Places Autocomplete, draggable pins, GPS locator, status markers, & radar heatmaps.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Multilingual Voice Speech-to-Text</td>
                <td className="py-2.5 px-3 text-teal-400 font-bold">✓ Operational (Hybrid)</td>
                <td className="py-2.5 px-3 text-slate-400">Browser Web Speech API + 4 realistic Hindi/English pre-recorded presets for reliable evaluation.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Official Municipal Dispatch Gateway</td>
                <td className="py-2.5 px-3 text-amber-400 font-bold">⚡ Prototype Sandbox</td>
                <td className="py-2.5 px-3 text-slate-400">Mocked municipal ERP webhook triggers; live dispatch requires verified MOUs.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
