'use client';

import React, { useState } from 'react';
import { Search, Calendar, Clock, Bell, Settings, ChevronDown, Activity, Sparkles } from 'lucide-react';
import { UserSession } from '../types';
import { authService } from '../services/authService';
import GlobalSearchModal from './GlobalSearchModal';
import NotificationModal from './NotificationModal';

interface HeaderBarProps {
  session?: UserSession | null;
  pageTitle?: string;
}

export default function HeaderBar({ session, pageTitle }: HeaderBarProps) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        {/* Left Search Bar */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-100/80 text-slate-500 text-xs font-medium border border-transparent focus:outline-none transition"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search biomarkers, crew members, telemetry...</span>
            <kbd className="ml-auto text-[10px] font-bold bg-white px-2 py-0.5 rounded text-slate-400 border border-slate-200">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Header Action Controls */}
        <div className="flex items-center gap-3">
          {/* Date Picker Button */}
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>25 Nov 2024</span>
          </button>

          {/* Time Selector Dropdown */}
          <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>24H</span>
          </button>

          {/* View Toggle Pill Group */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-3 py-1 rounded-full transition ${
                timeRange === 'daily' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-3 py-1 rounded-full transition ${
                timeRange === 'weekly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1 rounded-full transition ${
                timeRange === 'monthly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Settings Gear */}
          <button
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Dropdown Pill */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition"
              >
                <img
                  src={session.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                  alt={session.name}
                  className="w-7 h-7 rounded-full object-cover border border-blue-200"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{session.name}</span>
                  <span className="text-[9px] text-slate-500 font-semibold capitalize leading-none">{session.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{session.name}</p>
                    <p className="text-[11px] text-slate-500">{session.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      authService.logout();
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </header>

      {/* Modals */}
      {isSearchOpen && <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
      {isNotificationsOpen && <NotificationModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />}
    </>
  );
}
