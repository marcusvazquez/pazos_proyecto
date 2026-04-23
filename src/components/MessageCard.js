import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, categoryGradients } from '../theme/colors';
import { typography, radii, spacing } from '../theme/typography';
import CategoryTag from './CategoryTag';

export default function MessageCard({
  message,
  isFavorite,
  onToggleFavorite,
  animationKey,
}) {
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
  const gradient = categoryGradients[message.category] || categoryGradients.afirmaciones;

  return (
    <Animated.View style={[styles.wrapper, animStyle]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <CategoryTag category={message.category} />
          {onToggleFavorite && (
            <Pressable
              onPress={onToggleFavorite}
              hitSlop={12}
              style={({ pressed }) => [
                styles.heartBtn,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
            >
              <Text style={styles.heart}>{isFavorite ? '♥' : '♡'}</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.text}>{message.text}</Text>

        <View style={styles.footer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
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
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 22,
    color: '#E11D74',
    lineHeight: 24,
  },
  text: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.xl,
    color: colors.darkText,
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
    backgroundColor: 'rgba(30,27,46,0.2)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.darkText,
  },
});
