import { useMutation } from '@tanstack/react-query'
import { accountService } from '../services/accountService'

export function useDeactivateAccount() {
  return useMutation({ mutationFn: accountService.deactivate })
}
