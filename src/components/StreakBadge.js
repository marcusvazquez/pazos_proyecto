import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography, radii, spacing } from '../theme/typography';

export default function StreakBadge({ streak = 0 }) {
  const days = Math.max(0, streak);
  const bars = Array.from({ length: 7 }, (_, i) => i < Math.min(days, 7));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.flameWrap}>
          <Text style={styles.flame}>✨</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Tu racha</Text>
          <Text style={styles.count}>
            {days} {days === 1 ? 'día' : 'días'} seguidos
          </Text>
        </View>
      </View>

      <View style={styles.bars}>
        {bars.map((filled, i) => (
          <View
            key={i}
            style={[styles.bar, filled && styles.barFilled]}
          />
        ))}
      </View>
      <Text style={styles.caption}>
        {days === 0
          ? 'Empieza tu racha hoy ✨'
          : days < 7
          ? `${7 - days} días para completar la semana`
          : '¡Semana completa! Sigue así 🌸'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flameWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  flame: {
    fontSize: 22,
  },
  label: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.xs,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  count: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.lg,
    color: colors.darkText,
    marginTop: 2,
  },
  bars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.sm,
  },
  bar: {
    flex: 1,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  barFilled: {
    backgroundColor: colors.pink,
  },
  caption: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
});
