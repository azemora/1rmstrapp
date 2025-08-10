interface PhaseConfig {
  name: string;
  color: string;
  rest: number;
  // CORREÇÃO AQUI: Mudamos de 'intensity' para 'percentage'
  percentage: number; 
}

export const TRAINING_PHASES: { [key: string]: PhaseConfig } = {
  highVolume: {
    name: 'Treino 1',
    color: '#3B82F6',
    rest: 180,
    percentage: 0.65,
  },
  mediumVolume: {
    name: 'Treino 2',
    color: '#10B981',
    rest: 180,
    percentage: 0.75,
  },
  lowVolume: {
    name: 'Treino 3',
    color: '#EF4444',
    rest: 240,
    percentage: 0.85,
  },
};