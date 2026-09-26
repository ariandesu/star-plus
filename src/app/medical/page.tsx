'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeaderBar from '../../components/HeaderBar';
import AnalysisModal from '../../components/AnalysisModal';
import GlobalSearchModal from '../../components/GlobalSearchModal';
import NotificationModal from '../../components/NotificationModal';
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
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function FlightMedicalOfficerDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState('maya-chen');
  const [activeSignal, setActiveSignal] = useState<AnalysisSignal | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Local state for alert triage feed
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
      {/* Sidebar with Mobile Drawer */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <HeaderBar
          session={session}
          pageTitle="Flight Medical Officer Portal"
          selectedAstronautId={selectedAstronautId}
          onAstronautChange={(id) => setSelectedAstronautId(id)}
          onSearchClick={() => setIsSearchOpen(true)}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto pb-12">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-700 rounded-full tracking-wider uppercase">
                  FMO ACTIVE CLINICAL MONITORING
                </span>
                <span className="text-xs text-slate-500 font-bold">AURORA-1 Deep Space Mission</span>
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
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/20 transition cursor-pointer"
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
              const hr = member.currentVitals?.heartRate ?? member.baseline.heartRate;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedAstronautId(member.id)}
                  className={`p-5 rounded-3xl bg-white/80 backdrop-blur-md border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-white'
                      : 'border-slate-200/60 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{member.name}</h4>
                        <span className="text-[10px] text-slate-500 font-bold">{member.role}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      member.status === 'WATCH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Heart Rate</span>
                      <span className="font-black text-slate-900 text-sm">{hr} <span className="text-[10px] font-bold text-slate-400">bpm</span></span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">SpO₂ Level</span>
                      <span className="font-black text-slate-900 text-sm">98%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Notes & Prescriber Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Scoped Clinical Notes Form */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Clinical Notes & Diagnostics</h3>
                  <p className="text-xs text-slate-500">Record medical observations for {selectedAstronaut.name}.</p>
                </div>
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>

              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={`Type clinical note or medical directive for ${selectedAstronaut.name}...`}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="Countermeasure">Countermeasure</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Medication">Medication</option>
                    <option value="Nutrition">Nutrition</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">History for {selectedAstronaut.name}</span>
                {currentNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
                ) : (
                  currentNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-extrabold">{note.category}</span>
                        <span>{note.timestamp}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{note.note}</p>
                      <span className="text-[10px] text-slate-400 block font-semibold">— {note.author}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Alert Triage List */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black text-slate-900">Real-Time Alert Feed</h3>
                </div>

                <div className="flex items-center gap-1">
                  {(['ALL', 'CRITICAL', 'WARNING'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAlertFilter(filter)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition ${
                        alertFilter === filter
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-50/80 border-rose-200' : 'bg-amber-50/80 border-amber-200'
                    }`}
                  >
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1">{alert.description}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">{alert.timestamp} • Astronaut: {alert.astronautId}</span>
                    </div>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
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
