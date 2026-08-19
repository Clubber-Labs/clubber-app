import { View, Pressable, Text, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  useAcceptFollowRequest,
  useRejectFollowRequest,
} from '../hooks/useFollowRequests'
import { colors } from '@/shared/theme'

type Props = {
  followerId: string
}

export function FollowRequestActions({ followerId }: Props) {
  const { t } = useTranslation()
  const accept = useAcceptFollowRequest()
  const reject = useRejectFollowRequest()
  const pending = accept.isPending || reject.isPending

  if (pending) {
    return (
      <View className="px-3 py-2">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  return (
    <View className="flex-row gap-2">
      <Pressable
        onPress={() => accept.mutate(followerId)}
        className="bg-brand rounded-full px-3 py-2"
        accessibilityLabel={t('follows.accept')}
      >
        <Text className="text-content text-xs font-semibold">
          {t('follows.accept')}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => reject.mutate(followerId)}
        className="bg-surface-elevated rounded-full px-3 py-2 border border-line-strong"
        accessibilityLabel={t('follows.reject')}
      >
        <Text className="text-content-secondary text-xs font-semibold">
          {t('follows.reject')}
        </Text>
      </Pressable>
    </View>
  )
}
