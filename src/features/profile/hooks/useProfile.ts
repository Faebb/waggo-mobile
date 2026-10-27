import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changeMyPassword,
  confirmMyEmailChange,
  getMyProfile,
  requestMyEmailChange,
  updateMyProfile,
} from '../api/profileApi';
import type { ProfileUpdate } from '../model/types';

export const profileKeys = { mine: ['profile', 'me'] as const };

export function useMyProfile() {
  return useQuery({ queryKey: profileKeys.mine, queryFn: () => getMyProfile() });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: ProfileUpdate) => updateMyProfile(update),
    onSuccess: (profile) => queryClient.setQueryData(profileKeys.mine, profile),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changeMyPassword(currentPassword, newPassword),
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: ({ newEmail, password }: { newEmail: string; password: string }) =>
      requestMyEmailChange(newEmail, password),
  });
}

export function useConfirmEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => confirmMyEmailChange(code),
    // The profile shows the email: refetch it so Settings and Personal info show the new one.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.mine }),
  });
}
