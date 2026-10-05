'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import TopHeader from '@/components/TopHeader';
import RouteGuard from '@/components/RouteGuard';
import AnalysisModal from '@/components/AnalysisModal';
import MetricDetailModal from '@/components/MetricDetailModal';
import DoctorHealthOverviewCard from '@/components/DoctorHealthOverviewCard';
import type { OrganSystemKey } from '@/services/organHealthService';
import { ORGAN_SYSTEM_ACCENT } from '@/services/organHealthService';
import gsap from 'gsap';

const AnatomicalOrganViewer = dynamic(
  () => import('@/components/three/AnatomicalOrganViewer'),
  { ssr: false }
);

import { MOCK_ASTRONAUTS, MOCK_ALERTS } from '../../data/mockData';
import { authService } from '../../services/authService';
import { analysisService } from '../../services/analysisService';
import { DataAdapterService, NormalizedAstronautRecord } from '../../services/dataAdapterService';
import { TestRunnerService, TestSuiteReport } from '../../services/testRunnerService';
import { 
  AlertTriangle, CheckCircle2, 
  Activity, Heart, Moon, Zap, User, RefreshCw, ChevronRight, FileSpreadsheet, PlayCircle, Filter,
  Sparkles, FileText, Check, Clock, ShieldCheck, Flame, Table, Beaker,
  ExternalLink, Download, Database, BrainCircuit, Info, Layers, ChevronDown, Award, Search
} from 'lucide-react';
import { 
  NASA_MASTER_BIOMARKER_DATASET, 
  NASA_OSDR_SOURCES, 
  RANDOM_FOREST_FEATURE_IMPORTANCE,
  NasaBiomarkerRecord
} from '@/data/nasaMasterBiomarkerDataset';

const CREW_DETAILS = [
  {
    id: 'maya-chen',
    name: 'CDR Maya Chen',
    role: 'Commander / Pilot',
    day: 147,
    hr: '74 BPM',
    bp: '122 mmHg',
    sleepScore: '93%',
    sleepHours: '4.8 h',
    status: 'WATCH' as const,
    alertCount: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'alex-carter',
    name: 'Dr. Alex Carter',
    role: 'Flight Engineer',
    day: 142,
    hr: '68 BPM',
    bp: '118 mmHg',
    sleepScore: '99%',
    sleepHours: '6.2 h',
    status: 'STABLE' as const,
    alertCount: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'ryan-patel',
    name: 'Lt. Ryan Patel',
    role: 'Payload Specialist',
    day: 139,
    hr: '76 BPM',
    bp: '120 mmHg',
    sleepScore: '98%',
    sleepHours: '5.1 h',
    status: 'WATCH' as const,
    alertCount: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'lina-park',
    name: 'Dr. Lina Park',
    role: 'Geology & Habitat Specialist',
    day: 135,
    hr: '70 BPM',
    bp: '116 mmHg',
    sleepScore: '99%',
    sleepHours: '6.8 h',
    status: 'STABLE' as const,
    alertCount: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
];

export default function MedicalPage() {
  const [session, setSession] = useState<any>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('maya-chen');
  const [selectedSystem, setSelectedSystem] = useState<OrganSystemKey>('CARDIOVASCULAR');
  const [timeHorizon, setTimeHorizon] = useState<'24H' | '7D' | '30D'>('24H');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WATCH' | 'STABLE'>('ALL');
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [clinicalNotes, setClinicalNotes] = useState<Record<string, string>>({
    'maya-chen': 'Patient experiencing elevated HRV stress recovery flags during Sleep Phase 3. Recommending rest window shift.',
    'alex-carter': 'Vitals stable. Continuing nominal exercise protocol on ARED countermeasure device.',
    'ryan-patel': 'Slight elevation in resting heart rate post EVA-2. Monitoring hydration and electrolyte balance.',
    'lina-park': 'All biomarkers nominal. Full compliance with sleep schedule and cognitive readiness tests.'
  });
  const [newNote, setNewNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dataset A state (1000 research records)
  const [datasetRecords, setDatasetRecords] = useState<NormalizedAstronautRecord[]>([]);
  // NASA OSDR Dataset explorer state
  const [nasaSubjectFilter, setNasaSubjectFilter] = useState<'ALL' | 'C001' | 'C002' | 'C003' | 'C004'>('ALL');
  const [nasaPhaseFilter, setNasaPhaseFilter] = useState<'ALL' | 'PRE_FLIGHT' | 'POST_FLIGHT'>('ALL');
  const [nasaTimepointFilter, setNasaTimepointFilter] = useState<string>('ALL');
  const [nasaPanelTab, setNasaPanelTab] = useState<'OVERVIEW' | 'CMP' | 'CARDIO' | 'IMMUNE' | 'URINE' | 'ALL_FEATURES'>('OVERVIEW');
  const [nasaSearch, setNasaSearch] = useState('');
  const [datasetFilter, setDatasetFilter] = useState<'ALL' | 'WATCH' | 'CRITICAL' | 'NOMINAL'>('ALL');
  const [datasetSearch, setDatasetSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'CLINICAL' | 'DATASET' | 'TEST_SUITE'>('CLINICAL');

  // QA Test suite results (Dataset B)
  const [qaReport, setQaReport] = useState<TestSuiteReport | null>(null);

  // Modal states
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any | null>(null);

  // Animation Refs
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = authService.getSession();
    setSession(s);
    setDatasetRecords(DataAdapterService.getNormalizedAstronautRecords());
  }, []);

  // GSAP Entrance animation for Left and Right columns
  useEffect(() => {
    if (activeTab === 'CLINICAL') {
      const ctx = gsap.context(() => {
        if (leftColRef.current) {
          gsap.fromTo(
            leftColRef.current,
            { opacity: 0, x: -18 },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
          );
        }
        if (rightColRef.current) {
          gsap.fromTo(
            rightColRef.current,
            { opacity: 0, x: 18 },
            { opacity: 1, x: 0, duration: 0.6, delay: 0.1, ease: 'power3.out' }
          );
        }
      });
      return () => ctx.revert();
    }
  }, [activeTab]);

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
      [selectedAstronautId]: `${prev[selectedAstronautId] ? prev[selectedAstronautId] + '\n\n' : ''}[${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}] ${newNote}`
    }));
    setNewNote('');
    showToast('Clinical note logged successfully.');
  };

  const currentCrewItem = CREW_DETAILS.find(c => c.id === selectedAstronautId) || CREW_DETAILS[0];
  const _currentAstronaut = MOCK_ASTRONAUTS.find(a => a.id === selectedAstronautId) || MOCK_ASTRONAUTS[0];

  const filteredCrew = CREW_DETAILS.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const filteredDataset = datasetRecords.filter(r => {
    if (datasetFilter !== 'ALL' && r.status !== datasetFilter) return false;
    if (datasetSearch.trim()) {
      const q = datasetSearch.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.symptom.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMouseEnterCard = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { y: -2, duration: 0.2, ease: 'power2.out' });
  };

  const handleMouseLeaveCard = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: 'power2.out' });
  };

  return (
    <RouteGuard allow={['medical']}>
      <div className="min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col">
      
      {/* Top Header */}
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
        <div className="fixed top-20 right-6 z-50 bg-[#007AFF] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-blue-400/40 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/95 backdrop-blur-xl p-3 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('CLINICAL')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'CLINICAL'
                  ? 'bg-[#0066FF] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Crew Clinical Surveillance</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DATASET')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'DATASET'
                  ? 'bg-[#0066FF] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>NASA ML Research Dataset (OSDR Biomarkers)</span>
            </button>
            <button
              type="button"
              onClick={handleRunQaSuite}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'TEST_SUITE'
                  ? 'bg-[#0066FF] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <Beaker className="w-4 h-4" />
              <span>QA Test Suite (Dataset B)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <span>4 Crew Members Active</span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>Mission MET: Day 147</span>
            </div>
          </div>
        </div>

        {activeTab === 'CLINICAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================= */}
            {/* LEFT COLUMN (~40% desktop, 5 cols out of 12)             */}
            {/* ========================================================= */}
            <div ref={leftColRef} className="lg:col-span-5 space-y-5">
              
              {/* A) 3D Anatomical Organ Viewer */}
              <div className="h-[520px] min-h-[420px]">
                <AnatomicalOrganViewer
                  system={selectedSystem}
                  onSelectSystem={setSelectedSystem}
                  accent={ORGAN_SYSTEM_ACCENT[selectedSystem]}
                />
              </div>

              {/* B) Doctor Health Overview Card (Mascot & Speech Bubble) */}
              <DoctorHealthOverviewCard />

              {/* C) Crew Members (4) Card */}
              <div
                onMouseEnter={handleMouseEnterCard}
                onMouseLeave={handleMouseLeaveCard}
                className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 transition-all"
              >
                {/* Header with User Icon & Filter Dropdown */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Crew Members (4)</span>
                  </h3>

                  <div className="flex items-center gap-1.5 bg-slate-100/90 px-2.5 py-1 rounded-xl border border-slate-200/60">
                    <Filter className="w-3 h-3 text-slate-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-[11px] font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Status</option>
                      <option value="WATCH">Watch Only</option>
                      <option value="STABLE">Stable Only</option>
                    </select>
                  </div>
                </div>

                {/* 4 Detailed Astronaut Rows */}
                <div className="space-y-2.5">
                  {filteredCrew.map((c) => {
                    const isSelected = selectedAstronautId === c.id;
                    const isWatch = c.status === 'WATCH';

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedAstronautId(c.id)}
                        className={`w-full p-3.5 rounded-2xl border transition-all text-left flex flex-col gap-2.5 ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#007AFF] shadow-xs ring-1 ring-[#007AFF]/40'
                            : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                        }`}
                      >
                        {/* Top Line: Avatar (36x36), Name & Role, Day Badge, Status Pill, Alert Count, ChevronRight */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={c.avatarUrl}
                              alt={c.name}
                              className="w-[36px] h-[36px] rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 leading-tight truncate">{c.name}</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">Day {c.day}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                {c.role}
                              </div>
                            </div>
                          </div>

                          {/* Right Badges: Status Pill, Alert Counter, Chevron */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                              isWatch ? 'bg-amber-100 text-amber-800 border border-amber-200/80' : 'bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                            }`}>
                              {c.status}
                            </span>
                            <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                              c.alertCount > 0 ? 'bg-rose-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {c.alertCount}
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#007AFF] translate-x-0.5' : 'text-slate-400'}`} />
                          </div>
                        </div>

                        {/* Inline Vitals Row */}
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200/60 text-[11px] font-semibold text-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-medium text-[10px]">HR:</span>
                            <span className="font-bold text-slate-900">{c.hr}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-medium text-[10px]">BP:</span>
                            <span className="font-bold text-slate-900">{c.bp}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-medium text-[10px]">Sleep:</span>
                            <span className="font-bold text-slate-900">{c.sleepScore} / {c.sleepHours}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ========================================================= */}
            {/* RIGHT COLUMN (~60% desktop, 7 cols out of 12)            */}
            {/* ========================================================= */}
            <div ref={rightColRef} className="lg:col-span-7 space-y-6">
              
              {/* A) Multi-System Physiological Deviation Matrix */}
              <div
                onMouseEnter={handleMouseEnterCard}
                onMouseLeave={handleMouseLeaveCard}
                className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 transition-all"
              >
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        currentCrewItem.status === 'WATCH' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        STATUS: {currentCrewItem.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">Target: {currentCrewItem.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                        NASA ML: {currentCrewItem.status === 'WATCH' ? 'POST_FLIGHT (88% CONF)' : 'PRE_FLIGHT (91% CONF)'}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                      Multi-System Physiological Deviation Matrix
                    </h2>
                  </div>

                  {selectedAstronautId === 'maya-chen' && (
                    <button
                      type="button"
                      onClick={() => setIsAnalysisOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ Why was this flagged?</span>
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
                        <td className="py-3 px-3 font-semibold text-slate-700">{currentCrewItem.hr}</td>
                        <td className="py-3 px-3 text-slate-500">60 bpm</td>
                        <td className={`py-3 px-3 font-bold ${currentCrewItem.status === 'WATCH' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {currentCrewItem.status === 'WATCH' ? '+23.3%' : '+3.3%'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentCrewItem.status === 'WATCH' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {currentCrewItem.status === 'WATCH' ? 'WATCH' : 'NOMINAL'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">Sleep Duration (24H)</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{currentCrewItem.sleepHours}</td>
                        <td className="py-3 px-3 text-slate-500">7.5 hours</td>
                        <td className={`py-3 px-3 font-bold ${currentCrewItem.status === 'WATCH' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {currentCrewItem.status === 'WATCH' ? '-36.0%' : '-17.3%'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentCrewItem.status === 'WATCH' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {currentCrewItem.status === 'WATCH' ? 'DEFICIT' : 'OPTIMAL'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">Blood Oxygen (SpO2)</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">98.2%</td>
                        <td className="py-3 px-3 text-slate-500">98.0%</td>
                        <td className="py-3 px-3 font-bold text-emerald-600">+0.2%</td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            STABLE
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">Cognitive Reaction Speed</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {currentCrewItem.status === 'WATCH' ? '242 ms' : '210 ms'}
                        </td>
                        <td className="py-3 px-3 text-slate-500">205 ms</td>
                        <td className={`py-3 px-3 font-bold ${currentCrewItem.status === 'WATCH' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {currentCrewItem.status === 'WATCH' ? '+18.0%' : '+2.4%'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentCrewItem.status === 'WATCH' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {currentCrewItem.status === 'WATCH' ? 'FATIGUE SLOW' : 'NOMINAL'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* B) Clinical Notes & Recommendations Log */}
              <div
                onMouseEnter={handleMouseEnterCard}
                onMouseLeave={handleMouseLeaveCard}
                className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#007AFF]" />
                    <span>Clinical Notes ({currentCrewItem.name})</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">CONFIDENTIAL MEDICAL LOG</span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-[120px] overflow-y-auto">
                  {clinicalNotes[selectedAstronautId] || 'No active notes logged for this astronaut.'}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                    placeholder={`Log clinical recommendation for ${currentCrewItem.name}...`}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-100/90 border border-slate-200/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* C) Real-Time Alert Triage Feed Card */}
              <div
                onMouseEnter={handleMouseEnterCard}
                onMouseLeave={handleMouseLeaveCard}
                className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Real-Time Alert Triage Feed</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                    4 ACTIVE SIGNALS
                  </span>
                </div>

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            alert.severity === 'CRITICAL' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {alert.status === 'ACKNOWLEDGED' ? (
                          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> ACKNOWLEDGED
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* D) Bottom 2 Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Card 1: Mission Day 147 */}
                <div
                  onMouseEnter={handleMouseEnterCard}
                  onMouseLeave={handleMouseLeaveCard}
                  className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-wider">PRIMARY MISSION</span>
                      <span className="text-[10px] font-bold text-slate-400">SURFACE OPS</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mt-1">Mission Day 147</h4>
                    <p className="text-xs text-slate-500 font-medium">AURORA-1 • Lunar Surface Ops</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-[#007AFF] font-extrabold">62%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <div className="h-full bg-gradient-to-r from-[#007AFF] to-cyan-500 rounded-full" style={{ width: '62%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium pt-0.5">
                      62% of planned mission duration completed.
                    </p>
                  </div>
                </div>

                {/* Card 2: Countermeasure Compliance */}
                <div
                  onMouseEnter={handleMouseEnterCard}
                  onMouseLeave={handleMouseLeaveCard}
                  className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">ARED &amp; TREADMILL</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">NOMINAL</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mt-1">Countermeasure Compliance</h4>
                    <p className="text-xs text-slate-500 font-medium leading-tight mt-1">
                      Exercise sessions and axial loading are tracked against prescribed schedule.
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-3xl font-black text-slate-900 tracking-tight">92%</span>
                      <span className="text-xs text-slate-500 font-semibold ml-1.5">baseline compliance</span>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

                {/* NASA OSDR Master Biomarker ML Dataset Explorer View */}
        {activeTab === 'DATASET' && (
          <div className="space-y-6">
            {/* Header & Controls Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
              
              {/* Header Title & Actions Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                      NASA OSDR ML Benchmark
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      Inspiration4 Mission
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase tracking-wider">
                      28 Samples • 611 Features
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    NASA OSDR Master Biomarker Research Dataset
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                    Physiological & molecular biomarker telemetry tracking spaceflight-induced adaptation across 4 commercial astronauts (C001-C004) from pre-flight baseline (L-92) to post-flight recovery (R+194). Integrated with out-of-fold ML predictions (RandomForest & LogisticRegression).
                  </p>
                </div>

                {/* Top Action Buttons: NASA OSDR Links & CSV Download */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href="https://osdr.nasa.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>OSDR Portal</span>
                  </a>
                  <a
                    href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-569"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>OSD-569 (CBC)</span>
                  </a>
                  <a
                    href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-575"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                    <span>OSD-575 (Metabolic)</span>
                  </a>
                  <a
                    href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-656"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    <span>OSD-656 (Urine)</span>
                  </a>
                  <a
                    href="/data/NASA_MASTER_BIOMARKER.csv"
                    download="NASA_MASTER_BIOMARKER.csv"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer ml-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </a>
                </div>
              </div>

              {/* KPI Performance Cards Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">RandomForest OOF Accuracy</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">96.4%</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">27 / 28</span>
                    <span className="text-xs text-slate-500 font-semibold">samples correctly classified</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Top predictors: CXCL2, IL-17E/IL-25, CTACK, MCV, MPO</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">LogisticRegression OOF Accuracy</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">96.4%</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">27 / 28</span>
                    <span className="text-xs text-slate-500 font-semibold">samples correctly classified</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Linear decision boundary with standard scaling & L2 regularization</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Majority Baseline</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-600 text-white">57.1%</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">16 / 28</span>
                    <span className="text-xs text-slate-500 font-semibold">benchmark baseline</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Always predicts majority class (POST_FLIGHT: 16/28)</p>
                </div>
              </div>

              {/* Filters & Assay Panel Controls */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                
                {/* Filter Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
                  
                  {/* Subject Dropdown Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Subject:</span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                      {(['ALL', 'C001', 'C002', 'C003', 'C004'] as const).map((subj) => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setNasaSubjectFilter(subj)}
                          className={`px-3 py-1 rounded-lg transition ${
                            nasaSubjectFilter === subj
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {subj === 'ALL' ? 'All (4)' : subj}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flight Phase Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Phase:</span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                      {(['ALL', 'PRE_FLIGHT', 'POST_FLIGHT'] as const).map((phase) => (
                        <button
                          key={phase}
                          type="button"
                          onClick={() => setNasaPhaseFilter(phase)}
                          className={`px-3 py-1 rounded-lg transition ${
                            nasaPhaseFilter === phase
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {phase === 'ALL' ? 'All Phases' : phase === 'PRE_FLIGHT' ? 'PRE-FLIGHT (12)' : 'POST-FLIGHT (16)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timepoint Dropdown Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Timepoint:</span>
                    <select
                      value={nasaTimepointFilter}
                      onChange={(e) => setNasaTimepointFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Timepoints (7)</option>
                      <option value="L-92">L-92 (Pre-flight 92 days)</option>
                      <option value="L-44">L-44 (Pre-flight 44 days)</option>
                      <option value="L-3">L-3 (Pre-flight 3 days)</option>
                      <option value="R+1">R+1 (Return +1 day)</option>
                      <option value="R+45">R+45 (Return +45 days)</option>
                      <option value="R+82">R+82 (Return +82 days)</option>
                      <option value="R+194">R+194 (Return +194 days)</option>
                    </select>
                  </div>

                  {/* Search Box */}
                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={nasaSearch}
                      onChange={(e) => setNasaSearch(e.target.value)}
                      placeholder="Search sample, marker, value..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                </div>

                {/* Assay Panel Tabs Selector */}
                <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
                  {[
                    { id: 'OVERVIEW', label: 'Overview / CBC Panel', icon: Activity },
                    { id: 'CMP', label: 'Metabolic CMP Panel', icon: Heart },
                    { id: 'CARDIO', label: 'Cardiovascular Panel', icon: Zap },
                    { id: 'IMMUNE', label: 'Immune & Cytokine Panel', icon: Flame },
                    { id: 'URINE', label: 'Urine & Renal Panel', icon: Filter },
                    { id: 'ALL_FEATURES', label: 'All 607 Features Matrix', icon: Table }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = nasaPanelTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setNasaPanelTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 max-h-[560px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 sticky top-0 z-10 backdrop-blur-md">
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Sample & Subject</th>
                      <th className="py-3 px-3">Flight Phase</th>
                      <th className="py-3 px-4">Biomarker Measurements ({nasaPanelTab})</th>
                      <th className="py-3 px-4">ML Out-of-Fold Predictions</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono bg-white">
                    {NASA_MASTER_BIOMARKER_DATASET.filter((record) => {
                      if (nasaSubjectFilter !== 'ALL' && record.subjectId !== nasaSubjectFilter) return false;
                      if (nasaPhaseFilter !== 'ALL' && record.flightPhase !== nasaPhaseFilter) return false;
                      if (nasaTimepointFilter !== 'ALL' && record.timepoint !== nasaTimepointFilter) return false;
                      if (nasaSearch.trim()) {
                        const q = nasaSearch.toLowerCase();
                        const matchSample = record.sampleName.toLowerCase().includes(q);
                        const matchSubject = record.subjectId.toLowerCase().includes(q);
                        const matchTimepoint = record.timepoint.toLowerCase().includes(q);
                        const matchPhase = record.flightPhase.toLowerCase().includes(q);
                        return matchSample || matchSubject || matchTimepoint || matchPhase;
                      }
                      return true;
                    }).map((record) => {
                      const rfPred = record.predictions?.RandomForest;
                      const lrPred = record.predictions?.LogisticRegression;
                      const mbPred = record.predictions?.MajorityBaseline;
                      
                      const rfCorrect = rfPred?.predLabel === record.flightPhase;
                      const lrCorrect = lrPred?.predLabel === record.flightPhase;

                      return (
                        <tr key={record.sampleName} className="hover:bg-slate-50/90 transition-colors">
                          {/* Sample & Subject Column */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-blue-600 text-xs font-sans">{record.sampleName}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold font-sans">
                                  Subject {record.subjectId}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold font-sans">
                                  {record.timepoint}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Flight Phase Column */}
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              record.flightPhase === 'POST_FLIGHT' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300/60' 
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                            }`}>
                              {record.flightPhase}
                            </span>
                          </td>

                          {/* Biomarker Measurement Values Column based on active panel tab */}
                          <td className="py-3 px-4 text-xs font-mono text-slate-700">
                            {nasaPanelTab === 'OVERVIEW' && (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <span>WBC: <strong className="text-slate-900">{record.cbc.white_blood_cell_count_value_thousand_per_microliter} K/µL</strong></span>
                                <span>RBC: <strong className="text-slate-900">{record.cbc.red_blood_cell_count_value_million_per_microliter} M/µL</strong></span>
                                <span>HGB: <strong className="text-slate-900">{record.cbc.hemoglobin_value_percent}%</strong></span>
                                <span>MCV: <strong className="text-slate-900">{record.cbc.mcv_value_femtoliter} fL</strong></span>
                                <span>PLT: <strong className="text-slate-900">{record.cbc.platelet_count_value_thousand_per_microliter} K/µL</strong></span>
                                <span>NEUT: <strong className="text-slate-900">{record.cbc.neutrophils_value_percent}%</strong></span>
                              </div>
                            )}
                            {nasaPanelTab === 'CMP' && (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <span>GLU: <strong className="text-slate-900">{record.cmp.glucose_value_milligram_per_deciliter} mg/dL</strong></span>
                                <span>Na: <strong className="text-slate-900">{record.cmp.sodium_value_millimol_per_liter} mmol/L</strong></span>
                                <span>K: <strong className="text-slate-900">{record.cmp.potassium_value_millimol_per_liter} mmol/L</strong></span>
                                <span>CRE: <strong className="text-slate-900">{record.cmp.creatinine_value_milligram_per_deciliter} mg/dL</strong></span>
                                <span>ALT: <strong className="text-slate-900">{record.cmp.alt_value_units_per_liter} U/L</strong></span>
                                <span>AST: <strong className="text-slate-900">{record.cmp.ast_value_units_per_liter} U/L</strong></span>
                              </div>
                            )}
                            {nasaPanelTab === 'CARDIO' && (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <span>CRP: <strong className="text-slate-900">{record.cardio.crp_concentration_picogram_per_milliliter} pg/mL</strong></span>
                                <span>CRP %: <strong className="text-slate-900">{record.cardio.crp_percent}%</strong></span>
                                <span>L-Selectin: <strong className="text-slate-900">{record.cardio.l_selectin_concentration_picogram_per_milliliter} pg/mL</strong></span>
                                <span>CTACK: <strong className="text-slate-900">{record.cardio.ctack_concentration_picogram_per_milliliter} pg/mL</strong></span>
                              </div>
                            )}
                            {nasaPanelTab === 'IMMUNE' && (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <span>CXCL2 norm: <strong className="text-slate-900">{record.immune.cxcl2_percent_normalized_value}</strong></span>
                                <span>IL-17E/25 %: <strong className="text-slate-900">{record.immune.il_17e_per_il_25_percent}%</strong></span>
                                <span>MPO norm: <strong className="text-slate-900">{record.immune.mpo_percent_normalized_value}</strong></span>
                                <span>BCA-1 conc: <strong className="text-slate-900">{record.immune.bca_1_concentration_picogram_per_milliliter} pg/mL</strong></span>
                              </div>
                            )}
                            {nasaPanelTab === 'URINE' && (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <span>Spec Gravity: <strong className="text-slate-900">{record.urine.urine_specific_gravity}</strong></span>
                                <span>pH: <strong className="text-slate-900">{record.urine.urine_ph}</strong></span>
                                <span>Creatinine: <strong className="text-slate-900">{record.urine.urine_creatinine_mg_dl} mg/dL</strong></span>
                                <span>Osmolality: <strong className="text-slate-900">{record.urine.urine_osmolality_mOsm_kg} mOsm/kg</strong></span>
                              </div>
                            )}
                            {nasaPanelTab === 'ALL_FEATURES' && (
                              <div className="text-[11px] font-mono text-slate-600 truncate max-w-md">
                                <span>607 features extracted (WBC, RBC, CXCL2, IL-17E, CTACK, MCV, MPO, BCA-1, WNT16...)</span>
                              </div>
                            )}
                          </td>

                          {/* ML Out-of-Fold Predictions Column */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1 font-sans">
                              {/* RandomForest Chip */}
                              {rfPred && (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="font-bold text-slate-500 w-6">RF:</span>
                                  <span className={rfCorrect ? "px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800" : "px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800"}>
                                    {rfPred.predLabel} ({(rfPred.probPostFlight * 100).toFixed(1)}%)
                                  </span>
                                </div>
                              )}
                              {/* LogisticRegression Chip */}
                              {lrPred && (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="font-bold text-slate-500 w-6">LR:</span>
                                  <span className={lrCorrect ? "px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800" : "px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800"}>
                                    {lrPred.predLabel} ({(lrPred.probPostFlight * 100).toFixed(1)}%)
                                  </span>
                                </div>
                              )}
                              {/* Majority Baseline Chip */}
                              {mbPred && (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="font-bold text-slate-400 w-6">MB:</span>
                                  <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                                    {mbPred.predLabel} (50.0%)
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status / Correctness Column */}
                          <td className="py-3 px-3 text-right font-sans">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              rfCorrect && lrCorrect
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                                : 'bg-amber-100 text-amber-800 border border-amber-300/60'
                            }`}>
                              {rfCorrect && lrCorrect ? '✓ ML MATCH' : '⚠ DISCREPANCY'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Data Provenance & NASA OSDR Source Links Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* NASA OSDR Source Dataset Links */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-black text-slate-900">NASA OSDR Dataset Repositories</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Official NASA Sources</span>
                </div>

                <div className="space-y-3">
                  {NASA_OSDR_SOURCES.map((src) => (
                    <a
                      key={src.id}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 transition flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {src.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{src.description}</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-white group-hover:bg-blue-600 group-hover:text-white text-[10px] font-extrabold text-slate-600 border border-slate-200 group-hover:border-blue-600 transition shrink-0">
                        Open Study ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* RandomForest Top Feature Importance Table */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-purple-600" />
                    <h3 className="text-base font-black text-slate-900">Top ML Feature Importances</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">RandomForest Gini</span>
                </div>

                <div className="overflow-y-auto max-h-[260px] space-y-2 pr-1">
                  {RANDOM_FOREST_FEATURE_IMPORTANCE.slice(0, 8).map((fi, idx) => (
                    <div key={fi.feature} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="w-5 h-5 rounded-lg bg-purple-100 text-purple-800 text-[10px] font-black flex items-center justify-center font-sans">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-slate-800 truncate max-w-[220px]">{fi.feature}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (fi.importance / 0.06) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-purple-700 text-[11px]">
                          {(fi.importance * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* QA Test Suite (Dataset B) View */}
        {activeTab === 'TEST_SUITE' && qaReport && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Dataset B QA Evaluation Report</h2>
                <p className="text-xs text-slate-500">Automated decision support accuracy evaluation against 10 test case scenarios.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-emerald-600">
                  {qaReport.passedCount} / {qaReport.totalScenarios} PASSED
                </span>
                <button
                  type="button"
                  onClick={handleRunQaSuite}
                  className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-run Test Suite</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {qaReport.results.map((res) => (
                <div key={res.scenarioId} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
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
