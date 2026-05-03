/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FILTRO DE PALABRAS INAPROPIADAS — Brilla
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ⚠️ IMPORTANTE: esta lista es SOLO DE PRUEBA para desarrollo.
 * Será reemplazada por la lista final antes del lanzamiento.
 */

export const palabrasProhibidas = [
  'idiota',
  'imbécil',
  'estúpido',
  'estúpida',
  'maldito',
  'maldita',
  'inútil',
  'fracasado',
  'fracasada',
  'gordo',
  'gorda',
  'feo',
  'fea',
  'asco',
  'odio',
  'basura',
  'horrible',
  'pésimo',
];

/**
 * Normaliza un texto para comparación case-insensitive y sin acentos.
 */
export function normalize(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Devuelve true si el texto contiene alguna palabra prohibida,
 * incluso si aparece como subcadena dentro de otra palabra.
 * Comparación case-insensitive y sin acentos.
 */
export function containsForbiddenWords(text) {
  const haystack = normalize(text);
  if (!haystack) return false;
  return palabrasProhibidas.some((word) => haystack.includes(normalize(word)));
}

/**
 * Devuelve la primera palabra prohibida encontrada (normalizada),
 * o null si no hay ninguna. Útil para debug/telemetría interna.
 */
export function findFirstForbidden(text) {
  const haystack = normalize(text);
  if (!haystack) return null;
  for (const word of palabrasProhibidas) {
    if (haystack.includes(normalize(word))) return word;
  }
  return null;
}
