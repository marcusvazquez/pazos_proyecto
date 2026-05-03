/**
 * Helpers para el gestor avanzado de horarios.
 */

export function iconForHour(hour) {
  if (hour >= 5 && hour <= 11) return '🌅';
  if (hour >= 12 && hour <= 17) return '☀️';
  if (hour >= 18 && hour <= 23) return '🌙';
  return '⭐';
}

export function labelForHour(hour) {
  if (hour >= 5 && hour <= 11) return 'Mañana';
  if (hour >= 12 && hour <= 17) return 'Tarde';
  if (hour >= 18 && hour <= 23) return 'Noche';
  return 'Madrugada';
}

/**
 * Devuelve la próxima hora "redonda" (en punto, minuto=0) que no esté
 * ya ocupada por otra ranura. Se empieza buscando desde la hora actual + 1
 * y se recorren las siguientes 24 horas.
 */
export function nextAvailableHour(schedule) {
  const used = new Set((schedule || []).map((s) => s.hour));
  const now = new Date().getHours();
  for (let i = 1; i <= 24; i++) {
    const h = (now + i) % 24;
    if (!used.has(h)) return h;
  }
  return 9;
}

/**
 * Crea un nuevo slot con defaults basados en la hora.
 */
export function buildSlot(hour, minute = 0, enabled = true) {
  const id = `slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    label: labelForHour(hour),
    icon: iconForHour(hour),
    hour,
    minute,
    enabled,
  };
}
