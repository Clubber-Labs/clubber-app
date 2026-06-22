import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSubscribePremium } from './useSubscribePremium'
import { useSubscription } from './useSubscription'

const ACTIVATION_POLL_MS = 2000
// Teto pra esperar o webhook ativar o premium. Ao estourar, libera a saída —
// webhook lento/perdido não pode prender o usuário (que já foi cobrado no
// fluxo de pagamento) num spinner sem volta.
const ACTIVATION_TIMEOUT_MS = 35000
// Status terminais que não vão virar premium: para o polling e dá saída.
const TERMINAL_STATUSES = ['CANCELED', 'INCOMPLETE_EXPIRED', 'UNPAID']

// Estado do fluxo pós-pagamento, exposto à tela como união discriminada:
// 'idle' mostra a oferta; 'activating' o spinner de confirmação; 'stalled' a
// UI de saída (webhook demorou ou terminou em status não-ativo).
export type ActivationPhase = 'idle' | 'activating' | 'stalled'

/**
 * Orquestra o fluxo de assinatura + ativação da tela de upgrade: dispara o
 * PaymentSheet, polla a assinatura até o webhook confirmar o premium e
 * redireciona pra tela de gerenciamento. A tela só consome `phase` e renderiza
 * a UI — toda a navegação e o controle de polling moram aqui.
 */
export function useActivationFlow() {
  const router = useRouter()
  const subscribe = useSubscribePremium()

  // Pós-pagamento: a ativação chega via webhook no backend. Polla a
  // assinatura até ela existir como TRIALING/ACTIVE e então segue pra
  // tela de gerenciamento. `stalled` corta o polling e troca pra UI de saída.
  const [activating, setActivating] = useState(false)
  const [stalled, setStalled] = useState(false)
  const { data: subscription } = useSubscription({
    refetchInterval: activating && !stalled ? ACTIVATION_POLL_MS : false,
  })

  const activated =
    activating &&
    !!subscription &&
    (subscription.status === 'TRIALING' || subscription.status === 'ACTIVE')

  useEffect(() => {
    if (activated) router.replace('/billing/manage')
  }, [activated, router])

  // Já existe assinatura: nada a vender aqui → vai pra tela de gerenciar.
  // Decide pela MESMA fonte que a manage (que volta pra cá quando subscription
  // é null), então as duas guardas são complementares e nunca entram em
  // ping-pong. Antes isso usava profile.isPremium: quando o premium ficava sem
  // subscription (estado dessincronizado), upgrade↔manage se redirecionavam em
  // loop infinito (Maximum update depth, crash).
  useEffect(() => {
    if (subscription && !activating) router.replace('/billing/manage')
  }, [subscription, activating, router])

  // Timeout: se o webhook não confirmar a tempo, sai do spinner pra UI de saída.
  useEffect(() => {
    if (!activating || stalled) return
    const timer = setTimeout(() => setStalled(true), ACTIVATION_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [activating, stalled])

  // Status terminal (pagamento falhou/expirou): para o spinner de imediato.
  useEffect(() => {
    if (
      activating &&
      subscription &&
      TERMINAL_STATUSES.includes(subscription.status)
    ) {
      setStalled(true)
    }
  }, [activating, subscription])

  function start() {
    subscribe.mutate(undefined, {
      onSuccess: outcome => {
        if (outcome.kind === 'completed') setActivating(true)
        // dismissed: user fechou a sheet — sem feedback textual, o botão
        // voltar ao normal é o sinal (padrão do app).
      },
    })
  }

  const phase: ActivationPhase = stalled
    ? 'stalled'
    : activating
      ? 'activating'
      : 'idle'

  return {
    phase,
    start,
    isStarting: subscribe.isPending,
    error: subscribe.isError ? subscribe.error : null,
  }
}
