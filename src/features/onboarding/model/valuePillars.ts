export type ValuePillar = { icon: string; title: string; description: string };

/** Value proposition shown on the welcome screen (vault › Visión del proyecto). */
export const VALUE_PILLARS: readonly ValuePillar[] = [
  {
    icon: '🛡️',
    title: 'Paseadores verificados',
    description: 'Revisamos su identidad y antecedentes antes de su primer paseo.',
  },
  {
    icon: '📍',
    title: 'Paseo en vivo',
    description: 'Sigue la ruta en el mapa y recibe una alerta si algo sale de lo normal.',
  },
  {
    icon: '💳',
    title: 'Pagas al final',
    description: 'El pago se libera al paseador solo cuando el paseo termina bien.',
  },
];
