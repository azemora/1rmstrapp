
import { TRAINING_PHASES } from '../data/trainingConfig';

export const calculate1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return parseFloat(weight);
  const oneRepMax = weight * (1 + (reps / 30));
  return Math.round(oneRepMax * 100) / 100;
};
const LOAD_PERCENTAGES = {
  highVolume: 0.60,   // Treino 1
  mediumVolume: 0.80, // Treino 2
  lowVolume: 1.10,    // Treino 3
};

// Esta função decide qual é a fase do treino com base na semana do ano
export const getTrainingPhase = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((date - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);

  const phaseIndex = (weekNumber - 1) % 3; // Ciclo de 3 semanas

  if (phaseIndex === 0) return { phase: 'highVolume', sets: 3, reps: '12-15' };
  if (phaseIndex === 1) return { phase: 'mediumVolume', sets: 3, reps: '8-10' };
  return { phase: 'lowVolume', sets: 4, reps: '4-6' }; // phaseIndex === 2
};

// Esta função calcula a carga de trabalho final
export const getWorkingLoad = (oneRepMax, phase) => {
  if (!oneRepMax || oneRepMax <= 0 || !phase) return 'N/A';

  const { intensity } = TRAINING_PHASES[phase]; // Pega a faixa de intensidade

  const minLoad = oneRepMax * intensity.min;
  const maxLoad = oneRepMax * intensity.max;

  // Arredonda os valores para o múltiplo de 2.5 mais próximo
  const roundedMin = Math.round(minLoad / 2.5) * 2.5;
  const roundedMax = Math.round(maxLoad / 2.5) * 2.5;

  // Se os valores forem iguais após o arredondamento, mostra só um
  if (roundedMin === roundedMax) {
      return `${roundedMax}kg`;
  }

  return `${roundedMin}kg - ${roundedMax}kg`;
};