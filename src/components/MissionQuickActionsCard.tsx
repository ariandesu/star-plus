'use client';

import React from 'react';
import { Rocket, Zap, Activity, Radio, FileText } from 'lucide-react';

export interface MissionQuickActionsCardProps {
  onSimulateAnomaly?: () => void;
  onRunDiagnostics?: () => void;
  onContactCrew?: () => void;
  onViewTelemetry?: () => void;
}

export default function MissionQuickActionsCard({
  onSimulateAnomaly,
  onRunDiagnostics,
  onContactCrew,
  onViewTelemetry,
}: MissionQuickActionsCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
          <Rocket className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">Quick Actions</h3>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        {/* 1. Simulate Anomaly */}
        <button
          type="button"
          onClick={onSimulateAnomaly}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs rounded-2xl py-2.5 px-3 flex items-center gap-2.5 transition shadow-2xs cursor-pointer w-full text-left"
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
          <span>Simulate Anomaly (CO2 Spike)</span>
        </button>

        {/* 2. Run System Diagnostics */}
        <button
          type="button"
          onClick={onRunDiagnostics}
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-extrabold text-xs rounded-2xl py-2.5 px-3 flex items-center gap-2.5 transition shadow-2xs cursor-pointer w-full text-left"
        >
          <Activity className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Run System Diagnostics</span>
        </button>

        {/* 3. Contact Crew (Audio) */}
        <button
          type="button"
          onClick={onContactCrew}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl py-2.5 px-3 flex items-center gap-2.5 transition shadow-2xs cursor-pointer w-full text-left"
        >
          <Radio className="w-4 h-4 text-slate-600 shrink-0" />
          <span>Contact Crew (Audio)</span>
        </button>

        {/* 4. View Full Telemetry */}
        <button
          type="button"
          onClick={onViewTelemetry}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl py-2.5 px-3 flex items-center gap-2.5 transition shadow-2xs cursor-pointer w-full text-left"
        >
          <FileText className="w-4 h-4 text-slate-600 shrink-0" />
          <span>View Full Telemetry</span>
        </button>
      </div>
    </div>
  );
}
