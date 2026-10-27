import { useMutation } from '@tanstack/react-query';

import { confirmEmail, login, register, resendConfirmation } from '../api/authApi';

export function useRegister() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => register(email, password),
  });
}

export function useConfirmEmail() {
  return useMutation({ mutationFn: ({ email, code }: { email: string; code: string }) => confirmEmail(email, code) });
}

export function useResendConfirmation() {
  return useMutation({ mutationFn: (email: string) => resendConfirmation(email) });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
  });
}
