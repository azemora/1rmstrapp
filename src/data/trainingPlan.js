// A chave do objeto é o dia da semana: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

export const trainingPlan = {
  1: { // Segunda-feira
    dayName: "Peito & Tríceps",
    exercises: [
      { id: 1, name: "Supino Reto com Barra", sets: "4", reps: "6-8" },
      { id: 2, name: "Supino Inclinado com Halteres", sets: "3", reps: "8-10" },
      { id: 3, name: "Tríceps Pulley", sets: "3", reps: "10-12" },
    ]
  },
  3: { // Quarta-feira
    dayName: "Costas & Bíceps",
    exercises: [
      { id: 4, name: "Barra Fixa", sets: "4", reps: "Até a falha" },
      { id: 5, name: "Remada Curvada", sets: "3", reps: "6-8" },
      { id: 6, name: "Rosca Direta com Barra", sets: "3", reps: "8-10" },
    ]
  },
  5: { // Sexta-feira
    dayName: "Pernas & Ombros",
    exercises: [
      { id: 7, name: "Agachamento Livre", sets: "4", reps: "6-8" },
      { id: 8, name: "Leg Press 8", sets: "3", reps: "10-12" },
      { id: 9, name: "Desenvolvimento Militar com Barra", sets: "4", reps: "6-8" },
    ]
  },
  // Dias de descanso
  0: null, // Domingo
  2: null, // Terça
  4: null, // Quinta
  6: null, // Sábado
};