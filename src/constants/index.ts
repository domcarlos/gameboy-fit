// Rotas do app
export const ROUTES = {
  HOME: '/' as const,
  PROGRAMS: '/programs' as const,
  WORKOUT_SHEET: '/workout-sheet' as const,
  WORKOUT_ACTIVE: '/workout-active' as const,
  HISTORY: '/history' as const,
} as const;

// Chaves do AsyncStorage — nunca escrever strings soltas no código
export const STORAGE_KEYS = {
  SESSIONS: '@gameboyfit:sessions_v1',
  CARTRIDGES: '@gameboyfit:cartridges_v1',
  USER_PREFERENCES: '@gameboyfit:prefs_v1',
} as const;

// Tipos de cartucho
export const CARTRIDGE_TYPE = {
  OFFICIAL: 'official',
  TRAINER: 'trainer',
  PIRATE: 'pirate',
} as const;

// Tipos de carga
export const LOAD_TYPE = {
  BARBELL: 'barbell',
  DUMBBELL: 'dumbbell',
  MACHINE: 'machine',
  CABLE: 'cable',
  BODYWEIGHT: 'bodyweight',
} as const;

// Fases do treino
export const WORKOUT_PHASE = {
  IDLE: 'idle',
  RUNNING: 'running',
  RESTING: 'resting',
  PAUSED: 'paused',
  FINISHED: 'finished',
} as const;

// Incremento padrão de carga (kg)
export const LOAD_INCREMENT = 2.5;

// Versão do schema do cartucho
export const CARTRIDGE_SCHEMA_VERSION = '1.0.0';
export const CARTRIDGE_SCHEMA_URL = 'https://gameboy.fit/cartridge/v1';
