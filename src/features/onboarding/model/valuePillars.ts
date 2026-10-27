export type ValuePillar = { title: string; description: string };

/** Value proposition shown on the welcome screen (vault › Visión del proyecto; copy from design proposal 07 · 1). */
export const VALUE_PILLARS: readonly ValuePillar[] = [
  {
    title: 'Paseadores verificados',
    description: 'Revisamos su identidad antes de su primer paseo.',
  },
  {
    title: 'Paseo en vivo',
    description: 'Sigue la ruta en el mapa, minuto a minuto.',
  },
  {
    title: 'Pagas al final',
    description: 'Retenemos el pago y solo se cobra si el paseo ocurre.',
  },
];
