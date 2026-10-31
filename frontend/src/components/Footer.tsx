import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Info, Heart } from 'lucide-react';

export const Footer: React.FC<{ onSelectTab: (tab: string) => void }> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#070b12] border-t border-slate-800/80 text-slate-400 text-xs mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Logo size="md" showTagline={true} />
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              CivicSaathi AI bridges the accountability gap between citizens and municipal teams through 
              multilingual AI problem intake, smart duplicate detection, community issue clustering, 
              and citizen-verified resolution.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-teal-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Zero-Knowledge Private Complaint Isolation
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Platform Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('new-complaint')} className="hover:text-teal-400 transition-colors">
                  File New Complaint (Voice/Text)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('public-explorer')} className="hover:text-teal-400 transition-colors">
                  Public Issue Explorer
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('community-clusters')} className="hover:text-teal-400 transition-colors">
                  Community Issue Clusters
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('civic-radar')} className="hover:text-teal-400 transition-colors">
                  Civic Risk Radar & Heatmap
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Guide */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Transparency & Guides</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('demo-guide')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  🎯 Evaluator Presentation Guide
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('privacy-help')} className="hover:text-teal-400 transition-colors">
                  3 Privacy Modes & Civic Rights
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('admin-dashboard')} className="hover:text-teal-400 transition-colors">
                  System Audit Logs & Diagnostics
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Civic Integrity Disclaimer Banner */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong className="text-slate-300">Independent Civic Technology Platform:</strong> CivicSaathi AI does not claim 
              official municipal ownership or endorsement. Official complaint delivery operates only with verified administrative authority integrations.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-slate-400">
            Built with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for community empowerment.
          </div>
        </div>
      </div>
    </footer>
  );
};
