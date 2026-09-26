'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeaderBar from '../../components/HeaderBar';
import AnalysisModal from '../../components/AnalysisModal';
import MetricDetailModal from '../../components/MetricDetailModal';
import { healthService } from '../../services/healthService';
import { alertService } from '../../services/alertService';
import { MOCK_ENVIRONMENT } from '../../data/mockData';
import { authService } from '../../services/authService';
import { Astronaut, HealthMetricDetail, AlertItem, AnalysisSignal, UserSession } from '../../types';
import {
  Activity,
  ShieldCheck,
  Radio,
  Thermometer,
  Wind,
  Sun,
  AlertTriangle,
  Users,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export default function MissionControlDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeSignal, setActiveSignal] = useState<AnalysisSignal | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);

  useEffect(() => {
    const s = authService.getSession();
    if (s) setSession(s);
  }, []);

  const crew = healthService.getAstronauts();
  const alerts = alertService.getAlerts();
  const env = MOCK_ENVIRONMENT;

  const handleOpenSignal = (astId: string) => {
    const signal = healthService.getAstronauts().find(a => a.id === astId);
    if (signal) {
      // Mock signal for modal
      setActiveSignal({
        id: 'sig-mc-01',
        astronautId: astId,
        astronautName: signal.name,
        status: signal.status,
        timeWindowHours: 72,
        confidence: 'High',
        title: `${signal.name} Mission Control Vital Diagnostics`,
        summary: `Continuous telemetric analysis shows stable vitals with minor adaptation flags.`,
        deviations: [
          { metric: 'Heart Rate', baseline: '68 bpm', current: '74 bpm', deviationPercent: 8.8, direction: 'elevated' }
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
    <div className="flex h-screen bg-[#F4F7FC] text-slate-900 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar session={session} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <HeaderBar session={session} pageTitle="Mission Control Command Dashboard" />

        <main className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Top Mission Status KPI Row (4 Panels) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Mission Health Index */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Mission Health Index</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                  NOMINAL
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">86</span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full w-[86%]" />
              </div>
            </div>

            {/* Crew Status Breakdown */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Crew Status</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">3 Stable</span>
                <span className="text-xs font-semibold text-amber-600 font-bold">1 Watch</span>
              </div>
              <p className="text-[11px] text-slate-500">4 Crew members active on station</p>
            </div>

            {/* Spacecraft Environment */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Life Support (ECLSS)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">100%</span>
                <span className="text-xs font-semibold text-emerald-600">STABLE</span>
              </div>
              <p className="text-[11px] text-slate-500">Cabin CO2: 0.6% | Temp: 22°C</p>
            </div>

            {/* Mission Timeline */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Mission Progress</span>
                <Radio className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">Day 147</span>
                <span className="text-xs font-semibold text-slate-400">/ 365</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full w-[40%]" />
              </div>
            </div>

          </div>

          {/* Middle Grid: Crew Health List & Mission Domain Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Crew Health Status List (2 Span) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Crew Telemetry Status</h3>
                  <p className="text-xs text-slate-500">Live monitoring of all mission personnel</p>
                </div>
                <span className="text-xs font-bold text-blue-600">4 Active Sessions</span>
              </div>

              <div className="space-y-3">
                {crew.map((ast) => {
                  const isWatch = ast.status === 'WATCH';
                  return (
                    <div
                      key={ast.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                          {ast.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{ast.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isWatch ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {ast.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{ast.role} • Day {ast.missionDay}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">HR Baseline</span>
                          <span className="font-extrabold text-slate-900">{ast.currentVitals?.heartRate || ast.baseline.heartRate} bpm</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Sleep Load</span>
                          <span className="font-extrabold text-slate-900">{ast.currentVitals?.sleepDuration || ast.baseline.sleepHours} hrs</span>
                        </div>
                        <button
                          onClick={() => handleOpenSignal(ast.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
                        >
                          Telemetry Signal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mission Average Domain Performance (1 Span) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Mission Domain Index</h3>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Cardiovascular', score: 91, color: 'bg-emerald-500' },
                  { name: 'Sleep & Recovery', score: 72, color: 'bg-amber-500' },
                  { name: 'Cognitive Performance', score: 88, color: 'bg-emerald-500' },
                  { name: 'Musculoskeletal', score: 83, color: 'bg-emerald-500' },
                  { name: 'Psychological Load', score: 76, color: 'bg-blue-500' },
                  { name: 'Nutritional Intake', score: 85, color: 'bg-emerald-500' },
                  { name: 'Radiation Exposure', score: 81, color: 'bg-blue-500' },
                ].map((dom) => (
                  <div key={dom.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{dom.name}</span>
                      <span className="font-bold text-slate-900">{dom.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${dom.color}`} style={{ width: `${dom.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Section: Spacecraft Environment & Active Alert Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Spacecraft Environment Telemetry (1 Span) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Cabin ECLSS Telemetry</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Wind className="w-3.5 h-3.5 text-blue-600" />
                    <span>CO2 Level</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">{env.co2.current}%</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                    <span>Temperature</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">{env.temperature.current}°C</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">{env.humidity.current}%</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Sun className="w-3.5 h-3.5 text-purple-600" />
                    <span>Radiation</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">{env.radiation.current} mSv/h</div>
                </div>
              </div>
            </div>

            {/* Active Telemetry Alerts (2 Span) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Active Telemetry Alerts Feed</h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-white font-bold ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-500' : alert.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                        <p className="text-[11px] text-slate-500">{alert.description}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400">{alert.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>

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
  );
}
