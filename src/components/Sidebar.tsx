'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  TrendingUp,
  Settings,
  Activity,
  Radio,
  Stethoscope,
  Rocket
} from 'lucide-react';

const NAV_ITEMS = [
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 select-none z-40 shadow-xs">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md ring-4 ring-blue-50">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base tracking-tight leading-none">STAR PLUS</h1>
            <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
              Astronaut Health Platform
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const basePath = item.href.split('#')[0];
            const isActive = pathname === basePath && basePath !== '';

            return (
              <Link
                key={`${item.label}-${index}`}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Mission Badge */}
      <div className="p-4 m-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm border border-slate-700/50">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
          <span>MISSION STATUS</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="font-black text-sm tracking-wide text-white">AURORA-1</p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60 font-semibold">
          <span>Active Day 147</span>
          <span className="text-blue-400 font-bold">365 Days Total</span>
        </div>
      </div>
    </aside>
  );
}