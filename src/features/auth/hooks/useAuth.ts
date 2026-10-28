import { useMutation } from '@tanstack/react-query';

import {
  confirmEmail,
  forgotPassword,
  googleLogin,
  login,
  microsoftLogin,
  register,
  resendConfirmation,
  resetPassword,
} from '../api/authApi';

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

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => forgotPassword(email) });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) =>
      resetPassword(email, code, newPassword),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
  });
}

export function useGoogleLogin() {
  return useMutation({ mutationFn: (idToken: string) => googleLogin(idToken) });
}

export function useMicrosoftLogin() {
  return useMutation({ mutationFn: (idToken: string) => microsoftLogin(idToken) });
}
