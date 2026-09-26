'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '../types';
import { authService } from '../services/authService';
import RoleCard from '../components/RoleCard';
import { Shield, Lock, Activity, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('astronaut01');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('astronaut');

  const handleRoleSelect = (user: string, role: Role) => {
    setUsername(user);
    setSelectedRole(role);
    setError('');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = authService.login(username, password);
    if (res.success && res.session) {
      router.push(authService.getRoleDefaultRoute(res.session.role));
    } else {
      setError(res.error || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-star-navy to-slate-950 text-white flex flex-col justify-between selection:bg-star-blue selection:text-white">
      {/* Top Banner / Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-star-blue to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              STAR<span className="text-star-blue font-extrabold">+</span>
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">NASA Artemis VIII Program</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            NASA Space Apps Challenge 2026
          </span>
        </div>
      </header>

      {/* Main Hero & Role Selection */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center items-center text-center">
        {/* Title & Tagline */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-star-soft border border-white/15 mb-4">
            <Activity className="w-4 h-4 text-star-blue" />
            Predictive Astronaut Health & Mission Readiness Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Monitoring Human Health for <span className="bg-gradient-to-r from-star-blue via-blue-400 to-sky-300 bg-clip-text text-transparent">Deep Space Exploration</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Select an operational role below to enter the STAR PLUS health telemetry suite. Real-time biomarker anomaly detection, 72-hour trend diagnostics, and flight surgeon intervention protocols.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
          <RoleCard
            role="astronaut"
            title="Astronaut Portal"
            name="CDR Maya Chen"
            username="astronaut01"
            description="Personal biomarker monitoring, sleep architecture, 2-hour workout tracking, and focus checklist."
            avatarUrl="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300"
            onSelect={handleRoleSelect}
            isSelected={selectedRole === 'astronaut'}
          />

          <RoleCard
            role="medical"
            title="Flight Medical Officer"
            name="Dr. Marcus Vance"
            username="medical01"
            description="Crew health monitoring, baseline deviation analysis, active health alerts, and prescription check-offs."
            avatarUrl="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300"
            onSelect={handleRoleSelect}
            isSelected={selectedRole === 'medical'}
          />

          <RoleCard
            role="mission-control"
            title="Mission Control Ops"
            name="Flight Dir. Sarah Jenkins"
            username="control01"
            description="Mission Health Index, spacecraft cabin environmental telemetry (CO2, Temp, O2), and timeline events."
            avatarUrl="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300"
            onSelect={handleRoleSelect}
            isSelected={selectedRole === 'mission-control'}
          />
        </div>

        {/* Selected Role Form & Authorization Button */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-star-blue"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-star-blue"
                required
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-red-400 bg-red-500/20 p-2.5 rounded-xl border border-red-500/30">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-star-blue to-blue-500 hover:from-blue-600 hover:to-star-blue text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 group"
            >
              <span>Launch {selectedRole.toUpperCase()} Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/10 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 bg-black/20">
        <div>
          <span>STAR PLUS — Artemis VIII Mission Health Infrastructure</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 font-medium">
          <span>Active Crew: <strong>4 Astronauts</strong></span>
          <span>Mission Day: <strong>147</strong></span>
          <span>Telemetry Status: <strong className="text-emerald-400">100% NOMINAL</strong></span>
        </div>
      </footer>
    </div>
  );
}
