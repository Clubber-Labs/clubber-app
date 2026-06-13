import { useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useDeactivateAccount } from '@/features/account/hooks/useDeactivateAccount'
import { useConfirm } from '@/shared/lib/confirm'
import { setAccountRecovery } from '@/features/account/lib/accountRecovery'
import { endSession } from '@/features/auth/lib/session'
import { getApiError, isTooManyRequestsError } from '@/shared/lib/apiError'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { AccountExitSuccess } from '@/features/account/components/AccountExitSuccess'
import { colors } from '@/shared/theme'

const POINTS = [
  'Seu perfil, eventos e atividade somem para as outras pessoas.',
  'Nada é excluído — tudo volta ao reativar.',
  'Sem prazo: você reativa quando quiser, é só fazer login.',
]

export default function DeactivateAccountScreen() {
  const router = useRouter()
  const { data: profile, isLoading } = useMyProfile()
  const deactivate = useDeactivateAccount()
  const confirm = useConfirm()
  const [done, setDone] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)

  async function onExit() {
    setExiting(true)
    await endSession()
    router.replace('/(auth)/login')
  }

  async function onDeactivate() {
    if (!profile) return
    const ok = await confirm({
      title: 'Desativar conta',
      message:
        'Seu perfil e conteúdo ficarão ocultos até você fazer login de novo. Deseja continuar?',
      confirmLabel: 'Desativar',
      destructive: true,
    })
    if (!ok) return
    setInlineError(null)
    deactivate.mutate(undefined, {
      onSuccess: () => {
        // Persiste o marker já no sucesso (não só no "Entendi"), pra sobreviver
        // a uma saída acidental da tela de sucesso. Best-effort.
        void setAccountRecovery({
          userId: profile.id,
          status: 'DEACTIVATED',
          scheduledDeletionAt: null,
        })
        setDone(true)
      },
      onError: e =>
        setInlineError(
          isTooManyRequestsError(e)
            ? 'Muitas tentativas. Tente novamente em instantes.'
            : getApiError(e).message,
        ),
    })
  }

  if (done) {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <AccountExitSuccess
          title="Conta desativada"
          message="Seu perfil ficou oculto. Para voltar, é só fazer login novamente — sua conta é reativada na hora."
          loading={exiting}
          onDone={onExit}
        />
      </>
    )
  }

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      <View className="gap-2">
        <Text className="text-content text-2xl font-bold">Desativar conta</Text>
        <Text className="text-content-muted text-base leading-6">
          Como tirar uma pausa: você some do app sem perder nada.
        </Text>
      </View>

      <View className="bg-surface-sunken border border-line rounded-xl p-4 gap-3">
        {POINTS.map(point => (
          <View key={point} className="flex-row items-start gap-2">
            <Ionicons
              name="ellipse"
              size={6}
              color={colors.brandText}
              style={{ marginTop: 7 }}
            />
            <Text className="text-content-tertiary text-sm flex-1 leading-5">
              {point}
            </Text>
          </View>
        ))}
      </View>

      <FormError message={inlineError} />

      <View className="gap-3">
        <Button
          label="Desativar minha conta"
          variant="destructive"
          onPress={onDeactivate}
          loading={deactivate.isPending}
          disabled={deactivate.isPending}
        />
        <Button
          label="Cancelar"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </ScrollView>
  )
}
