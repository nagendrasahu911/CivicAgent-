import React from 'react';
import { Logo } from '../components/Logo';
import { 
  FilePlus2, ShieldCheck, Layers, BarChart3, 
  CheckCircle, ArrowRight, Sparkles, MapPin, 
  Users, MessageSquare, AlertTriangle, HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onSelectTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectTab }) => {
  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center pt-8 pb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-medium mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Next-Generation Civic Technology Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Your Voice. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-200">Smarter Action.</span> Accountable Communities.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          CivicSaathi AI transforms civic grievance reporting with multilingual voice input, smart duplicate detection, 
          community issue clustering, and citizen-verified complaint resolution.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onSelectTab('new-complaint')}
            className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <FilePlus2 className="w-4 h-4" />
            Report a Civic Problem
          </button>

          <button
            onClick={() => onSelectTab('community-clusters')}
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 shadow transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-teal-400" />
            Explore Community Clusters
          </button>

          <button
            onClick={() => onSelectTab('demo-guide')}
            className="px-6 py-3.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-semibold text-sm border border-cyan-800/80 shadow transition-all flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Live Demo Walkthrough Guide
          </button>
        </div>

        {/* Quick Statistics Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-teal-400 font-mono">100%</div>
            <div className="text-xs text-slate-400 mt-1">Citizen-Verified Closure</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-cyan-400 font-mono">Hindi + EN</div>
            <div className="text-xs text-slate-400 mt-1">Bilingual Voice & Text</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-purple-400 font-mono">TF-IDF + Geo</div>
            <div className="text-xs text-slate-400 mt-1">Smart Duplicate Detection</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-emerald-400 font-mono">3 Privacy Modes</div>
            <div className="text-xs text-slate-400 mt-1">Public, Private, Confidential</div>
          </div>
        </div>
      </section>

      {/* 3 Core Signature Pillars */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Three Signature Innovations</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Engineered to overcome the fundamental flaws of legacy municipal complaint portals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-800/80 flex items-center justify-center text-teal-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Multilingual AI Problem Intake</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Citizens speak or type naturally in Hindi, Hinglish, or English. AI automatically extracts the civic category, 
                detects missing landmarks, calculates an explainable 0–100 severity score, and generates a structured summary.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-teal-400 font-semibold flex items-center gap-1">
              Supports Voice Recording & Transcripts <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Smart Duplicate Detection & Clusters</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cross-language semantic matching maps "Road mein bada gaddha hai" to "Dangerous deep pothole". 
                Haversine distance filters prevent distant reports from false matching. Citizens can back existing community clusters instead of creating duplicate tickets.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-cyan-400 font-semibold flex items-center gap-1">
              Deduplicated Community Upvoting <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Citizen-Verified Resolution</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                An officer marking an issue resolved does NOT close it! The ticket transitions to "Awaiting Citizen Feedback". 
                The reporting citizen inspects the work, reviews before/after evidence photos, rates 1–5 stars, or reopens the ticket with an escalation reason.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              Accountable Full Lifecycle Audit <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 block">
                Full Role-Protected Architecture
              </span>
              <h3 className="text-2xl font-bold text-white mb-4">
                Designed for Citizens, Field Inspectors, and Municipal Leadership
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Citizens:</strong> Guided reporting, multilingual voice recorder, private tracking, and resolution verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Officers:</strong> Role-protected triage queue, AI categorization corrections, team assignment, and work proof uploads.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Moderators:</strong> Cluster merging, splitting, confirmation, and confidential report review.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Administrators:</strong> Real-time SLA radar, department workload metrics, audit logging, and factory resets.</span>
                </li>
              </ul>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => onSelectTab('officer-dashboard')}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors"
                >
                  Inspect Officer Hub
                </button>
                <button
                  onClick={() => onSelectTab('civic-radar')}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  View Civic Risk Radar
                </button>
              </div>
            </div>

            {/* Quick Demo Presentation Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1626] to-[#0a101d] border border-cyan-800/60 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Evaluation Presentation Flow</span>
              </div>
              <h4 className="text-base font-bold text-white mb-2">9-Step Verified Demonstration</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                We have prepared a self-contained demonstration workflow that allows judges and mentors to test the complete end-to-end lifecycle in under 3 minutes.
              </p>
              <button
                onClick={() => onSelectTab('demo-guide')}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                Launch Presentation Guide <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
