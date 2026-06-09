import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'

type ResetPasswordVars = {
  email: string
  code: string
  newPassword: string
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (vars: ResetPasswordVars) => authService.resetPassword(vars),
  })
}
