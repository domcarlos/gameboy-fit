import { useState, useRef, useCallback, useEffect } from 'react';
import { WorkoutSession, ExerciseLog, SetLog, Program, Exercise } from '../types';
import { saveSession } from '../store/sessions';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type WorkoutPhase = 'idle' | 'running' | 'resting' | 'paused' | 'finished';

export interface ActiveSet {
  exerciseId: string;
  setNumber: number; // 1-based
  totalSets: number;
  elapsed: number;
  load: number | null;
}

export function useWorkout(cartridgeId: string, program: Program) {
  // Flatten todos os exercícios em ordem
  const exercises: Exercise[] = program.sections.flatMap(s => s.exercises);

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [phase, setPhase] = useState<WorkoutPhase>('idle');
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [setElapsed, setSetElapsed] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [loads, setLoads] = useState<Record<string, number | null>>({});

  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<WorkoutSession | null>(null);

  const currentExercise = exercises[currentExIdx] ?? null;

  // Iniciar treino
  const startWorkout = useCallback(() => {
    const newSession: WorkoutSession = {
      id: uuid(),
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
    setPhase('running');
    setCurrentExIdx(0);
    setCurrentSet(1);
    setTotalElapsed(0);
    setSetElapsed(0);
  }, [cartridgeId, program, exercises]);

  // Timer global
  useEffect(() => {
    if (phase === 'running' || phase === 'resting') {
      totalTimerRef.current = setInterval(() => {
        setTotalElapsed(t => t + 1);
      }, 1000);
    }
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [phase]);

  // Timer de série
  useEffect(() => {
    if (phase === 'running') {
      setTimerRef.current = setInterval(() => {
        setSetElapsed(t => t + 1);
      }, 1000);
    }
    return () => {
      if (setTimerRef.current) clearInterval(setTimerRef.current);
    };
  }, [phase, currentSet, currentExIdx]);

  // Timer de descanso
  useEffect(() => {
    if (phase === 'resting') {
      restTimerRef.current = setInterval(() => {
        setRestRemaining(r => {
          if (r <= 1) {
            clearInterval(restTimerRef.current!);
            setPhase('running');
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

  // Pause/resume
  const togglePause = useCallback(() => {
    setPhase(p => {
      if (p === 'running') return 'paused';
      if (p === 'paused') return 'running';
      return p;
    });
  }, []);

  // Completar série
  const completeSet = useCallback(() => {
    if (!sessionRef.current || !currentExercise) return;

    const setLog: SetLog = {
      set_number: currentSet,
      reps_done: currentExercise.reps,
      load_kg: loads[currentExercise.id] ?? currentExercise.load_suggested_kg,
      duration_seconds: setElapsed,
      completed_at: new Date().toISOString(),
    };

    // Atualiza log da sessão
    const updatedLogs = sessionRef.current.exercise_logs.map(log => {
      if (log.exercise_id === currentExercise.id) {
        return { ...log, sets: [...log.sets, setLog] };
      }
      return log;
    });
    sessionRef.current = { ...sessionRef.current, exercise_logs: updatedLogs };
    setSession({ ...sessionRef.current });

    const isLastSet = currentSet >= currentExercise.sets;
    const isLastExercise = currentExIdx >= exercises.length - 1;

    if (isLastSet && isLastExercise) {
      // Treino completo
      finishWorkout();
      return;
    }

    if (isLastSet) {
      // Próximo exercício
      setCurrentExIdx(i => i + 1);
      setCurrentSet(1);
    } else {
      // Próxima série
      setCurrentSet(s => s + 1);
    }

    setSetElapsed(0);

    // Descanso (exceto conjugado)
    const rest = currentExercise.rest_seconds;
    if (rest > 0) {
      setRestRemaining(rest);
      setPhase('resting');
    }
  }, [currentExercise, currentSet, currentExIdx, exercises, loads, setElapsed]);

  // Pular descanso
  const skipRest = useCallback(() => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestRemaining(0);
    setPhase('running');
    setSetElapsed(0);
  }, []);

  // Atualizar carga
  const updateLoad = useCallback((exerciseId: string, load: number | null) => {
    setLoads(prev => ({ ...prev, [exerciseId]: load }));
  }, []);

  // Finalizar treino
  const finishWorkout = useCallback(() => {
    if (!sessionRef.current) return;
    const finished: WorkoutSession = {
      ...sessionRef.current,
      finished_at: new Date().toISOString(),
      total_duration_seconds: totalElapsed,
    };
    sessionRef.current = finished;
    setSession(finished);
    setPhase('finished');
    saveSession(finished);
  }, [totalElapsed]);

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

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
