import { EnvironmentTelemetry, TimelineEvent } from '../types';
import { MOCK_ENVIRONMENT, MOCK_TIMELINE } from '../data/mockData';
import { AppState } from './store';
import { healthService } from './healthService';

export const missionService = {
  getEnvironmentTelemetry(): EnvironmentTelemetry {
    return MOCK_ENVIRONMENT;
  },

  getTimelineEvents(): TimelineEvent[] {
    return MOCK_TIMELINE;
  },

  getMissionTimeline(): TimelineEvent[] {
    return MOCK_TIMELINE;
  },

  calculateMissionHealthIndex(): { score: number; status: string; breakdown: { crew: number; environment: number; payload: number } } {
    const isSim = AppState.isSimulationActive();

    if (isSim) {
      return {
        score: 98,
        status: 'EXCELLENT',
        breakdown: { crew: 98, environment: 97, payload: 99 }
      };
    }

    // Default Day 147 state: CDR Maya Chen is WATCH (86/100)
    return {
      score: 86,
      status: 'NOMINAL — WATCH ACTIVE',
      breakdown: { crew: 82, environment: 91, payload: 95 }
    };
  }
};
