import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PaymentSheetError, useStripe } from '@stripe/stripe-react-native'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import { billingService } from '../services/billingService'
import { billingKeys } from './cacheKeys'

// Paleta dark do app aplicada à PaymentSheet (ela não herda o tema).
const SHEET_APPEARANCE = {
  colors: {
    background: '#18181b', // zinc-900
    componentBackground: '#27272a', // zinc-800
    componentBorder: '#3f3f46', // zinc-700
    componentDivider: '#3f3f46',
    primary: '#7c3aed', // violet-600
    primaryText: '#ffffff',
    secondaryText: '#a1a1aa', // zinc-400
    componentText: '#ffffff',
    placeholderText: '#71717a', // zinc-500
    icon: '#a1a1aa',
  },
}

export type SubscribeOutcome = { kind: 'completed' } | { kind: 'dismissed' }

/**
 * Fluxo completo de assinatura via PaymentSheet nativa:
 * backend cria a Subscription (default_incomplete) → init da sheet com o
 * client secret → user confirma o cartão na sheet. `dismissed` = user fechou
 * a sheet sem pagar (não é erro — sem premium, sem cobrança; com trial, o
 * backend cancela a assinatura órfã ao fim do trial).
 *
 * A ativação do premium é assíncrona (webhook): quem espera o isPremium
 * virar true é a tela, via polling de useSubscription/useMyProfile.
 */
export function useSubscribePremium() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  const queryClient = useQueryClient()

  return useMutation<SubscribeOutcome>({
    mutationFn: async () => {
      const intent = await billingService.subscribe()

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'ConnectAI',
        customerId: intent.customerId,
        customerEphemeralKeySecret: intent.ephemeralKey,
        ...(intent.intentType === 'payment'
          ? { paymentIntentClientSecret: intent.clientSecret }
          : { setupIntentClientSecret: intent.clientSecret }),
        // App lança primeiro no Brasil: pré-seleciona BR no campo de país da
        // sheet (a lista nativa é alfabética e não reordenável, mas isso evita
        // o usuário ter que rolar até o Brasil). É só default — o usuário pode
        // trocar.
        defaultBillingDetails: { address: { country: 'BR' } },
        appearance: SHEET_APPEARANCE,
        allowsDelayedPaymentMethods: false,
      })
      if (initError) throw new Error(initError.message)

      const { error: presentError } = await presentPaymentSheet()
      if (presentError) {
        if (presentError.code === PaymentSheetError.Canceled) {
          return { kind: 'dismissed' }
        }
        throw new Error(presentError.message)
      }

      return { kind: 'completed' }
    },
    onSuccess: outcome => {
      if (outcome.kind !== 'completed') return
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription })
      queryClient.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}
