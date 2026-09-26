'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeaderBar from '../../components/HeaderBar';
import AnalysisModal from '../../components/AnalysisModal';
import { healthService } from '../../services/healthService';
import { alertService } from '../../services/alertService';
import { analysisService } from '../../services/analysisService';
import { authService } from '../../services/authService';
import { UserSession, AlertItem, AnalysisSignal } from '../../types';
import {
  Activity,
  Stethoscope,
  Filter,
  CheckCircle,
  FileText,
  Send,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function FlightMedicalOfficerDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState('maya-chen');
  const [activeSignal, setActiveSignal] = useState<AnalysisSignal | null>(null);

  // Local state for alert triage feed to ensure immediate re-renders on action
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  // Scoped Clinical Notes per Astronaut
  const [clinicalNotes, setClinicalNotes] = useState<Record<string, Array<{ id: string; timestamp: string; author: string; note: string; category: string }>>>({
    'maya-chen': [
      {
        id: 'note-1',
        timestamp: '25 Nov 2024, 08:30',
        author: 'Dr. Marcus Vance (FMO)',
        note: 'Noted cumulative sleep debt of -1.8h over past 72h. Advised 45min rest window prior to EVA preparation.',
        category: 'Countermeasure'
      }
    ]
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState('Countermeasure');

  useEffect(() => {
    const s = authService.getSession();
    setSession(s);
    setAlerts(alertService.getAlerts());
  }, []);

  const crew = healthService.getAstronauts();
  const selectedAstronaut = healthService.getAstronautById(selectedAstronautId) || crew[0];

  const handleResolveAlert = (alertId: string) => {
    const updated = alertService.resolveAlert(alertId);
    setAlerts([...updated]);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newEntry = {
      id: `note-${Date.now()}`,
      timestamp: 'Just now',
      author: session?.username || 'Dr. Marcus Vance',
      note: newNoteText.trim(),
      category: noteCategory
    };

    setClinicalNotes((prev) => ({
      ...prev,
      [selectedAstronautId]: [newEntry, ...(prev[selectedAstronautId] || [])]
    }));

    setNewNoteText('');
  };

  const currentNotes = clinicalNotes[selectedAstronautId] || [];

  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (alertFilter === 'WARNING') return a.severity === 'WARNING';
    return true;
  });

  return (
    <div className="flex h-screen bg-[#F4F7FC] text-slate-900 font-sans overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <HeaderBar pageTitle="Flight Medical Officer Portal" />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto pb-12">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                  FMO ACTIVE CLINICAL MONITORING
                </span>
                <span className="text-xs text-slate-500 font-medium">AURORA-1 Deep Space Mission</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                Crew Health Triage & Clinical Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const sig = analysisService.getAnalysisSignal(selectedAstronautId);
                  setActiveSignal(sig);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                Run AI Multi-Biomarker Analysis ({selectedAstronaut.name.split(' ')[0]})
              </button>
            </div>
          </div>

          {/* Top Crew Overview Cards (4 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {crew.map((member) => {
              const isSelected = member.id === selectedAstronautId;
              const isWatch = member.status === 'WATCH';
              const isCritical = member.status === 'CRITICAL';
              const hr = member.currentVitals?.heartRate ?? member.baseline.heartRate;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedAstronautId(member.id)}
                  className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">{member.name}</h3>
                        <p className="text-[11px] text-slate-500">{member.role}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700'
                          : isWatch
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Status</span>
                      <p className="text-sm font-bold text-slate-900">{member.status}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Heart Rate</span>
                      <p className="text-sm font-bold text-slate-700">{hr} bpm</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Middle Section: Crew Risk Matrix & Clinical Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Crew Risk Matrix & Biomarker Comparison */}
            <div className="lg:col-span-2 space-y-6">
              {/* Baseline Deviation Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Crew Biomarker Baseline Deviation Matrix
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">Real-time Telemetry Sync</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Astronaut</th>
                        <th className="pb-3 font-semibold">Heart Rate</th>
                        <th className="pb-3 font-semibold">Sleep Duration</th>
                        <th className="pb-3 font-semibold">Stress Index</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {crew.map((member) => {
                        const currentHr = member.currentVitals?.heartRate ?? member.baseline.heartRate;
                        const hrDev = currentHr - member.baseline.heartRate;
                        const sleepDur = member.currentVitals?.sleepDuration ?? member.baseline.sleepHours;
                        const sleepDev = (member.baseline.sleepHours - sleepDur).toFixed(1);
                        const stress = member.currentVitals?.stressIndex ?? member.baseline.stressLevel;

                        return (
                          <tr
                            key={member.id}
                            onClick={() => setSelectedAstronautId(member.id)}
                            className={`cursor-pointer transition hover:bg-slate-50 ${
                              member.id === selectedAstronautId ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <td className="py-3 font-bold text-slate-900">
                              {member.name}
                              <span className="block text-[10px] font-normal text-slate-400">{member.role}</span>
                            </td>
                            <td className="py-3">
                              <span className="font-bold text-slate-800">{currentHr} bpm</span>
                              <span className={`block text-[10px] font-medium ${hrDev > 5 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                                {hrDev >= 0 ? `+${hrDev}` : hrDev} vs baseline
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="font-bold text-slate-800">{sleepDur}h</span>
                              <span className={`block text-[10px] font-medium ${parseFloat(sleepDev) > 1.0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
                                {parseFloat(sleepDev) > 0 ? `-${sleepDev}h debt` : 'Optimal'}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="font-bold text-slate-800">{stress}/100</span>
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                                  member.status === 'WATCH'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {member.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Multi-Biomarker Radar Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  Clinical Biomarker Status for {selectedAstronaut.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Cardiovascular</span>
                    <p className="text-lg font-black text-slate-900 mt-1">92<span className="text-xs text-slate-400 font-normal">/100</span></p>
                    <span className="text-[10px] text-emerald-600 font-bold">Optimal</span>
                  </div>
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-extrabold uppercase text-amber-800">Sleep Load</span>
                    <p className="text-lg font-black text-amber-900 mt-1">68<span className="text-xs text-amber-600 font-normal">/100</span></p>
                    <span className="text-[10px] text-amber-700 font-bold">Mild Debt</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Cognitive</span>
                    <p className="text-lg font-black text-slate-900 mt-1">85<span className="text-xs text-slate-400 font-normal">/100</span></p>
                    <span className="text-[10px] text-emerald-600 font-bold">High Alertness</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Musculoskeletal</span>
                    <p className="text-lg font-black text-slate-900 mt-1">78<span className="text-xs text-slate-400 font-normal">/100</span></p>
                    <span className="text-[10px] text-emerald-600 font-bold">ARED Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Clinical Log & Prescriptions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    FMO Clinical Log ({selectedAstronaut.name.split(' ')[0]})
                  </h3>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">
                      Prescribe Countermeasure / Note
                    </label>
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder={`Enter medical note for ${selectedAstronaut.name}...`}
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                    >
                      <option value="Countermeasure">Countermeasure</option>
                      <option value="Medication">Medication</option>
                      <option value="Dietary">Dietary Adjustment</option>
                      <option value="Rest Window">Rest Window</option>
                    </select>

                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Log Entry
                    </button>
                  </div>
                </form>

                {/* Log History Scoped by Astronaut */}
                <div className="mt-5 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                    Recorded Notes for {selectedAstronaut.name}
                  </span>
                  {currentNotes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No clinical notes recorded yet.</p>
                  ) : (
                    currentNotes.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-blue-700 text-[10px] bg-blue-100/60 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{item.note}</p>
                        <span className="block text-[10px] text-slate-400 mt-1">— {item.author}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Real-Time Alert Triage Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-base">Real-Time Alert Triage Feed</h3>
                <span className="px-2 py-0.5 text-xs bg-slate-100 font-bold rounded-full text-slate-600">
                  {filteredAlerts.length} Active
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                {(['ALL', 'CRITICAL', 'WARNING'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAlertFilter(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      alertFilter === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded mt-0.5 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{alert.description}</p>
                      <span className="text-[10px] text-slate-400">{alert.timestamp} · Astronaut ID: {alert.astronautId}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition self-end sm:self-center shadow-sm flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resolve Alert
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Analysis Modal */}
      {activeSignal && (
        <AnalysisModal
          signal={activeSignal}
          isOpen={!!activeSignal}
          onClose={() => setActiveSignal(null)}
        />
      )}
    </div>
  );
}