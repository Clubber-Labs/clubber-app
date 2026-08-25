import { api } from '@/shared/lib/api'
import type { InvitePreview } from '@/shared/types'

export const invitesService = {
  // Auth opcional: deslogado recebe o preview público do evento.
  getByToken: (token: string): Promise<InvitePreview> =>
    api.get(`/invites/${token}`).then(r => r.data),

  // Idempotente: 201 materializa o convite, 200 se o viewer já tinha acesso.
  accept: (token: string): Promise<{ eventId: string }> =>
    api.post(`/invites/${token}/accept`).then(r => r.data),
}
