import React, { useEffect } from 'react';
import { Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

export default function SplashScreen({ onFinish }) {
  const theme = useTheme();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const tagOpacity = useSharedValue(0);
  const lineOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 900, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 250 }),
    );
    tagOpacity.value = withDelay(500, withTiming(1, { duration: 700 }));
    lineOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

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
  const lineStyle = useAnimatedStyle(() => ({
    opacity: lineOpacity.value,
    transform: [{ scaleX: lineOpacity.value }],
  }));

  const gradient = theme.splashGradient || [theme.bg, theme.bgSecondary];

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <Animated.View style={[styles.minLine, { backgroundColor: theme.textMuted }, lineStyle]} />
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Text
          style={[
            styles.logo,
            { color: theme.text },
            theme.isNeon && theme.glow.textGlow,
          ]}
        >
          Brilla
        </Text>
      </Animated.View>
      <Animated.Text style={[styles.tagline, { color: theme.textMuted }, tagStyle]}>
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
  minLine: {
    position: 'absolute',
    top: '38%',
    width: 32,
    height: 2,
    borderRadius: 1,
    transform: [{ scaleX: 0 }],
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.hero + 4,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
    letterSpacing: 0.5,
  },
});
