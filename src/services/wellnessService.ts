import { DailyWellnessLog } from '../types';

const WELLNESS_LOGS_KEY = 'star_plus_wellness_logs';

export const INITIAL_WELLNESS_LOG: DailyWellnessLog = {
  id: 'log-default-147',
  timestamp: new Date().toISOString(),
  missionDay: 147,
  astronautId: 'maya-chen',
  astronautName: 'CDR Maya Chen',
  sleepHours: 7.5,
  sleepQuality: 'Great',
  headSinus: 'None',
  backSpine: 'A Little',
  stomachNausea: 'None',
  energyLevel: 8,
  mood: 'Energetic',
  waterGlasses: 8,
  ateAllMeals: true,
  didExercise: true,
  vitalsSnapshot: {
    heartRate: 74,
    spO2: 97,
    hrv: 52,
  },
  status: 'SUBMITTED',
};

export class WellnessService {
  static getLogs(): DailyWellnessLog[] {
    if (typeof window === 'undefined') return [INITIAL_WELLNESS_LOG];
    const data = localStorage.getItem(WELLNESS_LOGS_KEY);
    if (!data) return [INITIAL_WELLNESS_LOG];
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_WELLNESS_LOG];
    } catch {
      return [INITIAL_WELLNESS_LOG];
    }
  }

  static getLatestLog(): DailyWellnessLog {
    const logs = this.getLogs();
    return logs[0] || INITIAL_WELLNESS_LOG;
  }

  static saveLog(log: DailyWellnessLog): void {
    if (typeof window === 'undefined') return;
    const logs = this.getLogs();
    const existingIndex = logs.findIndex((l) => l.missionDay === log.missionDay);
    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.unshift(log);
    }
    localStorage.setItem(WELLNESS_LOGS_KEY, JSON.stringify(logs));
  }
}
