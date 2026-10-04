/**
 * NASA OSDR Machine Learning Types & Interfaces
 * STAR+ Health Monitoring Engine
 */

export interface BiomarkerInput {
  subject_id?: string;
  flight_phase?: 'PRE_FLIGHT' | 'POST_FLIGHT' | 'IN_FLIGHT' | 'UNKNOWN';
  sample_id?: string;
  [key: string]: any;
}

export interface BiomarkerFeatureImportance {
  rank: number;
  featureKey: string;
  importance: number;
  name: string;
  category: 'Immune' | 'Hematology' | 'Metabolic' | 'Cardiovascular' | 'Bone & Musculoskeletal';
  description: string;
  referenceMedian: number;
  logisticWeight?: number;
}

export interface NasaMlPredictionResult {
  astronautId: string;
  modelUsed: 'logistic_regression' | 'random_forest' | 'ensemble';
  prediction: 'PRE_FLIGHT' | 'POST_FLIGHT';
  confidence: number;
  probabilities: {
    PRE_FLIGHT: number;
    POST_FLIGHT: number;
  };
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  engineSource: 'ONLINE_API' | 'EDGE_INFERENCE';
  timestamp: string;
  featuresUsed: number;
  topBiomarkerContributions?: {
    featureKey: string;
    name: string;
    value: number;
    referenceMedian: number;
    weight: number;
    contributionScore: number;
  }[];
}

export interface CrewMemberMlProfile {
  id: string;
  name: string;
  flightPhase?: string;
  predictionResult?: NasaMlPredictionResult;
  biomarkers: Record<string, number | undefined>;
}

export interface ModelServerHealthStatus {
  status: 'healthy' | 'unhealthy' | 'offline';
  service: string;
  version: string;
  modelsLoaded: string[];
  timestamp: string;
  apiUrl?: string;
  engineSource: 'ONLINE_API' | 'EDGE_INFERENCE';
  latencyMs?: number;
}
