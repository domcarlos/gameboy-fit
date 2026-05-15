import { CARTRIDGE_TYPE, LOAD_TYPE } from '../../../constants';

export type LoadType = typeof LOAD_TYPE[keyof typeof LOAD_TYPE];
export type CartridgeType = typeof CARTRIDGE_TYPE[keyof typeof CARTRIDGE_TYPE];

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

export interface CartridgeCover {
  bg_color: string;
  accent_color: string;
  label_text: string;
  art_style: string;
}

export interface CartridgeMeta {
  title: string;
  author: string;
  author_type: 'official' | 'trainer' | 'user';
  sport_focus: string[];
  description: string;
  cover: CartridgeCover;
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
