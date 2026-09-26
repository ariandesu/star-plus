'use client';

import React, { useState } from 'react';
import { HealthMetricDetail } from '../types';
import { X, Calendar, Activity, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';

interface MetricDetailModalProps {
  metric: HealthMetricDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MetricDetailModal({ metric, isOpen, onClose }: MetricDetailModalProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  if (!isOpen || !metric) return null;

  const getChartData = () => {
    switch (timeRange) {
      case '24h':
        return metric.history24h;
      case '7d':
        return metric.history7d;
      case '30d':
        return metric.history30d;
      default:
        return metric.history7d;
    }
  };

  const data = getChartData();
  const baselineValue = typeof metric.baselineValue === 'number' ? metric.baselineValue : parseFloat(metric.baselineValue as string);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-star-navy/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-star-navy to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-star-blue border border-white/10">
              <Activity className="w-6 h-6 text-star-soft" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{metric.name} — Historical Analytics</h2>
              <p className="text-xs text-slate-300">Detailed baseline comparison & trend projections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold uppercase text-slate-400">Current Biomarker</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-star-navy">{metric.currentValue}</span>
                <span className="text-xs font-semibold text-slate-500">{metric.unit}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold uppercase text-slate-400">30-Day Nominal Baseline</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-700">{metric.baselineValue}</span>
                <span className="text-xs font-semibold text-slate-500">{metric.unit}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <span className="text-xs font-bold uppercase text-amber-700">Deviation Percentage</span>
              <div className="flex items-baseline gap-1.5 mt-1 font-black text-amber-800 text-2xl">
                <span>{metric.deviationPercent > 0 ? `+${metric.deviationPercent}%` : `${metric.deviationPercent}%`}</span>
              </div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Select Time Horizon:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeRange === '24h' ? 'bg-white text-star-blue shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeRange === '7d' ? 'bg-white text-star-blue shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Days (Window)
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeRange === '30d' ? 'bg-white text-star-blue shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1769E8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1769E8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12213F', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#EAF3FF' }}
                />
                {!isNaN(baselineValue) && (
                  <ReferenceLine
                    y={baselineValue}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    label={{ value: `Baseline (${baselineValue})`, fill: '#EF4444', fontSize: 11, position: 'insideTopRight' }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="value"
                  name={metric.name}
                  stroke="#1769E8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#metricGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Clinical Description & Medical Guidance */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-xs leading-relaxed text-slate-700">
            <Info className="w-5 h-5 text-star-blue shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-star-navy text-sm mb-1">Clinical Assessment Note</h4>
              <p>{metric.description}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-star-navy hover:bg-slate-800 text-white text-xs font-bold transition shadow-md"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
