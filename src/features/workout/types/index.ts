import { WORKOUT_PHASE } from '../../../constants';

export type WorkoutPhase = typeof WORKOUT_PHASE[keyof typeof WORKOUT_PHASE];

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
