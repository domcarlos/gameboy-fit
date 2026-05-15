import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../utils/tokens';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'accent' | 'priority' | 'danger';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.base, containerVariants[variant], style]}>
      <Text style={textVariants[variant]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderWidth: 0.5,
  },
});

const containerVariants = StyleSheet.create({
  default: { backgroundColor: Colors.bgElevated, borderColor: Colors.border },
  accent: { backgroundColor: Colors.accentBg, borderColor: Colors.accent },
  priority: { backgroundColor: Colors.priorityBg, borderColor: Colors.priority },
  danger: { backgroundColor: 'rgba(255,77,77,0.1)', borderColor: Colors.danger },
});

const textVariants = StyleSheet.create({
  default: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '500' as const },
  accent: { fontSize: Typography.xs, color: Colors.accent, fontWeight: '600' as const },
  priority: { fontSize: Typography.xs, color: Colors.priority, fontWeight: '600' as const },
  danger: { fontSize: Typography.xs, color: Colors.danger, fontWeight: '600' as const },
});
