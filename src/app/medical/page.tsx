'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeaderBar from '../../components/HeaderBar';
import AnalysisModal from '../../components/AnalysisModal';
import MetricDetailModal from '../../components/MetricDetailModal';
import { healthService } from '../../services/healthService';
import { alertService } from '../../services/alertService';
import { analysisService } from '../../services/analysisService';
import { authService } from '../../services/authService';
import { Astronaut, HealthMetricDetail, AlertItem, AnalysisSignal, UserSession } from '../../types';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Activity,
  FileText,
  CheckCircle2,
  TrendingUp,
  Search,
  Plus,
  Shield,
  Clock,
  Send
} from 'lucide-react';

export default function MedicalDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('ast-01');
  const [activeSignal, setActiveSignal] = useState<AnalysisSignal | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [noteText, setNoteText] = useState('');
  const [notesHistory, setNotesHistory] = useState<Array<{ id: string; author: string; time: string; text: string }>>([
    { id: '1', author: 'Dr. Marcus Vance', time: '10:15 UTC', text: 'Prescribed rest protocol for Maya Chen following elevated 72h HR trend.' },
    { id: '2', author: 'Dr. Marcus Vance', time: 'Yesterday', text: 'Baseline vital assessment complete for all crew members. All nominal.' }
  ]);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  useEffect(() => {
    const s = authService.getSession();
    if (s) setSession(s);
  }, []);

  const crew = healthService.getAstronauts();
  const alerts = alertService.getAlerts();
  const selectedAstronaut = crew.find(a => a.id === selectedAstronautId) || crew[0];

  const handleOpenSignal = (astId: string) => {
    const signal = analysisService.getAnalysisSignal(astId);
    if (signal) {
      setActiveSignal(signal);
    }
  };

  const handleAddClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotesHistory([
      {
        id: Date.now().toString(),
        author: session?.name || 'Dr. Marcus Vance',
        time: 'Just now',
        text: noteText.trim()
      },
      ...notesHistory
    ]);
    setNoteText('');
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="flex h-screen bg-[#F4F7FC] text-slate-900 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar session={session} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <HeaderBar session={session} pageTitle="Flight Medical Officer (FMO) Clinical Dashboard" />

        <main className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Top Welcome Banner */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700">
                  FLIGHT MEDICAL OFFICER
                </span>
                <span className="text-xs font-bold text-slate-400">AURORA-1 Mission</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Clinical Crew Health Command & Protocol Triage
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-astronaut baseline deviation diagnostics, risk matrix triage, and direct prescription interventions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenSignal(selectedAstronautId)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open Diagnostic Signal ({selectedAstronaut.name})</span>
              </button>
            </div>
          </div>

          {/* Top Crew Overview Cards (4 Astronaut Panels) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {crew.map((ast) => {
              const isSelected = ast.id === selectedAstronautId;
              const score = ast.status === 'STABLE' ? 88 : ast.status === 'WATCH' ? 74 : 65;
              const hr = ast.currentVitals?.heartRate || ast.baseline.heartRate;

              return (
                <div
                  key={ast.id}
                  onClick={() => setSelectedAstronautId(ast.id)}
                  className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition flex flex-col justify-between ${
                    isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {ast.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ast.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{ast.role}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      ast.status === 'STABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {ast.status}
                    </span>
                  </div>

                  <div className="my-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Health Score</span>
                      <div className="text-2xl font-extrabold text-slate-900">{score} <span className="text-xs font-semibold text-slate-400">/ 100</span></div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Heart Rate</span>
                      <div className="text-sm font-bold text-slate-700">{hr} bpm</div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Middle Section: Crew Risk Matrix & Clinical Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Crew Risk Matrix & Baseline Deviation Table (2 Span) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Crew Baseline Risk Matrix</h3>
                  <p className="text-xs text-slate-500">Live multi-biomarker deviation tracking</p>
                </div>
                <span className="text-xs text-slate-400 font-semibold">4 Active Crew Members</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Astronaut</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Health Score</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Primary Flag</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {crew.map((ast) => {
                      const score = ast.status === 'STABLE' ? 88 : ast.status === 'WATCH' ? 74 : 65;
                      return (
                        <tr key={ast.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3 font-bold text-slate-900">{ast.name}</td>
                          <td className="p-3 text-slate-500">{ast.role}</td>
                          <td className="p-3 font-extrabold text-slate-900">{score}/100</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              ast.status === 'STABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {ast.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">
                            {ast.status === 'STABLE' ? 'None (Baseline Stable)' : 'Elevated HR & Reduced Sleep Load'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleOpenSignal(ast.id)}
                              className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition text-[11px]"
                            >
                              Inspect Signal
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Flight Medical Officer Clinical Notes & Protocol Manager (1 Span) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Clinical Notes — {selectedAstronaut.name}</h3>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>

              {/* Add Clinical Note Form */}
              <form onSubmit={handleAddClinicalNote} className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={`Write clinical note for ${selectedAstronaut.name}...`}
                  className="w-full h-24 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Medical Entry</span>
                </button>
              </form>

              {/* Notes History */}
              <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Medical Log History</span>
                {notesHistory.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700">{note.author}</span>
                      <span>{note.time}</span>
                    </div>
                    <p className="text-slate-700">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Alert Triage Feed Section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real-Time Alert Triage Feed</h3>
                <p className="text-xs text-slate-500">Clinical alerts generated by continuous vital monitoring</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      filterSeverity === sev ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-white font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500' : alert.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{alert.astronautName || alert.title}</span>
                        <span className="text-[10px] text-slate-400">• {alert.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{alert.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alertService.resolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition"
                    >
                      Resolve Alert
                    </button>
                  </div>
                </div>
              ))}
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
