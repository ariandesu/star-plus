import { Astronaut, HealthMetricDetail, HealthDomainScore } from '../types';
import { MOCK_ASTRONAUTS, MAYA_HEALTH_METRICS } from '../data/mockData';
import { AppState } from './store';

export const healthService = {
  getAstronauts(): Astronaut[] {
    const isSim = AppState.isSimulationActive();
    if (isSim) {
      return MOCK_ASTRONAUTS.map(a => {
        if (a.id === 'maya-chen') {
          return { ...a, status: 'STABLE' };
        }
        return a;
      });
    }
    return MOCK_ASTRONAUTS;
  },

  getAstronautById(id: string): Astronaut | undefined {
    const astronauts = this.getAstronauts();
    return astronauts.find(a => a.id === id);
  },

  getAstronautMetrics(astronautId?: string): HealthMetricDetail[] {
    return Object.values(this.getMayaMetrics());
  },

  getMayaMetrics(): Record<string, HealthMetricDetail> {
    const isSim = AppState.isSimulationActive();
    if (!isSim) {
      return MAYA_HEALTH_METRICS;
    }

    // Recovered metrics state after simulation intervention
    return {
      heartRate: {
        ...MAYA_HEALTH_METRICS.heartRate,
        currentValue: 61,
        deviationPercent: 1.6,
        status: 'STABLE',
        trend: 'down',
        description: 'Post-intervention: Resting HR normalized to baseline 61 bpm following rest protocol.'
      },
      sleep: {
        ...MAYA_HEALTH_METRICS.sleep,
        currentValue: 7.6,
        deviationPercent: 1.3,
        status: 'STABLE',
        trend: 'up',
        description: 'Post-intervention: Night sleep recovered to 7.6 hrs with full REM recovery.'
      },
      hrv: {
        ...MAYA_HEALTH_METRICS.hrv,
        currentValue: 56,
        deviationPercent: -3.4,
        status: 'STABLE',
        trend: 'up',
        description: 'Post-intervention: HRV rebound to 56 ms reflecting balanced parasympathetic activation.'
      },
      stress: {
        ...MAYA_HEALTH_METRICS.stress,
        currentValue: 24,
        deviationPercent: 9.0,
        status: 'STABLE',
        trend: 'down',
        description: 'Post-intervention: Cortisol markers returned to baseline levels.'
      },
      cognitive: {
        ...MAYA_HEALTH_METRICS.cognitive,
        currentValue: 212,
        deviationPercent: 0.9,
        status: 'STABLE',
        trend: 'down',
        description: 'Post-intervention: PVT reaction speed restored to 212ms baseline.'
      },
      spO2: MAYA_HEALTH_METRICS.spO2
    };
  },

  getDomainScores(astronautId: string): HealthDomainScore[] {
    const isSim = AppState.isSimulationActive();
    if (astronautId === 'maya-chen' && !isSim) {
      return [
        { domain: 'Cardiovascular', score: 72, status: 'WATCH', deviationPercent: 23.3 },
        { domain: 'Sleep & Recovery', score: 58, status: 'WATCH', deviationPercent: -36.0 },
        { domain: 'Fitness & Musculoskeletal', score: 88, status: 'STABLE', deviationPercent: -5.0 },
        { domain: 'Cognitive & Neuro', score: 70, status: 'WATCH', deviationPercent: 26.2 },
        { domain: 'Environmental Exposure', score: 94, status: 'STABLE', deviationPercent: 2.1 },
      ];
    }

    return [
      { domain: 'Cardiovascular', score: 96, status: 'STABLE', deviationPercent: 1.5 },
      { domain: 'Sleep & Recovery', score: 94, status: 'STABLE', deviationPercent: 1.2 },
      { domain: 'Fitness & Musculoskeletal', score: 92, status: 'STABLE', deviationPercent: 0.0 },
      { domain: 'Cognitive & Neuro', score: 95, status: 'STABLE', deviationPercent: 0.8 },
      { domain: 'Environmental Exposure', score: 98, status: 'STABLE', deviationPercent: 0.5 },
    ];
  }
};
