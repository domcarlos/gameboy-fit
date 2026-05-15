import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '../src/utils/tokens';
import cartridgeData from '../src/data/cartridge-elite-futebol.json';
import { Cartridge, Exercise } from '../src/types';

const cartridge = cartridgeData as unknown as Cartridge;

export default function WorkoutSheetScreen() {
  const { cartridgeId, programId } = useLocalSearchParams<{
    cartridgeId: string;
    programId: string;
  }>();

  const program = cartridge.cartridge.programs.find(p => p.id === programId);
  if (!program) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Nav */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← fichas</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.labelBadge}>
              <Text style={styles.labelLetter}>{program.label}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{program.title}</Text>
              <Text style={styles.heroSub}>{program.focus} · ~{program.duration_min}min</Text>
            </View>
          </View>
        </View>

        {/* Seções e exercícios */}
        {program.sections.map(section => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.exercises.map((ex, idx) => (
              <ExerciseRow key={ex.id} exercise={ex} index={idx} />
            ))}
          </View>
        ))}

        {/* CTA iniciar */}
        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => router.push({
            pathname: '/workout-active',
            params: { cartridgeId, programId },
          })}
        >
          <Text style={styles.startBtnText}>iniciar treino</Text>
          <Text style={styles.startBtnSub}>
            {program.sections.flatMap(s => s.exercises).length} exercícios · ~{program.duration_min}min
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function ExerciseRow({ exercise: ex, index }: { exercise: Exercise; index: number }) {
  const isPaired = ex.paired_with !== null;
  const isTimer = ex.timer_per_rep;

  return (
    <View style={[styles.exRow, ex.priority && styles.exRowPriority]}>
      <View style={styles.exLeft}>
        <Text style={styles.exOrder}>{String(ex.order).padStart(2, '0')}</Text>
        {ex.priority && <View style={styles.priorityDot} />}
      </View>

      <View style={styles.exBody}>
        <Text style={styles.exName}>{ex.name}</Text>
        {ex.execution_note && (
          <Text style={styles.exNote}>{ex.execution_note}</Text>
        )}
        {isPaired && (
          <View style={styles.pairedBadge}>
            <Text style={styles.pairedText}>conjugado</Text>
          </View>
        )}
      </View>

      <View style={styles.exRight}>
        <Text style={styles.exSets}>
          {isTimer
            ? `${ex.sets} × ${ex.timer_seconds}s`
            : `${ex.sets} × ${ex.reps}`}
        </Text>
        {ex.load_suggested_kg != null && (
          <Text style={styles.exLoad}>{ex.load_suggested_kg} kg</Text>
        )}
        {ex.load_type === 'bodyweight' && (
          <Text style={styles.exLoad}>corporal</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },

  back: { marginBottom: Spacing.xs },
  backText: { fontSize: Typography.sm, color: Colors.accent },

  hero: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  labelBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentBg,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelLetter: {
    fontSize: Typography.xl,
    fontWeight: '800',
    color: Colors.accent,
  },
  heroTitle: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Seções
  section: { gap: Spacing.xs },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.xs,
  },

  // Exercise row
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  exRowPriority: {
    borderColor: Colors.priority,
    backgroundColor: Colors.priorityBg,
  },

  exLeft: {
    alignItems: 'center',
    gap: 3,
    minWidth: 28,
  },
  exOrder: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.priority,
  },

  exBody: { flex: 1, gap: 3 },
  exName: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  exNote: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  pairedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.accent,
  },
  pairedText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
  },

  exRight: { alignItems: 'flex-end', gap: 2 },
  exSets: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  exLoad: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },

  // Start button
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  startBtnText: {
    fontSize: Typography.lg,
    fontWeight: '800',
    color: Colors.bg,
    letterSpacing: 1,
  },
  startBtnSub: {
    fontSize: Typography.xs,
    color: 'rgba(0,0,0,0.5)',
  },
});
