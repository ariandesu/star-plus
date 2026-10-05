'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  Radio,
  UserCheck,
  ArrowRight,
  Shield
} from 'lucide-react';
import { authService } from '../services/authService';

const PRELOAD_MODELS = [
  '/models/space_shuttle_discovery.glb',
  '/models/organs/realistic_human_heart.glb',
  '/models/organs/realistic_human_lungs.glb',
  '/models/organs/realistic_human_brain.glb',
  '/models/organs/realistic_human_skeleton.glb',
  '/models/organs/sleep_astronaut.glb'
];

export default function LandingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'ASTRONAUT' | 'MEDICAL' | 'MISSION_CONTROL'>('ASTRONAUT');
  const [username, setUsername] = useState('astronaut01');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    PRELOAD_MODELS.forEach((url) => {
      // 1. Eager HTTP fetch for browser cache
      fetch(url, { cache: 'force-cache' }).catch(() => {});

      // 2. Prefetch link tags in document head
      if (typeof document !== 'undefined' && !document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // 3. Dynamically import @react-three/drei and pre-cache 3D models via useGLTF.preload
    import('@react-three/drei')
      .then(({ useGLTF }) => {
        PRELOAD_MODELS.forEach((url) => {
          useGLTF.preload(url);
        });
      })
      .catch(() => {});
  }, []);

  const roles = [
    {
      id: 'ASTRONAUT' as const,
      title: 'Astronaut',
      desc: 'Access your personal health dashboard',
      username: 'astronaut01',
      pass: 'demo123',
      icon: UserCheck,
      route: '/astronaut'
    },
    {
      id: 'MEDICAL' as const,
      title: 'Flight Medical Officer',
      desc: 'Monitor crew health and medical data',
      username: 'medical01',
      pass: 'demo123',
      icon: Stethoscope,
      route: '/medical'
    },
    {
      id: 'MISSION_CONTROL' as const,
      title: 'Mission Control',
      desc: 'Oversee mission operations and crew health status',
      username: 'control01',
      pass: 'demo123',
      icon: Radio,
      route: '/mission-control'
    }
  ];

  const handleRoleSelect = (roleId: 'ASTRONAUT' | 'MEDICAL' | 'MISSION_CONTROL', defaultUsername: string, defaultPass: string) => {
    setSelectedRole(roleId);
    setUsername(defaultUsername);
    setPassword(defaultPass);
    setError('');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = authService.login(username, password);
    if (res.success && res.session) {
      // Use the actual session role for routing, not the UI-selected role
      // This ensures correct redirect even if state is stale or user typed credentials manually
      const targetRoute = authService.getRoleDefaultRoute(res.session.role);
      router.push(targetRoute);
    } else {
      setError(res.error || 'Invalid credentials. Use astronaut01, medical01, or control01 with demo123.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none bg-[url('/images/astronaut-sunrise.png')] bg-cover bg-center bg-no-repeat">
      
      {/* Background Dim & Blur Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-slate-950/30 backdrop-blur-[0.5px]" />

      {/* Top Header Navigation */}
      <header className="relative z-20 px-6 sm:px-10 py-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black tracking-tight text-white">STAR</span>
                <span className="text-lg font-black tracking-tight text-blue-500">PLUS</span>
              </div>
              <p className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest -mt-1">
                ASTRONAUT HEALTH MONITORING SYSTEM
              </p>
            </div>
          </div>

          {/* Vertical Divider & NASA Space Apps Badge */}
          <div className="hidden sm:flex items-center gap-4 border-l border-slate-800/80 pl-6 text-xs font-semibold">
            <div>
              <span className="text-slate-300 block text-[10px] font-bold uppercase tracking-wider">NASA SPACE APPS</span>
              <span className="text-white font-extrabold">CHALLENGE 2026</span>
            </div>
          </div>
        </div>

        {/* Right Mission Badge */}
        <div className="hidden md:flex items-center gap-3 border-l border-slate-800/80 pl-6 text-xs font-semibold">
          <div>
            <span className="text-slate-300 block text-[10px] font-bold uppercase tracking-wider">AURORA-1</span>
            <span className="text-white font-extrabold">Deep Space Research Mission</span>
          </div>
        </div>
      </header>

      {/* Main Split Layout: Left Hero & Right Floating Login Card */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Hero Marketing Column */}
        <div className="lg:col-span-6 space-y-6 pr-0 lg:pr-6">
          <div className="space-y-4">
            {/* Prominent Audit Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold shadow-lg shadow-purple-900/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Research Prototype • NASA OSDR + Simulated Telemetry</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] drop-shadow-md">
              Healthier <br />
              Missions, <br />
              <span className="text-blue-500">Brighter Futures.</span>
            </h1>

            <div className="space-y-1.5 pt-2">
              <p className="text-base sm:text-lg font-bold text-slate-100 drop-shadow">
                Monitor. Understand. Support.
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-200 drop-shadow">
                For every human, on every mission.
              </p>
              {/* Accent Line */}
              <div className="w-16 h-1 bg-blue-500 rounded-full mt-3 shadow-sm" />
            </div>
          </div>

          {/* Bottom Left Tagline */}
          <div className="pt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-extrabold tracking-widest text-slate-200 uppercase drop-shadow">
            <span>PEOPLE</span>
            <span className="text-blue-500">·</span>
            <span>DATA</span>
            <span className="text-blue-500">·</span>
            <span>HEALTH</span>
            <span className="text-blue-500">·</span>
            <span className="text-blue-400">FURTHER TOGETHER</span>
          </div>
        </div>

        {/* Right White Login Card Column */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/60 border border-white/40 space-y-5">
            
            {/* Card Header */}
            <div>
              <p className="text-xs font-bold text-slate-500">Welcome to</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-0.5">
                STAR <span className="text-blue-600">PLUS</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Astronaut Health Monitoring System
              </p>
              <div className="w-12 h-1 bg-blue-500 rounded-full mt-2.5" />
            </div>

            {/* Role Selection Section */}
            <div className="space-y-2">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Select your mission role
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Choose a role to load demo credentials
                </p>
              </div>

              {/* 3 Horizontal Role Cards */}
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id, r.username, r.pass)}
                      className={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer min-h-[95px] ${
                        isSelected
                          ? 'bg-blue-50/90 border-2 border-blue-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1.5">
                        <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[11px] sm:text-xs text-slate-900 leading-tight">
                          {r.title}
                        </h4>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2 font-medium">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-100/90 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100/90 border border-transparent rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Card Footer Note */}
            <div className="pt-1 text-center flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Demo Environment | Credentials are pre-configured for this demo</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-slate-800/60 bg-slate-950/50 backdrop-blur-md text-center text-xs text-slate-400">
        <p>STAR+ Astronaut Health Monitoring System • Built for NASA Space Apps Challenge 2026</p>
      </footer>
    </div>
  );
}