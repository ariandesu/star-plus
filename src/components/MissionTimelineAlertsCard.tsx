'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ArrowRight } from 'lucide-react';

export interface TimelineAlertItem {
  id: string;
  time: string;
  dotColorClass: string;
  description: string;
  badgeText: string;
  badgeClass: string;
}

const INITIAL_ALERTS: TimelineAlertItem[] = [
  {
    id: '1',
    time: '08:20 UTC',
    dotColorClass: 'bg-amber-500',
    description: 'Elevated Rest HR & Cognitive Latency (Crew: Maya Chen)',
    badgeText: 'WATCH',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200/60 font-black text-[10px] px-2.5 py-0.5 rounded-full',
  },
  {
    id: '2',
    time: '07:15 UTC',
    dotColorClass: 'bg-amber-500',
    description: 'Habitat CO2 Scrub Loop B Mild Elevation',
    badgeText: 'WATCH',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200/60 font-black text-[10px] px-2.5 py-0.5 rounded-full',
  },
  {
    id: '3',
    time: '06:00 UTC',
    dotColorClass: 'bg-red-500',
    description: 'Sleep Deficit Accumulation (3+ crew members)',
    badgeText: 'WATCH',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200/60 font-black text-[10px] px-2.5 py-0.5 rounded-full',
  },
  {
    id: '4',
    time: '05:00 UTC',
    dotColorClass: 'bg-sky-500',
    description: 'Solar Particle Event (SPE) Baseline Nominal',
    badgeText: 'INFO',
    badgeClass: 'bg-sky-100 text-sky-800 border border-sky-200/60 font-black text-[10px] px-2.5 py-0.5 rounded-full',
  },
  {
    id: '5',
    time: '03:40 UTC',
    dotColorClass: 'bg-emerald-500',
    description: 'All Systems Nominal',
    badgeText: 'RESOLVED',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-black text-[10px] px-2.5 py-0.5 rounded-full',
  },
];

export default function MissionTimelineAlertsCard() {
  const [selectedRange, setSelectedRange] = useState<string>('24H');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const timeOptions = ['12H', '24H', '48H', '7D'];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
          </div>
          <h2 className="text-base font-black text-slate-900">
            Mission Timeline &amp; Critical Alerts
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filter Button / Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white border border-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer hover:bg-slate-50 transition"
            >
              <span>{selectedRange} ∨</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-24 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                {timeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedRange(opt);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1 text-xs font-semibold hover:bg-slate-50 cursor-pointer ${
                      selectedRange === opt ? 'text-blue-600 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Link */}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-extrabold text-xs flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All →</span>
          </button>
        </div>
      </div>

      {/* Event Rows */}
      <div className="divide-y divide-slate-100">
        {INITIAL_ALERTS.map((item) => (
          <div
            key={item.id}
            className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-semibold text-slate-400 shrink-0 w-16">
                {item.time}
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${item.dotColorClass}`}
                aria-hidden="true"
              />
              <span className="font-semibold text-slate-800 truncate text-xs sm:text-sm">
                {item.description}
              </span>
            </div>
            <span className={`shrink-0 ${item.badgeClass}`}>
              {item.badgeText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
