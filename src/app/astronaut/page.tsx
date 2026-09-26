'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeaderBar from '../../components/HeaderBar';
import MetricDetailModal from '../../components/MetricDetailModal';
import AnalysisModal from '../../components/AnalysisModal';
import { healthService } from '../../services/healthService';
import { alertService } from '../../services/alertService';
import { analysisService } from '../../services/analysisService';
import { authService } from '../../services/authService';
import { HealthMetricDetail, UserSession } from '../../types';
import {
  Heart,
  Moon,
  Activity,
  Sun,
  Shield,
  Dumbbell,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';

export default function AstronautDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
    const s = authService.getSession();
    if (s) setSession(s);
  }, []);

  const astronaut = healthService.getAstronautById('ast-01');
  const metrics = healthService.getAstronautMetrics('ast-01');
  const alerts = alertService.getAlerts();

  if (!astronaut) return null;

  const hrMetric = metrics.find(m => m.id === 'm-hr');
  const sleepMetric = metrics.find(m => m.id === 'm-sleep');
  const radMetric = metrics.find(m => m.id === 'm-rad');

  const domainScores = [
    { name: 'Cardiovascular', score: 92, color: 'bg-emerald-500' },
    { name: 'Sleep Architecture', score: 68, color: 'bg-amber-400' },
    { name: 'Cognitive Function', score: 85, color: 'bg-emerald-500' },
    { name: 'Musculoskeletal', score: 78, color: 'bg-emerald-500' },
    { name: 'Psychological', score: 74, color: 'bg-amber-400' },
    { name: 'Nutrition & Metabolic', score: 88, color: 'bg-emerald-500' },
    { name: 'Radiation Protection', score: 82, color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex h-screen bg-[#F4F7FC] text-slate-900 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar session={session} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <HeaderBar session={session} pageTitle="Astronaut Personal Health Portal" />

        <main className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Top Welcome & Mission Banner */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700">
                  COMMANDER • CDR
                </span>
                <span className="text-xs font-bold text-slate-400">Mission Day 147</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Astronaut Health Telemetry — {astronaut.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time personal biometric status, 72-hour vital trends, and daily workout protocols.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAnalysisOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                <span>Run Biomarker Diagnostics</span>
              </button>
            </div>
          </div>

          {/* Top KPI Cards Grid (5 Panels) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Health Score Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Overall Score</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-3xl font-extrabold text-slate-900">84 <span className="text-xs font-semibold text-slate-400">/ 100</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">● 100% Mission Ready</span>
            </div>

            {/* Heart Rate Panel */}
            <div
              onClick={() => hrMetric && setSelectedMetric(hrMetric)}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs cursor-pointer hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Heart Rate</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-3xl font-extrabold text-slate-900">68 <span className="text-xs font-semibold text-slate-400">bpm</span></div>
                <span className="text-[11px] text-slate-500 font-medium">Baseline: 62 bpm</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">● Nominal Range</span>
            </div>

            {/* Sleep Load Panel */}
            <div
              onClick={() => sleepMetric && setSelectedMetric(sleepMetric)}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs cursor-pointer hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sleep Load</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-3xl font-extrabold text-slate-900">7.2 <span className="text-xs font-semibold text-slate-400">hrs</span></div>
                <span className="text-[11px] text-slate-500 font-medium">Efficiency: 88%</span>
              </div>
              <span className="text-[10px] font-bold text-amber-600">● Below Target (8h)</span>
            </div>

            {/* Radiation Panel */}
            <div
              onClick={() => radMetric && setSelectedMetric(radMetric)}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs cursor-pointer hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Radiation</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-3xl font-extrabold text-slate-900">12.4 <span className="text-xs font-semibold text-slate-400">mSv</span></div>
                <span className="text-[11px] text-slate-500 font-medium">Safe Limit: 50 mSv</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">● Within Safe Threshold</span>
            </div>

            {/* Interventions Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Protocol</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-3xl font-extrabold text-slate-900">1 <span className="text-xs font-semibold text-slate-400">Active</span></div>
                <span className="text-[11px] text-slate-500 font-medium">Prescribed Rest Protocol</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600">● In Progress</span>
            </div>
          </div>

          {/* Main 2-Column Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (2 Span) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 72-Hour Vital Trends Chart Panel */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">72-Hour Vital Trends Diagnostics</h3>
                    <p className="text-xs text-slate-500">Continuous telemetry of Heart Rate (bpm) & SpO₂ (%)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1 text-blue-600">● Heart Rate</span>
                    <span className="flex items-center gap-1 text-emerald-600">● SpO₂ Oxygen</span>
                  </div>
                </div>

                {/* Visual Chart Graphic Representation */}
                <div className="h-56 w-full bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="w-full h-full flex items-end justify-between gap-2 pt-4 pb-2 px-2">
                    {[62, 65, 64, 68, 72, 70, 68, 66, 69, 74, 71, 68].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className="w-full bg-blue-500/80 rounded-t-md hover:bg-blue-600 transition-all"
                          style={{ height: `${(val / 100) * 100}%` }}
                          title={`HR: ${val} bpm`}
                        />
                        <span className="text-[9px] font-bold text-slate-400">{idx * 6}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Biomarker Domain Status List */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Health Domain Index</h3>
                  <span className="text-xs font-semibold text-slate-400">Individual Baseline Standard</span>
                </div>

                <div className="space-y-4">
                  {domainScores.map((domain) => (
                    <div key={domain.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">{domain.name}</span>
                        <span className="text-slate-900">{domain.score} / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${domain.color} h-2 rounded-full transition-all`} style={{ width: `${domain.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (1 Span) */}
            <div className="space-y-6">
              
              {/* Quick Biometrics Telemetry Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Real-Time Telemetry</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Core Temp</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">37.0°C</div>
                    <span className="text-[9px] text-emerald-600 font-bold">● Nominal</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">SpO₂ Oxygen</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">98%</div>
                    <span className="text-[9px] text-emerald-600 font-bold">● Nominal</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">HRV Variability</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">58 ms</div>
                    <span className="text-[9px] text-amber-600 font-bold">● Slight Stress</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Cabin CO₂</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">0.6%</div>
                    <span className="text-[9px] text-emerald-600 font-bold">● Safe</span>
                  </div>
                </div>
              </div>

              {/* Today's Workout & Focus Tracker */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Today's Countermeasures</h3>
                  <Dumbbell className="w-4 h-4 text-blue-600" />
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      2h
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">ARED Resistance & Treadmill</span>
                      <span className="text-[10px] text-slate-500">Completed at 09:30 UTC</span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedMetric && (
        <MetricDetailModal
          metric={selectedMetric}
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}

      {isAnalysisOpen && (
        <AnalysisModal
          signal={analysisService.getAnalysisSignal('ast-01')}
          isOpen={isAnalysisOpen}
          onClose={() => setIsAnalysisOpen(false)}
        />
      )}
    </div>
  );
}
