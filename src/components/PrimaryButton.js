import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { typography, radii, spacing } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

export default function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
}) {
  const theme = useTheme();

  const palette =
    variant === 'pink'
      ? { bg: theme.accents.afirmaciones, fg: theme.isDark || theme.isNeon ? '#0A0A0A' : '#1E1B2E' }
      : variant === 'soft'
        ? { bg: theme.card, fg: theme.text }
        : variant === 'ghost'
          ? { bg: 'transparent', fg: theme.text }
          : { bg: theme.text, fg: theme.bg };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: theme.border,
        },
        variant === 'primary' && theme.isNeon && theme.glow.forAccent(theme.accents.afirmaciones),
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        style,
      ]}
    >
      {icon ? <Text style={[styles.icon, { color: palette.fg }]}>{icon}</Text> : null}
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.md,
    letterSpacing: 0.3,
  },
  icon: {
    fontSize: typography.sizes.md,
  },
});
