import React, { useMemo, useRef, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { typography, spacing, radii } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';
import { useAppStore } from '../store/useAppStore';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
} from '../notifications/scheduleNotifications';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const schedule = useAppStore((s) => s.schedule);
  const customMessages = useAppStore((s) => s.customMessages);
  const setNotificationsPermission = useAppStore(
    (s) => s.setNotificationsPermission,
  );

  const slides = useMemo(
    () => [
      {
        key: 's1',
        emoji: '🌸',
        gradient: [
          theme.accentBg.afirmaciones,
          theme.accents.afirmaciones,
        ],
        title: 'Mereces escuchar cosas bonitas todos los días',
        body: 'Brilla te acompaña con recordatorios cortos que nutren tu autoestima — sin ruido, sin juicio.',
      },
      {
        key: 's2',
        emoji: '💜',
        gradient: [theme.accentBg.animos, theme.accents.animos],
        title: '3 recordatorios diarios para tu bienestar',
        body: 'Mañana, tarde y noche. Un pequeño gesto contigo misma/o que cambia cómo te hablas.',
      },
      {
        key: 's3',
        emoji: '🔔',
        gradient: [theme.accentBg.logros, theme.accents.logros],
        title: 'Activa las notificaciones',
        body: 'Las necesitamos para enviarte tus frases a la hora que tú elijas. Funciona 100% offline.',
        isPermission: true,
      },
    ],
    [theme.name],
  );

  const goTo = (i) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleNext = async () => {
    if (index < slides.length - 1) {
      goTo(index + 1);
      return;
    }
    const permission = await requestNotificationPermissions();
    setNotificationsPermission(permission);
    if (permission === 'granted') {
      try {
        await scheduleDailyNotifications(schedule, customMessages);
      } catch (e) {}
    }
    completeOnboarding(permission);
    goHome();
  };

  const handleSkipPermission = () => {
    completeOnboarding('denied');
    goHome();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) setIndex(viewableItems[0].index);
  }).current;

  const current = slides[index] || slides[0];
  const dotInactive = theme.isDark || theme.isNeon ? 'rgba(255,255,255,0.2)' : 'rgba(30,27,46,0.2)';

  return (
    <LinearGradient colors={current.gradient} style={{ flex: 1 }}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.skipRow}>
          {index < slides.length - 1 ? (
            <Pressable onPress={() => goTo(slides.length - 1)} hitSlop={12}>
              <Text style={[styles.skip, { color: theme.text }]}>Saltar</Text>
            </Pressable>
          ) : (
            <View style={{ height: 20 }} />
          )}
        </View>

        <FlatList
          ref={listRef}
          data={slides}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 55 }}
          extraData={theme.name}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View
                style={[
                  styles.emojiCircle,
                  {
                    backgroundColor:
                      theme.isDark || theme.isNeon
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.55)',
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text
                style={[
                  styles.title,
                  { color: theme.text },
                  theme.isNeon && theme.glow.textGlow,
                ]}
              >
                {item.title}
              </Text>
              <Text style={[styles.body, { color: theme.textMuted }]}>{item.body}</Text>
            </View>
          )}
        />

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: dotInactive },
                i === index && {
                  width: 22,
                  backgroundColor: theme.text,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={
              index === slides.length - 1
                ? 'Permitir notificaciones'
                : 'Siguiente'
            }
            onPress={handleNext}
          />
          {current.isPermission && (
            <Pressable onPress={handleSkipPermission} style={styles.later}>
              <Text style={[styles.laterText, { color: theme.textMuted }]}>
                Quizá más tarde
              </Text>
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
    fontFamily: typography.medium,
    fontSize: typography.sizes.sm,
    opacity: 0.75,
    letterSpacing: 0.3,
  },
  slide: {
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 52,
  },
  title: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.xxl,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  body: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
  },
});
