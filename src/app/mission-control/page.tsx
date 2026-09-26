'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { EnvironmentTelemetry, TimelineEvent, Astronaut } from '../../types';
import { missionService } from '../../services/missionService';
import { healthService } from '../../services/healthService';
import { authService } from '../../services/authService';
import { simulationService } from '../../services/simulationService';
import {
  Shield,
  Activity,
  Gauge,
  Thermometer,
  Wind,
  Droplets,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';

export default function MissionControlDashboard() {
  const [session, setSession] = useState(authService.getSession());
  const [environment, setEnvironment] = useState<EnvironmentTelemetry | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [missionIndex, setMissionIndex] = useState(86);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadData = () => {
    const currentSession = authService.getSession();
    setSession(currentSession);

    const env = missionService.getEnvironmentTelemetry();
    setEnvironment(env);

    const time = missionService.getMissionTimeline();
    setTimeline(time);

    const crew = healthService.getAstronauts();
    setAstronauts(crew);

    const idx = missionService.calculateMissionHealthIndex();
    setMissionIndex(idx.score);

    setIsSimulating(simulationService.isSimulating());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleSimulation = () => {
    if (isSimulating) {
      simulationService.resetSimulation();
    } else {
      simulationService.startSimulation();
    }
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-star-navy flex flex-col">
      <Navbar session={session} onRefresh={loadData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Header Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-star-navy to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  MISSION CONTROL OPS
                </span>
                <span className="text-xs text-slate-300 font-medium">Flight Dir. Sarah Jenkins • Houston Link</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">Spacecraft Life Support & Mission Health Index</h1>
              <p className="text-xs text-slate-300 mt-1">Real-time cabin environmental telemetry, crew operational status, and timeline events</p>
            </div>
          </div>

          <button
            onClick={handleToggleSimulation}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 shadow-md ${
              isSimulating
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-star-blue to-blue-500 hover:from-blue-600 hover:to-star-blue text-white'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Reset to Day 147 Anomaly' : 'Simulate Day 150 Restored Index'}</span>
          </button>
        </div>

        {/* Mission Health Index & Cabin Environment Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mission Health Index Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Overall Mission Health Index</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-star-blue border border-blue-200">
                Artemis Base Alpha
              </span>
            </div>

            <div className="flex items-baseline justify-between py-2">
              <div>
                <span className="text-5xl font-black text-star-navy tracking-tight">{missionIndex}</span>
                <span className="text-lg font-bold text-slate-400"> / 100</span>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  missionIndex >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {missionIndex >= 90 ? 'NOMINAL READINESS' : 'WATCH FLAG ACTIVE'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Calculated dynamically based on 4 astronaut physiological signals, cabin atmosphere telemetry, and life support system sensors.
            </p>
          </div>

          {/* Cabin Environment Telemetry (2 Columns Wide) */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-star-blue" />
                <h2 className="text-base font-extrabold text-star-navy">Cabin Environmental Telemetry</h2>
              </div>
              <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Sensor Sync
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">CO2 Level</span>
                <p className="text-xl font-black text-star-navy">{environment?.co2?.current} mmHg</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Nominal (&lt; 4.0)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Cabin Temp</span>
                <p className="text-xl font-black text-star-navy">{environment?.temperature?.current} °C</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Nominal (20-23)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Humidity</span>
                <p className="text-xl font-black text-star-navy">{environment?.humidity?.current} %</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Nominal (40-60)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Radiation Exposure</span>
                <p className="text-xl font-black text-star-navy">{environment?.radiation?.current} mSv/day</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Nominal (&lt; 0.60)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Crew Operational Readiness Grid */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-star-navy flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-star-blue" />
            Crew Member Readiness & Operational Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {astronauts.map((astro) => (
              <div key={astro.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={astro.avatarUrl}
                    alt={astro.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-star-navy">{astro.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{astro.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    astro.status === 'WATCH' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {astro.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Heart Rate:</span>
                    <strong className="text-star-navy">{astro.currentVitals?.heartRate || astro.baseline.heartRate} bpm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Sleep (72h):</span>
                    <strong className="text-star-navy">{astro.currentVitals?.sleepDuration || astro.baseline.sleepHours} hrs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Stress Index:</span>
                    <strong className="text-star-navy">{astro.currentVitals?.stressIndex || astro.baseline.stressLevel} / 100</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Timeline Feed */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-star-blue" />
              <h2 className="text-base font-extrabold text-star-navy">Artemis Base Alpha Mission Timeline</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Mission Day 147</span>
          </div>

          <div className="space-y-3">
            {timeline.map((evt) => (
              <div key={evt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl text-white shrink-0 mt-0.5 ${
                    evt.category === 'Medical' ? 'bg-amber-500' : evt.category === 'Telemetry' ? 'bg-star-purple' : 'bg-star-blue'
                  }`}>
                    {evt.category === 'Medical' ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">Day {evt.day} • {evt.date}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {evt.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-star-navy mt-1">{evt.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{evt.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
