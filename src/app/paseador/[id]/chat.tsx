import { Stack, useLocalSearchParams } from 'expo-router';

import { ChatScreen } from '@/features/messaging';

export default function WalkerChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <ChatScreen walkId={id} viewer="Walker" />
    </>
  );
}
