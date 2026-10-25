import { useMutation } from '@tanstack/react-query';

import { confirmEmail, login, register } from '../api/authApi';

export function useRegister() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => register(email, password),
  });
}

export function useConfirmEmail() {
  return useMutation({ mutationFn: (token: string) => confirmEmail(token) });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
  });
}
