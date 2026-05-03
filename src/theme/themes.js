import { Platform } from 'react-native';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * DEFINICIÓN DE PALETAS — Brilla
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Cada tema expone los mismos "tokens semánticos" (bg, card, text, accents...)
 * para que los componentes consuman el mismo hook `useTheme()` sin saber
 * qué paleta está activa.
 */

export const THEME_NAMES = ['light', 'dark', 'neon'];

export const THEME_LABELS = {
  light: 'Claro',
  dark: 'Oscuro',
  neon: 'Neón',
};

export const THEME_EMOJIS = {
  light: '☀️',
  dark: '🌙',
  neon: '✨',
};

/**
 * Helper: devuelve estilos de "glow" multiplataforma.
 * En modo claro/oscuro el glow es sutil (solo sombra suave).
 * En modo neón añade boxShadow coloreado en web y shadow* en nativo.
 */
function makeGlow(color, radius = 8, opacity = 0.9) {
  const shadow = {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: 6,
  };
  if (Platform.OS === 'web') {
    shadow.boxShadow = `0 0 ${radius}px ${color}`;
  }
  return shadow;
}

const noGlow = () => ({});

const LIGHT = {
  name: 'light',
  isDark: false,
  isNeon: false,

  bg: '#FAFAFA',
  bgSecondary: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#FFFFFF',

  text: '#1E1B2E',
  textMuted: '#6B7280',
  textSoft: '#9CA3AF',

  border: '#F3E8FF',
  overlay: 'rgba(30, 27, 46, 0.4)',
  shadow: 'rgba(30, 27, 46, 0.08)',

  accents: {
    afirmaciones: '#F9A8D4',
    logros: '#FDE68A',
    animos: '#C4B5FD',
    gratitud: '#6EE7B7',
  },
  accentBg: {
    afirmaciones: '#FCE7F3',
    logros: '#FEF3C7',
    animos: '#EDE9FE',
    gratitud: '#D1FAE5',
  },
  categoryGradients: {
    afirmaciones: ['#FCE7F3', '#F9A8D4'],
    logros: ['#FEF3C7', '#FDE68A'],
    animos: ['#EDE9FE', '#C4B5FD'],
    gratitud: ['#D1FAE5', '#6EE7B7'],
  },
  splashGradient: ['#F9A8D4', '#C4B5FD'],

  statusBar: 'dark-content',
  statusBarStyle: 'dark',

  glow: {
    enabled: false,
    forAccent: noGlow,
    textGlow: {},
  },
};

const DARK = {
  name: 'dark',
  isDark: true,
  isNeon: false,

  bg: '#1A1A2E',
  bgSecondary: '#16213E',
  card: '#0F3460',
  cardAlt: '#16213E',

  text: '#E0E0E0',
  textMuted: '#A0A0B0',
  textSoft: '#7A7A8A',

  border: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.35)',

  accents: {
    afirmaciones: '#F48FB1',
    logros: '#FFD54F',
    animos: '#CE93D8',
    gratitud: '#80CBC4',
  },
  accentBg: {
    afirmaciones: 'rgba(244, 143, 177, 0.15)',
    logros: 'rgba(255, 213, 79, 0.15)',
    animos: 'rgba(206, 147, 216, 0.15)',
    gratitud: 'rgba(128, 203, 196, 0.15)',
  },
  categoryGradients: {
    afirmaciones: ['#0F3460', '#3A2342'],
    logros: ['#0F3460', '#3D3416'],
    animos: ['#0F3460', '#2D1E45'],
    gratitud: ['#0F3460', '#16213E'],
  },
  splashGradient: ['#1A1A2E', '#0F3460'],

  statusBar: 'light-content',
  statusBarStyle: 'light',

  glow: {
    enabled: false,
    forAccent: noGlow,
    textGlow: {},
  },
};

const NEON = {
  name: 'neon',
  isDark: true,
  isNeon: true,

  bg: '#0D0D0D',
  bgSecondary: '#111111',
  card: '#1A1A1A',
  cardAlt: '#161616',

  text: '#FFFFFF',
  textMuted: '#B0B0B0',
  textSoft: '#808080',

  border: 'rgba(255,255,255,0.12)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.5)',

  accents: {
    afirmaciones: '#FF2D78',
    logros: '#FFD700',
    animos: '#BF00FF',
    gratitud: '#00FFB3',
  },
  accentBg: {
    afirmaciones: 'rgba(255, 45, 120, 0.12)',
    logros: 'rgba(255, 215, 0, 0.12)',
    animos: 'rgba(191, 0, 255, 0.12)',
    gratitud: 'rgba(0, 255, 179, 0.12)',
  },
  categoryGradients: {
    afirmaciones: ['#1A1A1A', '#2A0A18'],
    logros: ['#1A1A1A', '#2A2200'],
    animos: ['#1A1A1A', '#1E0028'],
    gratitud: ['#1A1A1A', '#002B20'],
  },
  splashGradient: ['#0D0D0D', '#1A1A1A'],

  statusBar: 'light-content',
  statusBarStyle: 'light',

  glow: {
    enabled: true,
    forAccent: (color) => makeGlow(color, 8, 0.9),
    textGlow: {
      textShadowColor: 'rgba(255,255,255,0.6)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      ...(Platform.OS === 'web' && {
        textShadow: '0 0 6px rgba(255,255,255,0.6)',
      }),
    },
  },
};

const THEMES = {
  light: LIGHT,
  dark: DARK,
  neon: NEON,
};

export function getTheme(name) {
  return THEMES[name] || LIGHT;
}

export { LIGHT, DARK, NEON };
