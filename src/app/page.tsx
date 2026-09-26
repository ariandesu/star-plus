'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Activity,
  UserCheck,
  Stethoscope,
  Radio,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Eye
} from 'lucide-react';
import { authService } from '../services/authService';

export default function LandingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'ASTRONAUT' | 'MEDICAL' | 'MISSION_CONTROL'>('ASTRONAUT');
  const [username, setUsername] = useState('CDR Maya Chen');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  const roles = [
    {
      id: 'ASTRONAUT' as const,
      title: 'Astronaut Portal',
      user: 'CDR Maya Chen',
      icon: UserCheck,
      desc: 'Personal health telemetry, vital trends, workout schedules, and cognitive baseline tests.',
      route: '/astronaut',
      badge: 'CDR Maya Chen',
      gradient: 'from-blue-600 to-sky-500'
    },
    {
      id: 'MEDICAL' as const,
      title: 'Flight Medical Officer',
      user: 'Dr. Sarah Vance',
      icon: Stethoscope,
      desc: 'Real-time crew health triage, biomarker deviation analysis, clinical notes, and countermeasure prescriber.',
      route: '/medical',
      badge: 'FMO Dr. Vance',
      gradient: 'from-indigo-600 to-purple-600'
    },
    {
      id: 'MISSION_CONTROL' as const,
      title: 'Mission Control Operator',
      user: 'Commander Alex Vance',
      icon: Radio,
      desc: 'Habitat environmental telemetry, spacecraft life support grid, and emergency anomaly simulation.',
      route: '/mission-control',
      badge: 'Control Cmdr',
      gradient: 'from-emerald-600 to-teal-600'
    }
  ];

  const handleRoleSelect = (roleId: 'ASTRONAUT' | 'MEDICAL' | 'MISSION_CONTROL', defaultUser: string) => {
    setSelectedRole(roleId);
    setUsername(defaultUser);
    setError('');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = authService.login(username, password);
    if (res.success && res.session) {
      const routeMap = {
        'ASTRONAUT': '/astronaut',
        'MEDICAL': '/medical',
        'MISSION_CONTROL': '/mission-control'
      };
      router.push(routeMap[selectedRole]);
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleDirectAccess = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                STAR<span className="text-blue-400">+</span>
              </h1>
              <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest -mt-1">
                ASTRONAUT HEALTH MONITORING SYSTEM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AURORA-1 MISSION LIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero & Role Selection Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Hero Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>NASA SPACE APPS CHALLENGE 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Next-Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
              Space Health Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Continuous real-time physiological telemetry, predictive biomarker deviation analysis, and autonomous countermeasure guidance for deep-space human spaceflight missions.
          </p>

          {/* Quick Role Selection Cards Grid */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Select Operational Role View:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;

                return (
                  <div
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id, r.user)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${r.gradient} flex items-center justify-center text-white shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-white">{r.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{r.desc}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectAccess(r.route);
                      }}
                      className="mt-3 text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>Open Dashboard</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Auth Form */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-400 mb-2">
                MISSION AUTHENTICATION
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Access Health Console</h2>
              <p className="text-xs text-slate-400 mt-1">
                Authenticate your mission role credentials to access real-time biometric telemetry.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Astronaut / Officer ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter ID"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Passkey"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>LOGIN TO DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Or Direct One-Click Demo Views:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDirectAccess('/astronaut')}
                  className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-slate-700/80 transition"
                >
                  Astronaut
                </button>
                <button
                  onClick={() => handleDirectAccess('/medical')}
                  className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-slate-700/80 transition"
                >
                  Medical
                </button>
                <button
                  onClick={() => handleDirectAccess('/mission-control')}
                  className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-slate-700/80 transition"
                >
                  Control
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/60 text-center text-xs text-slate-500">
        STAR+ Astronaut Health Monitoring System • Built for NASA Space Apps Challenge 2026
      </footer>
    </div>
  );
}
