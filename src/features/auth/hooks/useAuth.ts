import { useMutation } from '@tanstack/react-query';

import { confirmEmail, login, register, verifyLoginCode } from '../api/authApi';

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

export function useVerifyLoginCode() {
  return useMutation({
    mutationFn: ({ challengeId, code }: { challengeId: string; code: string }) => verifyLoginCode(challengeId, code),
  });
}
