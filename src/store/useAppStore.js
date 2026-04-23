import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllMessages, categoryKeys, messages } from '../data/messages';
import { todayKey, daysBetween } from '../utils/date';

/**
 * Selecciona un mensaje que aún no esté en el pool de usados.
 * Cuando todos los mensajes se han usado, se reinicia el pool
 * (rotación sin repetir hasta agotar el banco).
 */
function pickNextMessage(usedIds, preferredCategory = null) {
  const all = getAllMessages();
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
  { id: 'morning', label: 'Mañana', hour: 8, minute: 0, enabled: true },
  { id: 'afternoon', label: 'Tarde', hour: 13, minute: 0, enabled: true },
  { id: 'night', label: 'Noche', hour: 20, minute: 0, enabled: true },
];

export const useAppStore = create(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      notificationsPermission: 'undetermined',

      currentMessage: null,
      usedIds: [],
      history: [],
      favorites: [],

      streak: 0,
      lastOpenDay: null,

      schedule: DEFAULT_SCHEDULE,

      completeOnboarding: (permission = 'undetermined') =>
        set({ hasOnboarded: true, notificationsPermission: permission }),

      setNotificationsPermission: (permission) =>
        set({ notificationsPermission: permission }),

      /**
       * Selecciona un mensaje nuevo (siguiente del pool) y lo pone como actual.
       * Además, lo agrega al historial si es la primera vez del día.
       */
      refreshMessage: (preferredCategory = null) => {
        const { usedIds, history } = get();
        const next = pickNextMessage(usedIds, preferredCategory);
        const newUsedIds =
          usedIds.length >= getAllMessages().length - 1
            ? [next.id]
            : [...usedIds, next.id];

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

      /**
       * Muestra un mensaje específico por id (usado al abrir desde notificación).
       */
      showMessageById: (id) => {
        const all = getAllMessages();
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

      /**
       * Actualiza la racha de días. Llamar al abrir la app.
       */
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

      updateScheduleItem: (id, patch) => {
        const { schedule } = get();
        set({
          schedule: schedule.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        });
      },

      resetSchedule: () => set({ schedule: DEFAULT_SCHEDULE }),

      /**
       * Historial filtrado a los últimos N días (default 7).
       */
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
        currentMessage: state.currentMessage,
        usedIds: state.usedIds,
        history: state.history,
        favorites: state.favorites,
        streak: state.streak,
        lastOpenDay: state.lastOpenDay,
        schedule: state.schedule,
      }),
    },
  ),
);
