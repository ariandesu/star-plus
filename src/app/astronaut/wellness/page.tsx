'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopHeader from '../../../components/TopHeader';
import { WellnessService } from '../../../services/wellnessService';
import { DailyWellnessLog } from '../../../types';
import {
  Moon,
  Activity,
  Zap,
  Droplets,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Smile,
  ArrowLeft,
  Sparkles,
  Check,
  Volume2
} from 'lucide-react';

export default function DailyWellnessPage() {
  const [log, setLog] = useState<DailyWellnessLog>(() => WellnessService.getLatestLog());
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Load latest log from store/localStorage
    const current = WellnessService.getLatestLog();
    setLog(current);
  }, []);

  const handleSave = () => {
    const updated: DailyWellnessLog = {
      ...log,
      timestamp: new Date().toISOString(),
      status: 'SUBMITTED',
    };
    WellnessService.saveLog(updated);
    setLog(updated);
    setIsSaved(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleWaterChange = (delta: number) => {
    const newGlasses = Math.max(0, Math.min(16, log.waterGlasses + delta));
    setLog((prev) => ({ ...prev, waterGlasses: newGlasses }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16">
      {/* Top Header */}
      <TopHeader
        greeting="Daily Wellness Check"
        subtitle="AURORA-1 • Mission Day 147"
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/astronaut"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </Link>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>How are you feeling today?</span>
                <span className="text-xs font-semibold text-slate-400">Day 147</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Takes less than 1 minute. Simple and confidential check-in.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
              <Link
                href="/astronaut"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition"
              >
                3D Vitals
              </Link>
              <span className="px-3 py-1.5 rounded-lg bg-white text-blue-600 shadow-2xs">
                Daily Check-in
              </span>
            </div>

            {/* Status Pill */}
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Submitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Today
              </span>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Wellness Check Saved!</h4>
                <p className="text-xs text-emerald-100">
                  Your daily update has been safely shared with Flight Surgeon Dr. Marcus Vance.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* CARD 1: Sleep */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">1. How did you sleep?</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Last night's rest</p>
                  </div>
                </div>
                <span className="text-lg font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                  {log.sleepHours} hrs
                </span>
              </div>

              {/* Hours Slider */}
              <div className="space-y-2 pt-2">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={log.sleepHours}
                  onChange={(e) => setLog({ ...log, sleepHours: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                  <span>0 hrs</span>
                  <span>6 hrs</span>
                  <span>12 hrs</span>
                </div>
              </div>

              {/* Quality Options */}
              <div className="pt-4 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Sleep Quality:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Great', emoji: '😊', value: 'Great' },
                    { label: 'Okay', emoji: '🙂', value: 'Okay' },
                    { label: 'Restless', emoji: '🥱', value: 'Restless' },
                    { label: 'Poor', emoji: '😣', value: 'Poor' },
                  ].map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => setLog({ ...log, sleepQuality: q.value as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        log.sleepQuality === q.value
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{q.emoji}</span>
                      <span>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Body Feelings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">2. How does your body feel?</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Physical symptoms check</p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {/* Head & Sinus */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Head & Sinus Pressure</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['None', 'A Little', 'A Lot'] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLog({ ...log, headSinus: val })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                          log.headSinus === val
                            ? val === 'None'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : val === 'A Little'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Back & Spine */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Back & Spine Soreness</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['None', 'A Little', 'A Lot'] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLog({ ...log, backSpine: val })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                          log.backSpine === val
                            ? val === 'None'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : val === 'A Little'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stomach & Dizziness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Stomach & Motion Sickness</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['None', 'A Little', 'A Lot'] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLog({ ...log, stomachNausea: val })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                          log.stomachNausea === val
                            ? val === 'None'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : val === 'A Little'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* CARD 3: Energy & Mood */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">3. Energy & Mood</h3>
                    <p className="text-[11px] text-slate-400 font-medium">How are you feeling mentally?</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl">
                  {log.energyLevel}/10
                </span>
              </div>

              {/* Energy Level Slider */}
              <div className="space-y-2 pt-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={log.energyLevel}
                  onChange={(e) => setLog({ ...log, energyLevel: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                  <span>Low Energy</span>
                  <span>Moderate</span>
                  <span>Full Power</span>
                </div>
              </div>

              {/* Mood Buttons */}
              <div className="pt-4 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Overall Mood:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Energetic', emoji: '⚡', value: 'Energetic' },
                    { label: 'Happy', emoji: '😊', value: 'Happy' },
                    { label: 'Calm', emoji: '😌', value: 'Calm' },
                    { label: 'Tired', emoji: '😴', value: 'Tired' },
                    { label: 'Stressed', emoji: '😟', value: 'Stressed' },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setLog({ ...log, mood: m.value as any })}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        log.mood === m.value
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: Water, Food & Exercise */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">4. Water, Food & Exercise</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Daily countermeasures</p>
                </div>
              </div>

              {/* Water Intake */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Water Intake</span>
                  <span className="text-blue-600 font-extrabold">
                    {log.waterGlasses} Glasses ({(log.waterGlasses * 0.3).toFixed(1)}L)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleWaterChange(-1)}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-base"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (log.waterGlasses / 10) * 100)}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWaterChange(1)}
                    className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center text-base"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Checkboxes for Food & Exercise */}
              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setLog({ ...log, ateAllMeals: !log.ateAllMeals })}
                  className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    log.ateAllMeals
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${log.ateAllMeals ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    <span>Ate all 3 meals today</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Target: 100%</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLog({ ...log, didExercise: !log.didExercise })}
                  className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    log.didExercise
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${log.didExercise ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    <span>Daily 45-min exercise completed</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">ARED Routine</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD 5: Today's Vitals (Live Telemetry Snapshot) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">5. Today's Vitals Snapshot</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Automatic sensor check</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ● Sensor Online
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-xs font-semibold text-slate-500">Resting Heart Rate</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">
                      {log.vitalsSnapshot?.heartRate || 74}
                    </span>
                    <span className="text-xs font-bold text-slate-400">bpm</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-1">● Normal Range</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-xs font-semibold text-slate-500">Blood Oxygen (SpO₂)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">
                      {log.vitalsSnapshot?.spO2 || 97}%
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-1">● Optimal</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-xs font-semibold text-slate-500">Heart Rate Variability</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">
                      {log.vitalsSnapshot?.hrv || 52}
                    </span>
                    <span className="text-xs font-bold text-slate-400">ms</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-1">● Good Recovery</span>
                </div>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Anything else to share with your flight surgeon? (Optional)
              </label>
              <textarea
                rows={2}
                value={log.notes || ''}
                onChange={(e) => setLog({ ...log, notes: e.target.value })}
                placeholder="e.g. Feeling good overall, slightly tired after EVA workout..."
                className="w-full p-3 rounded-xl border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>
          </div>

        </div>

        {/* Action Card & Submit Button */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Ready to save today's update?</h4>
              <p className="text-xs text-slate-500">
                Your report will be saved to your mission log and shared with Dr. Marcus Vance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Save My Daily Check-in</span>
          </button>
        </div>

      </main>
    </div>
  );
}
