'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '../types';
import { authService } from '../services/authService';
import { Shield, ArrowRight, UserCheck, Stethoscope, Radio, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('astronaut01');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('astronaut');

  const roleConfigs = {
    astronaut: {
      username: 'astronaut01',
      title: 'Astronaut',
      subtitle: 'Personal Telemetry & Biomarkers',
      icon: UserCheck,
      color: 'blue'
    },
    medical: {
      username: 'medical01',
      title: 'Flight Medical Officer',
      subtitle: 'Crew Diagnostics & Interventions',
      icon: Stethoscope,
      color: 'purple'
    },
    'mission-control': {
      username: 'control01',
      title: 'Mission Control Operator',
      subtitle: 'System Health Index & Cabin Specs',
      icon: Radio,
      color: 'emerald'
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setUsername(roleConfigs[role].username);
    setError('');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = authService.login(username, password);
    if (res.success && res.session) {
      router.push(authService.getRoleDefaultRoute(res.session.role));
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7FC] flex items-center justify-center p-4 sm:p-8 font-sans select-none">
      <div className="w-full max-w-6xl min-h-[640px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col md:flex-row">
        
        {/* Left Side: Space Hero Visual Panel (50% Width) */}
        <div className="md:w-1/2 relative bg-slate-900 p-8 md:p-12 flex flex-col justify-between text-white overflow-hidden">
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-blue-950/40" />

          {/* Top Header info */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  STAR<span className="text-blue-400 font-extrabold">+</span>
                </span>
                <p className="text-[9px] font-extrabold text-blue-200/80 uppercase tracking-widest -mt-0.5">
                  ASTRONAUT HEALTH MONITORING SYSTEM
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-md text-blue-200 border border-white/15">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Space Apps 2026
            </span>
          </div>

          {/* Center Hero Text */}
          <div className="relative z-10 my-auto py-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4">
              AURORA-1 DEEP SPACE RESEARCH MISSION
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none mb-4">
              Healthier Missions, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                Brighter Futures.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md font-normal">
              Monitor. Understand. Support. For every human, on every mission. Predictive biomarker telemetry & flight medical decision support.
            </p>
          </div>

          {/* Bottom Footer Specs */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-bold tracking-widest uppercase text-slate-400">
            <span>PEOPLE • DATA • HEALTH</span>
            <span className="text-blue-400">FURTHER TOGETHER</span>
          </div>
        </div>

        {/* Right Side: Authentication Card (50% Width) */}
        <div className="md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Welcome to STAR PLUS</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Select Your Mission Role
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose an operational role below to authorize access to telemetry dashboards.
              </p>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(['astronaut', 'medical', 'mission-control'] as Role[]).map((r) => {
                const cfg = roleConfigs[r];
                const Icon = cfg.icon;
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{cfg.title}</span>
                      <span className="text-[9px] text-slate-500 font-medium block truncate mt-0.5">{cfg.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username / Operational ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Passcode
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span>LOGIN →</span>
              </button>
            </form>

            {/* Demo Notice */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>NASA Space Apps Challenge 2026 Demo Environment</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
