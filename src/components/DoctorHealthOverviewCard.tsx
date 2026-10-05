'use client';

import React, { useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import gsap from 'gsap';

export default function DoctorHealthOverviewCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
        );

        if (mascotRef.current) {
          gsap.fromTo(
            mascotRef.current,
            { scale: 0.88, opacity: 0, y: 10 },
            { scale: 1, opacity: 1, duration: 0.7, delay: 0.15, ease: 'back.out(1.5)' }
          );
        }

        if (speechBubbleRef.current) {
          gsap.fromTo(
            speechBubbleRef.current,
            { opacity: 0, x: -10, scale: 0.98 },
            { opacity: 1, x: 0, scale: 1, duration: 0.5, delay: 0.25, ease: 'power2.out' }
          );
        }
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 select-none"
    >
      {/* Doctor Mascot */}
      <div
        ref={mascotRef}
        className="relative shrink-0 w-24 sm:w-28 flex flex-col items-center justify-end"
      >
        <div className="relative group">
          <img
            src="/images/doctor-guide.png"
            alt="Doctor Guide Mascot"
            className="w-24 sm:w-28 h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,102,255,0.15)] pointer-events-none"
            loading="eager"
          />
          <div className="w-16 h-2 bg-slate-900/10 rounded-full blur-[3px] mx-auto -mt-1.5 -z-10" />
        </div>
      </div>

      {/* Speech Bubble Container */}
      <div
        ref={speechBubbleRef}
        className="relative flex-1 w-full bg-[#EBF3FF] border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5"
      >
        {/* Pointer Tail pointing to the mascot */}
        <div className="hidden sm:block absolute -left-3 top-6 w-3.5 h-5 pointer-events-none overflow-visible z-10">
          <svg
            className="w-3.5 h-5 text-[#EBF3FF] filter drop-shadow-[-1.5px_0_0_rgba(191,219,254,0.8)]"
            viewBox="0 0 14 20"
            fill="currentColor"
          >
            <path d="M 14 0 L 0 10 L 14 20 Z" />
          </svg>
        </div>

        {/* Info Icon */}
        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-[#0066FF] flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Text Body */}
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            All Astronauts Health Overview
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            Here you can see the health status of all crew members. Select an astronaut to view detailed data, trends, and clinical insights.
          </p>
        </div>
      </div>
    </div>
  );
}
