import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listMessages, sendMessage } from '../api/messagesApi';

/** A chat must feel alive: the conversation refreshes every 3 seconds while the screen is open. */
export const CHAT_REFRESH_MS = 3000;

const chatKeys = { walk: (walkId: string) => ['messaging', 'chat', walkId] as const };

export function useChat(walkId: string) {
  return useQuery({
    queryKey: chatKeys.walk(walkId),
    queryFn: () => listMessages(walkId),
    refetchInterval: CHAT_REFRESH_MS,
  });
}

export function useSendMessage(walkId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendMessage(walkId, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.walk(walkId) }),
  });
}
