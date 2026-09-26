'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  TrendingUp,
  Settings,
  Shield,
  Activity,
  AlertTriangle,
  Stethoscope,
  X,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { label: 'Overview', href: '/astronaut', icon: LayoutDashboard },
  { label: 'Crew Health', href: '/medical', icon: Users },
  { label: 'Individual Analysis', href: '/astronaut', icon: UserCheck },
  { label: 'Mission Control', href: '/mission-control', icon: Activity },
  { label: 'Alerts', href: '/medical#alerts', icon: AlertTriangle },
  { label: 'Medical Records', href: '/medical#records', icon: FileText },
  { label: 'Trends & Reports', href: '/astronaut#trends', icon: TrendingUp },
  { label: 'Interventions', href: '/medical#interventions', icon: Stethoscope },
  { label: 'Settings', href: '/astronaut#settings', icon: Settings },
];

export default function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (href: string) => {
    if (onCloseMobile) onCloseMobile();
    router.push(href);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 text-white">
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between pb-6 mb-4 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                STAR<span className="text-blue-400 font-extrabold">+</span>
              </span>
              <p className="text-[9px] font-extrabold text-blue-300/80 uppercase tracking-widest -mt-0.5">
                SPACE HEALTH PORTAL
              </p>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Quick Switcher Pills */}
        <div className="mb-6 p-2 rounded-2xl bg-slate-800/60 border border-slate-750/80 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
            Navigation Views
          </span>
          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={() => handleNavClick('/astronaut')}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold text-center transition ${
                pathname === '/astronaut' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Astronaut
            </button>
            <button
              onClick={() => handleNavClick('/medical')}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold text-center transition ${
                pathname === '/medical' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Medical
            </button>
            <button
              onClick={() => handleNavClick('/mission-control')}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold text-center transition ${
                pathname === '/mission-control' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Control
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const targetPath = item.href.split('#')[0];
            const isActive = pathname === targetPath;

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mission Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-750/80 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300">AURORA-1 MISSION</span>
        </div>
        <p className="text-xs font-bold text-white">Day 147 of 365</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Deep Space Telemetry Online</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 sticky top-0 z-40 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-fade-in"
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] h-full bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800 shadow-2xl z-10 flex flex-col">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
