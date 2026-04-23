import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography, radii, spacing } from '../theme/typography';
import { categoryColors, categoryLabels, categoryEmojis } from '../data/messages';

export default function CategoryTag({ category, size = 'md' }) {
  if (!category) return null;
  const bg = categoryColors[category] || colors.pink;
  const label = categoryLabels[category] || category;
  const emoji = categoryEmojis[category] || '✨';

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: bg },
        isSmall && styles.tagSm,
      ]}
    >
      <Text style={[styles.emoji, isSmall && styles.emojiSm]}>{emoji}</Text>
      <Text style={[styles.label, isSmall && styles.labelSm]}>{label}</Text>
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
    color: colors.darkText,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: typography.sizes.xs,
  },
});
