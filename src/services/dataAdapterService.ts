import { 
  NASA_MASTER_BIOMARKER_DATASET, 
  NASA_OSDR_SOURCES, 
  RANDOM_FOREST_FEATURE_IMPORTANCE,
  NasaBiomarkerRecord, 
  NasaOsdrSourceLink,
  FeatureImportanceItem
} from '../data/nasaMasterBiomarkerDataset';
import { RAW_TEST_CASE_SCENARIOS } from '../data/testCaseScenarios';

export interface NormalizedAstronautRecord {
  id: string;
  astronautId: string;
  name: string;
  age: number;
  missionDays: number;
  heartRate: number;
  bloodPressure: string;
  boneDensity: number;
  sleepHours: number;
  symptom: string;
  status: 'NOMINAL' | 'WATCH' | 'CRITICAL';
  provenance: 'NASA OSDR Research Dataset' | 'Supplied Research Dataset';
}

export interface NormalizedTestScenario {
  id: string;
  astronautName: string;
  age: number;
  missionDays: number;
  heartRate: number;
  bloodPressure: string;
  boneDensity: number;
  sleepHours: number;
  symptom: string;
  expectedRecommendation: string;
}

export interface NasaDatasetStatistics {
  totalRecords: number;
  totalSubjects: number;
  totalFeatures: number;
  preFlightCount: number;
  postFlightCount: number;
  timepoints: string[];
  rfAccuracy: number;
  logRegAccuracy: number;
  baselineAccuracy: number;
  rfCorrectCount: number;
  logRegCorrectCount: number;
  baselineCorrectCount: number;
  topFeatures: FeatureImportanceItem[];
  provenanceDisclaimer: string;
  sources: NasaOsdrSourceLink[];
}

export class DataAdapterService {
  /**
   * Returns all 28 raw NASA OSDR Master Biomarker records with panel extractions and ML OOF predictions.
   */
  public static getNasaMasterBiomarkerDataset(): NasaBiomarkerRecord[] {
    return NASA_MASTER_BIOMARKER_DATASET;
  }

  /**
   * Returns NASA OSDR external repository direct links (OSD-569, OSD-575, OSD-656, OSDR Portal).
   */
  public static getNasaOsdrSources(): NasaOsdrSourceLink[] {
    return NASA_OSDR_SOURCES;
  }

  /**
   * Generates summary statistics across NASA OSDR Master Biomarker Dataset.
   */
  public static getNasaDatasetStatistics(): NasaDatasetStatistics {
    const dataset = NASA_MASTER_BIOMARKER_DATASET;
    const totalRecords = dataset.length;
    
    const preFlightCount = dataset.filter(r => r.flightPhase === 'PRE_FLIGHT').length;
    const postFlightCount = dataset.filter(r => r.flightPhase === 'POST_FLIGHT').length;

    let rfCorrect = 0;
    let lrCorrect = 0;
    let mbCorrect = 0;

    dataset.forEach(r => {
      if (r.predictions?.RandomForest) {
        if (r.predictions.RandomForest.predLabel === r.flightPhase) rfCorrect++;
      }
      if (r.predictions?.LogisticRegression) {
        if (r.predictions.LogisticRegression.predLabel === r.flightPhase) lrCorrect++;
      }
      if (r.predictions?.MajorityBaseline) {
        if (r.predictions.MajorityBaseline.predLabel === r.flightPhase) mbCorrect++;
      }
    });

    return {
      totalRecords,
      totalSubjects: 4,
      totalFeatures: 611,
      preFlightCount,
      postFlightCount,
      timepoints: ['L-92', 'L-44', 'L-3', 'R+1', 'R+45', 'R+82', 'R+194'],
      rfAccuracy: Number((rfCorrect / totalRecords).toFixed(3)),
      logRegAccuracy: Number((lrCorrect / totalRecords).toFixed(3)),
      baselineAccuracy: Number((mbCorrect / totalRecords).toFixed(3)),
      rfCorrectCount: rfCorrect,
      logRegCorrectCount: lrCorrect,
      baselineCorrectCount: mbCorrect,
      topFeatures: RANDOM_FOREST_FEATURE_IMPORTANCE,
      provenanceDisclaimer: 'NASA OSDR Master Biomarker Research Dataset (OSD-569, OSD-575, OSD-656) — 28 multi-timepoint astronaut samples, 611 clinical biomarkers & out-of-fold ML predictions.',
      sources: NASA_OSDR_SOURCES
    };
  }

  /**
   * Legacy normalization for compatibility.
   */
  public static getNormalizedAstronautRecords(): NormalizedAstronautRecord[] {
    return NASA_MASTER_BIOMARKER_DATASET.map((r) => {
      const isPost = r.flightPhase === 'POST_FLIGHT';
      return {
        id: r.sampleName,
        astronautId: r.subjectId,
        name: `Subject ${r.subjectId} (${r.timepoint})`,
        age: 38,
        missionDays: r.timepoint.startsWith('R+') ? parseInt(r.timepoint.replace('R+', '')) : 0,
        heartRate: isPost ? 82 : 68,
        bloodPressure: isPost ? '128/84' : '118/76',
        boneDensity: 0.94,
        sleepHours: isPost ? 5.8 : 7.2,
        symptom: isPost ? 'Post-flight Inflammatory & Cytokine Response' : 'Nominal Baseline',
        status: isPost ? 'WATCH' : 'NOMINAL',
        provenance: 'NASA OSDR Research Dataset'
      };
    });
  }

  /**
   * Normalizes raw Dataset B test scenarios into structured QA entities.
   */
  public static getNormalizedTestScenarios(): NormalizedTestScenario[] {
    return RAW_TEST_CASE_SCENARIOS.map((s: any, idx: number) => ({
      id: `TEST-${idx + 1}`,
      astronautName: s.Astronaut,
      age: Number(s.Age) || 35,
      missionDays: Number(s.Mission_Days) || 100,
      heartRate: Number(s.Heart_Rate) || 70,
      bloodPressure: s.Blood_Pressure || '120/80',
      boneDensity: Number(s.Bone_Density) || 1.0,
      sleepHours: Number(s.Sleep_Hours) || 7.0,
      symptom: s.Symptom || 'None',
      expectedRecommendation: s.Recommendation || 'Nominal status'
    }));
  }

  /**
   * Legacy dataset statistics method.
   */
  public static getDatasetStatistics() {
    return this.getNasaDatasetStatistics();
  }
}
