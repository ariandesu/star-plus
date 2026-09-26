'use client';

import React, { useState, useEffect } from 'react';
import TopHeader from '../../components/TopHeader';
import AstronautHealthScene, { HealthSystemType } from '../../components/three/AstronautHealthScene';
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
  const [selectedSystem, setSelectedSystem] = useState<HealthSystemType>('cardiovascular');
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

  // Chart telemetry data generator based on time horizon
  const getTelemetryChartData = () => {
    if (timeHorizon === '24H') {
      return [
        { time: '00:00', heartRate: 58, spo2: 99, stress: 18 },
        { time: '04:00', heartRate: 54, spo2: 99, stress: 15 },
        { time: '08:00', heartRate: 72, spo2: 98, stress: 24 },
        { time: '12:00', heartRate: 85, spo2: 97, stress: 32 },
        { time: '16:00', heartRate: 78, spo2: 98, stress: 26 },
        { time: '20:00', heartRate: 64, spo2: 99, stress: 20 },
        { time: '24:00', heartRate: 60, spo2: 99, stress: 18 },
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
          {/* Three.js 3D Visual Centerpiece, Floating Card & Selectors */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 3D Three.js Visual Anchor */}
            <AstronautHealthScene
              selectedSystem={selectedSystem}
              onSelectSystem={(sys) => setSelectedSystem(sys)}
              astronautName={astronaut.name}
              heartRate={selectedAstronautId === 'maya-chen' ? 65 : 72}
              spo2={98}
              sleepHours={selectedAstronautId === 'maya-chen' ? 4.8 : 7.2}
              stressIndex={selectedAstronautId === 'maya-chen' ? 26 : 18}
            />

            {/* Micro-System Summary Panel beneath 3D scene */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Active System Status
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
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SYSTEM MATCH</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">98.2% Baseline</div>
                  <span className="text-[10px] font-semibold text-emerald-600">✓ Nominal Sync</span>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COUNTERMEASURE</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">ARED 2h/day</div>
                  <span className="text-[10px] font-semibold text-blue-600">● Protocol Active</span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (~60% desktop, 7 cols out of 12)            */}
          {/* Large Health Analysis Panel, Actions, Schedule & Alert   */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Large Health Analysis Panel (Upper Right) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                      {selectedSystem.toUpperCase()} TELEMETRY
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Live Horizon: {timeHorizon}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                    {selectedSystem === 'cardiovascular' && 'Cardiovascular & Vascular Compliance'}
                    {selectedSystem === 'respiratory' && 'Respiratory Dynamics & Oxygenation'}
                    {selectedSystem === 'cognitive' && 'Neuro-Cognitive Load & Stress Index'}
                    {selectedSystem === 'musculoskeletal' && 'Bone Mineral Density & Muscle Attenuation'}
                    {selectedSystem === 'recovery' && 'Sleep Architecture & Circadian Rhythm'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsAnalysisOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Explain Signal</span>
                  </button>
                </div>
              </div>

              {/* Main Recharts Telemetry Area */}
              <div className="h-[220px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#0f172a' }}
                    />
                    <Area type="monotone" dataKey="heartRate" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Vitals Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RESTING HR</span>
                  <span className="text-lg font-black text-slate-900">{selectedAstronautId === 'maya-chen' ? '65 bpm' : '60 bpm'}</span>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">+8% vs Baseline</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">O2 SATURATION</span>
                  <span className="text-lg font-black text-slate-900">98% SpO2</span>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">Optimal Range</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLEEP DURATION</span>
                  <span className="text-lg font-black text-slate-900">{selectedAstronautId === 'maya-chen' ? '4.8 hours' : '7.5 hours'}</span>
                  <span className={`text-[10px] font-bold block mt-0.5 ${selectedAstronautId === 'maya-chen' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {selectedAstronautId === 'maya-chen' ? '⚠ Deficit -2.7h' : 'Target Achieved'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">STRESS INDEX</span>
                  <span className="text-lg font-black text-slate-900">{selectedAstronautId === 'maya-chen' ? '26 / 100' : '15 / 100'}</span>
                  <span className="text-[10px] font-bold text-amber-600 block mt-0.5">Mild Elevation</span>
                </div>
              </div>

            </div>

            {/* 2. Smaller Health / Action Panel & Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Prescribed Countermeasures Checklist */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-blue-600" />
                    <span>Prescribed Protocol</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">2 / 3 Done</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">ARED Heavy Resistance</span>
                        <span className="text-[10px] text-slate-500">07:30 - 09:30 UTC</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Completed</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">T-2 Treadmill Aerobic</span>
                        <span className="text-[10px] text-slate-500">13:00 - 14:00 UTC</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Completed</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Melatonin Circadian Reset</span>
                        <span className="text-[10px] text-slate-500">21:30 UTC</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Scheduled</span>
                  </div>
                </div>
              </div>

              {/* Mission EVA Suit & Hab Status */}
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">SUIT PRESSURE</span>
                    <span className="text-sm font-black text-slate-900">29.6 kPa</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">O2 FLOW</span>
                    <span className="text-sm font-black text-slate-900">0.42 L/min</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO2 SCRUBBER</span>
                    <span className="text-sm font-black text-slate-900">99.4% Eff.</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RADIATION SHIELD</span>
                    <span className="text-sm font-black text-slate-900">0.12 mSv/h</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Large Bottom Issue / Alert Signal Card (Reference layout signature component) */}
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
