'use client';

import React from 'react';
import { Activity, Heart, Wind, Brain, ShieldAlert, Moon } from 'lucide-react';

interface FallbackProps {
  system: 'CARDIOVASCULAR' | 'RESPIRATORY' | 'MUSCULOSKELETAL' | 'NEUROLOGICAL' | 'CIRCADIAN';
  status?: 'NOMINAL' | 'WATCH' | 'CRITICAL';
}

export default function HealthVisualizationFallback({ system, status = 'WATCH' }: FallbackProps) {
  const getIcon = () => {
    switch (system) {
      case 'CARDIOVASCULAR':
        return <Heart className="w-16 h-16 text-rose-500 animate-pulse" />;
      case 'RESPIRATORY':
        return <Wind className="w-16 h-16 text-blue-500" />;
      case 'NEUROLOGICAL':
        return <Brain className="w-16 h-16 text-purple-500" />;
      case 'MUSCULOSKELETAL':
        return <Activity className="w-16 h-16 text-emerald-500" />;
      case 'CIRCADIAN':
        return <Moon className="w-16 h-16 text-amber-500" />;
      default:
        return <Heart className="w-16 h-16 text-rose-500" />;
    }
  };

  return (
    <div className="w-full h-full min-h-[360px] rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 rounded-full bg-white shadow-md border border-slate-100">
        {getIcon()}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
          {system} 2D Anatomical Map
        </h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Interactive WebGL viewport fallback loaded. All telemetry metrics remain connected.
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
        status === 'WATCH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
      }`}>
        STATUS: {status}
      </span>
    </div>
  );
}
