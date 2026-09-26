'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Calendar,
  Clock,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  UserCheck,
  Stethoscope,
  Radio,
  LogOut
} from 'lucide-react';
import { UserSession } from '../types';
import { MOCK_ASTRONAUTS } from '../data/mockData';

interface HeaderBarProps {
  session?: UserSession | null;
  pageTitle?: string;
  selectedAstronautId?: string;
  onAstronautChange?: (astronautId: string) => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onToggleMobileMenu?: () => void;
}

export default function HeaderBar({
  session,
  pageTitle,
  selectedAstronautId = 'ast-01',
  onAstronautChange,
  onSearchClick,
  onNotificationClick,
  onToggleMobileMenu
}: HeaderBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [timeRange, setTimeRange] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const user = session || {
    username: 'CDR Maya Chen',
    role: pathname === '/medical' ? 'FLIGHT MEDICAL OFFICER' : pathname === '/mission-control' ? 'MISSION CONTROL' : 'ASTRONAUT',
    id: 'ast-01'
  };

  const handleRoleNavigate = (targetPath: string) => {
    setIsProfileMenuOpen(false);
    router.push(targetPath);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xs">
      
      {/* Left: Mobile Hamburger Menu & Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Open Mobile Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
            {pageTitle || 'STAR PLUS Health System'}
          </h2>
          <span className="text-[10px] font-semibold text-slate-400 hidden sm:block">
            Deep Space Station • Telemetry Node 04
          </span>
        </div>
      </div>

      {/* Center: Search Trigger Input */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onSearchClick}
          className="w-full bg-slate-100/80 hover:bg-slate-100 text-slate-500 text-xs rounded-full pl-9 pr-4 py-2 border border-slate-200/60 flex items-center justify-between transition cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">Search telemetry, crew, alerts, metrics...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-slate-500 rounded border border-slate-200">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls & User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Mobile Search Button */}
        <button
          onClick={onSearchClick}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Astronaut Target Selector Dropdown */}
        {onAstronautChange && (
          <div className="relative hidden sm:block">
            <select
              value={selectedAstronautId}
              onChange={(e) => onAstronautChange(e.target.value)}
              className="bg-blue-50/80 hover:bg-blue-50 text-blue-950 text-xs font-extrabold rounded-xl px-3 py-1.5 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none pr-7"
            >
              {MOCK_ASTRONAUTS.map((ast) => (
                <option key={ast.id} value={ast.id}>
                  Astronaut: {ast.name} ({ast.status})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-blue-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Timeframe View Pills */}
        <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
          {(['Daily', 'Weekly', 'Monthly'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-lg transition ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Notification Bell Trigger */}
        <button
          onClick={onNotificationClick}
          title="Active Mission Notifications"
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl relative transition"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
        </button>

        {/* User Profile Chip & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left pr-1">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">{user.username}</p>
              <p className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wide">{user.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Quick Switch Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl p-2 z-50 animate-fade-in">
              <div className="p-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user.username}</p>
                <p className="text-[10px] font-semibold text-slate-500">Active Operational Session</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => handleRoleNavigate('/astronaut')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                    pathname === '/astronaut' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Astronaut View</span>
                </button>

                <button
                  onClick={() => handleRoleNavigate('/medical')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                    pathname === '/medical' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <span>Medical Officer View</span>
                </button>

                <button
                  onClick={() => handleRoleNavigate('/mission-control')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                    pathname === '/mission-control' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>Mission Control View</span>
                </button>
              </div>

              <div className="pt-2 mt-1 border-t border-slate-100">
                <button
                  onClick={() => handleRoleNavigate('/')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 text-left transition"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Switch Role / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
