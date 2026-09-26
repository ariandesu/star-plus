'use client';

import React, { useState, useEffect } from 'react';
import TopHeader from '../../components/TopHeader';
import BodyPartsOrganScene, { HealthSystemType } from '../../components/three/BodyPartsOrganScene';
import MetricDetailModal from '../../components/MetricDetailModal';
import AnalysisModal from '../../components/AnalysisModal';
import { healthService } from '../../services/healthService';
import { alertService } from '../../services/alertService';
import { analysisService } from '../../services/analysisService';
import { authService } from '../../services/authService';
import { HealthMetricDetail, UserSession } from '../../types';
import { 
  Heart, 
  Wind, 
  Brain, 
  Activity, 
  Moon, 
  Dumbbell, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles,
  Shield,
  Clock,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function AstronautDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('maya-chen');
  const [selectedSystem, setSelectedSystem] = useState<HealthSystemType>('CARDIOVASCULAR');
  const [timeHorizon, setTimeHorizon] = useState<'24H' | '7D' | '30D'>('24H');
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
    const s = authService.getSession();
    if (s) setSession(s);
  }, []);

  const astronaut = healthService.getAstronautById(selectedAstronautId) || healthService.getAstronautById('maya-chen');
  const metrics = healthService.getAstronautMetrics(selectedAstronautId);
  const alerts = alertService.getAlerts();

  if (!astronaut) return null;

  // Chart telemetry data generator based on time horizon & selected organ system
  const getTelemetryChartData = () => {
    if (timeHorizon === '24H') {
      return [
        { time: '00:00', heartRate: 58, spo2: 99, stress: 18 },
        { time: '04:00', heartRate: 54, spo2: 99, stress: 15 },
        { time: '08:00', heartRate: 72, spo2: 98, stress: 24 },
        { time: '12:00', heartRate: 85, spo2: 97, stress: 32 },
        { time: '16:00', heartRate: 78, spo2: 98, stress: 26 },
        { time: '20:00', heartRate: 64, spo2: 99, stress: 20 },
        { time: '24:00', heartRate: 65, spo2: 98, stress: 18 },
      ];
    } else if (timeHorizon === '7D') {
      return [
        { time: 'Mon', heartRate: 62, spo2: 98, stress: 22 },
        { time: 'Tue', heartRate: 65, spo2: 98, stress: 25 },
        { time: 'Wed', heartRate: 61, spo2: 99, stress: 19 },
        { time: 'Thu', heartRate: 74, spo2: 97, stress: 35 },
        { time: 'Fri', heartRate: 68, spo2: 98, stress: 28 },
        { time: 'Sat', heartRate: 64, spo2: 99, stress: 20 },
        { time: 'Sun', heartRate: 65, spo2: 98, stress: 26 },
      ];
    } else {
      return [
        { time: 'W1', heartRate: 63, spo2: 98, stress: 21 },
        { time: 'W2', heartRate: 66, spo2: 98, stress: 24 },
        { time: 'W3', heartRate: 64, spo2: 99, stress: 22 },
        { time: 'W4', heartRate: 65, spo2: 98, stress: 26 },
      ];
    }
  };

  const chartData = getTelemetryChartData();

  // Floating metric values per selected organ system
  const getFloatingMetricProps = () => {
    switch (selectedSystem) {
      case 'CARDIOVASCULAR':
        return {
          label: 'Heart Rate (Resting)',
          value: selectedAstronautId === 'maya-chen' ? '65 BPM' : '72 BPM',
          delta: '+8%',
          status: (selectedAstronautId === 'maya-chen' ? 'WATCH' : 'NOMINAL') as 'WATCH' | 'NOMINAL'
        };
      case 'RESPIRATORY':
        return {
          label: 'O2 Saturation (SpO2)',
          value: '98%',
          delta: '0%',
          status: 'NOMINAL' as 'NOMINAL'
        };
      case 'NEUROLOGICAL':
        return {
          label: 'Cognitive Stress Index',
          value: '62 / 100',
          delta: '+12%',
          status: 'WATCH' as 'WATCH'
        };
      case 'MUSCULOSKELETAL':
        return {
          label: 'Bone Mineral & Lumbar Load',
          value: '0.98 g/cm²',
          delta: '-2%',
          status: 'NOMINAL' as 'NOMINAL'
        };
      case 'CIRCADIAN':
        return {
          label: 'Sleep Duration & Phase',
          value: selectedAstronautId === 'maya-chen' ? '4.8 Hours' : '7.5 Hours',
          delta: '-2.7h vs 7.5h',
          status: (selectedAstronautId === 'maya-chen' ? 'WATCH' : 'NOMINAL') as 'WATCH' | 'NOMINAL'
        };
      default:
        return {
          label: 'Heart Rate (Resting)',
          value: '65 BPM',
          delta: '+8%',
          status: 'WATCH' as 'WATCH'
        };
    }
  };

  const floatingProps = getFloatingMetricProps();

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col">
      
      {/* Top Navigation & Sub-Header matching Dribbble reference */}
      <TopHeader
        session={session}
        greeting={`Good Morning, ${astronaut.name.split(' ')[0]}`}
        subtitle="AURORA-1 • Mission Day 147"
        selectedAstronautId={selectedAstronautId}
        onAstronautChange={(id) => setSelectedAstronautId(id)}
        selectedTimeHorizon={timeHorizon}
        onTimeHorizonChange={(h) => setTimeHorizon(h)}
      />

      {/* Main Dashboard Canvas (Asymmetrical 40% Left / 60% Right layout) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN (~40% desktop, 5 cols out of 12)             */}
          {/* Three.js 3D Detailed Organ Centerpiece & System Switcher */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 3D BodyParts3D Detailed Organ Centerpiece (Default = Heart) */}
            <BodyPartsOrganScene
              selectedSystem={selectedSystem}
              onSelectSystem={(sys: HealthSystemType) => setSelectedSystem(sys)}
              astronautName={astronaut.name}
              metricValue={floatingProps.value}
              metricLabel={floatingProps.label}
              baselineDelta={floatingProps.delta}
              status={floatingProps.status}
            />

            {/* Micro-System Summary Panel beneath 3D scene */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Active Organ System Focus
                </span>
                <button 
                  onClick={() => setIsAnalysisOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>AI Diagnostics</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TARGET ORGAN</span>
                  <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">{selectedSystem}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CLINICAL STATUS</span>
                  <span className={`text-xs font-extrabold mt-0.5 block ${
                    floatingProps.status === 'WATCH' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {floatingProps.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Crew EVA Activity & Mission Timeline Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Upcoming EVA Mission Schedule
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">T-minus 14h 30m</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      01
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">Habitat Array Maintenance EVA</h4>
                      <span className="text-[10px] text-slate-500">Duration: 4h 15m • Primary Suit: CDR Maya Chen</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700">PREP</span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (~60% desktop, 7 cols out of 12)            */}
          {/* Diagnostic Decision Support, Telemetry Chart & Alerts     */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Upper Right: AI Diagnostic Decision Support & Biomarker Analysis */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Diagnostic Decision Support</h2>
                  <p className="text-xs text-slate-500">Continuous 72-hour baseline deviation & physiological trend analysis.</p>
                </div>

                <button
                  onClick={() => setIsAnalysisOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Full Explainability Modal</span>
                </button>
              </div>

              {/* Biomarker Deviation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition cursor-pointer"
                  onClick={() => setSelectedMetric(metrics.find(m => m.id === 'm-hr') || null)}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-extrabold text-amber-600">+8%</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 block">Resting HR</span>
                  <span className="text-lg font-black text-slate-900">65 <span className="text-xs font-normal text-slate-400">bpm</span></span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition cursor-pointer"
                  onClick={() => setSelectedMetric(metrics.find(m => m.id === 'm-spo2') || null)}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <Wind className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-extrabold text-emerald-600">0%</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 block">O2 Saturation</span>
                  <span className="text-lg font-black text-slate-900">98 <span className="text-xs font-normal text-slate-400">%</span></span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition cursor-pointer"
                  onClick={() => setSelectedMetric(metrics.find(m => m.id === 'm-sleep') || null)}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <Moon className="w-4 h-4 text-purple-500" />
                    <span className="text-[10px] font-extrabold text-amber-600">-2.7h</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 block">Sleep Window</span>
                  <span className="text-lg font-black text-slate-900">4.8 <span className="text-xs font-normal text-slate-400">hrs</span></span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition cursor-pointer">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-extrabold text-emerald-600">Nominal</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 block">Cortisol / Stress</span>
                  <span className="text-lg font-black text-slate-900">26 <span className="text-xs font-normal text-slate-400">/ 100</span></span>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    {selectedSystem} Telemetry Trend ({timeHorizon})
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Sampled every 4 hours</span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="heartRate" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#heartGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* 2. Middle Right: Habitat ECLSS & Suit Telemetry Quick Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Habitat Air Loop */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-600" />
                    <span>Habitat Air Loop (ECLSS)</span>
                  </h3>
                  <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">NOMINAL</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">O₂ SATURATION</span>
                    <span className="text-sm font-black text-slate-900">20.9%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂ CONC.</span>
                    <span className="text-sm font-black text-slate-900">0.38%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CABIN PRESS.</span>
                    <span className="text-sm font-black text-slate-900">101.3 kPa</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TEMP</span>
                    <span className="text-sm font-black text-slate-900">21.5 °C</span>
                  </div>
                </div>
              </div>

              {/* EVA Suit Telemetry */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>EVA Suit & Habitat</span>
                  </h3>
                  <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">PASS</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SUIT PRESSURE</span>
                    <span className="text-sm font-black text-slate-900">29.6 kPa</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">O₂ FLOW</span>
                    <span className="text-sm font-black text-slate-900">0.42 L/min</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂ SCRUBBER</span>
                    <span className="text-sm font-black text-slate-900">99.4% Eff.</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RADIATION SHIELD</span>
                    <span className="text-sm font-black text-slate-900">0.12 mSv/h</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Large Bottom Issue / Alert Signal Card */}
            {selectedAstronautId === 'maya-chen' && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/5 rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900">
                          WATCH SIGNAL
                        </span>
                        <span className="text-xs font-bold text-amber-800">Multi-System Physiological Deviation</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                        CDR Maya Chen — Sleep Deficit & Microgravity Fluid Shift Watch
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAnalysisOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Why was this flagged?</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pl-13">
                  System detected a 4.8-hour sleep period (-2.7h vs 7.5h baseline) paired with mild resting HR elevation (+8% vs 60 bpm baseline) and fluid shift response. Decision support system recommends strict sleep window hygiene and 30-minute light therapy before mission EVA.
                </p>
              </div>
            )}

          </div>

        </div>

      </main>

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

    </div>
  );
}
