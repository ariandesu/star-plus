'use client';

import React, { useState } from 'react';
import { Search, Calendar, Clock, Bell, Settings, ChevronDown } from 'lucide-react';
import { UserSession } from '../types';

interface HeaderBarProps {
  session?: UserSession | null;
  pageTitle?: string;
}

export default function HeaderBar({ session, pageTitle }: HeaderBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  const user = session || {
    username: 'maya.chen',
    role: 'ASTRONAUT',
    id: 'ast-01'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
      {/* Page Title & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {pageTitle && (
          <div className="hidden sm:block">
            <h2 className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">{pageTitle}</h2>
          </div>
        )}

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search telemetry, crew members, biomarkers, alerts..."
            className="w-full bg-slate-100/80 hover:bg-slate-100 text-slate-800 text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Right Controls: Filters, Timeframe, Quick Actions, User Profile */}
      <div className="flex items-center gap-3">
        {/* Date Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>25 Nov 2024</span>
        </div>

        {/* Time Format */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100/80 rounded-xl text-xs font-bold text-slate-600 border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>24H</span>
        </div>

        {/* View Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
          {(['Daily', 'Weekly', 'Monthly'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg transition ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1.5">
          <button
            title="Active Notifications"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative transition"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
          </button>

          <button
            title="System Settings"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user.username}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{user.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}