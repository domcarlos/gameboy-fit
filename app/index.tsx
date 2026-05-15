import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '../src/utils/tokens';
import { strings } from '../src/i18n';
import { Badge } from '../src/components/ui';
import { useCartridges } from '../src/features/cartridge/hooks/useCartridges';
import { Cartridge } from '../src/features/cartridge/types';
import { ROUTES } from '../src/constants';

export default function HomeScreen() {
  const { cartridges, loading } = useCartridges();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>{strings.home.appName}</Text>
          <Text style={styles.headerSub}>{strings.home.subtitle}</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={Colors.accent} />
        ) : (
          cartridges.map(c => <CartridgeCard key={c.cartridge.id} cartridge={c} />)
        )}
        <TouchableOpacity style={styles.pirateBtn} activeOpacity={0.7}>
          <Text style={styles.pirateBtnIcon}>+</Text>
          <Text style={styles.pirateBtnText}>{strings.home.uploadCartridge}</Text>
          <Text style={styles.pirateBtnSub}>{strings.home.uploadSub}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function CartridgeCard({ cartridge: c }: { cartridge: Cartridge }) {
  const { meta, programs, id } = c.cartridge;
  return (
    <TouchableOpacity
      style={styles.cartridgeCard}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: ROUTES.PROGRAMS, params: { cartridgeId: id } })}
    >
      <View style={[styles.cartridgeLabel, { backgroundColor: meta.cover.bg_color }]}>
        <View style={styles.cartridgeStripe} />
        <Text style={[styles.cartridgeLabelText, { color: meta.cover.accent_color }]}>{meta.cover.label_text}</Text>
        <Text style={styles.cartridgeAuthor}>by {meta.author}</Text>
      </View>
      <View style={styles.cartridgeInfo}>
        <Text style={styles.cartridgeTitle}>{meta.title}</Text>
        <Text style={styles.cartridgeDesc}>{meta.description}</Text>
        <View style={styles.metaRow}>
          <Badge label={`${programs.length} ${strings.cartridge.sheets}`} />
          <Badge label={`${meta.weeks} ${strings.cartridge.weeks}`} />
          <Badge label={`${meta.sessions_per_week}${strings.cartridge.sessionsPerWeek}`} />
        </View>
        <View style={styles.programs}>
          {programs.map(p => (
            <View key={p.id} style={styles.programChip}>
              <Text style={styles.programChipLabel}>{p.label}</Text>
              <Text style={styles.programChipTitle}>{p.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg },
  header: { marginBottom: Spacing.sm },
  headerLabel: { fontSize: Typography.xs, fontWeight: '700', letterSpacing: 3, color: Colors.accent },
  headerSub: { fontSize: Typography.xxl, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  cartridgeCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden' },
  cartridgeLabel: { padding: Spacing.lg, paddingVertical: Spacing.xl, alignItems: 'center', justifyContent: 'center', minHeight: 120 },
  cartridgeStripe: { position: 'absolute', left: 0, right: 0, top: 0, height: 4, backgroundColor: 'rgba(0,255,136,0.3)' },
  cartridgeLabelText: { fontSize: Typography.xxl, fontWeight: '800', letterSpacing: 4 },
  cartridgeAuthor: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: 1 },
  cartridgeInfo: { padding: Spacing.lg, gap: Spacing.md },
  cartridgeTitle: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  cartridgeDesc: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 19 },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  programs: { gap: Spacing.sm },
  programChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: Spacing.md },
  programChipLabel: { fontSize: Typography.base, fontWeight: '800', color: Colors.accent, minWidth: 20 },
  programChipTitle: { fontSize: Typography.sm, color: Colors.textPrimary, flex: 1 },
  pirateBtn: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.xl, alignItems: 'center', gap: Spacing.xs },
  pirateBtnIcon: { fontSize: 28, color: Colors.textMuted },
  pirateBtnText: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: '600' },
  pirateBtnSub: { fontSize: Typography.xs, color: Colors.textMuted },
});
