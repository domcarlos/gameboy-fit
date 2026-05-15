import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, TextInput, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '../src/utils/tokens';
import { strings } from '../src/i18n';
import { useWorkout } from '../src/features/workout/hooks/useWorkout';
import { useCartridge } from '../src/features/cartridge/hooks/useCartridges';
import { WORKOUT_PHASE, LOAD_INCREMENT } from '../src/constants';
import { formatTime, formatLoad } from '../src/utils/format';
import { WorkoutSession } from '../src/features/workout/types';
import { Program } from '../src/features/cartridge/types';

export default function WorkoutActiveScreen() {
  const { cartridgeId, programId } = useLocalSearchParams<{ cartridgeId: string; programId: string }>();
  const { cartridge } = useCartridge(cartridgeId!);
  const program = cartridge?.cartridge.programs.find(p => p.id === programId);

  if (!cartridge || !program) return null;

  return <WorkoutCockpit cartridgeId={cartridgeId!} program={program} />;
}

function WorkoutCockpit({ cartridgeId, program }: { cartridgeId: string; program: Program }) {
  const workout = useWorkout(cartridgeId, program);
  const { phase, currentExercise, currentExIdx, currentSet,
    totalElapsed, setElapsed, restRemaining, loads, exercises,
    startWorkout, completeSet, togglePause, skipRest, updateLoad, finishWorkout } = workout;

  const [loadInput, setLoadInput] = useState('');

  useEffect(() => { startWorkout(); }, []);

  useEffect(() => {
    if (!currentExercise) return;
    const val = loads[currentExercise.id] ?? currentExercise.load_suggested_kg;
    setLoadInput(val != null ? String(val) : '');
  }, [currentExIdx]);

  if (phase === WORKOUT_PHASE.FINISHED && workout.session) {
    return <WorkoutResult session={workout.session} program={program} />;
  }
  if (!currentExercise) return null;

  const isPaused = phase === WORKOUT_PHASE.PAUSED;
  const isResting = phase === WORKOUT_PHASE.RESTING;

  const nextEx = currentExIdx < exercises.length - 1 ? exercises[currentExIdx + 1] : null;
  const isLastAction = currentSet >= currentExercise.sets && currentExIdx >= exercises.length - 1;

  const adjustLoad = (delta: number) => {
    const current = parseFloat(loadInput) || 0;
    const next = Math.max(0, current + delta);
    const str = next % 1 === 0 ? String(next) : next.toFixed(1);
    setLoadInput(str);
    updateLoad(currentExercise.id, next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() =>
          Alert.alert(strings.workoutActive.endWorkoutTitle, strings.workoutActive.endWorkoutMessage, [
            { text: strings.common.cancel },
            { text: strings.common.confirm, style: 'destructive', onPress: finishWorkout },
          ])
        }>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={styles.globalTimerBlock}>
          <Text style={[styles.globalTimerText, isPaused && styles.dimmed]}>{formatTime(totalElapsed)}</Text>
          <Text style={styles.globalTimerLabel}>{strings.workoutActive.totalTime}</Text>
        </View>
        <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
          <Text style={styles.pauseIcon}>{isPaused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {isResting ? (
          <View style={styles.restCard}>
            <Text style={styles.restLabel}>{strings.workoutActive.rest}</Text>
            <Text style={styles.restTimer}>{restRemaining}s</Text>
            <TouchableOpacity style={styles.skipBtn} onPress={skipRest}>
              <Text style={styles.skipText}>{strings.workoutActive.skipRest}</Text>
            </TouchableOpacity>
            {nextEx && <Text style={styles.restNext}>{strings.workoutActive.next}: {nextEx.name}</Text>}
          </View>
        ) : (
          <>
            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{currentExIdx + 1} / {exercises.length}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(currentExIdx / exercises.length) * 100}%` as any }]} />
              </View>
            </View>

            {/* Main card */}
            <View style={[styles.mainCard, currentExercise.priority && styles.mainCardPriority]}>
              {currentExercise.priority && (
                <View style={styles.priorityBanner}>
                  <Text style={styles.priorityText}>{strings.workoutActive.priorityLabel}</Text>
                </View>
              )}
              <Text style={styles.exName}>{currentExercise.name}</Text>
              {currentExercise.execution_note && (
                <Text style={styles.exNote}>{currentExercise.execution_note}</Text>
              )}

              {/* Set dots */}
              <View style={styles.setDots}>
                {Array.from({ length: currentExercise.sets }).map((_, i) => (
                  <View key={i} style={[
                    styles.dot,
                    i < currentSet - 1 && styles.dotDone,
                    i === currentSet - 1 && styles.dotActive,
                  ]} />
                ))}
              </View>
              <Text style={styles.setLabel}>
                {strings.workoutActive.series} {currentSet} {strings.workoutActive.of} {currentExercise.sets}
              </Text>

              {/* Reps / timer */}
              <View style={styles.repsBlock}>
                <Text style={styles.repsValue}>
                  {currentExercise.timer_per_rep ? `${currentExercise.timer_seconds}s` : String(currentExercise.reps)}
                </Text>
                <Text style={styles.repsLabel}>
                  {currentExercise.timer_per_rep ? strings.workoutActive.duration : strings.workoutActive.reps}
                </Text>
              </View>

              <Text style={[styles.setTimer, isPaused && styles.dimmed]}>{formatTime(setElapsed)}</Text>

              {/* Load input */}
              {currentExercise.load_type !== 'bodyweight' && (
                <View style={styles.loadBlock}>
                  <Text style={styles.loadLabel}>{strings.workoutActive.load}</Text>
                  <View style={styles.loadRow}>
                    <TouchableOpacity style={styles.loadBtn} onPress={() => adjustLoad(-LOAD_INCREMENT)}>
                      <Text style={styles.loadBtnText}>−</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.loadInput}
                      value={loadInput}
                      onChangeText={v => {
                        setLoadInput(v);
                        const n = parseFloat(v);
                        if (!isNaN(n)) updateLoad(currentExercise.id, n);
                      }}
                      keyboardType="decimal-pad"
                      selectTextOnFocus
                    />
                    <TouchableOpacity style={styles.loadBtn} onPress={() => adjustLoad(LOAD_INCREMENT)}>
                      <Text style={styles.loadBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Complete */}
            <TouchableOpacity
              style={[styles.completeBtn, isPaused && styles.completeBtnDisabled]}
              activeOpacity={0.85}
              disabled={isPaused}
              onPress={completeSet}
            >
              <Text style={styles.completeBtnText}>
                {isLastAction ? strings.workoutActive.finishWorkout : `${strings.workoutActive.completeSet} ${currentSet}/${currentExercise.sets}`}
              </Text>
            </TouchableOpacity>

            {/* Next */}
            {nextEx && (
              <View style={styles.nextCard}>
                <Text style={styles.nextLabel}>{strings.workoutActive.next}</Text>
                <Text style={styles.nextName}>{nextEx.name}</Text>
                <Text style={styles.nextDetail}>{nextEx.sets} × {nextEx.reps}{nextEx.load_suggested_kg ? ` · ${formatLoad(nextEx.load_suggested_kg)}` : ''}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkoutResult({ session, program }: { session: WorkoutSession; program: Program }) {
  const totalSets = session.exercise_logs.reduce((a, l) => a + l.sets.length, 0);
  const totalVolume = session.exercise_logs.reduce(
    (a, l) => a + l.sets.reduce((x, s) => x + (s.load_kg ?? 0) * s.reps_done, 0), 0
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.resultTitle}>{strings.workoutFinished.title}</Text>
        <Text style={styles.resultSub}>{program.title}</Text>
        <View style={styles.resultStats}>
          <StatCard label={strings.workoutFinished.durationLabel} value={formatTime(session.total_duration_seconds)} />
          <StatCard label={strings.workoutFinished.setsLabel} value={String(totalSets)} />
          <StatCard label={strings.workoutFinished.volumeLabel} value={totalVolume > 0 ? String(Math.round(totalVolume)) : '-'} />
        </View>
        <TouchableOpacity style={styles.completeBtn} onPress={() => router.replace('/')}>
          <Text style={styles.completeBtnText}>{strings.workoutFinished.backHome}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  closeBtn: { fontSize: Typography.lg, color: Colors.textMuted, padding: Spacing.sm },
  globalTimerBlock: { alignItems: 'center' },
  globalTimerText: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary },
  globalTimerLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  dimmed: { opacity: 0.4 },
  pauseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  pauseIcon: { fontSize: Typography.base, color: Colors.textPrimary },
  restCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xxl, alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.info },
  restLabel: { fontSize: Typography.sm, fontWeight: '700', letterSpacing: 2, color: Colors.info },
  restTimer: { fontSize: 72, fontWeight: '800', color: Colors.info },
  skipBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  skipText: { fontSize: Typography.sm, color: Colors.textSecondary },
  restNext: { fontSize: Typography.sm, color: Colors.textMuted },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  progressText: { fontSize: Typography.xs, color: Colors.textMuted, minWidth: 36 },
  progressTrack: { flex: 1, height: 3, backgroundColor: Colors.bgElevated, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  mainCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 0.5, borderColor: Colors.border, gap: Spacing.lg, alignItems: 'center' },
  mainCardPriority: { borderColor: Colors.priority, borderWidth: 1 },
  priorityBanner: { backgroundColor: Colors.priorityBg, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  priorityText: { fontSize: Typography.xs, color: Colors.priority, fontWeight: '700', letterSpacing: 1 },
  exName: { fontSize: Typography.xxl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  exNote: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center' },
  setDots: { flexDirection: 'row', gap: Spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  dotDone: { backgroundColor: Colors.accentDim, borderColor: Colors.accentDim },
  dotActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  setLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  repsBlock: { alignItems: 'center' },
  repsValue: { fontSize: 64, fontWeight: '800', color: Colors.textPrimary, lineHeight: 72 },
  repsLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  setTimer: { fontSize: Typography.xl, fontWeight: '600', color: Colors.accent },
  loadBlock: { alignItems: 'center', gap: Spacing.sm, width: '100%' },
  loadLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  loadRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  loadBtn: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  loadBtnText: { fontSize: Typography.xl, color: Colors.textPrimary, fontWeight: '600' },
  loadInput: { width: 90, height: 52, borderRadius: Radius.md, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.accent, textAlign: 'center', fontSize: Typography.xxl, fontWeight: '700', color: Colors.textPrimary },
  completeBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center' },
  completeBtnDisabled: { opacity: 0.4 },
  completeBtnText: { fontSize: Typography.lg, fontWeight: '800', color: Colors.bg },
  nextCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 0.5, borderColor: Colors.border },
  nextLabel: { fontSize: Typography.xs, color: Colors.textMuted, minWidth: 44 },
  nextName: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary },
  nextDetail: { fontSize: Typography.xs, color: Colors.textMuted },
  resultContent: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.xl, paddingTop: 60 },
  trophy: { fontSize: 64 },
  resultTitle: { fontSize: Typography.xxxl, fontWeight: '800', color: Colors.textPrimary },
  resultSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center' },
  resultStats: { flexDirection: 'row', gap: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', gap: 4, borderWidth: 0.5, borderColor: Colors.border },
  statValue: { fontSize: Typography.xl, fontWeight: '800', color: Colors.accent },
  statLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
});
