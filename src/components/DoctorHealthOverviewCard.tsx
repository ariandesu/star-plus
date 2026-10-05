'use client';

import React, { useState, useEffect } from 'react';
import { Info, Cpu, Sparkles, AlertTriangle, ShieldCheck, Activity, Filter, CheckCircle2 } from 'lucide-react';
import { nasaMlService } from '../services/nasaMlService';

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

  const [modelMeta, setModelMeta] = useState<any>(null);

  useEffect(() => {
    const meta = nasaMlService.getModelMetadata();
    setModelMeta(meta);
  }, [selectedModel]);

  // Handle model switch changes dynamically
  const handleModelChange = (model: 'ensemble' | 'random_forest' | 'logistic_regression') => {
    setSelectedModel(model);
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

  return (
    <div className="bg-[#F0F5FA] rounded-3xl p-4 sm:p-5 border border-sky-100/80 shadow-xs space-y-4">
      {/* Top Banner Row */}
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
        {/* Doctor Mascot */}
        <div className="relative shrink-0 w-24 sm:w-28 flex flex-col items-center justify-end select-none">
          <div className="relative group transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/images/doctor-guide.png"
              alt="Doctor Guide Mascot"
              className="w-24 sm:w-28 h-auto object-contain drop-shadow-[0_8px_16px_rgba(14,31,64,0.08)] pointer-events-none"
              loading="eager"
            />
            <div className="w-16 h-2 bg-slate-900/10 rounded-full blur-[3px] mx-auto -mt-1.5 -z-10" />
          </div>
        </div>

        {/* Speech / Overview Header */}
        <div className="relative flex-1 w-full bg-white rounded-2xl border border-sky-200/90 p-4 shadow-sm">
          {/* Triangular Tail */}
          <div className="hidden sm:block absolute -left-3 top-6 w-3.5 h-5 pointer-events-none overflow-visible z-10">
            <svg
              className="w-3.5 h-5 text-white filter drop-shadow-[-1.5px_0_0_rgb(186,230,253)]"
              viewBox="0 0 14 20"
              fill="currentColor"
            >
              <path d="M 14 0 L 0 10 L 14 20 Z" />
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Clinical Overview &amp; NASA ML Screening
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Real-time spaceflight adaptation classification &amp; biomarker flags across active crew.
                </p>
              </div>
            </div>

            {/* Model Selector Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 shrink-0 self-start sm:self-auto">
              <span className="text-[10px] font-bold text-slate-500 px-1.5 hidden sm:inline flex items-center gap-1">
                <Filter className="w-3 h-3" /> Model:
              </span>
              <button
                type="button"
                onClick={() => handleModelChange('ensemble')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  selectedModel === 'ensemble'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ensemble
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('random_forest')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  selectedModel === 'random_forest'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Random Forest
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('logistic_regression')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  selectedModel === 'logistic_regression'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Logistic Reg
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">Crew Screened</div>
              <div className="text-sm font-extrabold text-slate-900">{crewStats.totalCrew} Astronauts</div>
            </div>
            <div className="p-2 rounded-xl bg-purple-50/80 border border-purple-100">
              <div className="text-[10px] text-purple-700 font-medium">Post-Flight Profile</div>
              <div className="text-sm font-extrabold text-purple-900">{crewStats.postFlightCount} / {crewStats.totalCrew} ({Math.round((crewStats.postFlightCount / crewStats.totalCrew) * 100)}%)</div>
            </div>
            <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-100">
              <div className="text-[10px] text-blue-700 font-medium">Pre-Flight Baseline</div>
              <div className="text-sm font-extrabold text-blue-900">{crewStats.preFlightCount} / {crewStats.totalCrew} ({Math.round((crewStats.preFlightCount / crewStats.totalCrew) * 100)}%)</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-100">
              <div className="text-[10px] text-rose-700 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                High Risk Flags
              </div>
              <div className="text-sm font-extrabold text-rose-900">{crewStats.highRiskCount} Requiring Action</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Biomarkers Requiring Doctor Attention */}
      <div className="bg-white rounded-2xl p-3.5 border border-sky-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Key Biomarkers Requiring Clinical Attention (OSDR Feature Importance)
            </h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Active Model: {selectedModel.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>MCV (RBC Volume)</span>
              <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded-full">HIGH IMP</span>
            </div>
            <p className="text-[10px] text-amber-800 mt-1 leading-tight">
              +14.2% shift in microgravity. Watch for fluid redistribution.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-900">
              <span>CXCL2 (Cytokine)</span>
              <span className="text-[9px] bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded-full">ACTION</span>
            </div>
            <p className="text-[10px] text-rose-800 mt-1 leading-tight">
              Elevated inflammatory immune response post orbital EVA.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
              <span>Fibrinogen / MPO</span>
              <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.2 rounded-full">MONITOR</span>
            </div>
            <p className="text-[10px] text-blue-800 mt-1 leading-tight">
              Vascular integrity &amp; clotting factors within nominal variance.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
              <span>Electrolyte (Na+)</span>
              <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded-full">STABLE</span>
            </div>
            <p className="text-[10px] text-emerald-800 mt-1 leading-tight">
              Hydration baseline steady across 3 of 4 crew members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}