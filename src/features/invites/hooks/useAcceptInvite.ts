import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invitesService } from '../services/invitesService'

export function useAcceptInvite(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => invitesService.accept(token),
    // O aceite muda o que o viewer enxerga (detalhe, feed, listas de evento) —
    // invalida a árvore de eventos pra tela de destino já abrir com acesso.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}
