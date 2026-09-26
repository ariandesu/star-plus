'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeaderBar from '../../components/HeaderBar';
import MetricDetailModal from '../../components/MetricDetailModal';
import AnalysisModal from '../../components/AnalysisModal';
import GlobalSearchModal from '../../components/GlobalSearchModal';
import NotificationModal from '../../components/NotificationModal';
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
  Clock,
  Sparkles
} from 'lucide-react';

export default function AstronautDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('maya-chen');
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Overview');

  useEffect(() => {
    const s = authService.getSession();
    if (s) setSession(s);
  }, []);

  const astronaut = healthService.getAstronautById(selectedAstronautId) || healthService.getAstronautById('maya-chen');
  const metrics = healthService.getAstronautMetrics(selectedAstronautId);
  const alerts = alertService.getAlerts();

  if (!astronaut) return null;

  const hrMetric = metrics.find(m => m.id.includes('hr'));
  const sleepMetric = metrics.find(m => m.id.includes('sleep'));
  const radMetric = metrics.find(m => m.id.includes('rad'));

  const domainScores = [
    { name: 'Cardiovascular', score: 92, color: 'bg-emerald-500' },
    { name: 'Sleep Architecture', score: 68, color: 'bg-amber-400' },
    { name: 'Cognitive Function', score: 85, color: 'bg-emerald-500' },
    { name: 'Musculoskeletal', score: 78, color: 'bg-emerald-500' },
    { name: 'Psychological', score: 74, color: 'bg-amber-400' },
    { name: 'Nutrition & Metabolic', score: 88, color: 'bg-emerald-500' },
    { name: 'Radiation Protection', score: 82, color: 'bg-emerald-500' },
  ];

  const domainTabs = ['Overview', 'Cardiovascular', 'Sleep & Circadian', 'Cognitive & Stress', 'Musculoskeletal', 'Radiation'];

  return (
    <div className="flex h-screen bg-[#F4F7FC] text-slate-900 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <HeaderBar
          session={session}
          pageTitle={`Astronaut Personal Health Portal — ${astronaut.name}`}
          selectedAstronautId={selectedAstronautId}
          onAstronautChange={(id) => setSelectedAstronautId(id)}
          onSearchClick={() => setIsSearchOpen(true)}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          
          {/* Top Welcome Banner */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700">
                  {astronaut.role}
                </span>
                <span className="text-xs font-bold text-slate-400">Mission Day 147</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Biometric Status — {astronaut.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time physiological telemetry, 72-hour vital trends, and daily workout protocols.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAnalysisOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>Run Biomarker Diagnostics</span>
              </button>
            </div>
          </div>

          {/* Domain Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {domainTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white/80 backdrop-blur-md border border-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Top KPI Cards Grid (5 Glassmorphic Panels) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Health Score Panel */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Overall Score</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="text-3xl font-black text-slate-900">84 <span className="text-xs font-bold text-slate-400">/ 100</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                ● 100% Mission Ready
              </span>
            </div>

            {/* Heart Rate Panel */}
            <div
              onClick={() => hrMetric && setSelectedMetric(hrMetric)}
              className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Heart Rate</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="text-3xl font-black text-slate-900">68 <span className="text-xs font-bold text-slate-400">bpm</span></div>
                <p className="text-[10px] text-slate-500 mt-1">Resting Baseline: 64 bpm</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition flex items-center gap-1">
                Click for Vital History →
              </span>
            </div>

            {/* Sleep Load Panel */}
            <div
              onClick={() => sleepMetric && setSelectedMetric(sleepMetric)}
              className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sleep Load</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Moon className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="text-3xl font-black text-slate-900">7.2h <span className="text-xs font-bold text-amber-500">88%</span></div>
                <p className="text-[10px] text-slate-500 mt-1">REM: 1.8h • Deep: 2.1h</p>
              </div>
              <span className="text-[10px] font-bold text-amber-600">● Moderate Circadian Shift</span>
            </div>

            {/* Radiation Accumulation Panel */}
            <div
              onClick={() => radMetric && setSelectedMetric(radMetric)}
              className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Radiation Dosimetry</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Sun className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="text-3xl font-black text-slate-900">12.4 <span className="text-xs font-bold text-slate-400">mSv</span></div>
                <p className="text-[10px] text-slate-500 mt-1">Safe Limit: 50 mSv / yr</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">● Safe Dosage Zone</span>
            </div>

            {/* Active Interventions Panel */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Protocol</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="text-lg font-black text-slate-900">ARED Resistance</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Scheduled at 15:30 UTC</p>
              </div>
              <span className="text-[10px] font-extrabold text-blue-600">1 Rest Window Active</span>
            </div>

          </div>

          {/* Main 2-Column Dashboard Body */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Main Column (2 Spans) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Vital Biomarkers Grid */}
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Vital Biomarkers Grid</h3>
                    <p className="text-xs text-slate-500">Real-time status metrics across physiological domains.</p>
                  </div>
                  <button
                    onClick={() => setIsAnalysisOpen(true)}
                    className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Full Biomarker Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {metrics.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMetric(m)}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Biomarker</span>
                        <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                        <div className="text-lg font-black text-slate-900 mt-1">
                          {m.currentValue} <span className="text-xs font-normal text-slate-500">{m.unit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          m.status === 'WATCH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">Baseline: {m.baselineValue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Domain Index Breakdown */}
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">Health Domain Performance Index</h3>
                  <span className="text-xs font-bold text-slate-400">Baseline Target: 100</span>
                </div>

                <div className="space-y-4">
                  {domainScores.map((domain) => (
                    <div key={domain.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">{domain.name}</span>
                        <span className="text-slate-900">{domain.score} / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${domain.color} h-2 rounded-full transition-all duration-300`} style={{ width: `${domain.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (1 Span) */}
            <div className="space-y-6">
              
              {/* Real-Time Telemetry Quick Status */}
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900">Real-Time Telemetry</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Core Temp</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">37.0°C</div>
                    <span className="text-[9px] text-emerald-600 font-extrabold">● Nominal</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">SpO₂ Oxygen</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">98%</div>
                    <span className="text-[9px] text-emerald-600 font-extrabold">● Nominal</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">HRV Variability</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">58 ms</div>
                    <span className="text-[9px] text-amber-600 font-extrabold">● Slight Stress</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Cabin CO₂</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">0.6%</div>
                    <span className="text-[9px] text-emerald-600 font-extrabold">● Safe</span>
                  </div>
                </div>
              </div>

              {/* Today's Countermeasures & Schedule */}
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">Today's Countermeasures</h3>
                  <Dumbbell className="w-4 h-4 text-blue-600" />
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
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
          signal={analysisService.getAnalysisSignal(selectedAstronautId)}
          isOpen={isAnalysisOpen}
          onClose={() => setIsAnalysisOpen(false)}
        />
      )}

      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {isNotificationOpen && (
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </div>
  );
}
