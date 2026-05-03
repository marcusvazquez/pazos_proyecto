import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, radii, spacing } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import CategoryTag from './CategoryTag';

export default function MessageCard({
  message,
  isFavorite,
  onToggleFavorite,
  animationKey,
}) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    opacity.value = 0;
    scale.value = 0.96;
    opacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    scale.value = withSequence(
      withTiming(1.01, { duration: 420, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }),
    );
  }, [animationKey]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!message) return null;

  const gradient =
    theme.categoryGradients[message.category] || theme.categoryGradients.afirmaciones;
  const accent = theme.accents[message.category] || theme.accents.afirmaciones;

  const textStyle = [
    styles.text,
    { color: theme.isNeon || theme.isDark ? theme.text : '#1E1B2E' },
    theme.isNeon && theme.glow.textGlow,
  ];

  const dotColor =
    theme.isDark || theme.isNeon ? 'rgba(255,255,255,0.2)' : 'rgba(30,27,46,0.2)';
  const dotActiveColor = theme.isDark || theme.isNeon ? theme.text : '#1E1B2E';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          shadowColor: theme.isNeon ? accent : '#1E1B2E',
          shadowOpacity: theme.isNeon ? 0.6 : 0.1,
          shadowRadius: theme.isNeon ? 16 : 24,
        },
        animStyle,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          theme.isNeon && {
            borderWidth: 1,
            borderColor: accent,
            ...theme.glow.forAccent(accent),
          },
        ]}
      >
        <View style={styles.header}>
          <CategoryTag category={message.category} showCustomIcon={!!message.custom} />
          {onToggleFavorite && (
            <Pressable
              onPress={onToggleFavorite}
              hitSlop={12}
              style={({ pressed }) => [
                styles.heartBtn,
                {
                  backgroundColor:
                    theme.isDark || theme.isNeon
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.55)',
                },
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
            >
              <Text style={[styles.heart, { color: isFavorite ? accent : theme.textMuted }]}>
                {isFavorite ? '♥' : '♡'}
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={textStyle}>{message.text}</Text>

        <View style={styles.footer}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <View
            style={[
              styles.dot,
              styles.dotActive,
              { backgroundColor: dotActiveColor },
            ]}
          />
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  card: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    minHeight: 300,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 22,
    lineHeight: 24,
  },
  text: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.xl,
    lineHeight: 30,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
  },
});
