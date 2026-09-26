import { AlertItem } from '../types';
import { AppState } from './store';

export const alertService = {
  getAlerts(): AlertItem[] {
    const alerts = AppState.getAlerts();
    const isSim = AppState.isSimulationActive();

    if (isSim) {
      return alerts.map(a => {
        if (a.id === 'alt-01' || a.id === 'alt-03') {
          return { ...a, status: 'RESOLVED', description: 'Post-intervention recovery confirmed. Biomarkers nominal.' };
        }
        return a;
      });
    }

    return alerts;
  },

  acknowledgeAlert(id: string, userName: string): AlertItem[] {
    const alerts = AppState.getAlerts();
    const updated = alerts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'ACKNOWLEDGED' as const,
          acknowledgedBy: userName,
          acknowledgedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC'
        };
      }
      return a;
    });
    AppState.saveAlerts(updated);
    return updated;
  },

  resolveAlert(id: string): AlertItem[] {
    const alerts = AppState.getAlerts();
    const updated = alerts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'RESOLVED' as const
        };
      }
      return a;
    });
    AppState.saveAlerts(updated);
    return updated;
  }
};
