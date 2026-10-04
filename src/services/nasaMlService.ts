/**
 * NASA OSDR Hybrid ML Client Service
 * Universal service providing seamless API failover to local TypeScript Edge Engine.
 */

import { nasaMlEngine } from './nasaMlEngine';
import {
  BiomarkerInput,
  NasaMlPredictionResult,
  CrewMemberMlProfile,
  ModelServerHealthStatus,
  BiomarkerFeatureImportance,
} from '../types/nasaMl';

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_ML_API_URL || 'https://dollars-asus-joseph-blocks.trycloudflare.com';

export class NasaMlService {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || DEFAULT_API_URL;
  }

  /**
   * Get target API URL dynamically (supporting localStorage override in browser environment)
   */
  public getApiUrl(): string {
    return this.getEffectiveApiUrl();
  }

  /**
   * Set API URL in memory and localStorage
   */
  public setApiUrl(url: string): void {
    this.apiUrl = url;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('ML_API_URL', url);
    }
  }

  private getEffectiveApiUrl(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('ML_API_URL');
      if (saved) return saved;
    }
    return this.apiUrl;
  }

  /**
   * Check online Model API health status
   */
  public async checkServerHealth(): Promise<ModelServerHealthStatus> {
    const url = `${this.getEffectiveApiUrl()}/health`;
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout fast check

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json();
        return {
          status: 'healthy',
          service: data.service || 'STAR+ NASA OSDR Model API',
          version: data.version || '1.0.0',
          modelsLoaded: data.models_loaded || ['LogisticRegression', 'RandomForest'],
          timestamp: new Date().toISOString(),
          apiUrl: url,
          engineSource: 'ONLINE_API',
          latencyMs,
        };
      }
    } catch (_err) {
      // Offline or network error
    }

    return {
      status: 'offline',
      service: 'STAR+ Edge ML Inference Engine (Fallback)',
      version: '1.0.0-edge',
      modelsLoaded: ['LogisticRegression_PRE_POST_FLIGHT', 'RandomForest_PRE_POST_FLIGHT'],
      timestamp: new Date().toISOString(),
      apiUrl: url,
      engineSource: 'EDGE_INFERENCE',
      latencyMs: Math.round(performance.now() - startTime),
    };
  }

  /**
   * Predict single astronaut health state and classification
   * Seamlessly calls online API first, falls back to Edge Engine on failure/offline
   */
  public async predictHealth(
    biomarkers: BiomarkerInput,
    modelName: 'logistic_regression' | 'random_forest' | 'ensemble' = 'ensemble'
  ): Promise<NasaMlPredictionResult> {
    const baseUrl = this.getEffectiveApiUrl().replace(/\/+$/, '');
    const url = `${baseUrl}/predict/all`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s API call timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          astronaut_id: String(biomarkers.subject_id || biomarkers.id || 'ASTRONAUT-01'),
          biomarkers,
          model_name: modelName,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Server outputs '0' = POST_FLIGHT, '1' = PRE_FLIGHT
        const rawPred = String(data.prediction || '');
        const mappedPred: 'PRE_FLIGHT' | 'POST_FLIGHT' =
          rawPred === '1' || rawPred === 'PRE_FLIGHT' ? 'PRE_FLIGHT' : 'POST_FLIGHT';

        const postProba =
          data.probabilities?.['0'] ??
          data.probabilities?.POST_FLIGHT ??
          (mappedPred === 'POST_FLIGHT' ? data.confidence : 1 - (data.confidence || 0.5));
        const preProba =
          data.probabilities?.['1'] ??
          data.probabilities?.PRE_FLIGHT ??
          (1 - postProba);

        const serverRisk = (data.risk_level || '').toUpperCase();
        const riskLevel: 'LOW' | 'MODERATE' | 'HIGH' =
          serverRisk === 'HIGH' || serverRisk === 'CRITICAL'
            ? 'HIGH'
            : serverRisk === 'MODERATE'
            ? 'MODERATE'
            : 'LOW';

        return {
          astronautId: String(data.astronaut_id || biomarkers.subject_id || 'ASTRONAUT-01'),
          modelUsed: modelName,
          prediction: mappedPred,
          confidence: data.confidence || Math.max(preProba, postProba),
          probabilities: {
            PRE_FLIGHT: Number(preProba.toFixed(4)),
            POST_FLIGHT: Number(postProba.toFixed(4)),
          },
          riskLevel,
          engineSource: 'ONLINE_API',
          timestamp: data.timestamp || new Date().toISOString(),
          featuresUsed: data.features_used || 605,
          topBiomarkerContributions: nasaMlEngine.predict(biomarkers, modelName).topBiomarkerContributions,
        };
      }
    } catch (_err) {
      // Network failover to Edge Engine
    }

    // Execute local edge engine
    const edgeResult = nasaMlEngine.predict(biomarkers, modelName);
    edgeResult.engineSource = 'EDGE_INFERENCE';
    return edgeResult;
  }

  /**
   * Predict health across an entire crew list
   */
  public async predictCrewMembers(crewList: CrewMemberMlProfile[]): Promise<CrewMemberMlProfile[]> {
    const updatedCrew = await Promise.all(
      crewList.map(async (member) => {
        const result = await this.predictHealth(member.biomarkers);
        return {
          ...member,
          flightPhase: result.prediction,
          predictionResult: result,
        };
      })
    );

    return updatedCrew;
  }

  /**
   * Get metadata about NASA ML Models
   */
  public getModelMetadata() {
    return nasaMlEngine.getMetadata();
  }

  /**
   * Get top feature importances
   */
  public getFeatureImportances(): BiomarkerFeatureImportance[] {
    return nasaMlEngine.getFeatureImportances();
  }
}

export const nasaMlService = new NasaMlService();
