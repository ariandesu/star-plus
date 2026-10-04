/**
 * NASA OSDR Microsecond Edge ML Inference Engine
 * Executes pre vs post flight biological classification directly in TypeScript / JS.
 * Zero network dependencies, zero latency.
 */

import {
  FEATURE_NAMES,
  IMPUTER_MEDIANS,
  SCALER_MEANS,
  SCALER_SCALES,
  SELECTED_FEATURE_INDICES,
  LOGISTIC_REGRESSION_WEIGHTS,
  LOGISTIC_REGRESSION_INTERCEPT,
  TOP_BIOMARKERS,
  RF_TREES,
  MODEL_METADATA,
  CompactRfTree,
} from '../data/nasaModelWeights';

import {
  BiomarkerInput,
  NasaMlPredictionResult,
  BiomarkerFeatureImportance,
} from '../types/nasaMl';

/**
 * Sigmoid activation function
 */
function sigmoid(z: number): number {
  if (z >= 0) {
    return 1 / (1 + Math.exp(-z));
  } else {
    const ez = Math.exp(z);
    return ez / (1 + ez);
  }
}

/**
 * Calculate Risk Level from post-flight probability
 */
function calculateRiskLevel(postFlightProba: number): 'LOW' | 'MODERATE' | 'HIGH' {
  if (postFlightProba >= 0.70) {
    return 'HIGH';
  } else if (postFlightProba >= 0.40) {
    return 'MODERATE';
  } else {
    return 'LOW';
  }
}

export class NasaMlEngine {
  /**
   * Preprocess input dictionary into standard feature vector (605 features)
   * Applies SimpleImputer (median substitution for missing values)
   */
  public preprocessInput(input: BiomarkerInput): number[] {
    const featureVector = new Array<number>(FEATURE_NAMES.length);

    for (let i = 0; i < FEATURE_NAMES.length; i++) {
      const featName = FEATURE_NAMES[i];
      let val: number | undefined = undefined;

      if (input[featName] !== undefined && input[featName] !== null) {
        const parsed = Number(input[featName]);
        if (!isNaN(parsed) && isFinite(parsed)) {
          val = parsed;
        }
      }

      // Impute using median if missing
      featureVector[i] = val !== undefined ? val : IMPUTER_MEDIANS[i];
    }

    return featureVector;
  }

  /**
   * StandardScale a 605-element feature vector
   */
  public scaleFeatures(featureVector: number[]): number[] {
    const scaled = new Array<number>(featureVector.length);
    for (let i = 0; i < featureVector.length; i++) {
      const scale = SCALER_SCALES[i] !== 0 ? SCALER_SCALES[i] : 1.0;
      scaled[i] = (featureVector[i] - SCALER_MEANS[i]) / scale;
    }
    return scaled;
  }

  /**
   * Select 50 K-Best features
   */
  public selectKBestFeatures(scaledVector: number[]): number[] {
    const selected = new Array<number>(SELECTED_FEATURE_INDICES.length);
    for (let i = 0; i < SELECTED_FEATURE_INDICES.length; i++) {
      const idx = SELECTED_FEATURE_INDICES[i];
      selected[i] = scaledVector[idx];
    }
    return selected;
  }

  /**
   * Predict using Logistic Regression model
   * Returns probability of [POST_FLIGHT, PRE_FLIGHT]
   */
  public predictLogisticRegression(input: BiomarkerInput): { preProba: number; postProba: number } {
    const rawVector = this.preprocessInput(input);
    const scaledVector = this.scaleFeatures(rawVector);
    const selectedVector = this.selectKBestFeatures(scaledVector);

    let z = LOGISTIC_REGRESSION_INTERCEPT;
    for (let i = 0; i < selectedVector.length; i++) {
      z += LOGISTIC_REGRESSION_WEIGHTS[i] * selectedVector[i];
    }

    // Scikit-learn Logistic Regression target classes: 0 = POST_FLIGHT, 1 = PRE_FLIGHT
    // sigmoid(z) gives P(Y = 1 | X) = P(PRE_FLIGHT)
    const preProba = sigmoid(z);
    const postProba = 1.0 - preProba;

    return { preProba, postProba };
  }

  /**
   * Predict using Random Forest 200-Tree Ensemble model
   * Returns probability of [POST_FLIGHT, PRE_FLIGHT]
   */
  public predictRandomForest(input: BiomarkerInput): { preProba: number; postProba: number } {
    const rawVector = this.preprocessInput(input);
    const scaledVector = this.scaleFeatures(rawVector);
    const selectedVector = this.selectKBestFeatures(scaledVector);

    let totalPreProba = 0;
    const treeCount = RF_TREES.length;

    for (let t = 0; t < treeCount; t++) {
      const tree: CompactRfTree = RF_TREES[t];
      let node = 0;

      while (tree.l[node] !== -1) {
        const featIdx = tree.f[node];
        const val = selectedVector[featIdx];
        const thresh = tree.t[node];

        if (val <= thresh) {
          node = tree.l[node];
        } else {
          node = tree.r[node];
        }
      }

      totalPreProba += tree.v[node];
    }

    const preProba = totalPreProba / treeCount;
    const postProba = 1.0 - preProba;

    return { preProba, postProba };
  }

  /**
   * Primary inference endpoint: predicts biological flight phase and risk assessment
   */
  public predict(
    input: BiomarkerInput,
    modelName: 'logistic_regression' | 'random_forest' | 'ensemble' = 'ensemble'
  ): NasaMlPredictionResult {
    let preProba = 0.5;
    let postProba = 0.5;

    if (modelName === 'logistic_regression') {
      const lr = this.predictLogisticRegression(input);
      preProba = lr.preProba;
      postProba = lr.postProba;
    } else if (modelName === 'random_forest') {
      const rf = this.predictRandomForest(input);
      preProba = rf.preProba;
      postProba = rf.postProba;
    } else {
      // Ensemble (Average of LR & RF probabilities)
      const lr = this.predictLogisticRegression(input);
      const rf = this.predictRandomForest(input);
      preProba = (lr.preProba + rf.preProba) / 2;
      postProba = (lr.postProba + rf.postProba) / 2;
    }

    const prediction: 'PRE_FLIGHT' | 'POST_FLIGHT' = preProba >= postProba ? 'PRE_FLIGHT' : 'POST_FLIGHT';
    const confidence = Math.max(preProba, postProba);
    const riskLevel = calculateRiskLevel(postProba);

    const astronautId = input.subject_id || input.id || 'ASTRONAUT-GEN-01';

    // Compute Biomarker Contributions for Top Markers
    const rawVector = this.preprocessInput(input);
    const scaledVector = this.scaleFeatures(rawVector);

    const topBiomarkerContributions = TOP_BIOMARKERS.map((bm) => {
      const fIdx = FEATURE_NAMES.indexOf(bm.featureKey);
      const rawVal = fIdx !== -1 ? rawVector[fIdx] : bm.referenceMedian;
      const zScore = fIdx !== -1 ? scaledVector[fIdx] : 0.0;
      const weight = bm.logisticWeight || bm.importance;
      const contributionScore = Math.round(zScore * weight * 1000) / 1000;

      return {
        featureKey: bm.featureKey,
        name: bm.name,
        value: Math.round(rawVal * 10000) / 10000,
        referenceMedian: bm.referenceMedian,
        weight: weight,
        contributionScore: contributionScore,
      };
    });

    return {
      astronautId: String(astronautId),
      modelUsed: modelName,
      prediction,
      confidence: Math.round(confidence * 10000) / 10000,
      probabilities: {
        PRE_FLIGHT: Math.round(preProba * 10000) / 10000,
        POST_FLIGHT: Math.round(postProba * 10000) / 10000,
      },
      riskLevel,
      engineSource: 'EDGE_INFERENCE',
      timestamp: new Date().toISOString(),
      featuresUsed: FEATURE_NAMES.length,
      topBiomarkerContributions,
    };
  }

  /**
   * Get metadata about trained models
   */
  public getMetadata() {
    return MODEL_METADATA;
  }

  /**
   * Get top 20 feature importances
   */
  public getFeatureImportances(): BiomarkerFeatureImportance[] {
    return TOP_BIOMARKERS;
  }
}

export const nasaMlEngine = new NasaMlEngine();
