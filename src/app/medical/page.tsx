'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import MetricCard from '../../components/MetricCard';
import MetricDetailModal from '../../components/MetricDetailModal';
import AnalysisModal from '../../components/AnalysisModal';
import { Astronaut, HealthMetricDetail, AnalysisSignal } from '../../types';
import { healthService } from '../../services/healthService';
import { analysisService } from '../../services/analysisService';
import { authService } from '../../services/authService';
import { simulationService } from '../../services/simulationService';
import {
  Activity,
  Heart,
  Moon,
  Brain,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User,
  Search,
  Sparkles,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';

export default function MedicalDashboard() {
  const [session, setSession] = useState(authService.getSession());
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [selectedAstronaut, setSelectedAstronaut] = useState<Astronaut | null>(null);
  const [metrics, setMetrics] = useState<HealthMetricDetail[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisSignal, setAnalysisSignal] = useState<AnalysisSignal | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadData = () => {
    const currentSession = authService.getSession();
    setSession(currentSession);

    const crew = healthService.getAstronauts();
    setAstronauts(crew);

    // Default select Maya Chen
    const maya = crew.find(a => a.id === 'ast-01') || crew[0];
    setSelectedAstronaut(maya);

    const m = healthService.getAstronautMetrics(maya.id);
    setMetrics(m);

    const sig = analysisService.getAnalysisSignal(maya.id);
    setAnalysisSignal(sig);

    setIsSimulating(simulationService.isSimulating());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectAstronaut = (astro: Astronaut) => {
    setSelectedAstronaut(astro);
    const m = healthService.getAstronautMetrics(astro.id);
    setMetrics(m);
    const sig = analysisService.getAnalysisSignal(astro.id);
    setAnalysisSignal(sig);
  };

  const handleMetricClick = (metric: HealthMetricDetail) => {
    setSelectedMetric(metric);
    setIsChartModalOpen(true);
  };

  const handleToggleSimulation = () => {
    if (isSimulating) {
      simulationService.resetSimulation();
    } else {
      simulationService.startSimulation();
    }
    loadData();
  };

  const domainScores = selectedAstronaut ? healthService.getDomainScores(selectedAstronaut.id) : [];

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-star-navy flex flex-col">
      <Navbar session={session} onRefresh={loadData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Header Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-star-navy to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-star-purple/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  FLIGHT MEDICAL OFFICER (FMO)
                </span>
                <span className="text-xs text-slate-300 font-medium">Dr. Marcus Vance • Artemis Base Alpha</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">Crew Telemetry & Diagnostic Health Suite</h1>
              <p className="text-xs text-slate-300 mt-1">Biomarker anomaly analysis, baseline deviation tracking, and intervention protocols</p>
            </div>
          </div>

          {/* Interactive Simulation Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSimulation}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 shadow-md ${
                isSimulating
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-star-blue to-blue-500 hover:from-blue-600 hover:to-star-blue text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Reset to Day 147 Anomaly' : 'Simulate Day 150 Restorative Intervention'}</span>
            </button>
          </div>
        </div>

        {/* Anomaly Notification Bar if Maya has WATCH status */}
        {selectedAstronaut?.status === 'WATCH' && (
          <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500 text-white shrink-0 shadow-md">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                    Physiological Anomaly Signal Detected
                  </span>
                  <span className="text-xs font-bold text-amber-800">CDR Maya Chen • Day 147</span>
                </div>
                <h3 className="text-base font-extrabold text-amber-950 mt-1">
                  Cumulative Sleep Deficit (-36%) & Elevated Resting Heart Rate (+23.3%)
                </h3>
                <p className="text-xs text-amber-900 mt-0.5">
                  Automated telemetry analysis identified early microgravity fatigue syndrome pattern. Prescribed rest protocols ready for review.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Investigate Anomaly Rationale</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Crew Roster Bar */}
        <div>
          <h2 className="text-base font-extrabold text-star-navy mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-star-blue" />
            Artemis Base Alpha Crew Roster (4 Astronauts)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {astronauts.map((astro) => (
              <div
                key={astro.id}
                onClick={() => handleSelectAstronaut(astro)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${
                  selectedAstronaut?.id === astro.id
                    ? 'bg-white border-star-blue ring-2 ring-star-blue/20 shadow-lg'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs'
                }`}
              >
                <img
                  src={astro.avatarUrl}
                  alt={astro.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-star-navy truncate">{astro.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      astro.status === 'WATCH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {astro.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold truncate">{astro.role}</p>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 mt-1">
                    <span>HR: {astro.currentVitals?.heartRate || astro.baseline.heartRate} bpm</span>
                    <span>Sleep: {astro.currentVitals?.sleepDuration || astro.baseline.sleepHours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Telemetry & Domain Health Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Domain Scorecards (Cardiovascular, Sleep, Fitness, Cognitive, Environment) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-4">
              <h2 className="text-base font-extrabold text-star-navy flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers className="w-5 h-5 text-star-purple" />
                Domain Health Indexes ({selectedAstronaut?.name})
              </h2>

              <div className="space-y-4">
                {domainScores.map((ds) => (
                  <div key={ds.domain} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-star-navy">{ds.domain}</span>
                      <span className={`font-black ${
                        ds.status === 'WATCH' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {ds.score} / 100 ({ds.status})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          ds.status === 'WATCH' ? 'bg-amber-500' : 'bg-star-blue'
                        }`}
                        style={{ width: `${ds.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flight Surgeon Actions</h3>
              <button
                onClick={() => setIsAnalysisModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-star-soft hover:bg-blue-100 text-star-blue font-extrabold text-xs transition flex items-center justify-between border border-blue-200"
              >
                <span>View Flag Rationale & Baseline Table</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Detailed Biomarker Grid for Selected Astronaut */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-star-navy flex items-center gap-2">
                <Activity className="w-5 h-5 text-star-blue" />
                Detailed Biomarker Telemetry ({selectedAstronaut?.name})
              </h2>
              <span className="text-xs text-slate-500 font-medium">72-Hour Continuous Window</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {metrics.map((m) => (
                <MetricCard
                  key={m.id}
                  metric={m}
                  onClick={handleMetricClick}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modal 1: Recharts Historical Trend Modal */}
      <MetricDetailModal
        metric={selectedMetric}
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
      />

      {/* Modal 2: Deterministic Anomaly Rationale & Recommended Actions */}
      <AnalysisModal
        signal={analysisSignal}
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onUpdate={loadData}
      />
    </div>
  );
}
