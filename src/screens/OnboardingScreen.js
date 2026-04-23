import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography, spacing, radii } from '../theme/typography';
import PrimaryButton from '../components/PrimaryButton';
import { useAppStore } from '../store/useAppStore';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
} from '../notifications/scheduleNotifications';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 's1',
    emoji: '🌸',
    gradient: ['#FCE7F3', '#F9A8D4'],
    title: 'Mereces escuchar cosas bonitas todos los días',
    body: 'Brilla te acompaña con recordatorios cortos que nutren tu autoestima — sin ruido, sin juicio.',
  },
  {
    key: 's2',
    emoji: '💜',
    gradient: ['#EDE9FE', '#C4B5FD'],
    title: '3 recordatorios diarios para tu bienestar',
    body: 'Mañana, tarde y noche. Un pequeño gesto contigo misma/o que cambia cómo te hablas.',
  },
  {
    key: 's3',
    emoji: '🔔',
    gradient: ['#FEF3C7', '#FDE68A'],
    title: 'Activa las notificaciones',
    body: 'Las necesitamos para enviarte tus frases a la hora que tú elijas. Funciona 100% offline.',
    isPermission: true,
  },
];

export default function OnboardingScreen() {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const schedule = useAppStore((s) => s.schedule);
  const setNotificationsPermission = useAppStore(
    (s) => s.setNotificationsPermission,
  );

  const goTo = (i) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  const handleNext = async () => {
    if (index < SLIDES.length - 1) {
      goTo(index + 1);
      return;
    }
    const permission = await requestNotificationPermissions();
    setNotificationsPermission(permission);
    if (permission === 'granted') {
      try {
        await scheduleDailyNotifications(schedule);
      } catch (e) {}
    }
    completeOnboarding(permission);
  };

  const handleSkipPermission = () => {
    completeOnboarding('denied');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) setIndex(viewableItems[0].index);
  }).current;

  const current = SLIDES[index];

  return (
    <LinearGradient colors={current.gradient} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.skipRow}>
          {index < SLIDES.length - 1 ? (
            <Pressable onPress={() => goTo(SLIDES.length - 1)} hitSlop={12}>
              <Text style={styles.skip}>Saltar</Text>
            </Pressable>
          ) : (
            <View style={{ height: 20 }} />
          )}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 55 }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )}
        />

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={
              index === SLIDES.length - 1
                ? 'Permitir notificaciones'
                : 'Siguiente'
            }
            onPress={handleNext}
          />
          {current.isPermission && (
            <Pressable onPress={handleSkipPermission} style={styles.later}>
              <Text style={styles.laterText}>Quizá más tarde</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipRow: {
    paddingHorizontal: spacing.xl,
    alignItems: 'flex-end',
    paddingVertical: spacing.sm,
  },
  skip: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.darkText,
    opacity: 0.7,
  },
  slide: {
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.xxl,
    color: colors.darkText,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  body: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.md,
    color: colors.darkText,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(30,27,46,0.25)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.darkText,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  later: {
    alignSelf: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  laterText: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.sm,
    color: colors.darkText,
    opacity: 0.7,
  },
});
