import { useMutation } from '@tanstack/react-query'
import { accountService } from '../services/accountService'

type DeleteAccountVars = {
  id: string
  password?: string
  reason?: string
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: ({ id, password, reason }: DeleteAccountVars) =>
      accountService.deleteAccount(id, { password, reason }),
  })
}
