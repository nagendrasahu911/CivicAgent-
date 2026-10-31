import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { LogIn, UserPlus, Shield, User, Sparkles } from 'lucide-react';

export const LoginRegisterView: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { login, register, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('citizen');
  const [regLocality, setRegLocality] = useState('Civil Lines, Delhi');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) onSuccess();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      locality: regLocality,
    });
    if (ok) onSuccess();
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-8">
        <Logo size="lg" className="justify-center mb-3" />
        <h2 className="text-xl font-bold text-white">Access CivicSaathi AI Portal</h2>
        <p className="text-xs text-slate-400 mt-1">
          Secure, role-based platform for citizens and authorized municipal teams
        </p>
      </div>

      {/* Demo Quick Logins Card */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-teal-950/60 to-cyan-950/60 border border-teal-800/80 shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300 mb-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Quick Hackathon Demo Logins (1-Click)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              switchDemoRole('citizen');
              onSuccess();
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2"
          >
            <User className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <div>
              <div className="font-semibold text-white text-[11px]">Citizen</div>
              <div className="text-[10px] text-slate-400">Aarav Sharma</div>
            </div>
          </button>

          <button
            onClick={() => {
              switchDemoRole('officer');
              onSuccess();
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div>
              <div className="font-semibold text-white text-[11px]">Field Officer</div>
              <div className="text-[10px] text-slate-400">Er. Rajesh Kumar</div>
            </div>
          </button>

          <button
            onClick={() => {
              switchDemoRole('moderator');
              onSuccess();
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <div>
              <div className="font-semibold text-white text-[11px]">Moderator</div>
              <div className="text-[10px] text-slate-400">Sunita Nair</div>
            </div>
          </button>

          <button
            onClick={() => {
              switchDemoRole('admin');
              onSuccess();
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <div className="font-semibold text-white text-[11px]">Administrator</div>
              <div className="text-[10px] text-slate-400">Command Center</div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Account
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@civicsaathi.org"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default demo password: DemoPass123!</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <LogIn className="w-4 h-4" />
              Sign In to CivicSaathi AI
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Rohan Gupta"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="rohan@example.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Account Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="citizen">Citizen</option>
                  <option value="officer">Field Officer</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Locality / Ward</label>
                <input
                  type="text"
                  value={regLocality}
                  onChange={(e) => setRegLocality(e.target.value)}
                  placeholder="Ward 12, Delhi"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
