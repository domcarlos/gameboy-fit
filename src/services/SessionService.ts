import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '../features/workout/types';
import { STORAGE_KEYS } from '../constants';

class SessionService {
  async getAll(): Promise<WorkoutSession[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
    } catch {
      return [];
    }
  }

  async save(session: WorkoutSession): Promise<void> {
    const sessions = await this.getAll();
    const idx = sessions.findIndex(s => s.id === session.id);

    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  async getByCartridge(cartridgeId: string): Promise<WorkoutSession[]> {
    const all = await this.getAll();
    return all.filter(s => s.cartridge_id === cartridgeId);
  }

  async getByProgram(programId: string): Promise<WorkoutSession[]> {
    const all = await this.getAll();
    return all.filter(s => s.program_id === programId);
  }

  /**
   * Retorna a última carga usada para um exercício específico.
   * Usado pelo cockpit para pré-preencher o input de carga.
   */
  async getLastLoad(exerciseId: string): Promise<number | null> {
    const sessions = await this.getAll();

    for (let i = sessions.length - 1; i >= 0; i--) {
      const log = sessions[i].exercise_logs.find(l => l.exercise_id === exerciseId);
      if (log && log.sets.length > 0) {
        return log.sets[log.sets.length - 1].load_kg;
      }
    }

    return null;
  }

  /**
   * Retorna estatísticas resumidas de um programa
   */
  async getProgramStats(programId: string): Promise<{
    totalSessions: number;
    totalVolume: number;
    lastSessionAt: string | null;
  }> {
    const sessions = await this.getByProgram(programId);

    const totalVolume = sessions.reduce((acc, s) =>
      acc + s.exercise_logs.reduce((a, log) =>
        a + log.sets.reduce((x, set) =>
          x + (set.load_kg ?? 0) * set.reps_done, 0
        ), 0
      ), 0
    );

    const lastSession = sessions
      .filter(s => s.finished_at !== null)
      .sort((a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime())[0];

    return {
      totalSessions: sessions.length,
      totalVolume: Math.round(totalVolume),
      lastSessionAt: lastSession?.finished_at ?? null,
    };
  }
}

export const sessionService = new SessionService();
