import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '../src/utils/tokens';
import cartridgeData from '../src/data/cartridge-elite-futebol.json';
import { Cartridge } from '../src/types';

const cartridge = cartridgeData as unknown as Cartridge;

export default function ProgramsScreen() {
  const { cartridgeId } = useLocalSearchParams<{ cartridgeId: string }>();
  const { meta, programs } = cartridge.cartridge;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Nav */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← cartuchos</Text>
        </TouchableOpacity>

        {/* Cartridge identity */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{meta.cover.label_text}</Text>
          <Text style={styles.heroTitle}>{meta.title}</Text>
          <Text style={styles.heroSub}>{meta.sessions_per_week}x por semana · {meta.weeks} semanas</Text>
        </View>

        {/* Program cards */}
        {programs.map(program => {
          const totalExercises = program.sections.flatMap(s => s.exercises).length;
          return (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              activeOpacity={0.85}
              onPress={() => router.push({
                pathname: '/workout-sheet',
                params: {
                  cartridgeId: cartridgeId,
                  programId: program.id,
                },
              })}
            >
              {/* Label grande */}
              <View style={styles.programLabelBlock}>
                <Text style={styles.programLabelLetter}>{program.label}</Text>
              </View>

              <View style={styles.programInfo}>
                <Text style={styles.programTitle}>{program.title}</Text>
                <Text style={styles.programFocus}>{program.focus}</Text>

                <View style={styles.programStats}>
                  <StatItem label="exercícios" value={String(totalExercises)} />
                  <StatItem label="duração" value={`~${program.duration_min}min`} />
                </View>

                {/* Grupos musculares */}
                <View style={styles.muscleGroups}>
                  {program.muscle_groups.map(m => (
                    <View key={m} style={styles.muscleTag}>
                      <Text style={styles.muscleTagText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  back: { marginBottom: Spacing.xs },
  backText: { fontSize: Typography.sm, color: Colors.accent },

  hero: { gap: 4 },
  heroLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 3,
    color: Colors.accent,
  },
  heroTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },

  programCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  programLabelBlock: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentBg,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programLabelLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },

  programInfo: { flex: 1, gap: Spacing.sm },
  programTitle: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  programFocus: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },

  programStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  statItem: { gap: 2 },
  statValue: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },

  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  muscleTag: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  muscleTagText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },

  arrow: {
    fontSize: Typography.lg,
    color: Colors.textMuted,
    alignSelf: 'center',
  },
});
