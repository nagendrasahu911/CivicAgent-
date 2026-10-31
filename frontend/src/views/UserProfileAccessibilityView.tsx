import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Globe, Eye, Type, Shield, LogOut } from 'lucide-react';

export const UserProfileAccessibilityView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user, language, setLanguage, highContrast, setHighContrast, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-teal-400" />
          User Profile & Accessibility Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Personal details, language options, high contrast modes, and accessibility preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Account Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Full Name</span>
            <span className="font-bold text-white text-sm">{user?.name || 'Citizen'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Email Address</span>
            <span className="font-bold text-white text-sm">{user?.email}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Account Role</span>
            <span className="font-bold text-teal-300 text-sm capitalize">{user?.role}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Default Locality</span>
            <span className="font-bold text-white text-sm">{user?.locality || 'Civil Lines, Delhi'}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              logout();
              onLogout();
            }}
            className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Accessibility & Language Preferences */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Accessibility & Localization
        </h2>

        {/* Language Selection */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              Interface Language
            </div>
            <p className="text-[11px] text-slate-400">
              Toggle between English and Hindi for labels, guidelines, and transcripts.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                language === 'en'
                  ? 'bg-teal-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                language === 'hi'
                  ? 'bg-teal-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        {/* High Contrast Mode Toggle */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-teal-400" />
              High Contrast Borders & Contrast Ratio
            </div>
            <p className="text-[11px] text-slate-400">
              Enhances text contrast and container borders for low-vision readability.
            </p>
          </div>

          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              highContrast
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {highContrast ? 'Enabled' : 'Standard'}
          </button>
        </div>
      </div>
    </div>
  );
};
