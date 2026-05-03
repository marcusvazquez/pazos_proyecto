import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { getTheme } from './themes';

/**
 * Hook global de tema. Lee el tema activo del store y devuelve
 * la paleta completa con tokens semánticos (bg, card, text, accents...).
 *
 * El nombre del tema (light | dark | neon) se persiste en AsyncStorage
 * a través del middleware `persist` de Zustand, por lo que sobrevive
 * entre sesiones sin trabajo extra.
 */
export function useTheme() {
  const systemScheme = useColorScheme();
  const themeName = useAppStore((s) => s.themeName);
  const resolvedTheme = themeName || (systemScheme === 'dark' ? 'dark' : 'light');
  return getTheme(resolvedTheme);
}

export function useThemeName() {
  return useAppStore((s) => s.themeName);
}

export function useSetTheme() {
  return useAppStore((s) => s.setTheme);
}
