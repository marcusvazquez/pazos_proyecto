import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { typography, radii, spacing } from '../theme/typography';

export default function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
}) {
  const palette = VARIANTS[variant] || VARIANTS.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: palette.bg },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
        style,
      ]}
    >
      {icon ? <Text style={[styles.icon, { color: palette.fg }]}>{icon}</Text> : null}
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: '#1E1B2E', fg: '#FAFAFA' },
  pink: { bg: colors.pink, fg: colors.darkText },
  soft: { bg: colors.white, fg: colors.darkText },
  ghost: { bg: 'transparent', fg: colors.darkText },
};

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
