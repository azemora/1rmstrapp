interface PhaseConfig {
  name: string;
  color: string;
  rest: number;
  intensity: { min: number; max: number };
}

// A palavra "export" aqui na frente é a que resolve o problema
export const TRAINING_PHASES: { [key: string]: PhaseConfig } = {
  highVolume: {
    name: 'Treino 1',
    color: '#3B82F6', // Azul
    rest: 180,
    intensity: { min: 0.60, max: 0.70 },
  },
  mediumVolume: {
    name: 'Treino 2',
    color: '#10B981', // Verde
    rest: 180,
    intensity: { min: 0.70, max: 0.80 },
  },
  lowVolume: {
    name: 'Treino 3',
    color: '#EF4444', // Vermelho
    rest: 240,
    intensity: { min: 0.80, max: 0.90 },
  },
};