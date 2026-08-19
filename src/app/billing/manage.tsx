import { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { ArrowLeftIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useSubscription } from '@/features/billing/hooks/useSubscription'
import { useCancelSubscription } from '@/features/billing/hooks/useCancelSubscription'
import { useResumeSubscription } from '@/features/billing/hooks/useResumeSubscription'
import { SubscriptionCard } from '@/features/billing/components/SubscriptionCard'
import { Button } from '@/shared/components/Button'
import { useConfirm } from '@/shared/lib/confirm'
import { colors } from '@/shared/theme'

export default function ManageSubscriptionScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const confirm = useConfirm()
  const { data: subscription, isLoading } = useSubscription()
  const cancel = useCancelSubscription()
  const resume = useResumeSubscription()

  // null = sem assinatura ativa → esta tela não tem o que gerenciar.
  useEffect(() => {
    if (!isLoading && subscription === null) router.replace('/billing/upgrade')
  }, [isLoading, subscription, router])

  async function handleCancel() {
    const ok = await confirm({
      title: t('billing.manage.cancelTitle'),
      message: t('billing.manage.cancelMessage'),
      confirmLabel: t('billing.manage.cancelTitle'),
      destructive: true,
    })
    if (ok) cancel.mutate()
  }

  if (isLoading || !subscription) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <View className="flex-row items-center gap-3 mb-6">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeftIcon size={24} color={colors.content} />
        </Pressable>
        <Text className="text-content font-bold text-xl">
          {t('billing.manage.title')}
        </Text>
      </View>

      <SubscriptionCard subscription={subscription} />

      <View className="mt-6 gap-3">
        {subscription.cancelAtPeriodEnd ? (
          <Button
            label={t('billing.manage.resume')}
            onPress={() => resume.mutate()}
            loading={resume.isPending}
          />
        ) : (
          <Button
            label={t('billing.manage.cancelTitle')}
            variant="secondary"
            onPress={handleCancel}
            loading={cancel.isPending}
          />
        )}
      </View>
    </ScrollView>
  )
}
