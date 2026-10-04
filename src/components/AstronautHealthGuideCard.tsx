'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Wind, Droplets, Moon, Shield, Info, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import { Astronaut } from '@/types';

interface AstronautHealthGuideCardProps {
  astronaut: Astronaut;
  onOpenDetailedView?: () => void;
}

export default function AstronautHealthGuideCard({
  astronaut,
  onOpenDetailedView,
}: AstronautHealthGuideCardProps) {
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [showInfoTip, setShowInfoTip] = useState(false);

  const callsign = astronaut.role.toLowerCase().includes('commander')
    ? 'CDR'
    : astronaut.name.split(' ')[0] || 'Astronaut';

  return (
    <div className="space-y-3.5">
      {/* ---------------- MASCOT & HEALTH SUMMARY SPEECH BUBBLE ---------------- */}
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 pt-1">
        {/* Left Column: 3D Mascot Character */}
        <div className="relative shrink-0 w-32 sm:w-36 flex flex-col items-center justify-end select-none">
          {/* Action / Motion dashes above the pointing hand */}
          <div className="absolute -top-1 right-2 sm:right-3 w-8 h-8 pointer-events-none z-10">
            <svg
              className="w-full h-full text-sky-400 stroke-current animate-pulse"
              viewBox="0 0 32 32"
              fill="none"
              style={{ animationDuration: '3s' }}
            >
              <path
                d="M 12 18 C 14 12, 19 8, 25 6"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.95"
              />
              <path
                d="M 8 23 C 10 18, 16 14, 22 12"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
              />
              <path
                d="M 5 28 C 7 24, 12 20, 18 18"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>
          </div>

          {/* Clean Astronaut Mascot PNG */}
          <div className="relative group transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/images/astronaut-guide.png"
              alt="Astronaut Health Mascot"
              className="w-32 sm:w-36 h-auto object-contain drop-shadow-[0_8px_16px_rgba(14,31,64,0.08)] pointer-events-none"
              loading="eager"
            />
            {/* Subtle soft floor contact shadow */}
            <div className="w-24 h-3 bg-slate-900/10 rounded-full blur-[3px] mx-auto -mt-2 -z-10" />
          </div>
        </div>

        {/* Right Column: Speech Bubble Card */}
        <div className="relative flex-1 w-full bg-white rounded-2xl sm:rounded-3xl border border-sky-200/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(14,31,64,0.05)]">
          {/* Triangular Speech Bubble Tail (points toward astronaut's hand) */}
          <div className="hidden sm:block absolute -left-3 top-7 w-3.5 h-5 pointer-events-none overflow-visible">
            <svg
              className="w-3.5 h-5 text-white filter drop-shadow-[-1.5px_0_0_rgb(186,230,253)]"
              viewBox="0 0 14 20"
              fill="currentColor"
            >
              <path d="M 14 0 L 0 10 L 14 20 Z" />
            </svg>
          </div>

          {/* Card Header */}
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                  Today&apos;s Health Summary
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInfoTip(!showInfoTip)}
                  className="text-sky-500 hover:text-sky-600 transition p-0.5 rounded-full hover:bg-sky-50"
                  aria-label="Health summary information"
                >
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Hi {callsign}! Here&apos;s your health in simple words:
            </p>

            {showInfoTip && (
              <div className="mt-2 p-2 bg-sky-50 rounded-xl border border-sky-100 text-[10px] text-sky-800 leading-relaxed">
                Synthesized by onboard biomechanical sensors and daily baseline analytics to provide a plain-language wellness overview.
              </div>
            )}
          </div>

          {/* Metric Rows */}
          {viewMode === 'simple' ? (
            <div className="py-2.5 space-y-2.5">
              {/* 1. Heart */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-sm shadow-red-500/20 text-white mt-0.5">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Heart</span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Looks Good
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">
                    Your heart is beating steadily within normal range.
                  </p>
                </div>
              </div>

              {/* 2. Oxygen */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20 text-white mt-0.5">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Oxygen</span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Good
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">
                    Your blood oxygen level is {astronaut.currentVitals?.heartRate ? '97%' : `${astronaut.baseline.spO2}%`}.
                  </p>
                </div>
              </div>

              {/* 3. Blood Pressure */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20 text-white mt-0.5">
                  <Droplets className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Blood Pressure</span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Watch
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">
                    A little higher than your baseline.
                  </p>
                </div>
              </div>

              {/* 4. Sleep */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-sm shadow-purple-600/20 text-white mt-0.5">
                  <Moon className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Sleep</span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Watch
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">
                    Your sleep shows some signs of disruption.
                  </p>
                </div>
              </div>

              {/* 5. Overall Status */}
              <div className="flex items-start gap-2.5 group">
                <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shrink-0 shadow-sm shadow-amber-400/20 text-white mt-0.5">
                  <Shield className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Overall Status</span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Monitor
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">
                    You&apos;re generally stable, but a few things need attention.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2.5 space-y-2">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Heart Rate</span>
                  <span className="font-bold text-slate-900">72 BPM <span className="text-[10px] text-slate-500 font-normal">(Base: 64)</span></span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Oxygen Saturation (SpO2)</span>
                  <span className="font-bold text-slate-900">97% <span className="text-[10px] text-slate-500 font-normal">(Base: 98%)</span></span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Blood Pressure</span>
                  <span className="font-bold text-amber-700">128/84 mmHg <span className="text-[10px] text-slate-500 font-normal">(+7%)</span></span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">HRV / Sleep Index</span>
                  <span className="font-bold text-amber-700">42 ms / 5.8h <span className="text-[10px] text-slate-500 font-normal">(-22%)</span></span>
                </div>
              </div>
              {onOpenDetailedView && (
                <button
                  type="button"
                  onClick={onOpenDetailedView}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition flex items-center justify-center gap-1"
                >
                  Open Full Clinical Analysis
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Bottom View Switcher Tabs */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('simple')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                viewMode === 'simple'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Simple View (For Everyone)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('detailed')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                viewMode === 'detailed'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Detailed View (For Professionals)
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- DAILY ASTRONAUT WELLNESS CHECK BANNER CARD ---------------- */}
      <Link
        href="/astronaut/wellness"
        className="group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 text-white">
            <Shield className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition">
                Daily Astronaut Wellness Check
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider shrink-0">
                DAY {astronaut.missionDay}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight truncate sm:whitespace-normal mt-0.5">
              Quick 1-minute subjective check-in (sleep quality, body soreness, mood &amp; water intake...)
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
          <span className="hidden sm:inline">Start</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </div>
  );
}
