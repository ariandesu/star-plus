'use client';

import React from 'react';
import { Info } from 'lucide-react';

export default function DoctorHealthOverviewCard() {
  return (
    <div className="bg-[#F0F5FA] rounded-3xl p-4 sm:p-5 border border-sky-100/80 shadow-xs">
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
        {/* Left Side: Doctor Mascot Image */}
        <div className="relative shrink-0 w-28 sm:w-32 flex flex-col items-center justify-end select-none">
          {/* Action / Motion dashes above pointing hand */}
          <div className="absolute -top-1 right-1 sm:right-2 w-7 h-7 pointer-events-none z-10">
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
            </svg>
          </div>

          <div className="relative group transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/images/doctor-guide.png"
              alt="Doctor Guide Mascot"
              className="w-28 sm:w-32 h-auto object-contain drop-shadow-[0_8px_16px_rgba(14,31,64,0.08)] pointer-events-none"
              loading="eager"
            />
            <div className="w-20 h-2.5 bg-slate-900/10 rounded-full blur-[3px] mx-auto -mt-2 -z-10" />
          </div>
        </div>

        {/* Right Side: Speech Bubble Card */}
        <div className="relative flex-1 w-full bg-white rounded-2xl border border-sky-200/90 p-4 sm:p-5 shadow-sm">
          {/* Triangular Speech Bubble Tail on left pointing to doctor's hand */}
          <div className="hidden sm:block absolute -left-3 top-6 w-3.5 h-5 pointer-events-none overflow-visible z-10">
            <svg
              className="w-3.5 h-5 text-white filter drop-shadow-[-1.5px_0_0_rgb(186,230,253)]"
              viewBox="0 0 14 20"
              fill="currentColor"
            >
              <path d="M 14 0 L 0 10 L 14 20 Z" />
            </svg>
          </div>

          {/* Header with Circular Blue Info Icon */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              All Astronauts Health Overview
            </h3>
          </div>

          {/* Paragraph Text */}
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Here you can see the health status of all crew members. Select an astronaut to view detailed data, trends, and clinical insights.
          </p>
        </div>
      </div>
    </div>
  );
}
