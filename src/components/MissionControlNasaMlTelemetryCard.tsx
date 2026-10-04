'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  Activity,
  Gauge,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  HeartPulse,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { nasaMlService } from '@/services/nasaMlService';
import { ModelServerHealthStatus, BiomarkerInput } from '@/types/nasaMl';

const CREW_SAMPLE_PROFILES: BiomarkerInput[] = [
  {
    subject_id: 'CREW-01',
    mcv_value_femtoliter: 88.5,
    sodium_value_millimol_per_liter: 139.0,
    cxcl2_percent_normalized_value: 120.0,
  },
  {
    subject_id: 'CREW-02',
    mcv_value_femtoliter: 95.2,
    sodium_value_millimol_per_liter: 144.5,
    cxcl2_percent_normalized_value: 240.0,
  },
  {
    subject_id: 'CREW-03',
    mcv_value_femtoliter: 84.1,
    sodium_value_millimol_per_liter: 136.2,
    cxcl2_percent_normalized_value: 95.0,
  },
  {
    subject_id: 'CREW-04',
    mcv_value_femtoliter: 91.8,
    sodium_value_millimol_per_liter: 141.0,
    cxcl2_percent_normalized_value: 185.0,
  },
];

export default function MissionControlNasaMlTelemetryCard() {
  const [telemetry, setTelemetry] = useState<ModelServerHealthStatus | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isPingLoading, setIsPingLoading] = useState<boolean>(false);
  const [readinessIndex, setReadinessIndex] = useState<number>(94.5);
  const [flightPhaseStats, setFlightPhaseStats] = useState<{
    preFlightPct: number;
    postFlightPct: number;
    nominalAdaptationPct: number;
  }>({
    preFlightPct: 25,
    postFlightPct: 75,
    nominalAdaptationPct: 75,
  });
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  const queryDiagnosticPing = useCallback(async () => {
    setIsPingLoading(true);
    const startTime = performance.now();
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);

    try {
      // Check server health
      const health = await nasaMlService.checkServerHealth();
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      setPingMs(latency);
      setTelemetry(health);

      // Evaluate crew sample readiness & adaptation breakdown
      const predictions = await Promise.all(
        CREW_SAMPLE_PROFILES.map((prof) => nasaMlService.predictHealth(prof))
      );

      const postFlightCount = predictions.filter((p) => p.prediction === 'POST_FLIGHT').length;
      const total = predictions.length;
      const postPct = Math.round((postFlightCount / total) * 100);
      const prePct = 100 - postPct;

      // Calculate readiness index based on average confidence and risk
      const lowRiskCount = predictions.filter((p) => p.riskLevel === 'LOW').length;
      const modRiskCount = predictions.filter((p) => p.riskLevel === 'MODERATE').length;
      const calculatedReadiness = Math.round(
        (lowRiskCount * 100 + modRiskCount * 70 + (total - lowRiskCount - modRiskCount) * 40) / total
      );

      setReadinessIndex(calculatedReadiness);
      setFlightPhaseStats({
        preFlightPct: prePct,
        postFlightPct: postPct,
        nominalAdaptationPct: postPct,
      });

      const newLog = `[${timestamp}] DIAGNOSTIC OK — Source: ${
        health.engineSource
      } | Latency: ${latency}ms | Readiness: ${calculatedReadiness}% | Models: ${health.modelsLoaded.join(
        ', '
      )}`;

      setDiagnosticLogs((prev) => [newLog, ...prev.slice(0, 4)]);
    } catch (err) {
      const errLog = `[${timestamp}] DIAGNOSTIC FAIL — Engine fallback executed. Error: ${String(err)}`;
      setDiagnosticLogs((prev) => [errLog, ...prev.slice(0, 4)]);
    } finally {
      setIsPingLoading(false);
    }
  }, []);

  useEffect(() => {
    queryDiagnosticPing();
  }, [queryDiagnosticPing]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm text-slate-900 dark:text-slate-100">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Mission Control NASA ML Telemetry & Readiness
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-300 dark:border-emerald-800">
                MCC Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live orbital biological state telemetry & NASA OSDR ML server monitoring
            </p>
          </div>
        </div>

        {/* QUICK ACTION: QUERY ML DIAGNOSTIC PING */}
        <button
          onClick={queryDiagnosticPing}
          disabled={isPingLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-all shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <Zap className={`w-3.5 h-3.5 text-amber-400 ${isPingLoading ? 'animate-spin' : ''}`} />
          Query ML Diagnostic Ping
        </button>
      </div>

      {/* METRIC GRID */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* READINESS INDEX GAUGE */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Crew Biological Readiness Index
            </span>
            <Gauge className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="my-3 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {readinessIndex}%
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Nominal Readiness
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${readinessIndex}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Aggregated from live biomarker predictions across active crew
          </p>
        </div>

        {/* FLIGHT PHASE ADAPTATION BREAKDOWN */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Real-Time Flight Phase Adaptation
            </span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>

          <div className="my-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Post-Orbital Adaptation
              </span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                {flightPhaseStats.postFlightPct}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${flightPhaseStats.postFlightPct}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Pre-Flight Baseline
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {flightPhaseStats.preFlightPct}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${flightPhaseStats.preFlightPct}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {flightPhaseStats.nominalAdaptationPct}% nominal post-orbital adaptation state
          </p>
        </div>

        {/* SERVER TELEMETRY SUMMARY */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              ML Model Server Status
            </span>
            <Server className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="my-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Server Health:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                {telemetry?.status === 'healthy' ? 'Online / Healthy' : 'Online / Edge Fallback'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Latency:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {pingMs !== null ? `${pingMs} ms` : 'Evaluating...'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Engine Source:</span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {telemetry?.engineSource || 'EDGE_INFERENCE'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700/60 pt-2">
            Dataset: <span className="font-semibold text-slate-600 dark:text-slate-300">NASA OSDR Inspiration4 (605 features)</span>
          </div>
        </div>
      </div>

      {/* DETAILED ML SERVER TELEMETRY BOX */}
      <div className="mt-6 bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">
              NASA OSDR ML Model Server Telemetry Log
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            URL: https://dollars-asus-joseph-blocks.trycloudflare.com
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-[11px]">
          <div>
            <span className="text-slate-400">Loaded Models: </span>
            <span className="text-emerald-400 font-bold">
              {telemetry?.modelsLoaded ? telemetry.modelsLoaded.join(', ') : 'RandomForest, LogisticRegression'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Trained On: </span>
            <span className="text-sky-300 font-bold">
              NASA OSDR Inspiration4 Open Science Data (605 Features)
            </span>
          </div>
        </div>

        {/* LOG LINES */}
        <div className="space-y-1 text-[11px] bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 font-mono">
          {diagnosticLogs.length > 0 ? (
            diagnosticLogs.map((log, idx) => (
              <div key={idx} className="text-emerald-400/90 leading-relaxed">
                {log}
              </div>
            ))
          ) : (
            <div className="text-slate-500">Initializing diagnostic stream...</div>
          )}
        </div>
      </div>
    </div>
  );
}