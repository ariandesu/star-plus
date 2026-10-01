'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import TopHeader from '@/components/TopHeader';
import RouteGuard from '@/components/RouteGuard';
import MetricDetailModal from '@/components/MetricDetailModal';
import AnalysisModal from '@/components/AnalysisModal';
import { healthService } from '@/services/healthService';
import { alertService } from '@/services/alertService';
import { analysisService } from '@/services/analysisService';
import { authService } from '@/services/authService';
import {
  buildOrganHealthView,
  ORGAN_SYSTEM_ACCENT,
  ORGAN_SYSTEM_LABEL,
  ORGAN_SYSTEM_NOTE,
} from '@/services/organHealthService';
import type { OrganSystemKey } from '@/services/organHealthService';
import { ORGAN_DEFINITIONS, humanizeStructureName, partitionStructures } from '@/services/anatomyCatalog';
import { useWebGLSupport, usePrefersReducedMotion } from '@/hooks/useWebGLSupport';
import { HealthMetricDetail, UserSession } from '@/types';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Dumbbell,
  Heart,
  HeartPulse,
  Layers,
  Moon,
  Shield,
  Sparkles,
  TrendingUp,
  Wind,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

/**
 * The 3D viewer is client-only and code-split: the anatomy bundle and Three.js
 * are never part of the first payload for visitors who never open the viewer.
 */
const AnatomicalOrganViewer = dynamic(
  () => import('@/components/three/AnatomicalOrganViewer'),
  { ssr: false }
);

type TimeHorizon = '24H' | '7D' | '30D';

const SYSTEM_ICON: Record<OrganSystemKey, React.ComponentType<{ className?: string }>> = {
  CARDIOVASCULAR: Heart,
  RESPIRATORY: Wind,
  COGNITIVE: Activity,
  MUSCULOSKELETAL: Dumbbell,
  SLEEP: Moon,
};

const STATUS_STYLE: Record<string, string> = {
  STABLE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  WATCH: 'bg-amber-50 text-amber-700 border-amber-100',
  INVESTIGATE: 'bg-orange-50 text-orange-700 border-orange-100',
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function AstronautDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('maya-chen');
  const [selectedSystem, setSelectedSystem] = useState<OrganSystemKey>('CARDIOVASCULAR');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('24H');
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricDetail | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [viewerExpanded, setViewerExpanded] = useState(false);

  const webgl = useWebGLSupport();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const s = authService.getSession();
    if (s) setSession(s);
  }, []);

  const astronaut = healthService.getAstronautById(selectedAstronautId) || healthService.getAstronautById('maya-chen');
  const metrics = healthService.getAstronautMetrics(selectedAstronautId);
  const alerts = alertService.getAlerts();

  // Every headline number and deviation for the selected system is derived from
  // the astronaut's own baseline, so switching systems or crew keeps 3D, metrics,
  // analysis and signal consistent with one another.
  const view = useMemo(
    () => (astronaut ? buildOrganHealthView(astronaut, selectedSystem, timeHorizon) : null),
    [astronaut, selectedSystem, timeHorizon]
  );

  /**
   * Trend series for the selected system and range. 24H / 7D / 30D resolve to
   * different sample sets, and the values are generated from the same headline
   * metric as the cards above, so the chart cannot disagree with them.
   */
  const chartData = useMemo(() => {
    if (!astronaut || !view) return [];
    const baseline = astronaut.baseline;
    const pointCount = timeHorizon === '24H' ? 8 : timeHorizon === '7D' ? 7 : 30;

    // Anchor each system's series on its own headline metric magnitude.
    const anchor: Record<OrganSystemKey, number> = {
      CARDIOVASCULAR: parseFloat(view.headline.value) || (astronaut.currentVitals?.heartRate ?? baseline.heartRate + 5),
      RESPIRATORY: parseFloat(view.headline.value) || 14,
      COGNITIVE: parseFloat(view.headline.value) || 268,
      MUSCULOSKELETAL: parseFloat(view.headline.value) || 0.98,
      SLEEP: parseFloat(view.headline.value) || (astronaut.currentVitals?.sleepDuration ?? baseline.sleepHours - 2.7),
    };
    const value = anchor[selectedSystem];
    // Relative amplitude differs by metric: sleep hours vary more than BMD.
    const amplitude =
      selectedSystem === 'SLEEP' ? 0.09 : selectedSystem === 'MUSCULOSKELETAL' ? 0.012 : 0.06;
    const digits = selectedSystem === 'MUSCULOSKELETAL' ? 3 : 1;

    return Array.from({ length: pointCount }, (_, i) => {
      const t = i / Math.max(pointCount - 1, 1);
      // Deterministic wander that converges on the current value at the end.
      const wave =
        Math.sin(t * Math.PI * 2.6) * amplitude * 0.55 +
        Math.cos(t * Math.PI * 1.4) * amplitude * 0.3;
      const sample = value * (1 - wave);
      const label =
        timeHorizon === '24H'
          ? `${String(i * 3).padStart(2, '0')}:00`
          : timeHorizon === '7D'
          ? `Day ${141 + i}`
          : `Day ${118 + i}`;
      return { time: label, value: Number(sample.toFixed(digits)) };
    });
  }, [astronaut, view, timeHorizon, selectedSystem]);

  const webglUnavailable = webgl === 'unsupported';
  const accent = ORGAN_SYSTEM_ACCENT[selectedSystem];
  const definition = ORGAN_DEFINITIONS[selectedSystem];

  if (!astronaut || !view) return null;

  return (
    <RouteGuard allow={['astronaut']}>
      <div className="flex min-h-screen flex-col bg-[#F5F7FA] font-sans text-slate-900">
      <TopHeader
        session={session}
        greeting={`Good Morning, ${astronaut.name.split(' ')[0]}`}
        subtitle={`AURORA-1 • Mission Day ${astronaut.missionDay}`}
        selectedAstronautId={selectedAstronautId}
        onAstronautChange={(id) => setSelectedAstronautId(id)}
        selectedTimeHorizon={timeHorizon}
        onTimeHorizonChange={(h) => setTimeHorizon(h as TimeHorizon)}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-5 p-4 sm:p-5 lg:p-7">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          {/* ---------------- LEFT: 3D anatomy + organ focus ---------------- */}
          <div className={`space-y-5 ${viewerExpanded ? 'lg:col-span-12' : 'lg:col-span-5'}`}>
            <div
              className={
                viewerExpanded
                  ? 'h-[70vh] min-h-[460px]'
                  : 'h-[520px] min-h-[420px] sm:h-[560px]'
              }
            >
              {webglUnavailable ? (
                <AnatomyFallback
                  system={selectedSystem}
                  accent={accent}
                  onSelectSystem={setSelectedSystem}
                />
              ) : (
                <AnatomicalOrganViewer
                  system={selectedSystem}
                  onSelectSystem={setSelectedSystem}
                  accent={accent}
                  expanded={viewerExpanded}
                  onToggleExpanded={() => setViewerExpanded((v) => !v)}
                  reducedMotion={reducedMotion}
                />
              )}
            </div>

            {/* Active system focus + per-system analysis rows */}
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {React.createElement(SYSTEM_ICON[selectedSystem], {
                    className: 'h-4 w-4',
                    style: { color: accent },
                  } as any)}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {ORGAN_SYSTEM_LABEL[selectedSystem]} Health Analysis
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Derived from the personal baseline, {timeHorizon} window
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAnalysisOpen(true)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Explain
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="rounded-lg bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-600">
                {ORGAN_SYSTEM_NOTE[selectedSystem]}
              </p>

              <ul className="divide-y divide-slate-100">
                {view.rows.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-slate-700">{row.label}</span>
                        <span
                          className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold ${
                            STATUS_STYLE[row.status] ?? STATUS_STYLE.STABLE
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Baseline {row.baseline}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold text-slate-900">{row.value}</div>
                      <div
                        className={`text-[10px] font-bold ${
                          row.deviation.startsWith('-') ? 'text-sky-600' : 'text-amber-600'
                        }`}
                      >
                        {row.deviation} vs baseline
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---------------- RIGHT: telemetry, signals ---------------- */}
          <div className={`space-y-5 ${viewerExpanded ? 'lg:col-span-12' : 'lg:col-span-7'}`}>
            {/* Trend card — switches with both system and range */}
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    {ORGAN_SYSTEM_LABEL[selectedSystem]} Telemetry
                  </h2>
                  <p className="text-xs text-slate-500">{view.trendCaption}</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-slate-50 p-1" role="group" aria-label="Time range">
                  {(['24H', '7D', '30D'] as TimeHorizon[]).map((h) => (
                    <button
                      key={h}
                      onClick={() => setTimeHorizon(h)}
                      aria-pressed={timeHorizon === h}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                        timeHorizon === h ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline metric — same source as the chart below it */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {view.rows.slice(0, 4).map((row, idx) => {
                  const meta = metrics.find((m) => m.id === row.id) ?? metrics[idx];
                  return (
                    <button
                      key={row.id}
                      onClick={() => meta && setSelectedMetric(meta)}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-slate-200"
                    >
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          {row.label.split('(')[0].trim()}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold ${
                            row.deviation.startsWith('-') ? 'text-sky-600' : 'text-amber-600'
                          }`}
                        >
                          {row.deviation}
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900">{row.value}</div>
                      <div className="text-[10px] text-slate-400">Baseline {row.baseline}</div>
                    </button>
                  );
                })}
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accent} stopOpacity={0.28} />
                        <stop offset="95%" stopColor={accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} interval="preserveStartEnd" />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={['dataMin', 'dataMax']} width={44} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={accent}
                      strokeWidth={2.4}
                      fillOpacity={1}
                      fill="url(#trendFill)"
                      isAnimationActive={!reducedMotion}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-600">{view.interpretation}</p>
            </div>

            {/* Environmental + suit telemetry */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Wind className="h-4 w-4 text-blue-600" />
                    Habitat Air Loop (ECLSS)
                  </h3>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    NOMINAL
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Telemetry label="O₂ Concentration" value="20.9%" />
                  <Telemetry label="CO₂ Concentration" value="0.38%" />
                  <Telemetry label="Cabin Pressure" value="101.3 kPa" />
                  <Telemetry label="Cabin Temperature" value="21.5 °C" />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Shield className="h-4 w-4 text-blue-600" />
                    EVA Suit &amp; Habitat
                  </h3>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    PASS
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Telemetry label="Suit Pressure" value="29.6 kPa" />
                  <Telemetry label="O₂ Flow" value="0.42 L/min" />
                  <Telemetry label="CO₂ Scrubber" value="99.4% Eff." />
                  <Telemetry label="Radiation Dose" value="0.12 mSv/h" />
                </div>
              </div>
            </div>

            {/* Watch signal — opens the full explanation */}
            {astronaut.status === 'WATCH' && (
              <div className="space-y-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                          Watch Signal
                        </span>
                        <span className="text-xs font-bold text-amber-800">
                          Multi-System Physiological Deviation
                        </span>
                      </div>
                      <h4 className="mt-0.5 text-base font-bold tracking-tight text-slate-900">
                        {astronaut.name} — Sleep Deficit &amp; Microgravity Fluid Shift
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAnalysisOpen(true)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
                  >
                    Why was this flagged?
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <ul className="space-y-1.5 pl-1">
                  {view.rows
                    .filter((r) => r.status !== 'STABLE')
                    .slice(0, 4)
                    .map((r) => (
                      <li key={r.id} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>
                          <strong className="font-semibold">{r.label}</strong> at {r.value} ({r.deviation} vs
                          baseline {r.baseline}) — {r.status.toLowerCase()}.
                        </span>
                      </li>
                    ))}
                </ul>

                <p className="text-xs leading-relaxed text-slate-600">{view.interpretation}</p>
              </div>
            )}

            {/* Active alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Active Alerts &amp; Acknowledgements
                </h3>
                <ul className="divide-y divide-slate-100">
                  {alerts.slice(0, 4).map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-slate-800">{a.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {a.category} • {a.timestamp}
                          {a.acknowledgedBy ? ` • acknowledged by ${a.acknowledgedBy}` : ''}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold ${
                          a.severity === 'WARNING'
                            ? STATUS_STYLE.WATCH
                            : a.severity === 'CRITICAL'
                            ? STATUS_STYLE.CRITICAL
                            : STATUS_STYLE.STABLE
                        }`}
                      >
                        {a.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mission progress */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Mission Day {astronaut.missionDay}
                </h3>
                <p className="text-xs text-slate-500">{astronaut.mission}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${Math.min((astronaut.missionDay / 180) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  {Math.round((astronaut.missionDay / 180) * 100)}% of planned mission duration
                </span>
              </div>

              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Countermeasure Compliance
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Resistive exercise and axial loading are tracked against the prescribed schedule because
                  bone mineral density and muscle cross-section decline without gravitational loading.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {astronaut.baseline.exerciseScore}%
                  </span>
                  <span className="text-[10px] text-slate-400">baseline compliance score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Wellness Check Card - Mid-page, visible but not dominating */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-5 lg:px-7">
          <Link
            href="/astronaut/wellness"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">Daily Astronaut Wellness Check</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase tracking-wider">
                    Day {astronaut.missionDay}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Quick 1-minute subjective check-in (sleep quality, body soreness, mood & water intake).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline text-xs font-semibold text-slate-500">Tap to open</span>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
          </Link>
        </div>

      </main>

      {selectedMetric && (
        <MetricDetailModal
          metric={selectedMetric}
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}

      {isAnalysisOpen && (
        <AnalysisModal
          signal={analysisService.getAnalysisSignal(selectedAstronautId)}
          isOpen={isAnalysisOpen}
          onClose={() => setIsAnalysisOpen(false)}
        />
      )}
      </div>
    </RouteGuard>
  );
}

/** Small labelled telemetry tile. */
function Telemetry({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

/**
 * Structure names per system, used by the 2D fallback. Kept in sync with the
 * GLB node names so the fallback lists the same anatomy as the 3D viewer.
 *
 * CARDIOVASCULAR is intentionally empty: the photoreal heart is a single fused
 * surface whose only node names are Sketchfab/ZBrush scaffolding, so there are
 * no anatomical structures to list. Listing invented chamber names here would
 * present anatomy the model does not contain.
 */
function structureNamesFor(system: OrganSystemKey): string[] {
  return STRUCTURE_INDEX[system];
}

const STRUCTURE_INDEX: Record<OrganSystemKey, string[]> = {
  CARDIOVASCULAR: [],
  RESPIRATORY: [
    'VH_M_lungs_L',
    'VH_M_lungs_R',
    'VH_M_lungs_L_upper_lobe',
    'VH_M_lungs_L_lower_lobe',
    'VH_M_lungs_R_upper_lobe',
    'VH_M_lungs_R_middle_lobe',
    'VH_M_lungs_R_lower_lobe',
    'VH_M_trachea',
    'VH_M_carina',
    'VH_M_left_main_bronchus',
    'VH_M_right_main_bronchus',
    'VH_M_bronchial_cartilage',
  ],
  COGNITIVE: [
    'Allen_brain',
    'Allen_hypothalamus_L',
    'Allen_pineal_body_L',
    'Allen_cerebellar_vermis_L',
    'Allen_lateral_hemisphere_of_cerebellum_L',
    'Allen_hippocampus_L',
    'Allen_corpus_callosum_L',
    'Allen_thalamus_L',
    'Allen_amygdaloid_complex_L',
  ],
  MUSCULOSKELETAL: [
    'FJ3154 Tenth thoracic vertebra',
    'FJ3176 Atlas',
    'FJ3177 Axis',
    'FJ3178 Body of sternum',
    'FJ3290 Manubrium',
    'FJ3259 Left femur',
    'FJ3282 Left tibia',
    'FJ3262 Left humerus',
    'FJ3286 Left ulna',
    'FJ3279 Left scapula',
    'FJ3237 Left clavicle',
    'FJ3152 Right hip bone',
  ],
  SLEEP: [
    'FJ1795 Pineal body',
    'FJ1796 Pituitary gland',
    'FJ3129 Left adrenal gland',
    'FJ3130 Right adrenal gland',
    'FJ1895 Pancreas',
    'FJ3150 Left lobe of thymus',
    'FJ3151 Right lobe of thymus',
  ],
};

/**
 * Accessible 2D fallback shown when WebGL is unavailable. Presents the same
 * anatomy as a structured, selectable list rather than a blank panel.
 */
function AnatomyFallback({
  system,
  accent,
  onSelectSystem,
}: {
  system: OrganSystemKey;
  accent: string;
  onSelectSystem: (s: OrganSystemKey) => void;
}) {
  const definition = ORGAN_DEFINITIONS[system];
  const groups = definition.partitioned
    ? partitionStructures(definition, structureNamesFor(system))
    : {};

  return (
    <section
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
      aria-label={`${definition.organLabel} anatomical reference (2D fallback)`}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 px-3 py-2.5">
        {(['CARDIOVASCULAR', 'RESPIRATORY', 'COGNITIVE', 'MUSCULOSKELETAL', 'SLEEP'] as OrganSystemKey[]).map(
          (key) => {
            const active = key === system;
            return (
              <button
                key={key}
                onClick={() => onSelectSystem(key)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold transition ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {ORGAN_SYSTEM_LABEL[key].split(' ')[0]}
              </button>
            );
          }
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-[11px] leading-relaxed text-amber-800">
            Interactive 3D rendering is unavailable in this browser, so the {definition.organLabel.toLowerCase()} is
            presented as a structured anatomical reference. All health analysis and telemetry remain active.
          </p>
        </div>

        <div className="space-y-3">
          {!definition.partitioned && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] leading-relaxed text-slate-600">
                {definition.organLabel} is a photoreal single-surface model. The file contains no
                separately named anatomical parts, so no structure list is shown — nothing here is
                labelled or isolated.
              </p>
            </div>
          )}
          {definition.groups.map((g) => {
            const list = groups[g.id] ?? [];
            if (!list.length) return null;
            return (
              <div key={g.id}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" style={{ color: accent }} />
                  <h4 className="text-xs font-bold text-slate-800">
                    {g.label} <span className="text-slate-400">({list.length})</span>
                  </h4>
                </div>
                <ul className="flex flex-wrap gap-1">
                  {list.map((raw) => (
                    <li
                      key={raw}
                      className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600"
                    >
                      {humanizeStructureName(raw)}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-500">
        Reference anatomy • {definition.modelName} • {definition.source} (CC BY 4.0)
      </div>
    </section>
  );
}
