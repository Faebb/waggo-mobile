import { WALK_TYPE_LABELS } from '@/features/pricing';

import type { Walk } from './types';

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "Luna", "Luna y Max", "Luna, Max y Toby". Unknown ids (a dog that was removed) are left out. */
export function petNamesOf(petIds: readonly string[], pets: readonly { id: string; name: string }[]): string {
  const names = petIds.flatMap((id) => pets.find((pet) => pet.id === id)?.name ?? []);
  if (names.length === 0) {
    return 'Tu perro';
  }
  return names.length === 1 ? names[0]! : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

/** "Individual · 60 min" */
export function walkKindOf(walk: Pick<Walk, 'walkType' | 'durationMinutes'>): string {
  return `${WALK_TYPE_LABELS[walk.walkType]} · ${walk.durationMinutes} min`;
}

/**
 * "Hoy, 10:20", "Mañana, 8:00" or "vie 2 oct, 17:00" in the device time zone.
 * Built by hand (no Intl) so the output is the same on Hermes, web and Jest.
 */
export function formatWhen(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  const days = Math.round((startOfDay(date) - startOfDay(now)) / (24 * 60 * 60 * 1000));

  if (days === 0) return `Hoy, ${time}`;
  if (days === 1) return `Mañana, ${time}`;
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}, ${time}`;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
