import { RAW_ASTRONAUT_HEALTH_DATASET } from '../data/astronautHealthDataset';
import { RAW_TEST_CASE_SCENARIOS } from '../data/testCaseScenarios';
import { Astronaut } from '../types';

export interface RawAstronautRecord {
  Astronaut_ID: string;
  Age: string | number;
  Mission_Days: string | number;
  Heart_Rate: string | number;
  Blood_Pressure: string;
  Bone_Density: string | number;
  Sleep_Hours: string | number;
  Symptom: string;
}

export interface RawTestScenario {
  Astronaut: string;
  Age: string | number;
  Mission_Days: string | number;
  Heart_Rate: string | number;
  Blood_Pressure: string;
  Bone_Density: string | number;
  Sleep_Hours: string | number;
  Symptom: string;
  Recommendation: string;
}

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
  provenance: 'Demo Research Dataset' | 'Supplied Research Dataset';
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
  expectedRecommendation: string; // Expected test outcome
}

export class DataAdapterService {
  /**
   * Normalizes raw Dataset A records into typed application entities.
   */
  public static getNormalizedAstronautRecords(): NormalizedAstronautRecord[] {
    return RAW_ASTRONAUT_HEALTH_DATASET.map((r: any, idx: number) => {
      const hr = Number(r.Heart_Rate) || 70;
      const sleep = Number(r.Sleep_Hours) || 7.0;
      const bone = Number(r.Bone_Density) || 1.0;
      const symptom = r.Symptom || 'None';

      let status: 'NOMINAL' | 'WATCH' | 'CRITICAL' = 'NOMINAL';
      if (sleep < 5.5 || hr > 85 || bone < 0.88 || symptom.includes('Disruption') || symptom.includes('Elevated Stress')) {
        status = 'WATCH';
      }
      if (sleep < 4.5 || hr > 95 || bone < 0.82) {
        status = 'CRITICAL';
      }

      return {
        id: r.Astronaut_ID || `AST-${idx + 1}`,
        astronautId: r.Astronaut_ID || `AST-${idx + 1}`,
        name: r.Astronaut_ID === 'AST-001' ? 'CDR Maya Chen' : `Astronaut ${r.Astronaut_ID}`,
        age: Number(r.Age) || 35,
        missionDays: Number(r.Mission_Days) || 100,
        heartRate: hr,
        bloodPressure: r.Blood_Pressure || '120/80',
        boneDensity: bone,
        sleepHours: sleep,
        symptom,
        status,
        provenance: 'Supplied Research Dataset'
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
   * Generates summary statistics across Dataset A for the Medical Dashboard.
   */
  public static getDatasetStatistics() {
    const records = this.getNormalizedAstronautRecords();
    const total = records.length;
    const watchCount = records.filter(r => r.status === 'WATCH').length;
    const criticalCount = records.filter(r => r.status === 'CRITICAL').length;
    const nominalCount = total - watchCount - criticalCount;

    const avgHeartRate = Math.round(records.reduce((acc, r) => acc + r.heartRate, 0) / total);
    const avgSleep = Number((records.reduce((acc, r) => acc + r.sleepHours, 0) / total).toFixed(1));
    const avgBoneDensity = Number((records.reduce((acc, r) => acc + r.boneDensity, 0) / total).toFixed(2));
    const avgMissionDays = Math.round(records.reduce((acc, r) => acc + r.missionDays, 0) / total);

    const symptomsCount: Record<string, number> = {};
    records.forEach(r => {
      symptomsCount[r.symptom] = (symptomsCount[r.symptom] || 0) + 1;
    });

    return {
      totalRecords: total,
      nominalCount,
      watchCount,
      criticalCount,
      avgHeartRate,
      avgSleep,
      avgBoneDensity,
      avgMissionDays,
      symptomsCount,
      provenanceDisclaimer: 'Supplied research dataset — approximately 1,000 synthetic demo astronaut records'
    };
  }
}
