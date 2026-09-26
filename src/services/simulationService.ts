import { AppState } from './store';

export const simulationService = {
  isSimulating(): boolean {
    return AppState.isSimulationActive();
  },

  startSimulation(): void {
    AppState.setSimulationActive(true);
  },

  resetSimulation(): void {
    AppState.setSimulationActive(false);
  }
};
