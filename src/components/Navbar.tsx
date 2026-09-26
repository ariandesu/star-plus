'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserSession, AlertItem } from '../types';
import { authService } from '../services/authService';
import { alertService } from '../services/alertService';
import { simulationService } from '../services/simulationService';
import { Search, Bell, Shield, User, LogOut, Play, RefreshCw, Activity, CheckCircle2, ChevronDown } from 'lucide-react';
import GlobalSearchModal from './GlobalSearchModal';
import NotificationModal from './NotificationModal';

interface NavbarProps {
  session: UserSession | null;
  onRefresh?: () => void;
}

export default function Navbar({ session, onRefresh }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setAlerts(alertService.getAlerts());
    setIsSimulating(simulationService.isSimulating());
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  const handleToggleSimulation = () => {
    if (isSimulating) {
      simulationService.resetSimulation();
      setIsSimulating(false);
    } else {
      simulationService.startSimulation();
      setIsSimulating(true);
    }
    if (onRefresh) onRefresh();
    window.location.reload();
  };

  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'astronaut':
        return { label: 'Astronaut Portal', bg: 'bg-blue-100 text-star-blue border-blue-200' };
      case 'medical':
        return { label: 'Medical Command (FMO)', bg: 'bg-purple-100 text-star-purple border-purple-200' };
      case 'mission-control':
        return { label: 'Mission Control Ops', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Guest', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(session?.role);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
        {/* Simulation Notice Banner */}
        {isSimulating && (
          <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>SIMULATION ACTIVE: Prescribed Rest Protocol & Workload Relief Applied — Day 150 Recovery State</span>
            </div>
            <button
              onClick={handleToggleSimulation}
              className="px-2.5 py-0.5 bg-white/20 hover:bg-white/30 rounded text-white text-xs transition font-semibold"
            >
              Reset to Day 147 Baseline
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Mission Day */}
          <div className="flex items-center gap-4">
            <Link href={session ? authService.getRoleDefaultRoute(session.role) : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-star-navy via-star-blue to-blue-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-star-navy flex items-center gap-1">
                  STAR<span className="text-star-blue font-extrabold">+</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-star-slate uppercase -mt-1">
                  NASA Space Health
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-star-soft text-star-blue border border-blue-200">
                MISSION DAY 147
              </span>
              <span className="text-xs font-medium text-slate-500">Artemis VIII</span>
            </div>
          </div>

          {/* Center Role Navigation Links if logged in */}
          {session && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
              <Link
                href="/astronaut"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  pathname === '/astronaut'
                    ? 'bg-white text-star-blue shadow-sm font-bold'
                    : 'text-slate-600 hover:text-star-navy hover:bg-slate-100'
                }`}
              >
                Astronaut View
              </Link>
              <Link
                href="/medical"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  pathname === '/medical'
                    ? 'bg-white text-star-blue shadow-sm font-bold'
                    : 'text-slate-600 hover:text-star-navy hover:bg-slate-100'
                }`}
              >
                Medical Officer (FMO)
              </Link>
              <Link
                href="/mission-control"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  pathname === '/mission-control'
                    ? 'bg-white text-star-blue shadow-sm font-bold'
                    : 'text-slate-600 hover:text-star-navy hover:bg-slate-100'
                }`}
              >
                Mission Control
              </Link>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simulation Action Button */}
            <button
              onClick={handleToggleSimulation}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm border ${
                isSimulating
                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  : 'bg-star-soft text-star-blue border-blue-200 hover:bg-blue-100'
              }`}
              title="Run intervention simulation to test recovery trends"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Reset Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Mission Simulation</span>
                </>
              )}
            </button>

            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-medium flex items-center gap-2 border border-slate-200 transition"
              aria-label="Search dashboard"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-star-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* User Profile & Role Switcher */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                >
                  <img
                    src={session.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                    alt={session.name}
                    className="w-7 h-7 rounded-lg object-cover border border-white shadow-xs"
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-star-navy leading-tight">{session.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-none capitalize">{session.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-star-navy">{session.name}</p>
                      <p className="text-[11px] text-slate-500">{session.title}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Switch Role View</span>
                      <Link
                        href="/astronaut"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        <User className="w-3.5 h-3.5 text-star-blue" />
                        <span>Astronaut Portal</span>
                      </Link>
                      <Link
                        href="/medical"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Activity className="w-3.5 h-3.5 text-star-purple" />
                        <span>Flight Medical Officer</span>
                      </Link>
                      <Link
                        href="/mission-control"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mission Control</span>
                      </Link>
                    </div>

                    <div className="px-2 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-star-red hover:bg-red-50 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/"
                className="px-3.5 py-1.5 rounded-xl bg-star-blue hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      {isSearchOpen && <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
      {isNotificationsOpen && <NotificationModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />}
    </>
  );
}
