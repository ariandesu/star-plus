'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import MetricCard from '../../components/MetricCard';
import MetricDetailModal from '../../components/MetricDetailModal';
import { HealthMetricDetail, DailyScheduleItem } from '../../types';
import { healthService } from '../../services/healthService';
import { authService } from '../../services/authService';
import { AppState } from '../../services/store';
import {
  Heart,
  Moon,
  Dumbbell,
  Brain,
  Droplets,
  Activity,
  CheckCircle2,
  Calendar,
  MessageSquare,
  AlertTriangle,
  User,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

export default function AstronautDashboard() {
  const [session, setSession] = useState(authService.getSession());
  const [metrics, setMetrics] = useState<HealthMetricDetail[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'sleep' | 'fitness' | 'nutrition' | 'cognitive' | 'schedule' | 'messages'>('health');

  // Focus Checklist State
  const [focusItems, setFocusItems] = useState([
    { id: 'f1', task: 'Complete 2-hour microgravity workout (Treadmill + ARED)', completed: false, category: 'FITNESS' },
    { id: 'f2', task: 'Submit morning HRV & cognitive alertness test', completed: true, category: 'COGNITIVE' },
    { id: 'f3', task: 'Log daily hydration (target 2.4L minimum)', completed: false, category: 'NUTRITION' },
    { id: 'f4', task: 'Review Flight Medical Officer rest & EVA adjustment guidance', completed: true, category: 'MEDICAL' }
  ]);

  const [schedule, setSchedule] = useState<DailyScheduleItem[]>([]);

  const loadData = () => {
    const currentSession = authService.getSession();
    setSession(currentSession);

    // Get metrics for Maya Chen
    const mayaMetrics = healthService.getAstronautMetrics('ast-01');
    setMetrics(mayaMetrics);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMetricClick = (metric: HealthMetricDetail) => {
    setSelectedMetric(metric);
    setIsModalOpen(true);
  };

  const handleToggleFocus = (id: string) => {
    setFocusItems(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'CARDIO':
        return <Heart className="w-4 h-4 text-star-blue" />;
      case 'SLEEP':
        return <Moon className="w-4 h-4 text-star-purple" />;
      case 'FITNESS':
        return <Dumbbell className="w-4 h-4 text-emerald-600" />;
      case 'COGNITIVE':
        return <Brain className="w-4 h-4 text-amber-600" />;
      default:
        return <Activity className="w-4 h-4 text-star-blue" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-star-navy flex flex-col">
      <Navbar session={session} onRefresh={loadData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome Header Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-star-navy to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-5">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300"
              alt="CDR Maya Chen"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-star-blue shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-star-soft text-star-blue border border-blue-200">
                  CDR MAYA CHEN
                </span>
                <span className="text-xs text-slate-300 font-medium">Artemis Base Alpha • Commander</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">Astronaut Health & Daily Operations Portal</h1>
              <p className="text-xs text-slate-300 mt-1">Real-time physiological telemetry & scheduled flight tasks</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Health Signal</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-sm font-extrabold text-amber-300">WATCH (Sleep Deficit Flag)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1.5 rounded-2xl overflow-x-auto border border-slate-300/60 shadow-xs">
          {[
            { id: 'health', label: 'My Health Summary', icon: Activity },
            { id: 'sleep', label: 'Sleep & Recovery', icon: Moon },
            { id: 'fitness', label: 'Fitness & Workout', icon: Dumbbell },
            { id: 'nutrition', label: 'Hydration & Nutrition', icon: Droplets },
            { id: 'cognitive', label: 'Cognitive Readiness', icon: Brain },
            { id: 'schedule', label: 'Daily Schedule', icon: Calendar },
            { id: 'messages', label: 'Medical Messages', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-star-blue shadow-md font-black'
                    : 'text-slate-600 hover:text-star-navy hover:bg-white/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: MY HEALTH SUMMARY */}
        {activeTab === 'health' && (
          <div className="space-y-8">
            {/* Today's Focus Checklist */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-star-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-star-blue" />
                  <h2 className="text-base font-extrabold text-star-navy">Today's Focus & Operational Checklist</h2>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {focusItems.filter(i => i.completed).length} of {focusItems.length} Completed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {focusItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleFocus(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      item.completed
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-star-blue'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                        item.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {item.completed && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className={`text-xs font-bold ${item.completed ? 'line-through text-emerald-800' : 'text-slate-800'}`}>
                        {item.task}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biomarker Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-star-navy flex items-center gap-2">
                  <Activity className="w-5 h-5 text-star-blue" />
                  Live Physiological Biomarkers (Day 147 Window)
                </h2>
                <span className="text-xs text-slate-500 font-semibold">Click any card to open 30-day historical trend graph</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {metrics.map((m) => (
                  <MetricCard
                    key={m.id}
                    metric={m}
                    onClick={handleMetricClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SLEEP & RECOVERY */}
        {activeTab === 'sleep' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-100 text-star-purple">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-star-navy">Sleep Architecture & Rest Analytics</h2>
                  <p className="text-xs text-slate-500">Track REM, Deep sleep stages, and sleep deficit recovery</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Sleep Deficit: -2.7 Hours Cumulative
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Duration</span>
                <p className="text-2xl font-black text-star-navy mt-1">4.8 Hrs</p>
                <span className="text-xs text-amber-700 font-semibold">Baseline: 7.5 Hrs (-36%)</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Deep Sleep</span>
                <p className="text-2xl font-black text-slate-800 mt-1">1.1 Hrs</p>
                <span className="text-xs text-slate-500">23% of total rest</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">REM Stage</span>
                <p className="text-2xl font-black text-slate-800 mt-1">1.2 Hrs</p>
                <span className="text-xs text-slate-500">25% of total rest</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Rest Quality Index</span>
                <p className="text-2xl font-black text-amber-700 mt-1">62 / 100</p>
                <span className="text-xs text-amber-600 font-semibold">Watch Signal</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
              <h4 className="font-bold text-sm text-amber-950">Flight Medical Officer Sleep Directive:</h4>
              <p>
                A cumulative sleep deficit of 2.7 hours has been detected over the past 72 hours due to intense EVA pre-check procedures. Flight Surgeon Dr. Marcus Vance has recommended a mandatory 90-minute restorative rest protocol prior to orbital maneuver duties.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: FITNESS & WORKOUT */}
        {activeTab === 'fitness' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-star-navy">Microgravity Countermeasure Fitness</h2>
                  <p className="text-xs text-slate-500">Daily 2.0-hour treadmill and ARED resistive exercise session</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Today: 78 Min Completed / 120 Min Target
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">T2 Treadmill Protocol</span>
                <p className="text-3xl font-black text-star-navy">45 Min</p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-star-blue h-full w-3/4" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Cardiovascular bone density maintenance</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">ARED Resistance Loads</span>
                <p className="text-3xl font-black text-slate-800">33 Min</p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-1/2" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Squat & Deadlift load simulations</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Caloric Expenditure</span>
                <p className="text-3xl font-black text-slate-800">680 kcal</p>
                <span className="text-xs text-emerald-600 font-bold">Target: 850 kcal</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NUTRITION & HYDRATION */}
        {activeTab === 'nutrition' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-100 text-star-blue">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-star-navy">Hydration & Metabolic Intake</h2>
                  <p className="text-xs text-slate-500">Fluid balance, electrolyte monitoring, and caloric tracking</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Daily Hydration Balance</span>
                  <span className="text-xs font-extrabold text-star-blue">1.8L / 2.4L Goal</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-star-blue h-full w-3/4" />
                </div>
                <p className="text-xs text-slate-600">
                  Hydration tracking increased to 2.8L/day per FMO recommendation during high EVA prep days.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Nutritional Caloric Intake</span>
                  <span className="text-xs font-extrabold text-emerald-600">2,450 kcal / 2,800 Goal</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-4/5" />
                </div>
                <p className="text-xs text-slate-600">
                  Balanced macronutrient distribution: 55% Carbs, 25% Protein, 20% Healthy Fats.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COGNITIVE READINESS */}
        {activeTab === 'cognitive' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-star-navy">Cognitive Readiness & Reaction Assessment</h2>
                  <p className="text-xs text-slate-500">Psychomotor Vigilance Task (PVT) & Alertness Scores</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase">PVT Reaction Speed</span>
                <p className="text-3xl font-black text-amber-900 mt-1">265 ms</p>
                <span className="text-xs text-amber-700 font-semibold">Baseline: 210 ms (+26.2% slow)</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Lapses (Reaction &gt; 500ms)</span>
                <p className="text-3xl font-black text-slate-800 mt-1">3 Lapses</p>
                <span className="text-xs text-slate-500">Elevated fatigue indicator</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Overall Alertness Score</span>
                <p className="text-3xl font-black text-star-navy mt-1">78 / 100</p>
                <span className="text-xs text-slate-500 font-medium">Sufficient for non-EVA maneuvers</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DAILY SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-star-blue" />
                <h2 className="text-base font-extrabold text-star-navy">Day 147 Time-Blocked Operational Schedule</h2>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { time: '06:00 - 07:00 UTC', task: 'Morning Telemetry Sync & Bio-Assay Checklist', category: 'MEDICAL', status: 'COMPLETED' },
                { time: '07:30 - 08:30 UTC', task: 'Breakfast & Hydration Logging', category: 'NUTRITION', status: 'COMPLETED' },
                { time: '08:30 - 10:30 UTC', task: 'Countermeasure Exercise Session (Treadmill + ARED)', category: 'FITNESS', status: 'IN_PROGRESS' },
                { time: '11:00 - 13:00 UTC', task: 'EVA Checklist Review & Suit Pressure Calibration', category: 'EVA_PREP', status: 'PENDING' },
                { time: '14:00 - 15:30 UTC', task: 'Prescribed Rest Protocol (90 Min Rest Period)', category: 'REST', status: 'PENDING' }
              ].map((sch, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-mono text-slate-500 font-semibold">{sch.time}</span>
                      <p className="font-bold text-star-navy text-sm mt-0.5">{sch.task}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    sch.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {sch.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MEDICAL MESSAGES */}
        {activeTab === 'messages' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-star-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-star-purple" />
                <h2 className="text-base font-extrabold text-star-navy">Direct Flight Surgeon Channel</h2>
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Flight Surgeon Online (Dr. Marcus Vance)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-purple-900 font-bold">
                  <span>Dr. Marcus Vance (FMO)</span>
                  <span className="font-mono text-[10px] text-slate-400">08:15 UTC</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Maya, your 72-hour sleep window dropped to 4.8 hours last night with resting HR up at 74 bpm. I've logged a 90-minute rest protocol into your schedule before afternoon EVA prep. Please prioritize hydration (2.8L).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-star-navy font-bold">
                  <span>CDR Maya Chen</span>
                  <span className="font-mono text-[10px] text-slate-400">08:22 UTC</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Acknowledged Dr. Vance. Completing my treadmill protocol now and will enter rest lock at 14:00 UTC.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Historical Trend Chart Modal */}
      <MetricDetailModal
        metric={selectedMetric}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
