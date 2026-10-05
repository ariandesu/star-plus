'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Info, Sparkles, AlertTriangle, Filter } from 'lucide-react';
import { nasaMlService } from '../services/nasaMlService';
import gsap from 'gsap';

export default function DoctorHealthOverviewCard() {
  const [selectedModel, setSelectedModel] = useState<'ensemble' | 'random_forest' | 'logistic_regression'>('ensemble');
  const [crewStats, setCrewStats] = useState<{
    totalCrew: number;
    postFlightCount: number;
    preFlightCount: number;
    highRiskCount: number;
    moderateRiskCount: number;
    lowRiskCount: number;
  }>({
    totalCrew: 4,
    postFlightCount: 3,
    preFlightCount: 1,
    highRiskCount: 1,
    moderateRiskCount: 2,
    lowRiskCount: 1,
  });

  const [_modelMeta, setModelMeta] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const biomarkersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const meta = nasaMlService.getModelMetadata();
    setModelMeta(meta);

    // GSAP Entrance Animations
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

        if (metricsRef.current && metricsRef.current.children) {
          gsap.fromTo(
            metricsRef.current.children,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.35, stagger: 0.08, ease: 'power2.out' }
          );
        }

        if (biomarkersRef.current && biomarkersRef.current.children) {
          gsap.fromTo(
            biomarkersRef.current.children,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.45, stagger: 0.06, ease: 'power2.out' }
          );
        }
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  // Handle model switch changes dynamically with GSAP pulse effect
  const handleModelChange = (model: 'ensemble' | 'random_forest' | 'logistic_regression') => {
    setSelectedModel(model);

    if (metricsRef.current) {
      gsap.fromTo(
        metricsRef.current,
        { scale: 0.98, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    if (model === 'logistic_regression') {
      setCrewStats({
        totalCrew: 4,
        postFlightCount: 2,
        preFlightCount: 2,
        highRiskCount: 1,
        moderateRiskCount: 1,
        lowRiskCount: 2,
      });
    } else if (model === 'random_forest') {
      setCrewStats({
        totalCrew: 4,
        postFlightCount: 3,
        preFlightCount: 1,
        highRiskCount: 2,
        moderateRiskCount: 1,
        lowRiskCount: 1,
      });
    } else {
      setCrewStats({
        totalCrew: 4,
        postFlightCount: 3,
        preFlightCount: 1,
        highRiskCount: 1,
        moderateRiskCount: 2,
        lowRiskCount: 1,
      });
    }
  };

  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: -2, scale: 1.01, duration: 0.2, ease: 'power2.out' });
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.2, ease: 'power2.out' });
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#F8FAFC]/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4"
    >
      {/* Top Banner Row */}
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
        {/* Doctor Mascot */}
        <div
          ref={mascotRef}
          className="relative shrink-0 w-24 sm:w-28 flex flex-col items-center justify-end select-none"
        >
          <div className="relative group transition-transform duration-300">
            <img
              src="/images/doctor-guide.png"
              alt="Doctor Guide Mascot"
              className="w-24 sm:w-28 h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,122,255,0.12)] pointer-events-none"
              loading="eager"
            />
            <div className="w-16 h-2 bg-slate-900/10 rounded-full blur-[3px] mx-auto -mt-1.5 -z-10" />
          </div>
        </div>

        {/* Speech / Overview Header */}
        <div
          ref={speechBubbleRef}
          className="relative flex-1 w-full bg-white/95 rounded-2xl border border-slate-200/90 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
        >
          {/* Triangular Tail */}
          <div className="hidden sm:block absolute -left-3 top-6 w-3.5 h-5 pointer-events-none overflow-visible z-10">
            <svg
              className="w-3.5 h-5 text-white filter drop-shadow-[-1.5px_0_0_rgba(226,232,240,0.8)]"
              viewBox="0 0 14 20"
              fill="currentColor"
            >
              <path d="M 14 0 L 0 10 L 14 20 Z" />
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] shrink-0">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  All Astronauts Health Overview
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  Here you can see the health status of all crew members. Select an astronaut to view detailed data, trends, and clinical insights.
                </p>
              </div>
            </div>

            {/* Model Selector Toggle */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1 shrink-0 self-start sm:self-auto border border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-500 px-1.5 hidden sm:inline-flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#007AFF]" /> Model:
              </span>
              <button
                type="button"
                onClick={() => handleModelChange('ensemble')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                  selectedModel === 'ensemble'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Ensemble
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('random_forest')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                  selectedModel === 'random_forest'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Random Forest
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('logistic_regression')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                  selectedModel === 'logistic_regression'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Logistic Reg
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div ref={metricsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
            <div
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/60 transition-all cursor-default"
            >
              <div className="text-[10px] text-slate-500 font-semibold">Crew Screened</div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight">{crewStats.totalCrew} Astronauts</div>
            </div>
            <div
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/60 transition-all cursor-default"
            >
              <div className="text-[10px] text-purple-700 font-semibold">Post-Flight Profile</div>
              <div className="text-sm font-extrabold text-purple-900 tracking-tight">{crewStats.postFlightCount} / {crewStats.totalCrew} ({Math.round((crewStats.postFlightCount / crewStats.totalCrew) * 100)}%)</div>
            </div>
            <div
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 transition-all cursor-default"
            >
              <div className="text-[10px] text-blue-700 font-semibold">Pre-Flight Baseline</div>
              <div className="text-sm font-extrabold text-blue-900 tracking-tight">{crewStats.preFlightCount} / {crewStats.totalCrew} ({Math.round((crewStats.preFlightCount / crewStats.totalCrew) * 100)}%)</div>
            </div>
            <div
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/60 transition-all cursor-default"
            >
              <div className="text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                High Risk Flags
              </div>
              <div className="text-sm font-extrabold text-rose-900 tracking-tight">{crewStats.highRiskCount} Requiring Action</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Biomarkers Requiring Doctor Attention */}
      <div className="bg-white/95 rounded-2xl p-3.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#007AFF]" />
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Key Biomarkers Requiring Clinical Attention (OSDR Feature Importance)
            </h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Active Model: {selectedModel.toUpperCase()}
          </span>
        </div>

        <div ref={biomarkersRef} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>MCV (RBC Volume)</span>
              <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">HIGH IMP</span>
            </div>
            <p className="text-[10px] text-amber-800/90 mt-1 leading-normal font-medium">
              +14.2% shift in microgravity. Watch for fluid redistribution.
            </p>
          </div>

          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/70 flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-900">
              <span>CXCL2 (Cytokine)</span>
              <span className="text-[9px] bg-rose-200/80 text-rose-900 px-1.5 py-0.5 rounded-full font-bold">ACTION</span>
            </div>
            <p className="text-[10px] text-rose-800/90 mt-1 leading-normal font-medium">
              Elevated inflammatory immune response post orbital EVA.
            </p>
          </div>

          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/70 flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
              <span>Fibrinogen / MPO</span>
              <span className="text-[9px] bg-blue-200/80 text-blue-900 px-1.5 py-0.5 rounded-full font-bold">MONITOR</span>
            </div>
            <p className="text-[10px] text-blue-800/90 mt-1 leading-normal font-medium">
              Vascular integrity &amp; clotting factors within nominal variance.
            </p>
          </div>

          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
              <span>Electrolyte (Na+)</span>
              <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded-full font-bold">STABLE</span>
            </div>
            <p className="text-[10px] text-emerald-800/90 mt-1 leading-normal font-medium">
              Hydration baseline steady across 3 of 4 crew members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
