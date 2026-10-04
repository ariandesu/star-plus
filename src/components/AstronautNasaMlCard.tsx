'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  Zap,
  Sparkles,
  Server,
  Cpu,
  Info,
  TrendingUp,
  HeartPulse,
} from 'lucide-react';
import { nasaMlService } from '@/services/nasaMlService';
import { NasaMlPredictionResult, BiomarkerInput } from '@/types/nasaMl';

const DEFAULT_BIOMARKERS: BiomarkerInput = {
  subject_id: 'ASTRO-CDR-RIVERA',
  mcv_value_femtoliter: 88.5,
  sodium_value_millimol_per_liter: 139.0,
  cxcl2_percent_normalized_value: 120.0,
  mpo_concentration_npq: 5.9,
  ctack_percent: 350.0,
  fibrinogen_percent: 91.8,
  monocytes_value_percent: 8.05,
  bca_1_concentration_picogram_per_milliliter: 14.2,
};

interface AstronautNasaMlCardProps {
  astronautId?: string;
}

export default function AstronautNasaMlCard({ astronautId }: AstronautNasaMlCardProps) {
  const [prediction, setPrediction] = useState<NasaMlPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Simulator inputs
  const [mcv, setMcv] = useState<number>(88.5);
  const [sodium, setSodium] = useState<number>(139.0);
  const [cxcl2, setCxcl2] = useState<number>(120.0);
  const [mpo, setMpo] = useState<number>(5.9);
  const [ctack, setCtack] = useState<number>(350.0);
  const [fibrinogen, setFibrinogen] = useState<number>(91.8);

  const runInference = useCallback(async (customBiomarkers?: BiomarkerInput) => {
    setLoading(true);
    const startTime = performance.now();

    const input: BiomarkerInput = customBiomarkers || {
      subject_id: astronautId || 'ASTRO-CDR-RIVERA',
      mcv_value_femtoliter: mcv,
      sodium_value_millimol_per_liter: sodium,
      cxcl2_percent_normalized_value: cxcl2,
      mpo_concentration_npq: mpo,
      ctack_percent: ctack,
      fibrinogen_percent: fibrinogen,
      monocytes_value_percent: 8.05,
      bca_1_concentration_picogram_per_milliliter: 14.2,
    };

    try {
      const res = await nasaMlService.predictHealth(input, 'ensemble');
      const endTime = performance.now();
      setPingMs(Math.round(endTime - startTime));
      setPrediction(res);
    } catch (err) {
      console.error('Failed to run NASA ML inference:', err);
    } finally {
      setLoading(false);
    }
  }, [mcv, sodium, cxcl2, mpo, ctack, fibrinogen]);

  useEffect(() => {
    runInference(DEFAULT_BIOMARKERS);
  }, [runInference]);

  const handleResetSimulator = () => {
    setMcv(88.5);
    setSodium(139.0);
    setCxcl2(120.0);
    setMpo(5.9);
    setCtack(350.0);
    setFibrinogen(91.8);
    runInference(DEFAULT_BIOMARKERS);
  };

  const getRiskBadgeColor = (risk?: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (risk) {
      case 'HIGH':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
      case 'MODERATE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  const getRiskIcon = (risk?: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (risk) {
      case 'HIGH':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'MODERATE':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'LOW':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm text-slate-900 dark:text-slate-100 transition-all duration-200">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                NASA OSDR Machine Learning Health Classifier
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 rounded-md border border-sky-300 dark:border-sky-800">
                <Sparkles className="w-3 h-3" /> Inspiration4 Model
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Biomarker flight adaptation evaluation trained on 605 spaceflight biological features
            </p>
          </div>
        </div>

        {/* SERVER / EDGE ENGINE STATUS BADGE */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {prediction?.engineSource === 'ONLINE_API' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Server className="w-3.5 h-3.5" />
              Online API {pingMs !== null && `(${pingMs}ms)`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <Cpu className="w-3.5 h-3.5" />
              Edge Engine {pingMs !== null && `(${pingMs}ms)`}
            </span>
          )}
          <button
            onClick={() => runInference()}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            title="Refresh ML Evaluation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* PREDICTION SUMMARY CARD */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* FLIGHT ADAPTATION STATE */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Predicted Adaptation State
            </span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {prediction?.prediction === 'PRE_FLIGHT' ? (
                <span className="text-emerald-600 dark:text-emerald-400">Pre-Flight Baseline</span>
              ) : (
                <span className="text-sky-600 dark:text-sky-400">Post-Flight Orbital</span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {prediction?.prediction === 'PRE_FLIGHT'
                ? 'Biomarkers match baseline pre-launch physiological status'
                : 'Biomarkers indicate active microgravity flight adaptation'}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Model: <span className="font-mono text-slate-600 dark:text-slate-300">Ensemble (LR + RF)</span>
          </div>
        </div>

        {/* CONFIDENCE SCORE */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Model Confidence
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
              {prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : '--%'}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">certainty</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${(prediction?.confidence || 0) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Pre: {((prediction?.probabilities?.PRE_FLIGHT || 0) * 100).toFixed(1)}%</span>
            <span>Post: {((prediction?.probabilities?.POST_FLIGHT || 0) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* RISK LEVEL ASSESSMENT */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              NASA Risk Level
            </span>
            {getRiskIcon(prediction?.riskLevel)}
          </div>
          <div className="my-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold border ${getRiskBadgeColor(
                  prediction?.riskLevel
                )}`}
              >
                {getRiskIcon(prediction?.riskLevel)}
                {prediction?.riskLevel || 'LOW'} RISK
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {prediction?.riskLevel === 'HIGH'
                ? 'Significant biomarker deviation from spaceflight baseline'
                : prediction?.riskLevel === 'MODERATE'
                ? 'Moderate physiological adaptation signals present'
                : 'Nominal biomarker levels within expected flight variance'}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Assessed: <span className="font-mono">{prediction?.timestamp ? new Date(prediction.timestamp).toLocaleTimeString() : 'Just now'}</span>
          </div>
        </div>
      </div>

      {/* VISUAL BREAKDOWN OF TOP CONTRIBUTING BIOMARKERS */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            Top Contributing NASA OSDR Biomarkers
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Astronaut vs Baseline Median Reference
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              name: 'MCV (Femtoliter)',
              key: 'mcv',
              val: mcv,
              median: 88.5,
              unit: 'fL',
              desc: 'Mean Corpuscular Volume (RBC adaptation)',
            },
            {
              name: 'Serum Sodium',
              key: 'sodium',
              val: sodium,
              median: 139.0,
              unit: 'mmol/L',
              desc: 'Electrolyte & fluid shift regulator',
            },
            {
              name: 'CXCL2 / GRO-beta',
              key: 'cxcl2',
              val: cxcl2,
              median: 120.0,
              unit: '% norm',
              desc: 'Inflammatory neutrophil chemokine',
            },
            {
              name: 'Myeloperoxidase (MPO)',
              key: 'mpo',
              val: mpo,
              median: 5.9,
              unit: 'NPQ',
              desc: 'Oxidative endothelial stress marker',
            },
            {
              name: 'CTACK / CCL27',
              key: 'ctack',
              val: ctack,
              median: 350.0,
              unit: '% norm',
              desc: 'Cutaneous T-cell homing cytokine',
            },
            {
              name: 'Fibrinogen',
              key: 'fibrinogen',
              val: fibrinogen,
              median: 91.8,
              unit: '% norm',
              desc: 'Acute phase coagulation protein',
            },
          ].map((item) => {
            const diffPct = (((item.val - item.median) / item.median) * 100).toFixed(1);
            const isElevated = item.val > item.median * 1.05;
            const isDepressed = item.val < item.median * 0.95;

            return (
              <div
                key={item.key}
                className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isElevated
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : isDepressed
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {Number(diffPct) >= 0 ? `+${diffPct}%` : `${diffPct}%`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.val} <span className="text-[10px] font-normal text-slate-500">{item.unit}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Ref: {item.median} {item.unit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isElevated ? 'bg-amber-500' : isDepressed ? 'bg-sky-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, (item.val / (item.median * 1.5)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE IN-FLIGHT LAB SIMULATOR (COLLAPSIBLE) */}
      <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
          className="w-full bg-slate-100 dark:bg-slate-800/80 px-4 py-3 flex items-center justify-between hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Interactive In-Flight Lab Simulator
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Adjust astronaut biomarkers & execute live ML re-evaluation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              {isSimulatorOpen ? 'Hide Controls' : 'Open Simulator'}
            </span>
            {isSimulatorOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {isSimulatorOpen && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* MCV Slider */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    MCV (fL)
                  </label>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {mcv} fL
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="100"
                  step="0.1"
                  value={mcv}
                  onChange={(e) => setMcv(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>80 fL (Microcytic)</span>
                  <span>100 fL (Macrocytic)</span>
                </div>
              </div>

              {/* Sodium Slider */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sodium (mmol/L)
                  </label>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {sodium} mmol/L
                  </span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="150"
                  step="0.5"
                  value={sodium}
                  onChange={(e) => setSodium(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>130 (Hyponatremia)</span>
                  <span>150 (Hypernatremia)</span>
                </div>
              </div>

              {/* CXCL2 Slider */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    CXCL2 (% norm)
                  </label>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {cxcl2} %
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={cxcl2}
                  onChange={(e) => setCxcl2(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>50%</span>
                  <span>300% (High Inflamm.)</span>
                </div>
              </div>

              {/* MPO Slider */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    MPO (NPQ)
                  </label>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {mpo} NPQ
                  </span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="15.0"
                  step="0.1"
                  value={mpo}
                  onChange={(e) => setMpo(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>2.0</span>
                  <span>15.0 (High Stress)</span>
                </div>
              </div>

              {/* CTACK Slider */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    CTACK / CCL27 (% norm)
                  </label>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {ctack} %
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="10"
                  value={ctack}
                  onChange={(e) => setCtack(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>100%</span>
                  <span>800%</span>
                </div>
              </div>

              {/* Fibrinogen Slider */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Fibrinogen (% norm)
                  </label>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {fibrinogen} %
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="2"
                  value={fibrinogen}
                  onChange={(e) => setFibrinogen(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>50%</span>
                  <span>200%</span>
                </div>
              </div>
            </div>

            {/* SIMULATOR CONTROLS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleResetSimulator}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 rounded-lg transition-colors"
              >
                Reset to Flight Baselines
              </button>

              <button
                onClick={() => runInference()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sm transition-all duration-200 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Run Live ML Inference
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NASA CLINICAL ACTION RECOMMENDATIONS */}
      <div className="mt-6 bg-sky-500/5 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-800/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <HeartPulse className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300">
            NASA Flight Surgeon Clinical Action Items
          </h4>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
            <span>
              {prediction?.prediction === 'POST_FLIGHT'
                ? 'Initiate post-orbital fluid shift recovery countermeasure & lower-body negative pressure protocol.'
                : 'Maintain routine EVA pre-launch conditioning and baseline hematology monitoring.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
            <span>
              {prediction?.riskLevel === 'HIGH'
                ? 'Flag elevated cytokine inflammatory cascade (CXCL2/MPO) for flight medical officer evaluation.'
                : 'Electrolyte balance nominal (Sodium within expected orbital homeostasis range).'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}