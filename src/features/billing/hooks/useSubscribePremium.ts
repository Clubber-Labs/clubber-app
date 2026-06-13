import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PaymentSheetError, useStripe } from '@stripe/stripe-react-native'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import { billingService } from '../services/billingService'
import { billingKeys } from './cacheKeys'
import { colors } from '@/shared/theme'

// Paleta dark do app aplicada à PaymentSheet (ela não herda o tema).
const SHEET_APPEARANCE = {
  colors: {
    background: colors.surface, // zinc-900
    componentBackground: colors.line, // zinc-800
    componentBorder: colors.lineStrong, // zinc-700
    componentDivider: colors.lineStrong,
    primary: colors.brand, // violet-600
    primaryText: colors.content,
    secondaryText: colors.contentMuted, // zinc-400
    componentText: colors.content,
    placeholderText: colors.contentSubtle, // zinc-500
    icon: colors.contentMuted,
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
