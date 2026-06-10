import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useSubscribePremium } from '@/features/billing/hooks/useSubscribePremium'
import { useSubscription } from '@/features/billing/hooks/useSubscription'
import { PremiumBenefits } from '@/features/billing/components/PremiumBenefits'
import { Button } from '@/shared/components/Button'
import { getApiError } from '@/shared/lib/apiError'

const ACTIVATION_POLL_MS = 2000
// Teto pra esperar o webhook ativar o premium. Ao estourar, libera a saída —
// webhook lento/perdido não pode prender o usuário (que já foi cobrado no
// fluxo de pagamento) num spinner sem volta.
const ACTIVATION_TIMEOUT_MS = 35000
// Status terminais que não vão virar premium: para o polling e dá saída.
const TERMINAL_STATUSES = ['CANCELED', 'INCOMPLETE_EXPIRED', 'UNPAID']

export default function UpgradeScreen() {
  const router = useRouter()
  const { data: profile } = useMyProfile()
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

  // Já é premium e não veio do fluxo de pagamento: nada a vender aqui.
  useEffect(() => {
    if (profile?.isPremium && !activating) router.replace('/billing/manage')
  }, [profile?.isPremium, activating, router])

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

  function handleSubscribe() {
    subscribe.mutate(undefined, {
      onSuccess: outcome => {
        if (outcome.kind === 'completed') setActivating(true)
        // dismissed: user fechou a sheet — sem feedback textual, o botão
        // voltar ao normal é o sinal (padrão do app).
      },
    })
  }

  // Ativação demorou ou terminou em estado não-ativo: dá saída ao usuário.
  if (activating && stalled) {
    return (
      <View className="flex-1 bg-black items-center justify-center gap-5 px-8">
        <Ionicons name="time-outline" size={44} color="#a78bfa" />
        <Text className="text-white font-semibold text-lg text-center">
          A confirmação está demorando
        </Text>
        <Text className="text-zinc-400 text-sm text-center">
          Se o pagamento foi concluído, seu acesso premium é liberado assim que
          a confirmação chegar. Você pode acompanhar pela tela de assinatura.
        </Text>
        <View className="w-full gap-3 mt-1">
          <Button
            label="Ver minha assinatura"
            onPress={() => router.replace('/billing/manage')}
          />
          <Pressable onPress={() => router.back()} hitSlop={8} className="py-2">
            <Text className="text-zinc-400 text-sm text-center">Voltar</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (activating) {
    return (
      <View className="flex-1 bg-black items-center justify-center gap-4 px-8">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="text-white font-semibold text-lg">
          Confirmando pagamento...
        </Text>
        <Text className="text-zinc-400 text-sm text-center">
          Estamos ativando seu acesso premium. Isso costuma levar poucos
          segundos.
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color="#ffffff" />
        </Pressable>
      </View>

      <View className="items-center mb-8">
        {/* Badge com camadas concêntricas pra dar profundidade/brilho ao
            ícone (NativeWind não tem gradiente nativo — halo via opacidades). */}
        <View className="w-28 h-28 rounded-full bg-violet-600/10 items-center justify-center mb-5">
          <View className="w-20 h-20 rounded-full bg-violet-600/20 items-center justify-center">
            <View className="w-14 h-14 rounded-2xl bg-violet-600 items-center justify-center">
              <Ionicons name="diamond" size={30} color="#ffffff" />
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-white font-bold text-2xl">ConnectAI</Text>
          <View className="px-2 py-0.5 rounded-md bg-violet-600/20 border border-violet-500/40">
            <Text className="text-violet-300 text-xs font-bold tracking-wide">
              PREMIUM
            </Text>
          </View>
        </View>
        <Text className="text-zinc-400 text-sm mt-2 text-center">
          Mais visibilidade para você e seus eventos.
        </Text>
      </View>

      <PremiumBenefits />

      <View className="mt-8 gap-3">
        <Button
          label="Assinar Premium"
          onPress={handleSubscribe}
          loading={subscribe.isPending}
        />
        <Text className="text-zinc-500 text-xs text-center">
          Novos assinantes ganham 7 dias grátis. Assinatura mensal, cancele
          quando quiser — o acesso continua até o fim do período pago.
        </Text>
        {subscribe.isError && (
          <Text className="text-red-500 text-sm text-center">
            {getApiError(subscribe.error).message}
          </Text>
        )}
      </View>
    </ScrollView>
  )
}
