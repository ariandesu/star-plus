import { AnalysisSignal, RecommendedAction } from '../types';
import { MAYA_ANALYSIS_SIGNAL } from '../data/mockData';
import { AppState } from './store';

export const analysisService = {
  getAnalysisSignal(astronautId: string): AnalysisSignal {
    const isSim = AppState.isSimulationActive();
    const savedActions = AppState.getRecommendedActions();

    if (isSim) {
      return {
        ...MAYA_ANALYSIS_SIGNAL,
        status: 'STABLE',
        summary: 'Post-Intervention Analysis: Mandatory restorative rest protocol and workload reduction successfully restored autonomic balance and sleep architecture. All primary health indicators have returned to nominal baseline range.',
        deviations: [
          { metric: 'Sleep Duration', baseline: '7.5 hrs/night', current: '7.6 hrs', deviationPercent: 1.3, direction: 'elevated' },
          { metric: 'Resting Heart Rate', baseline: '60 bpm', current: '61 bpm', deviationPercent: 1.6, direction: 'elevated' },
          { metric: 'Heart Rate Variability', baseline: '58 ms', current: '56 ms', deviationPercent: -3.4, direction: 'reduced' },
          { metric: 'Cognitive Reaction Time', baseline: '210 ms', current: '212 ms', deviationPercent: 0.9, direction: 'elevated' },
          { metric: 'Stress Index', baseline: '22 / 100', current: '24 / 100', deviationPercent: 9.0, direction: 'elevated' },
        ],
        recommendedActions: savedActions.map(a => ({ ...a, isCompleted: true }))
      };
    }

    return {
      ...MAYA_ANALYSIS_SIGNAL,
      recommendedActions: savedActions
    };
  },

  toggleActionStatus(actionId: string, role?: string): RecommendedAction[] {
    const actions = AppState.getRecommendedActions();
    const updated = actions.map(act => {
      if (act.id === actionId) {
        const nextState = !act.isCompleted;
        return {
          ...act,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC' : undefined,
          completedByRole: nextState ? (role as any || 'medical') : undefined
        };
      }
      return act;
    });
    AppState.saveRecommendedActions(updated);
    return updated;
  }
};
