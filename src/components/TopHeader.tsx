'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Shield, 
  Search, 
  Bell, 
  Calendar, 
  Clock, 
  ChevronDown, 
  LogOut, 
  User, 
  Activity, 
  Sliders, 
  CheckCircle2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { UserSession, AlertItem } from '../types';
import { authService } from '../services/authService';
import { alertService } from '../services/alertService';
import { MOCK_ASTRONAUTS } from '../data/mockData';
import { nasaMlService } from '../services/nasaMlService';
import GlobalSearchModal from './GlobalSearchModal';
import NotificationModal from './NotificationModal';
import { SettingsModal } from './SettingsModal';

interface TopHeaderProps {
  session?: UserSession | null;
  greeting?: string;
  subtitle?: string;
  selectedAstronautId?: string;
  onAstronautChange?: (astronautId: string) => void;
  selectedTimeHorizon?: '24H' | '7D' | '30D';
  onTimeHorizonChange?: (horizon: '24H' | '7D' | '30D') => void;
}

export default function TopHeader({
  session: initialSession,
  greeting = 'Good Morning, Maya',
  subtitle = 'AURORA-1 • Mission Day 147',
  selectedAstronautId = 'maya-chen',
  onAstronautChange,
  selectedTimeHorizon = '24H',
  onTimeHorizonChange
}: TopHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(initialSession || null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeHorizon, setActiveHorizon] = useState<'24H' | '7D' | '30D'>(selectedTimeHorizon);
  const [isMlOnline, setIsMlOnline] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState<string>('Oct 5, 2026');

  useEffect(() => {
    const formatDate = () => {
      const now = new Date();
      const monthDayYear = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      });
      return `${monthDayYear} · ${timeStr} UTC`;
    };
    setCurrentDate(formatDate());
    const interval = setInterval(() => {
      setCurrentDate(formatDate());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const s = initialSession || authService.getSession();
    setSession(s);
    setAlerts(alertService.getAlerts());

    // Check NASA ML server health on mount
    nasaMlService.checkServerHealth().then((health) => {
      setIsMlOnline(health.status === 'healthy');
    }).catch(() => {
      setIsMlOnline(false);
    });

    // Apply saved theme or default to dark mode
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('star_plus_theme');
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, [initialSession, pathname]);

  const handleHorizonClick = (h: '24H' | '7D' | '30D') => {
    setActiveHorizon(h);
    if (onTimeHorizonChange) onTimeHorizonChange(h);
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const currentAstronaut = MOCK_ASTRONAUTS.find(a => a.id === selectedAstronautId) || MOCK_ASTRONAUTS[0];

  return (
    <>
      <header className="w-full bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40">
        {/* Top Bar: Brand, Navigation, Search, Notifications, Profile */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href={session ? authService.getRoleDefaultRoute(session.role) : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1 leading-none">
                  STAR<span className="text-blue-600 font-extrabold">+</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
                  Astronaut Health Monitoring
                </span>
              </div>
            </Link>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 text-xs font-medium transition"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Search vitals, alerts...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* User Profile Pill & Dropdown */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 transition"
                >
                  <img
                    src={session.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                    alt={session.name}
                    className="w-7 h-7 rounded-lg object-cover border border-white shadow-xs"
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight">{session.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium capitalize leading-none">{session.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{session.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{session.title}</p>
                    </div>

                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsSettingsOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition text-left cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-blue-600" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="px-2 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Sub-Header Row: Greeting, Mission Pill, Date & Horizon Selector */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Greeting & Subtitle */}
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">{greeting}</h1>
                <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
              </div>

              {/* Status Pill */}
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NOMINAL MONITORING
              </span>

              {/* NASA ML Status Pill */}
              <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isMlOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'} border`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isMlOnline ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                NASA ML Research Dataset (OSDR Biomarkers)
              </span>
            </div>

            {/* Right Controls: Target Selector (if FMO), Date, Time Horizon */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              
              {/* Target Astronaut Selector (if FMO or on change provided) */}
              {onAstronautChange && (
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <select
                    value={selectedAstronautId}
                    onChange={(e) => onAstronautChange(e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                  >
                    {MOCK_ASTRONAUTS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Selector Pill */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentDate}</span>
              </div>

              {/* Time Horizon Selector (24H, 7D, 30D) */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs gap-0.5">
                {(['24H', '7D', '30D'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHorizonClick(h)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      activeHorizon === h
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Modals */}
      {isSearchOpen && <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
      {isNotificationsOpen && <NotificationModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        session={session}
        onSessionUpdate={(updated) => setSession(updated)}
      />
    </>
  );
}
