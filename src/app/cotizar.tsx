import { Stack } from 'expo-router';

import { FareQuoteScreen } from '@/features/pricing';

export default function Quote() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Cotizar paseo' }} />
      <FareQuoteScreen />
    </>
  );
}
