'use client';

import React from 'react';
import { HealthMetricDetail } from '../types';
import { TrendingUp, TrendingDown, Minus, LineChart, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MetricCardProps {
  metric: HealthMetricDetail;
  onClick: (metric: HealthMetricDetail) => void;
  icon?: React.ReactNode;
}

export default function MetricCard({ metric, onClick, icon }: MetricCardProps) {
  const getStatusBadge = () => {
    switch (metric.status) {
      case 'STABLE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Stable'
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
          label: 'Watch Signal'
        };
      case 'INVESTIGATE':
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500 animate-ping',
          label: 'Investigate'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Nominal'
        };
    }
  };

  const badge = getStatusBadge();

  const getTrendIcon = () => {
    if (metric.trend === 'up') {
      return <TrendingUp className={`w-3.5 h-3.5 ${metric.status === 'WATCH' ? 'text-amber-600' : 'text-slate-500'}`} />;
    }
    if (metric.trend === 'down') {
      return <TrendingDown className={`w-3.5 h-3.5 ${metric.status === 'WATCH' ? 'text-amber-600' : 'text-slate-500'}`} />;
    }
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div
      onClick={() => onClick(metric)}
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-star-card hover:shadow-star-hover hover:border-star-blue/40 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Header Title & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {icon && <span className="p-2 rounded-xl bg-star-soft text-star-blue">{icon}</span>}
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.name}</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>

        {/* Big Metric Display */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-star-navy tracking-tight">{metric.currentValue}</span>
          <span className="text-sm font-semibold text-slate-500">{metric.unit}</span>
        </div>

        {/* Baseline vs Current Deviation */}
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          <span className="text-slate-500">
            Baseline: <strong className="text-slate-700 font-semibold">{metric.baselineValue} {metric.unit}</strong>
          </span>
          <div className="flex items-center gap-1 font-bold">
            {getTrendIcon()}
            <span className={metric.deviationPercent > 0 ? (metric.status === 'WATCH' ? 'text-amber-600' : 'text-slate-700') : (metric.status === 'WATCH' ? 'text-amber-600' : 'text-slate-700')}>
              {metric.deviationPercent > 0 ? `+${metric.deviationPercent}%` : `${metric.deviationPercent}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Prompt */}
      <div className="mt-4 pt-2.5 flex items-center justify-between text-[11px] text-star-blue font-bold group-hover:translate-x-0.5 transition-transform">
        <span className="flex items-center gap-1.5">
          <LineChart className="w-3.5 h-3.5" />
          View Historical Trend Curves
        </span>
        <span className="text-slate-300 group-hover:text-star-blue transition-colors">→</span>
      </div>
    </div>
  );
}
