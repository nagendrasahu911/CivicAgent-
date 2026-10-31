import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { 
  Bell, FilePlus2, Layers, Compass, BarChart3, 
  ShieldAlert, Settings, LogOut, Menu, X, HelpCircle,
  FolderOpen, Building2, Eye
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, unreadCount, language, setLanguage } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOfficial = user && ['officer', 'moderator', 'admin'].includes(user.role);
  const isAdmin = user && user.role === 'admin';

  const navLinks = [
    // Citizen & General Links
    { id: 'citizen-dashboard', label: 'Citizen Home', role: 'citizen', icon: Compass },
    { id: 'new-complaint', label: 'Report Issue', role: 'all', icon: FilePlus2, highlight: true },
    { id: 'my-complaints', label: 'My Reports', role: 'citizen', icon: FolderOpen },
    { id: 'public-explorer', label: 'Public Feed', role: 'all', icon: Eye },
    { id: 'community-clusters', label: 'Clusters', role: 'all', icon: Layers },
    { id: 'civic-radar', label: 'Risk Radar', role: 'all', icon: BarChart3 },

    // Officer / Moderator / Admin Links
    ...(isOfficial ? [
      { id: 'officer-dashboard', label: 'Officer Hub', role: 'official', icon: ShieldAlert },
      { id: 'officer-queue', label: 'Review Queue', role: 'official', icon: ShieldAlert },
      { id: 'departments', label: 'Departments', role: 'official', icon: Building2 },
      { id: 'clusters-management', label: 'Cluster Ops', role: 'official', icon: Layers },
    ] : []),

    ...(isAdmin ? [
      { id: 'admin-dashboard', label: 'Admin', role: 'admin', icon: Settings },
    ] : []),
  ];

  return (
    <header className="bg-[#0b1120] border-b border-slate-800 sticky top-7 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => onSelectTab('landing')}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Logo size="md" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    link.highlight
                      ? 'bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-sm shadow-teal-500/20'
                      : isActive
                      ? 'bg-slate-800 text-teal-400 font-semibold border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions: Language, Notifications, Demo Guide, Profile */}
          <div className="flex items-center gap-2">
            {/* Demo Guide shortcut button */}
            <button
              onClick={() => onSelectTab('demo-guide')}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                currentTab === 'demo-guide'
                  ? 'bg-cyan-950 border-cyan-700 text-cyan-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
              title="Interactive Walkthrough & Evaluation Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Guide</span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-slate-300 hover:border-slate-700"
              title="Toggle English / Hindi"
            >
              {language === 'en' ? '🇮🇳 HI' : '🇬🇧 EN'}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => onSelectTab('notifications')}
              className={`relative p-2 rounded-lg border transition-colors ${
                currentTab === 'notifications'
                  ? 'bg-slate-800 border-teal-500 text-teal-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile & Accessibility Settings */}
            <button
              onClick={() => onSelectTab('profile')}
              className={`p-2 rounded-lg border transition-colors ${
                currentTab === 'profile'
                  ? 'bg-slate-800 border-teal-500 text-teal-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
              title="User Profile & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    link.highlight
                      ? 'bg-teal-600 text-white font-semibold'
                      : isActive
                      ? 'bg-slate-800 text-teal-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => {
                onSelectTab('demo-guide');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-cyan-300 hover:bg-slate-800"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Demo Walkthrough Guide
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
