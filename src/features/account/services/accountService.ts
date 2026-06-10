import { api } from '@/shared/lib/api'
import type { AccountStatus } from '@/shared/types'

export type AccountLifecycleResponse = {
  accountStatus: AccountStatus
  deactivatedAt: string | null
  scheduledDeletionAt: string | null
}

export type DeleteAccountPayload = {
  password?: string
  reason?: string
}

export const accountService = {
  deactivate: (): Promise<AccountLifecycleResponse> =>
    api.post('/users/me/deactivate').then(r => r.data),

  // DELETE com body: envia só as chaves preenchidas. password '' ou chave
  // undefined NÃO vão (conta só-social manda body sem password). skipAuthHandler
  // mantém o 401 'Senha incorreta' inline em vez de encerrar a sessão.
  deleteAccount: (
    id: string,
    { password, reason }: DeleteAccountPayload,
  ): Promise<AccountLifecycleResponse> => {
    const body: DeleteAccountPayload = {}
    if (password) body.password = password
    if (reason) body.reason = reason
    return api
      .delete(`/users/${id}`, { data: body, skipAuthHandler: true })
      .then(r => r.data)
  },
}
