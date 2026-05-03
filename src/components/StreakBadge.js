import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, radii, spacing } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

export default function StreakBadge({ streak = 0 }) {
  const theme = useTheme();
  const days = Math.max(0, streak);
  const bars = Array.from({ length: 7 }, (_, i) => i < Math.min(days, 7));
  const accent = theme.accents.afirmaciones;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          shadowColor: theme.isNeon ? accent : '#000',
          shadowOpacity: theme.isNeon ? 0.4 : 0.06,
        },
        theme.isNeon && {
          borderWidth: 1,
          borderColor: accent,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.flameWrap, { backgroundColor: theme.accentBg.logros }]}>
          <Text style={styles.flame}>✨</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Tu racha</Text>
          <Text style={[styles.count, { color: theme.text }]}>
            {days} {days === 1 ? 'día' : 'días'} seguidos
          </Text>
        </View>
      </View>

      <View style={styles.bars}>
        {bars.map((filled, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: theme.border },
              filled && { backgroundColor: accent },
              filled && theme.isNeon && theme.glow.forAccent(accent),
            ]}
          />
        ))}
      </View>
      <Text style={[styles.caption, { color: theme.textMuted }]}>
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
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 4 },
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
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  count: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.lg,
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
  },
  caption: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.xs,
  },
});
