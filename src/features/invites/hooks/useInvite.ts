import { useQuery } from '@tanstack/react-query'
import { invitesService } from '../services/invitesService'

export function useInvite(token: string) {
  return useQuery({
    queryKey: ['invites', token],
    queryFn: () => invitesService.getByToken(token),
    enabled: !!token,
    // 404/410 são desfechos definitivos do link — re-tentar só atrasa a tela
    // de erro. Falha de rede tem retry manual (CTA na própria tela).
    retry: false,
  })
}
