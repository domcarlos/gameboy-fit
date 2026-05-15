import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography } from '../../utils/tokens';
import { strings } from '../../i18n';

interface ScreenHeaderProps {
  backLabel?: string;
  onBack?: () => void;
  title?: string;
}

export function ScreenHeader({
  backLabel = strings.common.back,
  onBack,
  title,
}: ScreenHeaderProps) {
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <Text style={styles.backText}>{backLabel}</Text>
      </TouchableOpacity>
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, marginBottom: Spacing.sm },
  backBtn: { alignSelf: 'flex-start' },
  backText: { fontSize: Typography.sm, color: Colors.accent },
  title: { fontSize: Typography.xxl, fontWeight: '700', color: Colors.textPrimary },
});
