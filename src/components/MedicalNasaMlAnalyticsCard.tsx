'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Stethoscope,
  Users,
  BarChart3,
  RefreshCw,
  SlidersHorizontal,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  Brain,
  FileSpreadsheet,
  Activity,
} from 'lucide-react';
import { nasaMlService } from '@/services/nasaMlService';
import {
  NasaMlPredictionResult,
  BiomarkerFeatureImportance,
  CrewMemberMlProfile,
  BiomarkerInput,
} from '@/types/nasaMl';

const INITIAL_CREW_PROFILES: CrewMemberMlProfile[] = [
  {
    id: 'CREW-01',
    name: 'Dr. Alex Rivera',
    biomarkers: {
      mcv_value_femtoliter: 88.5,
      sodium_value_millimol_per_liter: 139.0,
      cxcl2_percent_normalized_value: 120.0,
      mpo_concentration_npq: 5.9,
      ctack_percent: 350.0,
      fibrinogen_percent: 91.8,
      monocytes_value_percent: 8.05,
    },
  },
  {
    id: 'CREW-02',
    name: 'CDR Sarah Chen',
    biomarkers: {
      mcv_value_femtoliter: 95.2,
      sodium_value_millimol_per_liter: 144.5,
      cxcl2_percent_normalized_value: 240.0,
      mpo_concentration_npq: 9.8,
      ctack_percent: 480.0,
      fibrinogen_percent: 115.0,
      monocytes_value_percent: 12.1,
    },
  },
  {
    id: 'CREW-03',
    name: 'Marcus Vance',
    biomarkers: {
      mcv_value_femtoliter: 84.1,
      sodium_value_millimol_per_liter: 136.2,
      cxcl2_percent_normalized_value: 95.0,
      mpo_concentration_npq: 4.2,
      ctack_percent: 290.0,
      fibrinogen_percent: 85.0,
      monocytes_value_percent: 7.2,
    },
  },
  {
    id: 'CREW-04',
    name: 'Eng. Elena Rostova',
    biomarkers: {
      mcv_value_femtoliter: 91.8,
      sodium_value_millimol_per_liter: 141.0,
      cxcl2_percent_normalized_value: 185.0,
      mpo_concentration_npq: 7.4,
      ctack_percent: 410.0,
      fibrinogen_percent: 102.5,
      monocytes_value_percent: 9.9,
    },
  },
];

type ModelType = 'ensemble' | 'random_forest' | 'logistic_regression';

export default function MedicalNasaMlAnalyticsCard() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('ensemble');
  const [crewProfiles, setCrewProfiles] = useState<CrewMemberMlProfile[]>(INITIAL_CREW_PROFILES);
  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [featureImportances, setFeatureImportances] = useState<BiomarkerFeatureImportance[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<BiomarkerFeatureImportance | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'explainability'>('matrix');

  // Load feature importances & initial screening
  const screenCrew = useCallback(async (model: ModelType) => {
    setIsScreening(true);
    try {
      const updated = await Promise.all(
        crewProfiles.map(async (member) => {
          const res = await nasaMlService.predictHealth(member.biomarkers, model);
          return {
            ...member,
            flightPhase: res.prediction,
            predictionResult: res,
          };
        })
      );
      setCrewProfiles(updated);
    } catch (err) {
      console.error('Error screening crew:', err);
    } finally {
      setIsScreening(false);
    }
  }, [crewProfiles]);

  useEffect(() => {
    const importances = nasaMlService.getFeatureImportances();
    setFeatureImportances(importances);
    if (importances.length > 0) {
      setSelectedFeature(importances[0]);
    }
    screenCrew(selectedModel);
  }, [selectedModel]);

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
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

  // Top 10 biomarkers specifically asked for in the prompt or feature list
  const top10Features = featureImportances.slice(0, 10);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm text-slate-900 dark:text-slate-100">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Flight Surgeon NASA OSDR Analytics & Explainability
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-300 dark:border-indigo-800">
                FMO Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-model astronaut biological screening matrix & feature importance attribution
            </p>
          </div>
        </div>

        {/* BATCH RE-SCREEN & TAB CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1.5" />
              Crew Matrix
            </button>
            <button
              onClick={() => setActiveTab('explainability')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'explainability'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
              Explainability
            </button>
          </div>

          <button
            onClick={() => screenCrew(selectedModel)}
            disabled={isScreening}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScreening ? 'animate-spin' : ''}`} />
            Batch Re-Screen Crew
          </button>
        </div>
      </div>

      {/* MODEL SELECTOR TAB BAR */}
      <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Active ML Model Classifier:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleModelChange('ensemble')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              selectedModel === 'ensemble'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            Ensemble (LR + RF)
          </button>
          <button
            onClick={() => handleModelChange('random_forest')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              selectedModel === 'random_forest'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            Random Forest (200 Trees)
          </button>
          <button
            onClick={() => handleModelChange('logistic_regression')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              selectedModel === 'logistic_regression'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            Logistic Regression (50 K-Best)
          </button>
        </div>
      </div>

      {/* TAB 1: CREW BIOMARKER SCREENING MATRIX */}
      {activeTab === 'matrix' && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Crew NASA Biomarker Screening Matrix ({crewProfiles.length} Members)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Inspiration4 Baseline Ruleset
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Astronaut</th>
                  <th className="p-3.5">Flight Adaptation State</th>
                  <th className="p-3.5">Model Confidence</th>
                  <th className="p-3.5">Risk Level</th>
                  <th className="p-3.5">Primary Biomarker Factor</th>
                  <th className="p-3.5">Engine Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {crewProfiles.map((member) => {
                  const res = member.predictionResult;
                  const primaryFactor =
                    res?.topBiomarkerContributions && res.topBiomarkerContributions.length > 0
                      ? res.topBiomarkerContributions[0]
                      : { name: 'CXCL2 / GRO-beta', value: member.biomarkers.cxcl2_percent_normalized_value || 120 };

                  return (
                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                            {member.name.charAt(4) || member.name.charAt(0)}
                          </div>
                          <div>
                            <div>{member.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{member.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-semibold">
                        {res?.prediction === 'PRE_FLIGHT' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PRE_FLIGHT Baseline
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                            <Activity className="w-3.5 h-3.5" />
                            POST_FLIGHT Orbital
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono font-bold">
                        {res ? `${(res.confidence * 100).toFixed(1)}%` : '--%'}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getRiskBadgeColor(
                            res?.riskLevel
                          )}`}
                        >
                          {res?.riskLevel === 'HIGH' && <ShieldAlert className="w-3 h-3" />}
                          {res?.riskLevel === 'MODERATE' && <AlertTriangle className="w-3 h-3" />}
                          {res?.riskLevel === 'LOW' && <CheckCircle2 className="w-3 h-3" />}
                          {res?.riskLevel || 'LOW'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {primaryFactor.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Val: {primaryFactor.value}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {res?.engineSource || 'EDGE_INFERENCE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE IMPORTANCE & EXPLAINABILITY */}
      {activeTab === 'explainability' && (
        <div className="mt-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Top 10 NASA OSDR Biomarker Feature Importances
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Scikit-Learn Random Forest & Logistic Feature Weights
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* HORIZONTAL BAR CHART OF TOP 10 BIOMARKERS */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              {top10Features.map((feat) => {
                const isSelected = selectedFeature?.featureKey === feat.featureKey;
                const pct = (feat.importance * 100).toFixed(2);

                return (
                  <div
                    key={feat.featureKey}
                    onClick={() => setSelectedFeature(feat)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-4 text-slate-400 font-mono text-[10px]">
                          #{feat.rank}
                        </span>
                        {feat.name}
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {pct}% weight
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, feat.importance * 1500)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CLINICAL EXPLANATION DETAIL CARD */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              {selectedFeature ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Biomarker Clinical Detail
                      </h4>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedFeature.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Category:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {selectedFeature.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Feature Key:</span>{' '}
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {selectedFeature.featureKey}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Reference Baseline Median:</span>{' '}
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                        {selectedFeature.referenceMedian}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Logistic Regression Weight:</span>{' '}
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedFeature.logisticWeight ?? 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Clinical Description & Spaceflight Relevance
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedFeature.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Info className="w-8 h-8 mb-2" />
                  <p className="text-xs">Select a biomarker to view clinical explainability</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NASA CLINICAL PROTOCOL ACTION ITEMS */}
      <div className="mt-6 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
            NASA Flight Medical Protocol Action Recommendations
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              Perform automated feature attribution checks prior to long-duration EVA missions to detect immune systemic cascades early.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              If crew members present elevated CXCL2 or CTACK levels beyond 2.0x reference medians, initiate countermeasure anti-inflammatory protocol.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}