'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeaderBar from '../../components/HeaderBar';
import AnalysisModal from '../../components/AnalysisModal';
import MetricDetailModal from '../../components/MetricDetailModal';
import GlobalSearchModal from '../../components/GlobalSearchModal';
import NotificationModal from '../../components/NotificationModal';
import { MOCK_ASTRONAUTS, MOCK_ALERTS, MAYA_ANALYSIS_SIGNAL } from '../../data/mockData';
import { authService } from '../../services/authService';
import { DataAdapterService, NormalizedAstronautRecord } from '../../services/dataAdapterService';
import { TestRunnerService, TestSuiteReport } from '../../services/testRunnerService';
import { 
  AlertTriangle, ShieldCheck, Stethoscope, Search, Bell, CheckCircle2, 
  Activity, Heart, Moon, Zap, User, RefreshCw, ChevronRight, FileSpreadsheet, PlayCircle, Filter
} from 'lucide-react';

export default function MedicalPage() {
  const [session, setSession] = useState<any>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('maya-chen');
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [clinicalNotes, setClinicalNotes] = useState<Record<string, string>>({
    'maya-chen': 'Patient experiencing elevated HRV stress recovery flags during Sleep Phase 3. Recommending rest window shift.'
  });
  const [newNote, setNewNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dataset A state (1000 research records)
  const [datasetRecords, setDatasetRecords] = useState<NormalizedAstronautRecord[]>([]);
  const [datasetFilter, setDatasetFilter] = useState<'ALL' | 'WATCH' | 'CRITICAL' | 'NOMINAL'>('ALL');
  const [datasetSearch, setDatasetSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'CLINICAL' | 'DATASET' | 'TEST_SUITE'>('CLINICAL');

  // QA Test suite results (Dataset B)
  const [qaReport, setQaReport] = useState<TestSuiteReport | null>(null);

  // Modal states
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const s = authService.getSession();
    setSession(s);
    setDatasetRecords(DataAdapterService.getNormalizedAstronautRecords());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', acknowledgedBy: session?.username || 'Flight Medical Officer' } : a));
    showToast(`Alert #${alertId} acknowledged by Flight Medical Officer.`);
  };

  const handleInvestigateAlert = (alertId: string) => {
    setIsAnalysisOpen(true);
    showToast(`Opening clinical biomarker signal analysis for Alert #${alertId}`);
  };

  const handleCreateIntervention = (alertId: string) => {
    showToast(`Intervention created for Alert #${alertId}. Notification dispatched to Commander.`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setClinicalNotes(prev => ({
      ...prev,
      [selectedAstronautId]: `${prev[selectedAstronautId] || ''}\n[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${newNote}`
    }));
    setNewNote('');
    showToast('Clinical note logged securely.');
  };

  const handleRunQaTestSuite = () => {
    const report = TestRunnerService.runTestSuite();
    setQaReport(report);
    setActiveTab('TEST_SUITE');
    showToast(`QA Test Suite executed: ${report.passedCount}/${report.totalScenarios} scenarios matched.`);
  };

  const selectedAstronaut = MOCK_ASTRONAUTS.find(a => a.id === selectedAstronautId) || MOCK_ASTRONAUTS[0];
  const stats = DataAdapterService.getDatasetStatistics();

  const filteredRecords = datasetRecords.filter(r => {
    const matchesFilter = datasetFilter === 'ALL' || r.status === datasetFilter;
    const matchesSearch = r.astronautId.toLowerCase().includes(datasetSearch.toLowerCase()) || 
                          r.symptom.toLowerCase().includes(datasetSearch.toLowerCase()) ||
                          r.name.toLowerCase().includes(datasetSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#F4F7FC] text-slate-800 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HeaderBar 
          onSearchClick={() => setIsSearchOpen(true)}
          onNotificationClick={() => setIsNotificationsOpen(true)}
          selectedAstronautId={selectedAstronautId}
          onAstronautChange={setSelectedAstronautId}
        />

        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-semibold border border-slate-700 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100/60 shadow-sm">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 tracking-wider">
                  FLIGHT MEDICAL OFFICER DASHBOARD
                </span>
                <span className="text-xs text-slate-400 font-medium">• AURORA-1 (Synthetic Demonstration)</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Crew Clinical Surveillance & Decision Support</h1>
              <p className="text-xs text-slate-500 mt-0.5">Biomarker baseline tracking, reactive triage, and Dataset QA verification.</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('CLINICAL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'CLINICAL' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Clinical Triage
              </button>
              <button
                onClick={() => setActiveTab('DATASET')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'DATASET' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>1,000 Records Dataset</span>
              </button>
              <button
                onClick={handleRunQaTestSuite}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'TEST_SUITE' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Run QA Suite (Dataset B)</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] font-bold text-slate-500 text-center py-1">
            ⚠️ Demo environment using synthetic space mission dataset. Not a medical diagnostic system.
          </p>

          {/* TAB 1: CLINICAL TRIAGE */}
          {activeTab === 'CLINICAL' && (
            <div className="space-y-6">
              {/* Alert Feed */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-bold text-slate-900">Active Alert Triage Feed</h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{alerts.length} Total Alerts</span>
                </div>

                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        alert.severity === 'CRITICAL' ? 'bg-amber-50/50 border-amber-200/60' : 'bg-slate-50/50 border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          alert.severity === 'CRITICAL' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">{alert.astronautName}</span>
                            <span className="text-[10px] text-slate-400">• {alert.timestamp}</span>
                            {alert.status === 'ACKNOWLEDGED' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800">
                                ACKNOWLEDGED BY MEDICAL
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-1">{alert.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{alert.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                        {alert.status !== 'ACKNOWLEDGED' && (
                          <button 
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-sm"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button 
                          onClick={() => handleInvestigateAlert(alert.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20"
                        >
                          Investigate Signal
                        </button>
                        <button 
                          onClick={() => handleCreateIntervention(alert.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20"
                        >
                          Create Intervention
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Astronaut Overview & Clinical Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100/60 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">PATIENT SURVEILLANCE</span>
                      <h2 className="text-lg font-bold text-slate-900">{selectedAstronaut.name} ({selectedAstronaut.role})</h2>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedAstronaut.status === 'WATCH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      STATUS: {selectedAstronaut.status}
                    </span>
                  </div>

                  {/* Why Flagged Trigger */}
                  {selectedAstronaut.status === 'WATCH' && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">Multi-System Physiological WATCH Signal Active</p>
                          <p className="text-[11px] text-amber-700">Sleep disruption (-19%) paired with elevated HRV stress recovery flags.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsAnalysisOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shrink-0"
                      >
                        Why was this flagged?
                      </button>
                    </div>
                  )}

                  {/* Vitals baseline breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400">SLEEP DURATION</span>
                      <p className="text-lg font-bold text-slate-900 mt-1">4.8h <span className="text-xs font-medium text-slate-400">/ 7.5h baseline</span></p>
                      <span className="text-[10px] font-bold text-amber-600">-19% deviation</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400">RESTING HEART RATE</span>
                      <p className="text-lg font-bold text-slate-900 mt-1">65 bpm <span className="text-xs font-medium text-slate-400">/ 60 bpm baseline</span></p>
                      <span className="text-[10px] font-bold text-amber-600">+8% deviation</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400">EXERCISE SCORE</span>
                      <p className="text-lg font-bold text-slate-900 mt-1">82 <span className="text-xs font-medium text-slate-400">/ 92 baseline</span></p>
                      <span className="text-[10px] font-bold text-amber-600">-11% deviation</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400">REACTION TIME</span>
                      <p className="text-lg font-bold text-slate-900 mt-1">229 ms <span className="text-xs font-medium text-slate-400">/ 210 ms baseline</span></p>
                      <span className="text-[10px] font-bold text-amber-600">+9% deviation</span>
                    </div>
                  </div>
                </div>

                {/* Scoped Clinical Notes */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100/60 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Clinical Notes ({selectedAstronaut.name})</h3>
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {clinicalNotes[selectedAstronautId] || 'No notes logged yet.'}
                    </div>
                  </div>

                  <form onSubmit={handleAddNote} className="mt-4 space-y-2">
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Log medical observation or protocol note..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      rows={3}
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                    >
                      Log Clinical Note
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATASET A (1,000 RESEARCH RECORDS) */}
          {activeTab === 'DATASET' && (
            <div className="space-y-6">
              {/* Dataset Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100/60 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">TOTAL RECORDS</span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalRecords}</p>
                  <span className="text-[10px] font-semibold text-slate-500">{stats.provenanceDisclaimer}</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100/60 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-600">NOMINAL CREW</span>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.nominalCount}</p>
                  <span className="text-[10px] font-semibold text-slate-500">Normal biomarker parameters</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100/60 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase text-amber-600">WATCH CREW</span>
                  <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.watchCount}</p>
                  <span className="text-[10px] font-semibold text-slate-500">Requires monitoring</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100/60 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase text-rose-600">CRITICAL CREW</span>
                  <p className="text-2xl font-extrabold text-rose-700 mt-1">{stats.criticalCount}</p>
                  <span className="text-[10px] font-semibold text-slate-500">High physiological stress</span>
                </div>
              </div>

              {/* Dataset Search & Filter Bar */}
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={datasetSearch}
                    onChange={e => setDatasetSearch(e.target.value)}
                    placeholder="Search by ID, name, or symptom..."
                    className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400">Status Filter:</span>
                  {(['ALL', 'WATCH', 'CRITICAL', 'NOMINAL'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setDatasetFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        datasetFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 sticky top-0 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Astronaut ID</th>
                        <th className="py-3 px-4">Age / Days</th>
                        <th className="py-3 px-4">Heart Rate</th>
                        <th className="py-3 px-4">Blood Pressure</th>
                        <th className="py-3 px-4">Bone Density</th>
                        <th className="py-3 px-4">Sleep Hours</th>
                        <th className="py-3 px-4">Symptom</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.slice(0, 50).map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">{r.id}</td>
                          <td className="py-3 px-4 text-slate-600">{r.age} yrs / {r.missionDays}d</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{r.heartRate} bpm</td>
                          <td className="py-3 px-4 text-slate-600">{r.bloodPressure}</td>
                          <td className="py-3 px-4 text-slate-600">{r.boneDensity} g/cm²</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{r.sleepHours} h</td>
                          <td className="py-3 px-4 text-slate-600">{r.symptom}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              r.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                              r.status === 'WATCH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
                  Showing top 50 of {filteredRecords.length} filtered research records (total 1,000 records loaded).
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATASET B QA TEST SUITE */}
          {activeTab === 'TEST_SUITE' && qaReport && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Dataset B — Automated QA Test Suite Report</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Evaluating 10 explicit test scenario records against STAR PLUS rule engine.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">PASSED MATCHES</span>
                    <p className="text-xl font-extrabold text-emerald-600">{qaReport.passedCount} / {qaReport.totalScenarios}</p>
                  </div>
                  <button
                    onClick={handleRunQaTestSuite}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                  >
                    Re-run Test Suite
                  </button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Scenario ID</th>
                      <th className="py-3 px-4">Astronaut Name</th>
                      <th className="py-3 px-4">Vitals & Symptom</th>
                      <th className="py-3 px-4">Expected Recommendation</th>
                      <th className="py-3 px-4">Generated Logic Output</th>
                      <th className="py-3 px-4">QA Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {qaReport.results.map(r => (
                      <tr key={r.scenarioId} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{r.scenarioId}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{r.astronautName}</td>
                        <td className="py-3 px-4 text-slate-600">{r.sleepHours}h sleep • {r.heartRate} bpm • {r.symptom}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{r.expectedOutcome}</td>
                        <td className="py-3 px-4 font-medium text-blue-700">{r.generatedRecommendation}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            r.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnalysisModal 
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        signal={MAYA_ANALYSIS_SIGNAL}
      />
      <MetricDetailModal 
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
        metric={selectedMetric}
      />
      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <NotificationModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
