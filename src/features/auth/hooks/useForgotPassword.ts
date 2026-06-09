import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  })
}
