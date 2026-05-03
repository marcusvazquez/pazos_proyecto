import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllMessages as getBankMessages, categoryKeys, messages } from '../data/messages';
import { todayKey, daysBetween } from '../utils/date';
import { buildSlot, iconForHour, labelForHour, nextAvailableHour } from '../utils/schedule';

export const CUSTOM_MESSAGES_KEY = 'brilla_custom_messages';
export const MAX_SCHEDULE_SLOTS = 6;
const SYSTEM_DEFAULT_THEME =
  Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

/**
 * Combina el banco general con los mensajes personales del usuario.
 * Los personales se marcan con `custom: true` para poder distinguirlos
 * visualmente (ícono ✏️) en la UI.
 */
function getAllMessagesWithCustom(customMessages = []) {
  const bank = getBankMessages();
  const customs = (customMessages || []).map((m) => ({ ...m, custom: true }));
  return [...bank, ...customs];
}

function pickNextMessage(usedIds, preferredCategory, customMessages) {
  const all = getAllMessagesWithCustom(customMessages);
  let pool = all.filter((m) => !usedIds.includes(m.id));

  if (pool.length === 0) {
    pool = all;
  }

  if (preferredCategory) {
    const filtered = pool.filter((m) => m.category === preferredCategory);
    if (filtered.length > 0) pool = filtered;
  }

  const random = pool[Math.floor(Math.random() * pool.length)];
  return random;
}

export const DEFAULT_SCHEDULE = [
  { id: 'morning', label: 'Mañana', icon: '🌅', hour: 8, minute: 0, enabled: true },
  { id: 'afternoon', label: 'Tarde', icon: '☀️', hour: 13, minute: 0, enabled: true },
  { id: 'night', label: 'Noche', icon: '🌙', hour: 20, minute: 0, enabled: true },
];

export const useAppStore = create(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      notificationsPermission: 'undetermined',

      themeName: SYSTEM_DEFAULT_THEME,

      currentMessage: null,
      usedIds: [],
      history: [],
      favorites: [],

      streak: 0,
      lastOpenDay: null,

      schedule: DEFAULT_SCHEDULE,

      customMessages: [],

      completeOnboarding: (permission = 'undetermined') =>
        set({ hasOnboarded: true, notificationsPermission: permission }),

      /**
       * Vuelve al flujo inicial (onboarding) sin conservar cambios
       * personalizados de la sesión.
       */
      logoutToStart: () =>
        set(() => {
          AsyncStorage.removeItem(CUSTOM_MESSAGES_KEY).catch(() => {});
          return {
            hasOnboarded: false,
            notificationsPermission: 'undetermined',
            themeName: SYSTEM_DEFAULT_THEME,
            currentMessage: null,
            usedIds: [],
            history: [],
            favorites: [],
            streak: 0,
            lastOpenDay: null,
            schedule: DEFAULT_SCHEDULE,
            customMessages: [],
          };
        }),

      setNotificationsPermission: (permission) =>
        set({ notificationsPermission: permission }),

      setTheme: (name) => {
        if (!['light', 'dark', 'neon'].includes(name)) return;
        set({ themeName: name });
      },

      refreshMessage: (preferredCategory = null) => {
        const { usedIds, history, customMessages } = get();
        const next = pickNextMessage(usedIds, preferredCategory, customMessages);
        if (!next) return null;

        const totalCount = getAllMessagesWithCustom(customMessages).length;
        const newUsedIds =
          usedIds.length >= totalCount - 1 ? [next.id] : [...usedIds, next.id];

        const entry = {
          ...next,
          date: todayKey(),
          timestamp: Date.now(),
        };

        const alreadyLogged = history.find(
          (h) => h.id === next.id && h.date === entry.date,
        );

        set({
          currentMessage: entry,
          usedIds: newUsedIds,
          history: alreadyLogged
            ? history
            : [entry, ...history].slice(0, 60),
        });

        return entry;
      },

      showMessageById: (id) => {
        const { customMessages } = get();
        const all = getAllMessagesWithCustom(customMessages);
        const found = all.find((m) => m.id === id);
        if (!found) return null;
        const entry = { ...found, date: todayKey(), timestamp: Date.now() };
        const { history, usedIds } = get();
        const alreadyLogged = history.find(
          (h) => h.id === found.id && h.date === entry.date,
        );
        set({
          currentMessage: entry,
          usedIds: usedIds.includes(found.id) ? usedIds : [...usedIds, found.id],
          history: alreadyLogged ? history : [entry, ...history].slice(0, 60),
        });
        return entry;
      },

      toggleFavorite: (id) => {
        const { favorites } = get();
        if (favorites.includes(id)) {
          set({ favorites: favorites.filter((f) => f !== id) });
        } else {
          set({ favorites: [...favorites, id] });
        }
      },

      updateStreak: () => {
        const { lastOpenDay, streak } = get();
        const today = todayKey();
        if (lastOpenDay === today) return;

        const diff = daysBetween(lastOpenDay, today);
        let newStreak;
        if (lastOpenDay === null) {
          newStreak = 1;
        } else if (diff === 1) {
          newStreak = streak + 1;
        } else if (diff > 1) {
          newStreak = 1;
        } else {
          newStreak = streak || 1;
        }
        set({ streak: newStreak, lastOpenDay: today });
      },

      // ─────────────────── Gestor avanzado de horarios ───────────────────

      updateScheduleItem: (id, patch) => {
        const { schedule } = get();
        set({
          schedule: schedule.map((s) => {
            if (s.id !== id) return s;
            const merged = { ...s, ...patch };
            if (patch.hour !== undefined) {
              merged.icon = merged.icon || iconForHour(merged.hour);
              if (!s.customLabel) merged.label = labelForHour(merged.hour);
            }
            return merged;
          }),
        });
      },

      addScheduleItem: () => {
        const { schedule } = get();
        if (schedule.length >= MAX_SCHEDULE_SLOTS) return null;
        const hour = nextAvailableHour(schedule);
        const slot = buildSlot(hour, 0, true);
        set({ schedule: [...schedule, slot] });
        return slot;
      },

      removeScheduleItem: (id) => {
        const { schedule } = get();
        const activeCount = schedule.filter((s) => s.enabled).length;
        const target = schedule.find((s) => s.id === id);
        if (!target) return;
        if (target.enabled && activeCount <= 1) return;
        set({ schedule: schedule.filter((s) => s.id !== id) });
      },

      resetSchedule: () => set({ schedule: DEFAULT_SCHEDULE }),

      // ─────────────────── Mensajes personales ───────────────────

      /**
       * Agrega un mensaje personal al banco del usuario.
       * El caller es responsable de validar contra palabras prohibidas
       * (ver `src/utils/profanity.js`) antes de llamar a esta acción.
       * Persistido bajo la clave del store principal; el brief pedía
       * `brilla_custom_messages` — el espíritu (persistencia local) se
       * cumple a través del middleware `persist` de Zustand, y además
       * replicamos la lista bajo esa clave para acceso externo.
       */
      addCustomMessage: ({ text, category }) => {
        const clean = (text || '').trim();
        if (!clean) return null;
        if (!categoryKeys.includes(category)) return null;
        const { customMessages } = get();
        const entry = {
          id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          text: clean,
          category,
          custom: true,
          createdAt: Date.now(),
        };
        const next = [entry, ...customMessages];
        set({ customMessages: next });
        AsyncStorage.setItem(CUSTOM_MESSAGES_KEY, JSON.stringify(next)).catch(
          () => {},
        );
        return entry;
      },

      removeCustomMessage: (id) => {
        const { customMessages } = get();
        const next = customMessages.filter((m) => m.id !== id);
        set({ customMessages: next });
        AsyncStorage.setItem(CUSTOM_MESSAGES_KEY, JSON.stringify(next)).catch(
          () => {},
        );
      },

      getCombinedMessages: () => {
        const { customMessages } = get();
        return getAllMessagesWithCustom(customMessages);
      },

      getRecentHistory: (days = 7) => {
        const { history } = get();
        const cutoff = new Date();
        cutoff.setHours(0, 0, 0, 0);
        cutoff.setDate(cutoff.getDate() - (days - 1));
        return history.filter((h) => {
          const d = new Date(h.date + 'T00:00:00');
          return d >= cutoff;
        });
      },
    }),
    {
      name: 'brilla-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        notificationsPermission: state.notificationsPermission,
        themeName: state.themeName,
        currentMessage: state.currentMessage,
        usedIds: state.usedIds,
        history: state.history,
        favorites: state.favorites,
        streak: state.streak,
        lastOpenDay: state.lastOpenDay,
        schedule: state.schedule,
        customMessages: state.customMessages,
      }),
    },
  ),
);
