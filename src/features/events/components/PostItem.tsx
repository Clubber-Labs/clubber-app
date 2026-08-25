import { View, Text, Pressable, Image, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  TrashIcon,
  FlagIcon,
  ChatCircleIcon,
  HeartIcon,
} from 'phosphor-react-native'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useConfirm } from '@/shared/lib/confirm'
import { useDeletePost } from '../hooks/usePosts'
import { formatRelative } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatFullName } from '@/shared/utils/fullName'
import type { EventPost } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  post: EventPost
  // Quando definido (post de outra pessoa), exibe o botão de denúncia. O sheet
  // é elevado pela lista (EventPostsFeed), igual ao padrão de comentários.
  onReport?: () => void
}

export function PostItem({ eventId, post, onReport }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const userId = useAuthStore(s => s.userId)
  const deletePost = useDeletePost(eventId)
  const confirm = useConfirm()

  const isAuthor = userId === post.authorId

  async function handleDelete() {
    const ok = await confirm({
      title: t('events.posts.deleteTitle'),
      message: t('events.posts.deleteMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
    })
    if (ok) deletePost.mutate(post.id)
  }

  return (
    <View className="bg-surface rounded-xl p-4 border border-line gap-3">
      <View className="flex-row items-start justify-between">
        <ProfileLink
          userId={post.author.id}
          username={post.author.username}
          className="flex-row items-center gap-2 flex-1"
        >
          <UserAvatar
            name={post.author.name}
            avatarUrl={post.author.avatarUrl}
          />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-content">
              {formatFullName(post.author.name, post.author.lastname)}
            </Text>
            <Text className="text-xs text-content-subtle">
              @{post.author.username} · {formatRelative(post.createdAt, locale)}
            </Text>
          </View>
        </ProfileLink>

        {isAuthor ? (
          <Pressable
            onPress={handleDelete}
            disabled={deletePost.isPending}
            className="w-8 h-8 items-center justify-center"
          >
            <TrashIcon size={18} color={colors.danger} />
          </Pressable>
        ) : onReport ? (
          <Pressable
            onPress={onReport}
            className="w-8 h-8 items-center justify-center"
            accessibilityLabel={t('events.posts.report')}
          >
            <FlagIcon size={16} color={colors.contentSubtle} />
          </Pressable>
        ) : null}
      </View>

      <Text className="text-base text-content-bright">{post.content}</Text>

      {post.images && post.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {post.images.map(img => (
            <Image
              key={img.id}
              source={{ uri: img.url }}
              className="w-40 h-40 rounded-xl bg-surface-elevated"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {post._count && (
        <View className="flex-row gap-4 pt-1">
          <View className="flex-row items-center gap-1">
            <ChatCircleIcon size={14} color={colors.contentSubtle} />
            <Text className="text-xs text-content-muted">
              {post._count.comments}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <HeartIcon size={14} color={colors.contentSubtle} />
            <Text className="text-xs text-content-muted">
              {post._count.reactions}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
