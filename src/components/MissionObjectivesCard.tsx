'use client';

import React from 'react';
import { Target, Users, Sparkles, Shield, Wrench, LucideIcon } from 'lucide-react';

export interface ObjectiveItem {
  id: string;
  title: string;
  progress: number; // 0 to 100
  icon: LucideIcon;
}

export interface MissionObjectivesCardProps {
  objectives?: ObjectiveItem[];
}

const DEFAULT_OBJECTIVES: ObjectiveItem[] = [
  {
    id: 'crew-health',
    title: 'Crew Health Monitoring',
    progress: 92,
    icon: Users,
  },
  {
    id: 'science-exp',
    title: 'Science Experiments',
    progress: 68,
    icon: Sparkles,
  },
  {
    id: 'eva-ops',
    title: 'EVA Operations',
    progress: 40,
    icon: Shield,
  },
  {
    id: 'system-maint',
    title: 'System Maintenance',
    progress: 75,
    icon: Wrench,
  },
];

export default function MissionObjectivesCard({
  objectives = DEFAULT_OBJECTIVES,
}: MissionObjectivesCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">
          Mission Objectives Progress
        </h3>
      </div>

      {/* Objectives List */}
      <div className="space-y-3.5 pt-1">
        {objectives.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="space-y-1.5">
              {/* Row Header: Icon + Title + Percentage */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <IconComponent className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <span className="font-extrabold text-blue-600">
                  {item.progress}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
