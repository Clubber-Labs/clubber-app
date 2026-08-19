import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams } from 'expo-router'
import { useEventInvites } from '@/features/events/hooks/useInvites'
import { UserListItem } from '@/features/users/components/UserListItem'
import { isForbiddenError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'

export default function InvitedScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: invited, isLoading, error } = useEventInvites(id)

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  if (isForbiddenError(error)) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-content-muted text-center text-sm">
          {t('events.invited.forbidden')}
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-content-muted text-center text-sm">
          {t('events.invited.loadError')}
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={invited ?? []}
      keyExtractor={u => u.id}
      renderItem={({ item }) => <UserListItem user={item} />}
      ItemSeparatorComponent={() => <View className="h-px bg-surface ml-16" />}
      ListEmptyComponent={
        <View className="items-center justify-center pt-16 px-6">
          <Text className="text-content-subtle text-sm text-center">
            {t('events.invited.empty')}
          </Text>
        </View>
      }
    />
  )
}
