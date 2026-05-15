// Todas as strings visíveis ao usuário ficam aqui.
// Para adicionar inglês: cria en.ts com as mesmas chaves.

export const pt = {
  common: {
    back: '← voltar',
    loading: 'carregando...',
    error: 'algo deu errado',
    cancel: 'cancelar',
    confirm: 'confirmar',
  },

  home: {
    appName: 'GAMEBOY.FIT',
    subtitle: 'seus cartuchos',
    uploadCartridge: 'carregar cartucho',
    uploadSub: 'R$ 1,99 · upload de treino externo',
  },

  programs: {
    backLabel: '← cartuchos',
    exercises: 'exercícios',
    duration: 'duração',
  },

  workoutSheet: {
    backLabel: '← fichas',
    startButton: 'iniciar treino',
    conjugated: 'conjugado',
    bodyweight: 'corporal',
  },

  workoutActive: {
    totalTime: 'tempo total',
    rest: 'descanso',
    skipRest: 'pular descanso →',
    next: 'a seguir',
    series: 'série',
    of: 'de',
    reps: 'repetições',
    duration: 'duração',
    load: 'carga (kg)',
    priorityLabel: 'exercício-foco',
    completeSet: 'completar série',
    finishWorkout: 'finalizar treino',
    endWorkoutTitle: 'Encerrar treino?',
    endWorkoutMessage: 'O progresso atual será salvo.',
  },

  workoutFinished: {
    title: 'treino concluído',
    durationLabel: 'duração',
    setsLabel: 'séries',
    volumeLabel: 'volume (kg)',
    backHome: 'voltar ao início',
  },

  cartridge: {
    weeks: 'semanas',
    sessionsPerWeek: 'x / sem',
    sheets: 'fichas',
  },
} as const;

export type Strings = typeof pt;
export const strings = pt;
