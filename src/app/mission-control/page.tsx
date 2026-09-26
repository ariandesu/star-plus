'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeaderBar from '../../components/HeaderBar';
import AnalysisModal from '../../components/AnalysisModal';
import MetricDetailModal from '../../components/MetricDetailModal';
import GlobalSearchModal from '../../components/GlobalSearchModal';
import NotificationModal from '../../components/NotificationModal';
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
  Sparkles,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function MissionControlDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeSignal, setActiveSignal] = useState<AnalysisSignal | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Simulation emergency state
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  useEffect(() => {
    const s = authService.getSession();
    if (s) setSession(s);
  }, []);

  const crew = healthService.getAstronauts();
  const alerts = alertService.getAlerts();
  const env = MOCK_ENVIRONMENT;

  const handleOpenSignal = (astId: string) => {
    const signal = healthService.getAstronauts().find((a) => a.id === astId);
    if (signal) {
      setActiveSignal({
        id: 'sig-mc-01',
        astronautId: astId,
        astronautName: signal.name,
        status: signal.status,
        timeWindowHours: 72,
        confidence: 'High',
        title: `${signal.name} Mission Control Telemetry Diagnostics`,
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
    <div className="flex h-screen bg-[#F4F7FC] text-slate-900 overflow-hidden font-sans">
      {/* Left Sidebar with Mobile Drawer */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <HeaderBar
          session={session}
          pageTitle="Mission Control Command Dashboard"
          onSearchClick={() => setIsSearchOpen(true)}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto pb-12">
          
          {/* Top Command Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-700 rounded-full tracking-wider uppercase">
                  FLIGHT DIRECTOR TELEMETRY COMMAND
                </span>
                <span className="text-xs text-slate-500 font-bold">Station: AURORA-1 (LEO Orbit)</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                Spacecraft ECLSS & Crew Telemetry Monitor
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer ${
                  isEmergencyMode
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isEmergencyMode ? 'EMERGENCY SIMULATION ACTIVE' : 'Simulate Anomaly'}</span>
              </button>
            </div>
          </div>

          {/* Top Mission Status KPI Row (4 Panels) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Mission Health Index */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Mission Health Index</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isEmergencyMode ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isEmergencyMode ? 'CRITICAL WATCH' : 'NOMINAL'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{isEmergencyMode ? '68' : '86'}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`h-2 rounded-full ${isEmergencyMode ? 'bg-rose-500 w-[68%]' : 'bg-emerald-500 w-[86%]'}`} />
              </div>
            </div>

            {/* Crew Status Breakdown */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Crew Status</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">3 Stable</span>
                <span className="text-xs font-bold text-amber-600">1 Watch</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">4 Crew members active on station</p>
            </div>

            {/* Spacecraft Environment */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Life Support (ECLSS)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{isEmergencyMode ? '91%' : '100%'}</span>
                <span className={`text-xs font-bold ${isEmergencyMode ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isEmergencyMode ? 'DEGRADED' : 'STABLE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                CO2: {isEmergencyMode ? '0.9%' : '0.6%'} | Temp: {isEmergencyMode ? '25°C' : '22°C'}
              </p>
            </div>

            {/* Mission Progress */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Mission Progress</span>
                <Radio className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">Day 147</span>
                <span className="text-xs font-bold text-slate-400">/ 365</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Trajectory: Nominal Earth Return Path</p>
            </div>

          </div>

          {/* Middle Section: Crew Vitals & Biomarker Domain Averages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Crew Vitals Monitoring (2 Span) */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Live Crew Telemetry Stream</h3>
                  <p className="text-xs text-slate-500">Real-time biometrics from astronaut suits and cabin sensors.</p>
                </div>
                <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {crew.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleOpenSignal(member.id)}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:border-blue-300 hover:bg-white transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{member.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold">{member.role}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        member.status === 'WATCH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200/40">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Heart Rate</span>
                        <span className="text-xs font-black text-slate-900">
                          {member.currentVitals?.heartRate ?? member.baseline.heartRate} bpm
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">SpO₂</span>
                        <span className="text-xs font-black text-slate-900">98%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Core Temp</span>
                        <span className="text-xs font-black text-slate-900">36.8°C</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Station Average Domain Scores */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900">Station Biomarker Domains</h3>
              <div className="space-y-4">
                {[
                  { name: 'Cardiovascular', score: 88, color: 'bg-emerald-500' },
                  { name: 'Sleep & Circadian', score: 72, color: 'bg-amber-500' },
                  { name: 'Cognitive Load', score: 84, color: 'bg-blue-500' },
                  { name: 'Musculoskeletal', score: 90, color: 'bg-emerald-500' },
                  { name: 'Radiation Shielding', score: 78, color: 'bg-purple-500' }
                ].map((dom) => (
                  <div key={dom.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">{dom.name}</span>
                      <span className="font-black text-slate-900">{dom.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${dom.color}`} style={{ width: `${dom.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Spacecraft ECLSS Telemetry & Active Alert Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Spacecraft Environment Telemetry */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900">Cabin ECLSS Telemetry</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Wind className="w-4 h-4 text-blue-600" />
                    <span>CO2 Level</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {isEmergencyMode ? '0.90%' : `${env.co2.current}%`}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                    <span>Temperature</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {isEmergencyMode ? '25.4°C' : `${env.temperature.current}°C`}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {env.humidity.current}%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Sun className="w-4 h-4 text-purple-600" />
                    <span>Radiation</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {isEmergencyMode ? '0.45 mSv/h' : `${env.radiation.current} mSv/h`}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Telemetry Alerts Feed */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900">Active Telemetry Alert Feed</h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-white font-black ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{alert.description}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Astronaut Target: {alert.astronautId}</p>
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
