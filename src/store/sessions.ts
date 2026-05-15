import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, ExerciseLog, SetLog } from '../types';

const SESSIONS_KEY = '@gameboyfit:sessions';

export async function saveSessions(sessions: WorkoutSession[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function loadSessions(): Promise<WorkoutSession[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const sessions = await loadSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  await saveSessions(sessions);
}

export async function getSessionsByCartridge(cartridgeId: string): Promise<WorkoutSession[]> {
  const sessions = await loadSessions();
  return sessions.filter(s => s.cartridge_id === cartridgeId);
}

// Busca a última carga usada para um exercício
export async function getLastLoad(exerciseId: string): Promise<number | null> {
  const sessions = await loadSessions();
  for (let i = sessions.length - 1; i >= 0; i--) {
    const log = sessions[i].exercise_logs.find(l => l.exercise_id === exerciseId);
    if (log && log.sets.length > 0) {
      const last = log.sets[log.sets.length - 1];
      return last.load_kg;
    }
  }
  return null;
}
