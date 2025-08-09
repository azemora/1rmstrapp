interface PhaseConfig {
  name: string;
  color: string;
  rest: number;
}

export const TRAINING_PHASES: { [key: string]: PhaseConfig } = {
  highVolume: { name: 'Treino 1', color: '#3B82F6', rest: 180 },
  mediumVolume: { name: 'Treino 2', color: '#10B981', rest: 180 },
  lowVolume: { name: 'Treino 3', color: '#EF4444', rest: 240 },
};