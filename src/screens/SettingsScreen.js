import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography, spacing, radii } from '../theme/typography';
import NotificationItem from '../components/NotificationItem';
import { useAppStore, DEFAULT_SCHEDULE } from '../store/useAppStore';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
} from '../notifications/scheduleNotifications';

export default function SettingsScreen({ navigation }) {
  const schedule = useAppStore((s) => s.schedule);
  const updateScheduleItem = useAppStore((s) => s.updateScheduleItem);
  const resetSchedule = useAppStore((s) => s.resetSchedule);
  const notificationsPermission = useAppStore(
    (s) => s.notificationsPermission,
  );
  const setNotificationsPermission = useAppStore(
    (s) => s.setNotificationsPermission,
  );

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const activeCount = schedule.filter((s) => s.enabled).length;

  useEffect(() => {
    const t = setTimeout(async () => {
      if (notificationsPermission !== 'granted') return;
      setSaving(true);
      try {
        await scheduleDailyNotifications(schedule);
        setLastSaved(Date.now());
      } catch (e) {}
      setSaving(false);
    }, 500);
    return () => clearTimeout(t);
  }, [schedule, notificationsPermission]);

  const handleRequestPermission = async () => {
    const status = await requestNotificationPermissions();
    setNotificationsPermission(status);
    if (status === 'granted') {
      await scheduleDailyNotifications(schedule);
    } else {
      Alert.alert(
        'Activa las notificaciones',
        'Para recibir tus recordatorios, habilita las notificaciones de Brilla desde la configuración de tu dispositivo.',
      );
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Restablecer horarios',
      '¿Volver a los horarios por defecto (8:00, 13:00 y 20:00)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: () => resetSchedule(),
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.warmWhite }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={10}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Configuración</Text>
            <Text style={styles.subtitle}>Tus recordatorios diarios</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {notificationsPermission !== 'granted' && (
            <View style={styles.banner}>
              <Text style={styles.bannerEmoji}>🔔</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  Activa las notificaciones
                </Text>
                <Text style={styles.bannerBody}>
                  Son necesarias para recibir tus recordatorios diarios.
                </Text>
              </View>
              <Pressable
                onPress={handleRequestPermission}
                style={styles.bannerBtn}
              >
                <Text style={styles.bannerBtnText}>Activar</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.sectionLabel}>
            Horarios · {activeCount} {activeCount === 1 ? 'activo' : 'activos'}
          </Text>

          {schedule.map((slot) => (
            <NotificationItem
              key={slot.id}
              slot={slot}
              onChange={(patch) => updateScheduleItem(slot.id, patch)}
            />
          ))}

          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>Restablecer horarios sugeridos</Text>
          </Pressable>

          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🌸</Text>
            <Text style={styles.infoTitle}>Funciona 100% offline</Text>
            <Text style={styles.infoBody}>
              Brilla no necesita internet ni cuenta. Tus mensajes están
              guardados localmente en tu dispositivo. Sin anuncios, sin
              seguimiento.
            </Text>
          </View>

          {lastSaved && notificationsPermission === 'granted' && (
            <Text style={styles.savedNote}>
              {saving ? 'Guardando…' : '✓ Cambios guardados'}
            </Text>
          )}

          <Text style={styles.version}>Brilla · v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.darkText,
  },
  title: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.xxl,
    color: colors.darkText,
  },
  subtitle: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 2,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerTitle: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.sm,
    color: colors.darkText,
  },
  bannerBody: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
  },
  bannerBtn: {
    backgroundColor: colors.darkText,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  bannerBtnText: {
    fontFamily: typography.bold,
    color: colors.warmWhite,
    fontSize: typography.sizes.xs,
  },
  sectionLabel: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.xs,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  resetBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
  },
  resetText: {
    fontFamily: typography.bold,
    color: colors.darkText,
    fontSize: typography.sizes.sm,
    opacity: 0.7,
  },
  infoCard: {
    backgroundColor: colors.lavenderSoft,
    padding: spacing.xl,
    borderRadius: radii.xl,
    marginTop: spacing.xl,
  },
  infoEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.md,
    color: colors.darkText,
    marginBottom: spacing.xs,
  },
  infoBody: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    color: colors.darkText,
    lineHeight: 22,
    opacity: 0.8,
  },
  savedNote: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontFamily: typography.medium,
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontFamily: typography.regular,
    fontSize: typography.sizes.xs,
    color: colors.mutedLight,
  },
});
