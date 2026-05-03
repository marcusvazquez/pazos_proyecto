import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllMessages, categoryLabels } from '../data/messages';

const USED_KEY = 'brilla:notification-used-ids';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions() {
  if (!Device.isDevice && Platform.OS !== 'web') {
    return 'denied';
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('brilla-daily', {
        name: 'Recordatorios diarios',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F9A8D4',
        sound: 'default',
      });
    } catch (e) {}
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return 'granted';

  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/**
 * Devuelve (y rota) un pool de mensajes para notificaciones.
 * Mezcla el banco general con mensajes personales si se pasan.
 */
async function pickMessagesForSchedule(count, customMessages = []) {
  const all = [
    ...getAllMessages(),
    ...(customMessages || []).map((m) => ({ ...m, custom: true })),
  ];
  let used = [];
  try {
    const raw = await AsyncStorage.getItem(USED_KEY);
    used = raw ? JSON.parse(raw) : [];
  } catch (e) {
    used = [];
  }

  let pool = all.filter((m) => !used.includes(m.id));
  if (pool.length < count) {
    used = [];
    pool = [...all];
  }

  const picked = [];
  for (let i = 0; i < count; i++) {
    if (pool.length === 0) break;
    const idx = Math.floor(Math.random() * pool.length);
    const [chosen] = pool.splice(idx, 1);
    picked.push(chosen);
    used.push(chosen.id);
  }

  try {
    await AsyncStorage.setItem(USED_KEY, JSON.stringify(used));
  } catch (e) {}

  return picked;
}

/**
 * Cancela todas las notificaciones programadas y reprograma las diarias.
 * @param {Array} schedule - ranuras de horarios activas
 * @param {Array} customMessages - mensajes personales a mezclar (opcional)
 */
export async function scheduleDailyNotifications(schedule, customMessages = []) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {}

  const active = (schedule || []).filter((s) => s.enabled);
  if (active.length === 0) return [];

  const picked = await pickMessagesForSchedule(active.length, customMessages);
  const results = [];

  for (let i = 0; i < active.length; i++) {
    const slot = active[i];
    const msg = picked[i];
    if (!msg) continue;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Brilla · ${categoryLabels[msg.category] || 'Para ti'}`,
          body: msg.text,
          data: { messageId: msg.id, slotId: slot.id },
          sound: 'default',
        },
        trigger: {
          hour: slot.hour,
          minute: slot.minute,
          repeats: true,
          channelId: 'brilla-daily',
        },
      });
      results.push({ slotId: slot.id, notificationId: id, messageId: msg.id });
    } catch (e) {}
  }

  return results;
}

export function addNotificationResponseListener(callback) {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response?.notification?.request?.content?.data;
    if (data?.messageId) {
      callback(data.messageId);
    }
  });
  return () => sub.remove();
}

export async function getLastNotificationResponse() {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response?.notification?.request?.content?.data?.messageId || null;
  } catch (e) {
    return null;
  }
}

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {}
}
