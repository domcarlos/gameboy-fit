import { useState, useRef, useCallback, useEffect } from 'react';
import { Program, Exercise } from '../../../features/cartridge/types';
import { WorkoutSession, WorkoutPhase, SetLog } from '../types';
import { WORKOUT_PHASE } from '../../../constants';
import { sessionService } from '../../../services';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function flattenExercises(program: Program): Exercise[] {
  return program.sections.flatMap(s => s.exercises);
}

export interface UseWorkoutReturn {
  // Estado
  session: WorkoutSession | null;
  phase: WorkoutPhase;
  currentExercise: Exercise | null;
  currentExIdx: number;
  currentSet: number;
  totalElapsed: number;
  setElapsed: number;
  restRemaining: number;
  loads: Record<string, number | null>;
  exercises: Exercise[];

  // Ações
  startWorkout: () => void;
  completeSet: () => void;
  togglePause: () => void;
  skipRest: () => void;
  updateLoad: (exerciseId: string, load: number | null) => void;
  finishWorkout: () => void;
}

export function useWorkout(cartridgeId: string, program: Program): UseWorkoutReturn {
  const exercises = flattenExercises(program);

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [phase, setPhase] = useState<WorkoutPhase>(WORKOUT_PHASE.IDLE);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [setElapsed, setSetElapsed] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [loads, setLoads] = useState<Record<string, number | null>>({});

  // Refs para timers e sessão mutável
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<WorkoutSession | null>(null);
  const totalElapsedRef = useRef(0);

  const currentExercise = exercises[currentExIdx] ?? null;

  // Sincroniza ref com state para uso em callbacks
  useEffect(() => {
    totalElapsedRef.current = totalElapsed;
  }, [totalElapsed]);

  // Timer global (roda durante running e resting)
  useEffect(() => {
    const isActive = phase === WORKOUT_PHASE.RUNNING || phase === WORKOUT_PHASE.RESTING;
    if (isActive) {
      totalTimerRef.current = setInterval(() => setTotalElapsed(t => t + 1), 1000);
    }
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [phase]);

  // Timer de série (só durante running)
  useEffect(() => {
    if (phase === WORKOUT_PHASE.RUNNING) {
      setTimerRef.current = setInterval(() => setSetElapsed(t => t + 1), 1000);
    }
    return () => {
      if (setTimerRef.current) clearInterval(setTimerRef.current);
    };
  }, [phase, currentSet, currentExIdx]);

  // Timer de descanso
  useEffect(() => {
    if (phase === WORKOUT_PHASE.RESTING) {
      restTimerRef.current = setInterval(() => {
        setRestRemaining(r => {
          if (r <= 1) {
            clearInterval(restTimerRef.current!);
            setPhase(WORKOUT_PHASE.RUNNING);
            setSetElapsed(0);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [phase]);

  const startWorkout = useCallback(() => {
    const newSession: WorkoutSession = {
      id: generateId(),
      cartridge_id: cartridgeId,
      program_id: program.id,
      started_at: new Date().toISOString(),
      finished_at: null,
      total_duration_seconds: 0,
      exercise_logs: exercises.map(ex => ({
        exercise_id: ex.id,
        exercise_name: ex.name,
        sets: [],
      })),
    };

    sessionRef.current = newSession;
    setSession(newSession);
    setPhase(WORKOUT_PHASE.RUNNING);
    setCurrentExIdx(0);
    setCurrentSet(1);
    setTotalElapsed(0);
    setSetElapsed(0);
  }, [cartridgeId, program.id, exercises]);

  const finishWorkout = useCallback(() => {
    if (!sessionRef.current) return;

    const finished: WorkoutSession = {
      ...sessionRef.current,
      finished_at: new Date().toISOString(),
      total_duration_seconds: totalElapsedRef.current,
    };

    sessionRef.current = finished;
    setSession(finished);
    setPhase(WORKOUT_PHASE.FINISHED);

    // Persiste de forma assíncrona sem bloquear a UI
    sessionService.save(finished).catch(console.error);
  }, []);

  const completeSet = useCallback(() => {
    if (!sessionRef.current || !currentExercise) return;

    const setLog: SetLog = {
      set_number: currentSet,
      reps_done: currentExercise.reps,
      load_kg: loads[currentExercise.id] ?? currentExercise.load_suggested_kg,
      duration_seconds: setElapsed,
      completed_at: new Date().toISOString(),
    };

    // Atualiza log imutavelmente
    const updatedLogs = sessionRef.current.exercise_logs.map(log =>
      log.exercise_id === currentExercise.id
        ? { ...log, sets: [...log.sets, setLog] }
        : log
    );

    sessionRef.current = { ...sessionRef.current, exercise_logs: updatedLogs };
    setSession({ ...sessionRef.current });

    const isLastSet = currentSet >= currentExercise.sets;
    const isLastExercise = currentExIdx >= exercises.length - 1;

    if (isLastSet && isLastExercise) {
      finishWorkout();
      return;
    }

    if (isLastSet) {
      setCurrentExIdx(i => i + 1);
      setCurrentSet(1);
    } else {
      setCurrentSet(s => s + 1);
    }

    setSetElapsed(0);

    if (currentExercise.rest_seconds > 0) {
      setRestRemaining(currentExercise.rest_seconds);
      setPhase(WORKOUT_PHASE.RESTING);
    }
  }, [currentExercise, currentSet, currentExIdx, exercises.length, loads, setElapsed, finishWorkout]);

  const togglePause = useCallback(() => {
    setPhase(p =>
      p === WORKOUT_PHASE.RUNNING ? WORKOUT_PHASE.PAUSED :
      p === WORKOUT_PHASE.PAUSED ? WORKOUT_PHASE.RUNNING : p
    );
  }, []);

  const skipRest = useCallback(() => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestRemaining(0);
    setPhase(WORKOUT_PHASE.RUNNING);
    setSetElapsed(0);
  }, []);

  const updateLoad = useCallback((exerciseId: string, load: number | null) => {
    setLoads(prev => ({ ...prev, [exerciseId]: load }));
  }, []);

  return {
    session,
    phase,
    currentExercise,
    currentExIdx,
    currentSet,
    totalElapsed,
    setElapsed,
    restRemaining,
    loads,
    exercises,
    startWorkout,
    completeSet,
    togglePause,
    skipRest,
    updateLoad,
    finishWorkout,
  };
}
