'use client';

import RouteGuard from '@/components/RouteGuard';

import React, { useState, useEffect } from 'react';
import TopHeader from '../../components/TopHeader';
import MissionEnvironmentScene from '../../components/three/MissionEnvironmentScene';
import AnalysisModal from '../../components/AnalysisModal';
import MetricDetailModal from '../../components/MetricDetailModal';
import { healthService } from '../../services/healthService';
import { alertService } from '../../services/alertService';
import { MOCK_ENVIRONMENT } from '../../data/mockData';
import { authService } from '../../services/authService';
import { HealthMetricDetail, AnalysisSignal, UserSession } from '../../types';
import { 
  Activity, 
  Shield, 
  Radio, 
  Thermometer, 
  Wind, 
  Sun, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  Zap, 
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function MissionControlDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeSignal, setActiveSignal] = useState<AnalysisSignal | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [timeHorizon, setTimeHorizon] = useState<'24H' | '7D' | '30D'>('24H');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  useEffect(() => {
    const s = authService.getSession();
    if (s) setSession(s);
  }, []);

  const crew = healthService.getAstronauts();
  const alerts = alertService.getAlerts();

  // Dynamic telemetry data varying across time horizon and emergency mode
  const telemetryData = {
    '24H': {
      pressure: isEmergencyMode ? '96.4 kPa' : '101.3 kPa',
      pressureNum: isEmergencyMode ? 96.4 : 101.3,
      o2: isEmergencyMode ? '18.5%' : '20.9%',
      o2Num: isEmergencyMode ? 18.5 : 20.9,
      co2: isEmergencyMode ? '0.92%' : '0.38%',
      co2Num: isEmergencyMode ? 0.92 : 0.38,
      radiation: isEmergencyMode ? '0.45 mSv/h' : '0.12 mSv/h',
      radiationNum: isEmergencyMode ? 0.45 : 0.12,
      cabinTemp: isEmergencyMode ? 25.8 : 21.5,
      hrMaya: '65 bpm',
      hrOthers: '70 bpm',
      spo2: '98%',
      sleepMaya: '4.8h',
      sleepOthers: '7.2h',
    },
    '7D': {
      pressure: isEmergencyMode ? '95.8 kPa' : '100.8 kPa',
      pressureNum: isEmergencyMode ? 95.8 : 100.8,
      o2: isEmergencyMode ? '18.1%' : '20.7%',
      o2Num: isEmergencyMode ? 18.1 : 20.7,
      co2: isEmergencyMode ? '0.98%' : '0.44%',
      co2Num: isEmergencyMode ? 0.98 : 0.44,
      radiation: isEmergencyMode ? '0.52 mSv/h' : '0.15 mSv/h',
      radiationNum: isEmergencyMode ? 0.52 : 0.15,
      cabinTemp: isEmergencyMode ? 26.2 : 21.8,
      hrMaya: '68 bpm',
      hrOthers: '73 bpm',
      spo2: '97%',
      sleepMaya: '5.1h',
      sleepOthers: '7.0h',
    },
    '30D': {
      pressure: isEmergencyMode ? '94.5 kPa' : '100.2 kPa',
      pressureNum: isEmergencyMode ? 94.5 : 100.2,
      o2: isEmergencyMode ? '17.6%' : '20.4%',
      o2Num: isEmergencyMode ? 17.6 : 20.4,
      co2: isEmergencyMode ? '1.05%' : '0.51%',
      co2Num: isEmergencyMode ? 1.05 : 0.51,
      radiation: isEmergencyMode ? '0.64 mSv/h' : '0.22 mSv/h',
      radiationNum: isEmergencyMode ? 0.64 : 0.22,
      cabinTemp: isEmergencyMode ? 26.9 : 22.3,
      hrMaya: '72 bpm',
      hrOthers: '76 bpm',
      spo2: '96%',
      sleepMaya: '5.5h',
      sleepOthers: '6.8h',
    }
  }[timeHorizon];

  const handleOpenSignal = (astId: string) => {
    const signal = healthService.getAstronauts().find((a) => a.id === astId);
    if (signal) {
      setActiveSignal({
        id: 'sig-mc-01',
        astronautId: astId,
        astronautName: signal.name,
        status: signal.status,
        timeWindowHours: timeHorizon === '24H' ? 24 : timeHorizon === '7D' ? 168 : 720,
        confidence: 'High',
        title: `${signal.name} Mission Control Telemetry Diagnostics (${timeHorizon})`,
        summary: `Continuous telemetric analysis over ${timeHorizon} shows stable vitals with orbital adaptation flags.`,
        deviations: [
          { metric: 'Heart Rate', baseline: '68 bpm', current: timeHorizon === '30D' ? '72 bpm' : '74 bpm', deviationPercent: 8.8, direction: 'elevated' }
        ],
        possibleContributingFactors: ['Microgravity Fluid Shift', 'Circadian Phase Delay'],
        recommendedActions: [
          { id: 'act-1', action: 'Schedule 30min rest protocol', category: 'Sleep', isCompleted: false }
        ],
        timestamp: 'Just now'
      });
    }
  };

  return (
    <RouteGuard allow={['mission-control']}>
      <div className="min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col">
      
      {/* Top Header Bar matching Dribbble reference */}
      <TopHeader
        session={session}
        greeting="Mission Control Operations Command"
        subtitle={`AURORA-1 • Station Telemetry & Crew Vitals Grid (${timeHorizon} Horizon)`}
        selectedTimeHorizon={timeHorizon}
        onTimeHorizonChange={(h) => setTimeHorizon(h)}
      />

      {/* Main Content Layout (40/60 Asymmetrical Composition) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN (~40% desktop, 5 cols out of 12)             */}
          {/* Three.js 3D Habitat Model & Emergency Simulation Trigger  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 3D Habitat/Shuttle Discovery Scene */}
            <MissionEnvironmentScene
              cabinPressure={telemetryData.pressureNum}
              o2Percentage={telemetryData.o2Num}
              co2Level={telemetryData.co2Num}
              cabinTemp={telemetryData.cabinTemp}
              radiationLevel={telemetryData.radiationNum}
            />

            {/* Simulation Control Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Mission Control Anomaly Simulation ({timeHorizon})
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isEmergencyMode ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isEmergencyMode ? 'ANOMALY ACTIVE' : 'NOMINAL BASELINE'}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Trigger real-time telemetry anomaly simulation (CO2 spike, O2 drop) over the selected {timeHorizon} window to test decision support reactivity.
              </p>

              <button
                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                className={`w-full py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  isEmergencyMode
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isEmergencyMode ? 'Reset Baseline Telemetry' : 'Simulate Anomaly Emergency'}</span>
              </button>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (~60% desktop, 7 cols out of 12)            */}
          {/* Live Crew Vitals Matrix Grid & ECLSS Telemetry           */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Upper Right: Crew Vitals Matrix Grid */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Crew Vitals Grid ({timeHorizon})</h2>
                  <p className="text-xs text-slate-500">Real-time physiological telemetry feed across all 4 crew members.</p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-100">
                  LEO ORBIT • {timeHorizon} WINDOW
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {crew.map((astronaut) => {
                  const isWatch = astronaut.status === 'WATCH';
                  const isMaya = astronaut.id === 'maya-chen';

                  return (
                    <div
                      key={astronaut.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isWatch ? 'bg-amber-50/50 border-amber-200/80 shadow-2xs' : 'bg-slate-50/70 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={astronaut.avatarUrl}
                            alt={astronaut.name}
                            className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs"
                          />
                          <div>
                            <h3 className="text-xs font-extrabold text-slate-900">{astronaut.name}</h3>
                            <span className="text-[10px] text-slate-500 font-medium block">{astronaut.role}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isWatch ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {astronaut.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">HEART RATE</span>
                          <span className="text-xs font-black text-slate-900 block">{isMaya ? telemetryData.hrMaya : telemetryData.hrOthers}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">SpO2</span>
                          <span className="text-xs font-black text-slate-900 block">{telemetryData.spo2}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">SLEEP</span>
                          <span className="text-xs font-black text-slate-900 block">{isMaya ? telemetryData.sleepMaya : telemetryData.sleepOthers}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenSignal(astronaut.id)}
                        className="w-full py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Telemetry Diagnostics</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lower Right: ECLSS Environmental Air Loop & Radiation Shielding */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-600" />
                <span>Habitat Environmental Control & Life Support (ECLSS) — {timeHorizon} Aggregate</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">CABIN PRESSURE</span>
                  <span className="text-base font-black text-slate-900 mt-0.5">{telemetryData.pressure}</span>
                  <span className={`text-[10px] font-semibold block ${isEmergencyMode ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {isEmergencyMode ? '⚠ Minor Drop' : `${timeHorizon} Stable`}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">OXYGEN LOOP</span>
                  <span className="text-base font-black text-slate-900 mt-0.5">{telemetryData.o2}</span>
                  <span className={`text-[10px] font-semibold block ${isEmergencyMode ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
                    {isEmergencyMode ? '⚠ Low Saturation' : `${timeHorizon} Nominal`}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">CO2 SCRUBBER</span>
                  <span className="text-base font-black text-slate-900 mt-0.5">{telemetryData.co2}</span>
                  <span className={`text-[10px] font-semibold block ${isEmergencyMode ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {isEmergencyMode ? '⚠ Scrubbing High' : `${timeHorizon} Filtered`}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">DOSIMETRY</span>
                  <span className="text-base font-black text-slate-900 mt-0.5">{telemetryData.radiation}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 block">{timeHorizon} Accumulation</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Modals */}
      {activeSignal && (
        <AnalysisModal
          signal={activeSignal}
          isOpen={!!activeSignal}
          onClose={() => setActiveSignal(null)}
        />
      )}

      {selectedMetric && (
        <MetricDetailModal
          metric={selectedMetric}
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}

      </div>

    </RouteGuard>
  );
}
