'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, User, Activity, AlertTriangle, Shield, CheckSquare } from 'lucide-react';
import { MOCK_ASTRONAUTS, MAYA_HEALTH_METRICS, MOCK_ALERTS, MOCK_TODAY_FOCUS } from '../data/mockData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredAstronauts = q
    ? MOCK_ASTRONAUTS.filter(a => a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
    : MOCK_ASTRONAUTS;

  const metricsList = Object.values(MAYA_HEALTH_METRICS);
  const filteredMetrics = q
    ? metricsList.filter(m => m.name.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q)))
    : metricsList;

  const filteredAlerts = q
    ? MOCK_ALERTS.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    : MOCK_ALERTS;

  const filteredTasks = q
    ? MOCK_TODAY_FOCUS.filter(t => t.task.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    : MOCK_TODAY_FOCUS;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-star-navy/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crew members, health metrics, alerts, focus tasks..."
            className="w-full bg-transparent text-sm font-semibold text-star-navy placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-5">
          {/* Astronauts */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-star-blue" />
              Crew Members ({filteredAstronauts.length})
            </span>
            <div className="space-y-1">
              {filteredAstronauts.map(a => (
                <div
                  key={a.id}
                  onClick={() => {
                    router.push('/medical');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-100 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src={a.avatarUrl} alt={a.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-bold text-star-navy">{a.name}</p>
                      <p className="text-[10px] text-slate-500">{a.role} • {a.mission}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    a.status === 'WATCH' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Health Biomarkers */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-star-purple" />
              Biomarkers & Health Metrics ({filteredMetrics.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredMetrics.map(m => (
                <div
                  key={m.id}
                  onClick={() => {
                    router.push('/astronaut');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-star-navy">{m.name}</p>
                    <p className="text-[10px] text-slate-500">Baseline: {m.baselineValue} {m.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800">{m.currentValue} {m.unit}</p>
                    <span className={`text-[10px] font-bold ${m.status === 'WATCH' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Active Mission Alerts ({filteredAlerts.length})
            </span>
            <div className="space-y-1">
              {filteredAlerts.map(alt => (
                <div
                  key={alt.id}
                  onClick={() => {
                    router.push('/mission-control');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-red-50/40 transition cursor-pointer flex items-center justify-between border border-transparent hover:border-red-200"
                >
                  <div>
                    <p className="text-xs font-bold text-star-navy">{alt.title}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{alt.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    alt.severity === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {alt.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Tasks */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              Today's Schedule & Focus Tasks ({filteredTasks.length})
            </span>
            <div className="space-y-1">
              {filteredTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    router.push('/astronaut');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-100 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-star-navy">{t.task}</p>
                    <p className="text-[10px] text-slate-500">{t.category} Task</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {t.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 font-medium">
          Press <kbd className="px-1.5 py-0.5 bg-white rounded border text-slate-600 font-mono text-[10px]">ESC</kbd> to exit search
        </div>
      </div>
    </div>
  );
}
