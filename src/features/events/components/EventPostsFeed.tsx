import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { usePosts } from '../hooks/usePosts'
import { PostItem } from './PostItem'
import { CreatePostInput } from './CreatePostInput'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import type { AttendanceType, EventPost } from '@/shared/types'
import type { ReactElement } from 'react'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  myAttendance: AttendanceType | null
  ListHeaderComponent?: ReactElement
}

export function EventPostsFeed({
  eventId,
  myAttendance,
  ListHeaderComponent,
}: Props) {
  const { t } = useTranslation()
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = usePosts(eventId)
  const { refreshing, onRefresh } = usePullRefresh(refetch)
  const myId = useAuthStore(s => s.userId)
  const report = useReportFlow()

  const posts = data?.pages.flatMap(page => page.data) ?? []
  const canPost = myAttendance === 'CONFIRMED' || myAttendance === 'INTERESTED'

  return (
    <>
      <FlatList<EventPost>
        // A lista hospeda o input de comentário/post: sem isto o primeiro toque em
        // Enviar apenas fecha o teclado, e o usuário precisa tocar duas vezes.
        keyboardShouldPersistTaps="handled"
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 10,
          paddingBottom: 60,
        }}
        ListHeaderComponent={
          <View className="gap-3">
            {ListHeaderComponent}
            <CreatePostInput
              eventId={eventId}
              disabled={!canPost}
              disabledReason={t('events.posts.attendToPost')}
            />
          </View>
        }
        renderItem={({ item }) => (
          <PostItem
            eventId={eventId}
            post={item}
            onReport={
              item.authorId !== myId
                ? () => report.requestReport({ type: 'post', id: item.id })
                : undefined
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-2" />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandEmphasis}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.brandEmphasis}
              className="py-8"
            />
          ) : (
            <View className="py-10 items-center">
              <Text className="text-center text-content-muted text-sm">
                {t('events.posts.empty')}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              size="small"
              color={colors.brandEmphasis}
              className="py-3"
            />
          ) : null
        }
      />
      <ReportReasonSheet
        target={report.target}
        onClose={report.close}
        onSubmit={report.submit}
      />
    </>
  )
}
