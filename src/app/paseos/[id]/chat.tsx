import { Stack, useLocalSearchParams } from 'expo-router';

import { ChatScreen } from '@/features/messaging';

export default function OwnerChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <ChatScreen walkId={id} viewer="Owner" />
    </>
  );
}
