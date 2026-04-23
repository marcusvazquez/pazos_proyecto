import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, categoryBackgrounds } from '../theme/colors';
import { typography, spacing, radii } from '../theme/typography';
import MessageCard from '../components/MessageCard';
import StreakBadge from '../components/StreakBadge';
import { useAppStore } from '../store/useAppStore';
import { todayKey } from '../utils/date';

const GREETINGS = [
  'Hola',
  'Qué gusto verte',
  'Aquí estás',
  'Respira',
  'Tómate un momento',
];

function useGreeting() {
  const hour = new Date().getHours();
  let timeGreeting = 'Hola';
  if (hour < 12) timeGreeting = 'Buenos días';
  else if (hour < 19) timeGreeting = 'Buenas tardes';
  else timeGreeting = 'Buenas noches';

  const subtitle =
    GREETINGS[new Date().getDate() % GREETINGS.length];
  return { timeGreeting, subtitle };
}

export default function HomeScreen({ navigation }) {
  const currentMessage = useAppStore((s) => s.currentMessage);
  const refreshMessage = useAppStore((s) => s.refreshMessage);
  const updateStreak = useAppStore((s) => s.updateStreak);
  const streak = useAppStore((s) => s.streak);
  const lastOpenDay = useAppStore((s) => s.lastOpenDay);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    updateStreak();
    const today = todayKey();
    if (!currentMessage || currentMessage.date !== today) {
      refreshMessage();
      setAnimKey((k) => k + 1);
    }
  }, []);

  const handleRefresh = () => {
    refreshMessage();
    setAnimKey((k) => k + 1);
  };

  const bg = currentMessage
    ? categoryBackgrounds[currentMessage.category] || colors.warmWhite
    : colors.warmWhite;

  const bgOpacity = useSharedValue(1);
  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: 400 });
  }, [currentMessage?.id]);

  const { timeGreeting, subtitle } = useGreeting();
  const isFavorite = currentMessage && favorites.includes(currentMessage.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.warmWhite }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: bg },
          bgStyle,
        ]}
      />
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{timeGreeting}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={styles.headerBtn}
              hitSlop={10}
            >
              <Text style={styles.headerBtnText}>⚙︎</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Tu mensaje de hoy</Text>

          <MessageCard
            message={currentMessage}
            isFavorite={isFavorite}
            onToggleFavorite={() =>
              currentMessage && toggleFavorite(currentMessage.id)
            }
            animationKey={animKey}
          />

          <Pressable
            onPress={handleRefresh}
            style={({ pressed }) => [
              styles.refresh,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.refreshIcon}>↻</Text>
            <Text style={styles.refreshText}>Ver otro</Text>
          </Pressable>

          <View style={styles.streakWrap}>
            <StreakBadge streak={streak} />
          </View>

          <Pressable
            onPress={() => navigation.navigate('History')}
            style={styles.historyLink}
          >
            <Text style={styles.historyLinkText}>
              Ver mi historial →
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.xxl,
    color: colors.darkText,
  },
  subtitle: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 2,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 22,
    color: colors.darkText,
  },
  sectionLabel: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.xs,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  refresh: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    marginTop: spacing.xl,
    gap: spacing.sm,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  refreshIcon: {
    fontSize: 18,
    color: colors.darkText,
  },
  refreshText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.md,
    color: colors.darkText,
  },
  streakWrap: {
    marginTop: spacing.xxl,
  },
  historyLink: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    padding: spacing.sm,
  },
  historyLinkText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.md,
    color: colors.darkText,
  },
});
