'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Bell,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  Globe,
  Shield,
  Stethoscope,
  Radio
} from 'lucide-react';
import { UserSession } from '../types';

interface SidebarProps {
  session?: UserSession | null;
}

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/astronaut', icon: LayoutDashboard },
    { label: 'Crew Health', href: '/medical', icon: Users },
    { label: 'Individual Analysis', href: '/astronaut', icon: UserCheck },
    { label: 'Mission Control', href: '/mission-control', icon: Radio },
    { label: 'Alerts', href: '/medical#alerts', icon: Activity },
    { label: 'Medical Records', href: '/medical#records', icon: Stethoscope },
    { label: 'Trends & Reports', href: '/astronaut#trends', icon: TrendingUp },
    { label: 'Interventions', href: '/medical#interventions', icon: FileText },
    { label: 'Settings', href: '#settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 sticky top-0 z-30 select-none">
      {/* Top Logo Section */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1 leading-none">
              STAR<span className="text-blue-600 font-extrabold">+</span>
            </span>
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase mt-1">
              ASTRONAUT HEALTH MONITORING SYSTEM
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mission Card Badge */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Active Mission</span>
            <span className="text-xs font-bold text-slate-900">AURORA-1 • Day 147</span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% Telemetry Nominal
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
