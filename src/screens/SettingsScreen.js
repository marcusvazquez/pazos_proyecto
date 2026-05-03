import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, spacing, radii } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { THEME_NAMES, THEME_LABELS, THEME_EMOJIS } from '../theme/themes';
import NotificationItem from '../components/NotificationItem';
import { useAppStore, MAX_SCHEDULE_SLOTS } from '../store/useAppStore';
import { categoryKeys, categoryLabels, categoryEmojis } from '../data/messages';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
} from '../notifications/scheduleNotifications';
import { containsForbiddenWords } from '../utils/profanity';

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const schedule = useAppStore((s) => s.schedule);
  const updateScheduleItem = useAppStore((s) => s.updateScheduleItem);
  const addScheduleItem = useAppStore((s) => s.addScheduleItem);
  const removeScheduleItem = useAppStore((s) => s.removeScheduleItem);
  const resetSchedule = useAppStore((s) => s.resetSchedule);
  const notificationsPermission = useAppStore(
    (s) => s.notificationsPermission,
  );
  const setNotificationsPermission = useAppStore(
    (s) => s.setNotificationsPermission,
  );
  const themeName = useAppStore((s) => s.themeName);
  const setTheme = useAppStore((s) => s.setTheme);
  const customMessages = useAppStore((s) => s.customMessages);
  const addCustomMessage = useAppStore((s) => s.addCustomMessage);
  const removeCustomMessage = useAppStore((s) => s.removeCustomMessage);
  const logoutToStart = useAppStore((s) => s.logoutToStart);

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('afirmaciones');

  const activeCount = schedule.filter((s) => s.enabled).length;
  const activeActiveSlots = useMemo(
    () => schedule.filter((s) => s.enabled).length,
    [schedule],
  );

  useEffect(() => {
    const t = setTimeout(async () => {
      if (notificationsPermission !== 'granted') return;
      setSaving(true);
      try {
        await scheduleDailyNotifications(schedule, customMessages);
        setLastSaved(Date.now());
      } catch (e) {}
      setSaving(false);
    }, 500);
    return () => clearTimeout(t);
  }, [schedule, customMessages, notificationsPermission]);

  const handleRequestPermission = async () => {
    const status = await requestNotificationPermissions();
    setNotificationsPermission(status);
    if (status === 'granted') {
      await scheduleDailyNotifications(schedule, customMessages);
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
      '¿Volver a los horarios sugeridos (08:00, 13:00 y 20:00)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', onPress: () => resetSchedule() },
      ],
    );
  };

  const handleAddSlot = () => {
    if (schedule.length >= MAX_SCHEDULE_SLOTS) {
      Alert.alert(
        'Máximo alcanzado',
        `Puedes tener hasta ${MAX_SCHEDULE_SLOTS} recordatorios.`,
      );
      return;
    }
    addScheduleItem();
  };

  const handleRemoveSlot = (id) => {
    const slot = schedule.find((s) => s.id === id);
    if (!slot) return;
    if (slot.enabled && activeActiveSlots <= 1) {
      Alert.alert(
        'No se puede eliminar',
        'Debe quedar al menos 1 recordatorio activo.',
      );
      return;
    }
    Alert.alert('Eliminar recordatorio', '¿Eliminar este horario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeScheduleItem(id),
      },
    ]);
  };

  const handleAddMessage = () => {
    const clean = newText.trim();
    if (!clean) {
      Alert.alert('Mensaje vacío', 'Escribe un mensaje antes de agregarlo.');
      return;
    }
    if (containsForbiddenWords(clean)) {
      Alert.alert(
        'Mensaje no permitido',
        'Brilla es un espacio seguro 💛 Este mensaje contiene palabras que podrían hacerte daño a ti o a otros. Intenta reformularlo de manera positiva.',
        [{ text: 'Entendido' }],
      );
      return;
    }
    addCustomMessage({ text: clean, category: newCategory });
    setNewText('');
  };

  const handleRemoveMessage = (id) => {
    Alert.alert('Eliminar mensaje', '¿Eliminar este mensaje personal?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeCustomMessage(id),
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      'Volverás a la pantalla de bienvenida y se reiniciarán tus cambios de esta sesión.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logoutToStart();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          },
        },
      ],
    );
  };

  const canDeleteSlot = schedule.length > 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: theme.card }]}
            hitSlop={10}
          >
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Configuración</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Tus recordatorios diarios
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─────────── Selector de tema ─────────── */}
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            Apariencia
          </Text>
          <View style={styles.themeRow}>
            {THEME_NAMES.map((name) => {
              const active = themeName === name;
              const accent = theme.accents.afirmaciones;
              return (
                <Pressable
                  key={name}
                  onPress={() => setTheme(name)}
                  style={[
                    styles.themePill,
                    {
                      backgroundColor: active ? theme.text : theme.card,
                      borderColor: active ? theme.text : 'transparent',
                    },
                    active && theme.isNeon && theme.glow.forAccent(accent),
                  ]}
                >
                  <Text style={styles.themeEmoji}>{THEME_EMOJIS[name]}</Text>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: active ? theme.bg : theme.text },
                    ]}
                  >
                    {THEME_LABELS[name]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ─────────── Banner de permisos ─────────── */}
          {notificationsPermission !== 'granted' && (
            <View
              style={[styles.banner, { backgroundColor: theme.accentBg.logros }]}
            >
              <Text style={styles.bannerEmoji}>🔔</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: theme.text }]}>
                  Activa las notificaciones
                </Text>
                <Text style={[styles.bannerBody, { color: theme.textMuted }]}>
                  Son necesarias para recibir tus recordatorios diarios.
                </Text>
              </View>
              <Pressable
                onPress={handleRequestPermission}
                style={[styles.bannerBtn, { backgroundColor: theme.text }]}
              >
                <Text style={[styles.bannerBtnText, { color: theme.bg }]}>
                  Activar
                </Text>
              </Pressable>
            </View>
          )}

          {/* ─────────── Gestor avanzado de horarios ─────────── */}
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            Horarios · {activeCount} {activeCount === 1 ? 'activo' : 'activos'}
          </Text>

          {schedule.map((slot) => (
            <NotificationItem
              key={slot.id}
              slot={slot}
              onChange={(patch) => updateScheduleItem(slot.id, patch)}
              onDelete={canDeleteSlot ? () => handleRemoveSlot(slot.id) : undefined}
            />
          ))}

          {schedule.length < MAX_SCHEDULE_SLOTS && (
            <Pressable
              onPress={handleAddSlot}
              style={[
                styles.addSlotBtn,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                },
              ]}
            >
              <Text style={[styles.addSlotText, { color: theme.text }]}>
                ＋ Agregar recordatorio
              </Text>
            </Pressable>
          )}

          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <Text style={[styles.resetText, { color: theme.textMuted }]}>
              Restablecer horarios sugeridos
            </Text>
          </Pressable>

          {/* ─────────── Mis mensajes personales ─────────── */}
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            Mis mensajes personales
          </Text>

          {customMessages.length === 0 && (
            <Text style={[styles.emptyHint, { color: theme.textMuted }]}>
              Aún no tienes mensajes propios. Escribe uno abajo ✨
            </Text>
          )}

          {customMessages.map((m) => {
            const accent = theme.accents[m.category] || theme.accents.afirmaciones;
            const bg = theme.accentBg[m.category] || theme.accentBg.afirmaciones;
            return (
              <View
                key={m.id}
                style={[
                  styles.customCard,
                  { backgroundColor: bg },
                  theme.isNeon && { borderWidth: 1, borderColor: accent },
                ]}
              >
                <View style={styles.customCardHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: accent }]}>
                    <Text style={styles.categoryDotIcon}>
                      {categoryEmojis[m.category]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.customCategory, { color: theme.textMuted }]}>
                      ✏️ {categoryLabels[m.category]}
                    </Text>
                    <Text style={[styles.customText, { color: theme.text }]}>
                      {m.text}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveMessage(m.id)}
                    hitSlop={12}
                    style={[
                      styles.removeMsgBtn,
                      {
                        backgroundColor:
                          theme.isDark || theme.isNeon
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(255,255,255,0.7)',
                      },
                    ]}
                  >
                    <Text style={[styles.removeMsgIcon, { color: theme.text }]}>
                      🗑️
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          <View
            style={[
              styles.formCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <TextInput
              value={newText}
              onChangeText={setNewText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor={theme.textSoft}
              multiline
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.border,
                },
              ]}
            />

            <Text style={[styles.formLabel, { color: theme.textMuted }]}>
              Categoría
            </Text>
            <View style={styles.catRow}>
              {categoryKeys.map((cat) => {
                const active = newCategory === cat;
                const accent = theme.accents[cat];
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    style={[
                      styles.catPill,
                      {
                        backgroundColor: active ? accent : theme.bgSecondary,
                        borderColor: active ? accent : theme.border,
                      },
                      active && theme.isNeon && theme.glow.forAccent(accent),
                    ]}
                  >
                    <Text style={styles.catPillEmoji}>{categoryEmojis[cat]}</Text>
                    <Text
                      style={[
                        styles.catPillText,
                        {
                          color: active
                            ? theme.isDark || theme.isNeon
                              ? '#0A0A0A'
                              : theme.text
                            : theme.text,
                        },
                      ]}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={handleAddMessage}
              style={[
                styles.addMsgBtn,
                { backgroundColor: theme.text },
                theme.isNeon && theme.glow.forAccent(theme.accents.afirmaciones),
              ]}
            >
              <Text style={[styles.addMsgText, { color: theme.bg }]}>
                Agregar mensaje
              </Text>
            </Pressable>
          </View>

          {/* ─────────── Info + versión ─────────── */}
          <View
            style={[styles.infoCard, { backgroundColor: theme.accentBg.animos }]}
          >
            <Text style={styles.infoEmoji}>🌸</Text>
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              Funciona 100% offline
            </Text>
            <Text style={[styles.infoBody, { color: theme.text }]}>
              Brilla no necesita internet ni cuenta. Tus mensajes están
              guardados localmente en tu dispositivo. Sin anuncios, sin
              seguimiento.
            </Text>
          </View>

          {lastSaved && notificationsPermission === 'granted' && (
            <Text style={[styles.savedNote, { color: theme.textMuted }]}>
              {saving ? 'Guardando…' : '✓ Cambios guardados'}
            </Text>
          )}

          <View style={[styles.logoutWrap, { borderTopColor: theme.border }]}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutBtn,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={styles.logoutIcon}>⎋</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.logoutTitle, { color: theme.text }]}>
                  Cerrar sesión
                </Text>
                <Text style={[styles.logoutHint, { color: theme.textMuted }]}>
                  Volver al inicio de la app
                </Text>
              </View>
              <Text style={[styles.logoutChevron, { color: theme.textSoft }]}>›</Text>
            </Pressable>
          </View>

          <Text style={[styles.version, { color: theme.textSoft }]}>
            Brilla · v1.1.0
          </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
  },
  title: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.xxl,
  },
  subtitle: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionLabel: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  themePill: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xl,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  themeEmoji: {
    fontSize: 22,
  },
  themeLabel: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.sm,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.xl,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerTitle: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.sm,
  },
  bannerBody: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  bannerBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  bannerBtnText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.xs,
  },
  addSlotBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addSlotText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.md,
  },
  resetBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
  },
  resetText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  emptyHint: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  customCard: {
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  customCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryDot: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDotIcon: {
    fontSize: 18,
  },
  customCategory: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  customText: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  removeMsgBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMsgIcon: {
    fontSize: 14,
  },
  formCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
  },
  input: {
    minHeight: 90,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    fontFamily: typography.regular,
    fontSize: typography.sizes.md,
    textAlignVertical: 'top',
  },
  formLabel: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  catPillEmoji: {
    fontSize: typography.sizes.sm,
  },
  catPillText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.sm,
  },
  addMsgBtn: {
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  addMsgText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.md,
  },
  infoCard: {
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
    marginBottom: spacing.xs,
  },
  infoBody: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    opacity: 0.8,
  },
  savedNote: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontFamily: typography.medium,
    fontSize: typography.sizes.xs,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.md,
    fontFamily: typography.regular,
    fontSize: typography.sizes.xs,
  },
  logoutWrap: {
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  logoutIcon: {
    fontSize: 18,
    opacity: 0.85,
  },
  logoutTitle: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.md,
  },
  logoutHint: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  logoutChevron: {
    fontSize: 22,
    fontWeight: '300',
  },
});
