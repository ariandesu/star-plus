'use client';

import React, { useState } from 'react';
import { AnalysisSignal, RecommendedAction } from '../types';
import { X, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { analysisService } from '../services/analysisService';

interface AnalysisModalProps {
  signal: AnalysisSignal | null;
  isOpen: boolean;
  onClose: () => void;
  onActionToggled?: () => void;
  onUpdate?: () => void;
}

export default function AnalysisModal({ signal, isOpen, onClose, onActionToggled, onUpdate }: AnalysisModalProps) {
  const [actions, setActions] = useState<RecommendedAction[]>(signal?.recommendedActions || []);

  if (!isOpen || !signal) return null;

  const handleToggleAction = (actionId: string) => {
    const updated = analysisService.toggleActionStatus(actionId, 'medical');
    setActions(updated);
    if (onActionToggled) onActionToggled();
    if (onUpdate) onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-star-navy/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-star-navy to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">{signal.astronautName} — Health Analysis Signal</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  {signal.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">Deterministic Rule Engine — Baseline vs 72-Hour Deviation Diagnostics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Signal Summary Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Primary Flag Rationale</h4>
              <p className="text-xs mt-0.5 leading-relaxed">{signal.summary}</p>
            </div>
          </div>

          {/* Biomarker Deviations Table */}
          <div>
            <h3 className="text-sm font-extrabold text-star-navy mb-3 flex items-center justify-between">
              <span>Biomarker Deviation Metrics (30-Day Baseline vs Current 72-Hour Window)</span>
              <span className="text-xs font-semibold text-slate-500">Confidence Score: <strong className="text-star-blue">{signal.confidence}</strong></span>
            </h3>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Biomarker</th>
                    <th className="p-3">Baseline</th>
                    <th className="p-3">Current Window</th>
                    <th className="p-3">Deviation %</th>
                    <th className="p-3">Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {signal.deviations.map((bio, idx) => (
                    <tr key={idx} className={bio.deviationPercent > 20 ? 'bg-amber-50/40' : 'bg-white'}>
                      <td className="p-3 font-bold text-star-navy">{bio.metric}</td>
                      <td className="p-3 text-slate-600">{bio.baseline}</td>
                      <td className="p-3 font-bold text-slate-800">{bio.current}</td>
                      <td className="p-3 font-extrabold">
                        <span className={bio.deviationPercent > 0 ? 'text-amber-700' : 'text-slate-700'}>
                          {bio.deviationPercent > 0 ? `+${bio.deviationPercent}%` : `${bio.deviationPercent}%`}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          bio.direction === 'elevated' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {bio.direction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contributing Environmental & Operational Factors */}
          <div>
            <h3 className="text-sm font-extrabold text-star-navy mb-2">Contributing Factors</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(signal.possibleContributingFactors || []).map((factor, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-star-blue shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Recommended Actions */}
          <div>
            <h3 className="text-sm font-extrabold text-star-navy mb-3 flex items-center justify-between">
              <span>Flight Medical Officer Recommended Interventions</span>
              <span className="text-xs text-slate-500 font-normal">Check off completed steps</span>
            </h3>

            <div className="space-y-2.5">
              {actions.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleToggleAction(act.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    act.isCompleted
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-star-blue shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                      act.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {act.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <p className={`text-xs font-bold ${act.isCompleted ? 'line-through text-emerald-800' : 'text-slate-800'}`}>
                        {act.action}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                        {act.category} Intervention
                      </span>
                    </div>
                  </div>

                  {act.isCompleted && (
                    <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Prescribed ({act.completedAt || 'Active'})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-star-navy hover:bg-slate-800 text-white text-xs font-bold transition shadow-md"
          >
            Acknowledge Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
