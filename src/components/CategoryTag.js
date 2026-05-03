import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, radii, spacing } from '../theme/typography';
import { categoryLabels, categoryEmojis } from '../data/messages';
import { useTheme } from '../theme/ThemeContext';

export default function CategoryTag({ category, size = 'md', showCustomIcon = false }) {
  const theme = useTheme();
  if (!category) return null;

  const bg = theme.accents[category] || theme.accents.afirmaciones;
  const label = categoryLabels[category] || category;
  const emoji = categoryEmojis[category] || '✨';

  const isSmall = size === 'sm';
  const textColor = theme.isDark || theme.isNeon ? '#0A0A0A' : theme.text;

  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: bg },
        isSmall && styles.tagSm,
        theme.isNeon && theme.glow.forAccent(bg),
      ]}
    >
      <Text style={[styles.emoji, isSmall && styles.emojiSm]}>{emoji}</Text>
      <Text style={[styles.label, { color: textColor }, isSmall && styles.labelSm]}>
        {label}
      </Text>
      {showCustomIcon && (
        <Text style={[styles.customIcon, isSmall && styles.customIconSm]}>✏️</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
  },
  tagSm: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  emoji: {
    fontSize: typography.sizes.md,
    marginRight: 6,
  },
  emojiSm: {
    fontSize: typography.sizes.sm,
    marginRight: 4,
  },
  label: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.sm,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: typography.sizes.xs,
  },
  customIcon: {
    fontSize: typography.sizes.sm,
    marginLeft: 6,
  },
  customIconSm: {
    fontSize: typography.sizes.xs,
    marginLeft: 4,
  },
});
