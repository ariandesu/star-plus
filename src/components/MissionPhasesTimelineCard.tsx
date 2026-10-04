'use client';

import React from 'react';
import { Rocket, Check } from 'lucide-react';

export interface PhaseItem {
  id: string;
  name: string;
  duration: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface MissionPhasesTimelineCardProps {
  phases?: PhaseItem[];
  currentPhaseName?: string;
}

const DEFAULT_PHASES: PhaseItem[] = [
  { id: '1', name: 'Launch', duration: 'Day 0', status: 'completed' },
  { id: '2', name: 'Orbit Insertion', duration: 'Day 1', status: 'completed' },
  { id: '3', name: 'Nominal Ops', duration: 'Day 1 - 180', status: 'active' },
  { id: '4', name: 'Research Phase', duration: 'Day 181 - 300', status: 'upcoming' },
  { id: '5', name: 'Return', duration: 'Day 301', status: 'upcoming' },
];

export default function MissionPhasesTimelineCard({
  phases = DEFAULT_PHASES,
  currentPhaseName = 'Nominal Operations',
}: MissionPhasesTimelineCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Rocket className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-base font-black text-slate-900">
            Mission Phases &amp; Timeline
          </h2>
        </div>

        {/* Current Phase Capsule Pill */}
        <div className="self-start sm:self-auto bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-2xl flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
            Current Phase:
          </span>
          <span className="text-xs font-black text-blue-600">
            {currentPhaseName}
          </span>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="flex items-start justify-between min-w-[600px] px-4">
          {phases.map((phase, index) => {
            const isLast = index === phases.length - 1;

            // Connector line logic:
            // If current phase is completed and next phase is completed or active, connector is solid blue
            const nextPhase = phases[index + 1];
            const isConnectorBlue =
              phase.status === 'completed' &&
              (nextPhase?.status === 'completed' || nextPhase?.status === 'active');

            return (
              <div
                key={phase.id}
                className="flex-1 flex flex-col items-center relative text-center group"
              >
                {/* Connecting Line to next step */}
                {!isLast && (
                  <div
                    className={`absolute top-4 left-[50%] right-[-50%] h-0.5 z-0 transition-colors duration-300 ${
                      isConnectorBlue ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Circle Icon / Indicator */}
                <div className="relative z-10 bg-white p-0.5 rounded-full">
                  {phase.status === 'completed' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {phase.status === 'active' && (
                    <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center shadow-xs">
                      <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                    </div>
                  )}

                  {phase.status === 'upcoming' && (
                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    </div>
                  )}
                </div>

                {/* Label Info */}
                <div className="mt-3 flex flex-col items-center space-y-0.5">
                  <span
                    className={`text-xs ${
                      phase.status === 'active'
                        ? 'font-black text-blue-600'
                        : phase.status === 'completed'
                        ? 'font-bold text-slate-800'
                        : 'font-medium text-slate-500'
                    }`}
                  >
                    {phase.name}
                  </span>
                  <span
                    className={`text-[11px] ${
                      phase.status === 'active'
                        ? 'font-semibold text-blue-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {phase.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
