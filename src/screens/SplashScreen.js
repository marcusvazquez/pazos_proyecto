import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { typography, spacing } from '../theme/typography';

export default function SplashScreen({ onFinish }) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const tagOpacity = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 900, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 250 }),
    );
    tagOpacity.value = withDelay(500, withTiming(1, { duration: 700 }));
    sparkleOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }),
    );

    const t = setTimeout(() => {
      onFinish && onFinish();
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tagOpacity.value }));
  const sparkStyle = useAnimatedStyle(() => ({ opacity: sparkleOpacity.value }));

  return (
    <LinearGradient colors={gradients.splash} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.Text style={[styles.sparkleTop, sparkStyle]}>✨</Animated.Text>
      <Animated.Text style={[styles.sparkleBottom, sparkStyle]}>✨</Animated.Text>

      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Text style={styles.logo}>Brilla</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, tagStyle]}>
        Mereces cosas bonitas
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.hero + 6,
    color: colors.darkText,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.md,
    color: colors.darkText,
    marginTop: spacing.md,
    opacity: 0.8,
  },
  sparkleTop: {
    position: 'absolute',
    top: '22%',
    right: '18%',
    fontSize: 26,
  },
  sparkleBottom: {
    position: 'absolute',
    bottom: '24%',
    left: '15%',
    fontSize: 22,
  },
});
