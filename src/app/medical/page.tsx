'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TopHeader from '@/components/TopHeader';
import RouteGuard from '@/components/RouteGuard';
import AnalysisModal from '@/components/AnalysisModal';
import MetricDetailModal from '@/components/MetricDetailModal';
import DoctorHealthOverviewCard from '@/components/DoctorHealthOverviewCard';
import MedicalNasaMlAnalyticsCard from '@/components/MedicalNasaMlAnalyticsCard';
import type { OrganSystemKey } from '@/services/organHealthService';
import { ORGAN_SYSTEM_ACCENT } from '@/services/organHealthService';

const AnatomicalOrganViewer = dynamic(
  () => import('@/components/three/AnatomicalOrganViewer'),
  { ssr: false }
);
import { MOCK_ASTRONAUTS, MOCK_ALERTS, MAYA_ANALYSIS_SIGNAL } from '../../data/mockData';
import { authService } from '../../services/authService';
import { analysisService } from '../../services/analysisService';
import { DataAdapterService, NormalizedAstronautRecord } from '../../services/dataAdapterService';
import { TestRunnerService, TestSuiteReport } from '../../services/testRunnerService';
import { 
  AlertTriangle, ShieldCheck, Stethoscope, Search, Bell, CheckCircle2, 
  Activity, Heart, Moon, Zap, User, RefreshCw, ChevronRight, FileSpreadsheet, PlayCircle, Filter,
  ArrowUpRight, Sparkles, FileText, Check
} from 'lucide-react';

export default function MedicalPage() {
  const [session, setSession] = useState<any>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('maya-chen');
  const [selectedSystem, setSelectedSystem] = useState<OrganSystemKey>('CARDIOVASCULAR');
  const [timeHorizon, setTimeHorizon] = useState<'24H' | '7D' | '30D'>('24H');
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

  const handleRunQaSuite = () => {
    const report = TestRunnerService.runTestSuite();
    setQaReport(report);
    setActiveTab('TEST_SUITE');
    showToast(`QA Test Suite Completed: ${report.passedCount}/${report.totalScenarios} Scenarios Passed.`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setClinicalNotes(prev => ({
      ...prev,
      [selectedAstronautId]: `${prev[selectedAstronautId] ? prev[selectedAstronautId] + '\n\n' : ''}[${new Date().toLocaleTimeString()}] ${newNote}`
    }));
    setNewNote('');
    showToast('Clinical note logged successfully.');
  };

  const currentAstronaut = MOCK_ASTRONAUTS.find(a => a.id === selectedAstronautId) || MOCK_ASTRONAUTS[0];

  const filteredDataset = datasetRecords.filter(r => {
    if (datasetFilter !== 'ALL' && r.status !== datasetFilter) return false;
    if (datasetSearch.trim()) {
      const q = datasetSearch.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.symptom.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <RouteGuard allow={['medical']}>
      <div className="min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col">
      
      {/* Top Header matching reference layout */}
      <TopHeader
        session={session}
        greeting="Flight Medical Officer Command"
        subtitle="AURORA-1 Crew Health Surveillance & Decision Support"
        selectedAstronautId={selectedAstronautId}
        onAstronautChange={(id) => setSelectedAstronautId(id)}
        selectedTimeHorizon={timeHorizon}
        onTimeHorizonChange={(h) => setTimeHorizon(h)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Layout (40/60 Asymmetrical Composition) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs (Clinical Overview, 1,000 Records Explorer, QA Suite) */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('CLINICAL')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition ${
                activeTab === 'CLINICAL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              Crew Clinical Surveillance
            </button>
            <button
              onClick={() => setActiveTab('DATASET')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                activeTab === 'DATASET'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Research Dataset (1,000 Records)</span>
            </button>
            <button
              onClick={handleRunQaSuite}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                activeTab === 'TEST_SUITE'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>QA Test Suite (Dataset B)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>4 Crew Members Active</span>
          </div>
        </div>

        {activeTab === 'CLINICAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================= */}
            {/* LEFT COLUMN (~40% desktop, 5 cols out of 12)             */}
            {/* Three.js 3D Visual Centerpiece, Roster & System Selectors */}
            {/* ========================================================= */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Real reference-organ anatomy viewer (HRA / BodyParts3D) */}
              <div className="h-[520px] min-h-[420px]">
                <AnatomicalOrganViewer
                  system={selectedSystem}
                  onSelectSystem={setSelectedSystem}
                  accent={ORGAN_SYSTEM_ACCENT[selectedSystem]}
                />
              </div>

              {/* All Astronauts Health Overview Doctor Guide Card */}
              <DoctorHealthOverviewCard />

              {/* NASA OSDR Biological Health Analytics Card */}
              <MedicalNasaMlAnalyticsCard />

              {/* Crew Roster Quick Target Selector */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Active Astronaut Target
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {MOCK_ASTRONAUTS.map((a) => {
                    const isSelected = selectedAstronautId === a.id;
                    const isWatch = a.status === 'WATCH';

                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAstronautId(a.id)}
                        className={`p-3 rounded-2xl border transition text-left flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">{a.name}</span>
                          <span className={`w-2 h-2 rounded-full ${isWatch ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold mt-1">{a.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ========================================================= */}
            {/* RIGHT COLUMN (~60% desktop, 7 cols out of 12)            */}
            {/* Medical Analysis, Clinical Notes & Alert Triage Feed      */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Upper Right: Medical Analysis & AI Explainability Panel */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        currentAstronaut.status === 'WATCH' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        STATUS: {currentAstronaut.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">Target: {currentAstronaut.name}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                      Multi-System Physiological Deviation Matrix
                    </h2>
                  </div>

                  {selectedAstronautId === 'maya-chen' && (
                    <button
                      onClick={() => setIsAnalysisOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Why was this flagged?</span>
                    </button>
                  )}
                </div>

                {/* Baseline Deviation Matrix Table */}
                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-3">BIOMARKER</th>
                        <th className="py-2.5 px-3">CURRENT VALUE</th>
                        <th className="py-2.5 px-3">MISSION BASELINE</th>
                        <th className="py-2.5 px-3">DEVIATION</th>
                        <th className="py-2.5 px-3 text-right">EVALUATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">Resting Heart Rate</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{selectedAstronautId === 'maya-chen' ? '65 bpm' : '60 bpm'}</td>
                        <td className="py-3 px-3 text-slate-500">60 bpm</td>
                        <td className="py-3 px-3 font-bold text-amber-600">+8.3%</td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">WATCH</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">Sleep Duration (24H)</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{selectedAstronautId === 'maya-chen' ? '4.8 hours' : '7.5 hours'}</td>
                        <td className="py-3 px-3 text-slate-500">7.5 hours</td>
                        <td className="py-3 px-3 font-bold text-amber-600">-19.2%</td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">DEFICIT</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">Blood Oxygen (SpO2)</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">98%</td>
                        <td className="py-3 px-3 text-slate-500">98%</td>
                        <td className="py-3 px-3 font-bold text-emerald-600">0.0%</td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">NOMINAL</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Middle Right: Clinical Notes Logger */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Clinical Notes — {currentAstronaut.name}</span>
                  </h3>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-[120px] overflow-y-auto">
                  {clinicalNotes[selectedAstronautId] || 'No active notes logged for this astronaut.'}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={`Log clinical recommendation for ${currentAstronaut.name}...`}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Bottom Right: Alert Triage Feed */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Real-Time Alert Triage Feed</span>
                </h3>

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            alert.severity === 'CRITICAL' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {alert.status === 'ACKNOWLEDGED' ? (
                          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            ✓ ACKNOWLEDGED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 1,000 Records Research Dataset View */}
        {activeTab === 'DATASET' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Research Astronaut Dataset (1,000 Records)</h2>
                <p className="text-xs text-slate-500">Normalized health telemetry dataset for Space Apps statistical analysis.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={datasetSearch}
                  onChange={(e) => setDatasetSearch(e.target.value)}
                  placeholder="Search ID, Name, Symptom..."
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="border-b border-slate-200 text-slate-400 font-bold">
                    <th className="py-2.5 px-3">ASTRONAUT ID</th>
                    <th className="py-2.5 px-3">NAME</th>
                    <th className="py-2.5 px-3">AGE</th>
                    <th className="py-2.5 px-3">MISSION DAYS</th>
                    <th className="py-2.5 px-3">HEART RATE</th>
                    <th className="py-2.5 px-3">BLOOD PRESSURE</th>
                    <th className="py-2.5 px-3">PRIMARY SYMPTOM</th>
                    <th className="py-2.5 px-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredDataset.slice(0, 50).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-blue-600">{r.id}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{r.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.age}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.missionDays}d</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{r.heartRate} bpm</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.bloodPressure}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{r.symptom}</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
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
          </div>
        )}

        {/* QA Test Suite (Dataset B) View */}
        {activeTab === 'TEST_SUITE' && qaReport && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Dataset B QA Evaluation Report</h2>
                <p className="text-xs text-slate-500">Automated decision support accuracy evaluation against 10 test case scenarios.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-emerald-600">
                  {qaReport.passedCount} / {qaReport.totalScenarios} PASSED
                </span>
                <button
                  onClick={handleRunQaSuite}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-run Test Suite</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {qaReport.results.map((res) => (
                <div key={res.scenarioId} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{res.scenarioId}: {res.astronautName}</span>
                      <span className="text-xs text-slate-500">({res.heartRate} bpm, {res.sleepHours}h sleep)</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Outcome: <strong className="text-slate-900">{res.generatedRecommendation}</strong></p>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                    res.status === 'PASS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800'
                  }`}>
                    {res.status === 'PASS' ? '✓ PASSED' : '❌ DISCREPANCY'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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

    </RouteGuard>
  );
}
