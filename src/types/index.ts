export type LoadType = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';
export type CartridgeType = 'official' | 'trainer' | 'pirate';

export interface Exercise {
  id: string;
  order: number | string;
  name: string;
  sets: number;
  reps: number;
  load_suggested_kg: number | null;
  load_type: LoadType;
  execution_note: string | null;
  priority: boolean;
  paired_with: string | null;
  load_unit: string | null;
  rest_seconds: number;
  timer_per_rep: boolean;
  timer_seconds?: number;
}

export interface Section {
  id: string;
  title: string;
  exercises: Exercise[];
}

export interface Program {
  id: string;
  label: string;
  title: string;
  focus: string;
  duration_min: number;
  muscle_groups: string[];
  sections: Section[];
}

export interface CartridgeMeta {
  title: string;
  author: string;
  author_type: 'official' | 'trainer' | 'user';
  sport_focus: string[];
  description: string;
  cover: {
    bg_color: string;
    accent_color: string;
    label_text: string;
    art_style: string;
  };
  tags: string[];
  created_at: string;
  weeks: number;
  sessions_per_week: number;
}

export interface Cartridge {
  $schema: string;
  cartridge: {
    id: string;
    version: string;
    type: CartridgeType;
    meta: CartridgeMeta;
    programs: Program[];
  };
}

// Sessão de treino em execução
export interface SetLog {
  set_number: number;
  reps_done: number;
  load_kg: number | null;
  duration_seconds: number | null;
  completed_at: string;
}

export interface ExerciseLog {
  exercise_id: string;
  exercise_name: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  cartridge_id: string;
  program_id: string;
  started_at: string;
  finished_at: string | null;
  total_duration_seconds: number;
  exercise_logs: ExerciseLog[];
}
