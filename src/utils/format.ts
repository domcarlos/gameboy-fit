/**
 * Formata segundos em MM:SS
 * Ex: 90 → "01:30"
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Formata carga — remove .0 desnecessário
 * Ex: 27.5 → "27.5kg" | 50.0 → "50kg"
 */
export function formatLoad(kg: number | null): string {
  if (kg === null) return 'corporal';
  return `${kg % 1 === 0 ? kg.toFixed(0) : kg} kg`;
}

/**
 * Gera ID único simples
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
