import { useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Stack, useRouter } from 'expo-router'
import { CircleIcon } from 'phosphor-react-native'
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

// Chaves, não frases: a constante avalia no import e congelaria o idioma.
const POINT_KEYS = [
  'account.deactivateEffects.0',
  'account.deactivateEffects.1',
  'account.deactivateEffects.2',
] as const

export default function DeactivateAccountScreen() {
  const { t } = useTranslation()
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
      title: t('account.deactivate'),
      message: t('account.deactivateConfirmMessage'),
      confirmLabel: t('account.deactivateConfirm'),
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
            ? t('account.tooManyAttempts')
            : getApiError(e).message,
        ),
    })
  }

  if (done) {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <AccountExitSuccess
          title={t('account.deactivatedTitle')}
          message={t('account.deactivatedMessage')}
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
        <Text className="text-content text-2xl font-bold">
          {t('account.deactivate')}
        </Text>
        <Text className="text-content-muted text-base leading-6">
          {t('account.deactivateTagline')}
        </Text>
      </View>

      <View className="bg-surface-sunken border border-line rounded-xl p-4 gap-3">
        {POINT_KEYS.map(key => (
          <View key={key} className="flex-row items-start gap-2">
            <CircleIcon
              weight="fill"
              size={6}
              color={colors.brandText}
              style={{ marginTop: 7 }}
            />
            <Text className="text-content-tertiary text-sm flex-1 leading-5">
              {t(key)}
            </Text>
          </View>
        ))}
      </View>

      <FormError message={inlineError} />

      <View className="gap-3">
        <Button
          label={t('account.deactivateCta')}
          variant="destructive"
          onPress={onDeactivate}
          loading={deactivate.isPending}
          disabled={deactivate.isPending}
        />
        <Button
          label={t('common.cancel')}
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </ScrollView>
  )
}
