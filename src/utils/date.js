export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBetween(keyA, keyB) {
  if (!keyA || !keyB) return Infinity;
  const a = new Date(keyA + 'T00:00:00');
  const b = new Date(keyB + 'T00:00:00');
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff;
}

const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const DIAS = [
  'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb',
];

export function formatFriendlyDate(key) {
  if (!key) return '';
  const date = new Date(key + 'T00:00:00');
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  if (key === today) return 'Hoy';
  if (key === yesterday) return 'Ayer';
  return `${DIAS[date.getDay()]} ${date.getDate()} ${MESES[date.getMonth()]}`;
}

export function formatTime(hour, minute) {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${h}:${m}`;
}
