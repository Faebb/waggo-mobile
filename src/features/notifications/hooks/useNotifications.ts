import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listNotifications, markNotificationsRead } from '../api/notificationsApi';

export const notificationKeys = { mine: ['notifications', 'mine'] as const };

/** Until push arrives, the app asks for new notices every 15 seconds. */
export const NOTIFICATIONS_REFRESH_MS = 15_000;

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.mine,
    queryFn: () => listNotifications(),
    refetchInterval: NOTIFICATIONS_REFRESH_MS,
  });
}

/** Marks the inbox as read; the bell drops its number right away. */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: (inbox) => queryClient.setQueryData(notificationKeys.mine, inbox),
  });
}
