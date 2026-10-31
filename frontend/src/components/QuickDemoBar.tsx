import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { UserCheck, Shield, RotateCcw, Sparkles } from 'lucide-react';

export const QuickDemoBar: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, switchDemoRole } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const roles: { role: UserRole; name: string; label: string; dept?: string }[] = [
    { role: 'citizen', name: 'Aarav Sharma', label: 'Citizen', dept: 'Civil Lines Resident' },
    { role: 'officer', name: 'Er. Rajesh Kumar', label: 'Field Officer', dept: 'Roads & Highways' },
    { role: 'moderator', name: 'Sunita Nair', label: 'Moderator', dept: 'Civic HQ' },
    { role: 'admin', name: 'Admin', label: 'Administrator', dept: 'Municipal Command' },
  ];

  const handleReset = async () => {
    if (!window.confirm("Reset CivicSaathi AI demo database back to clean baseline state?")) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset-demo', { method: 'POST' });
      if (res.ok) {
        alert("Demo database successfully reset with fresh test dataset!");
        window.location.reload();
      } else {
        alert("Reset failed. Ensure backend server is running.");
      }
    } catch {
      alert("Failed connecting to backend.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-slate-950/95 border-b border-slate-800 text-xs text-slate-300 py-1.5 px-4 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Current Active Persona */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 font-medium">
            <Sparkles className="w-3 h-3 text-teal-400" />
            Hackathon Live Evaluation Mode
          </span>
          <span className="text-slate-400 hidden sm:inline">Active Persona:</span>
          <span className="font-semibold text-white flex items-center gap-1">
            {user?.name || 'Guest'}
            <span className="text-[10px] text-teal-400 font-mono uppercase bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
              {user?.role}
            </span>
          </span>
        </div>

        {/* Right: 1-Click Role Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">Switch Role:</span>
          {roles.map((r) => {
            const isActive = user?.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => {
                  switchDemoRole(r.role);
                  if (onNavigate) {
                    if (r.role === 'citizen') onNavigate('citizen-dashboard');
                    else if (r.role === 'officer') onNavigate('officer-dashboard');
                    else if (r.role === 'moderator') onNavigate('clusters-management');
                    else if (r.role === 'admin') onNavigate('admin-dashboard');
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/30 ring-1 ring-teal-400 font-semibold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
                title={`Switch to ${r.name} (${r.dept})`}
              >
                {r.role === 'citizen' ? <UserCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                {r.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Reset Demo Data button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-2 py-1 rounded-md bg-slate-900 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-rose-900/50 text-[11px] font-medium transition-colors flex items-center gap-1"
            title="Reset database to fresh test data"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Resetting...' : 'Reset Demo'}
          </button>
        </div>
      </div>
    </div>
  );
};
