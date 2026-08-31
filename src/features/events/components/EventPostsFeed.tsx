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
  // O autor não responde RSVP ao próprio evento — sem isto ele cairia no
  // "marque presença para postar", sem botão nenhum que o tirasse de lá. É
  // também o que dá a ele a moderação dos posts alheios.
  isAuthor?: boolean
  // Convite do input, quando a tela quer trocar o padrão (evento ao vivo).
  placeholder?: string
  ListHeaderComponent?: ReactElement
}

export function EventPostsFeed({
  eventId,
  myAttendance,
  isAuthor = false,
  placeholder,
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
  const canPost =
    isAuthor || myAttendance === 'CONFIRMED' || myAttendance === 'INTERESTED'
  // A paginação é por cursor e não devolve total: contar o que está carregado
  // enquanto há próxima página anunciaria um número que cresce ao rolar.
  const subtitle = hasNextPage
    ? t('events.posts.sectionFrom')
    : t('events.posts.sectionSubtitle', { count: posts.length })

  return (
    <>
      <FlatList<EventPost>
        // A lista hospeda o input de comentário/post: sem isto o primeiro toque em
        // Enviar apenas fecha o teclado, e o usuário precisa tocar duas vezes.
        keyboardShouldPersistTaps="handled"
        data={posts}
        keyExtractor={item => item.id}
        // Sem padding horizontal: a foto do post vai de ponta a ponta. Quem
        // precisa de margem (cabeçalho, texto, ações) a aplica por dentro.
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={
          <View className="gap-3 px-4 pb-3">
            {ListHeaderComponent}
            <View className="gap-0.5">
              <Text className="text-base font-extrabold text-content">
                {t('events.posts.sectionTitle')}
              </Text>
              <Text className="text-xs text-content-muted">{subtitle}</Text>
            </View>
            <CreatePostInput
              eventId={eventId}
              disabled={!canPost}
              disabledReason={t('events.posts.attendToPost')}
              placeholder={placeholder}
            />
          </View>
        }
        renderItem={({ item }) => (
          <PostItem
            eventId={eventId}
            post={item}
            isOrganizer={isAuthor}
            onReport={
              item.authorId !== myId
                ? () => report.requestReport({ type: 'post', id: item.id })
                : undefined
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-px bg-line" />}
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
            <View className="items-center px-4 py-10">
              <Text className="text-center text-sm text-content-muted">
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
