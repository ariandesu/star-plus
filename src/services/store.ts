import { UserSession, Role, AlertItem, RecommendedAction, HealthStatus, MetricPoint } from '../types';
import { DEMO_USERS, MOCK_ASTRONAUTS, MAYA_HEALTH_METRICS, MAYA_ANALYSIS_SIGNAL, MOCK_ENVIRONMENT, MOCK_ALERTS, MOCK_TIMELINE, MAYA_DAILY_SCHEDULE } from '../data/mockData';

const SESSION_KEY = 'star_plus_user_session';
const ALERTS_KEY = 'star_plus_alerts_state';
const ACTIONS_KEY = 'star_plus_actions_state';
const SIMULATION_KEY = 'star_plus_simulation_active';

export class AppState {
  static getSession(): UserSession | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static setSession(session: UserSession | null): void {
    if (typeof window === 'undefined') return;
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  static isSimulationActive(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIMULATION_KEY) === 'true';
  }

  static setSimulationActive(active: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIMULATION_KEY, active ? 'true' : 'false');
  }

  static getAlerts(): AlertItem[] {
    if (typeof window === 'undefined') return MOCK_ALERTS;
    const data = localStorage.getItem(ALERTS_KEY);
    if (!data) return MOCK_ALERTS;
    try {
      return JSON.parse(data);
    } catch {
      return MOCK_ALERTS;
    }
  }

  static saveAlerts(alerts: AlertItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }

  static getRecommendedActions(): RecommendedAction[] {
    if (typeof window === 'undefined') return MAYA_ANALYSIS_SIGNAL.recommendedActions;
    const data = localStorage.getItem(ACTIONS_KEY);
    if (!data) return MAYA_ANALYSIS_SIGNAL.recommendedActions;
    try {
      return JSON.parse(data);
    } catch {
      return MAYA_ANALYSIS_SIGNAL.recommendedActions;
    }
  }

  static saveRecommendedActions(actions: RecommendedAction[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
  }
}
