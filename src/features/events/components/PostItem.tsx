import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ChatCircleIcon, DotsThreeIcon, HeartIcon } from 'phosphor-react-native'
import { ActionsMenu, type MenuAction } from '@/shared/components/ActionsMenu'
import { PostImages } from './PostImages'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useConfirm } from '@/shared/lib/confirm'
import { useDeletePost, useTogglePostLike } from '../hooks/usePosts'
import { formatRelative } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatFullName } from '@/shared/utils/fullName'
import type { EventPost } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  post: EventPost
  // Quando definido (post de outra pessoa), habilita denunciar. O sheet é
  // elevado pela lista (EventPostsFeed), igual ao padrão de comentários.
  onReport?: () => void
  // Viewer é o organizador do evento — modera post alheio.
  isOrganizer?: boolean
}

const AVATAR = 38

/**
 * Post do evento em fluxo reto: sem card, sem raio, sem borda em volta. A foto
 * vai de ponta a ponta da tela e o texto respira no px-4 — o que separa um post
 * do outro é o divisor da lista.
 *
 * A ordem muda com o conteúdo, como no Instagram: sem foto o texto É o post e
 * vem antes das ações; com foto a imagem é o post, e o texto vira legenda
 * depois das ações.
 */
export function PostItem({ eventId, post, onReport, isOrganizer }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const userId = useAuthStore(s => s.userId)
  const deletePost = useDeletePost(eventId)
  const toggleLike = useTogglePostLike(eventId)
  const confirm = useConfirm()
  const liked = post.userLiked
  const [menuOpen, setMenuOpen] = useState(false)

  const isAuthor = userId === post.authorId
  const images = post.images ?? []
  const hasImages = images.length > 0

  async function handleDelete() {
    const ok = await confirm({
      title: t('events.posts.deleteTitle'),
      message: t('events.posts.deleteMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
    })
    if (ok) deletePost.mutate(post.id)
  }

  const actions: MenuAction[] = [
    ...(onReport
      ? [{ label: t('events.posts.report'), onPress: onReport }]
      : []),
    ...(isAuthor || isOrganizer
      ? [
          {
            label: t('events.posts.deleteTitle'),
            onPress: handleDelete,
            destructive: true,
          },
        ]
      : []),
  ]

  return (
    <View className="pb-3">
      <View className="flex-row items-center gap-2.5 px-4 py-3">
        <ProfileLink
          userId={post.author.id}
          username={post.author.username}
          className="flex-1 flex-row items-center gap-2.5"
        >
          <UserAvatar
            name={post.author.name}
            avatarUrl={post.author.avatarUrl}
            size={AVATAR}
          />
          <View className="flex-1">
            <Text className="text-sm font-bold text-content" numberOfLines={1}>
              {formatFullName(post.author.name, post.author.lastname)}
            </Text>
            <Text className="text-xs text-content-subtle" numberOfLines={1}>
              {`@${post.author.username} · ${formatRelative(post.createdAt, locale)}`}
            </Text>
          </View>
        </ProfileLink>

        {actions.length > 0 && (
          <Pressable
            onPress={() => setMenuOpen(true)}
            disabled={deletePost.isPending}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('events.card.moreActions')}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <DotsThreeIcon
              size={20}
              color={colors.contentMuted}
              weight="bold"
            />
          </Pressable>
        )}
      </View>

      {!hasImages && !!post.content && (
        <Text className="px-4 pb-1 text-[15px] leading-[22px] text-content">
          {post.content}
        </Text>
      )}

      {hasImages && <PostImages images={images} />}

      <View className="flex-row items-center gap-5 px-4 pt-3">
        <Pressable
          onPress={() =>
            toggleLike.mutate({ postId: post.id, currentlyLiked: liked })
          }
          hitSlop={6}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          accessibilityLabel={
            liked ? t('events.comments.unlike') : t('events.comments.like')
          }
          className="flex-row items-center gap-1.5"
        >
          <HeartIcon
            size={22}
            weight={liked ? 'fill' : 'regular'}
            color={liked ? colors.danger : colors.contentSecondary}
          />
          {!!post._count?.reactions && (
            <Text
              className={`text-sm ${liked ? 'text-danger' : 'text-content-secondary'}`}
            >
              {post._count.reactions}
            </Text>
          )}
        </Pressable>

        <View className="flex-row items-center gap-1.5">
          <ChatCircleIcon size={21} color={colors.contentSecondary} />
          {!!post._count?.comments && (
            <Text className="text-sm text-content-secondary">
              {post._count.comments}
            </Text>
          )}
        </View>
      </View>

      {hasImages && !!post.content && (
        <Text
          className="px-4 pt-2 text-[15px] leading-[22px] text-content-tertiary"
          numberOfLines={3}
        >
          <Text className="font-bold text-content">{post.author.username}</Text>
          {` ${post.content}`}
        </Text>
      )}

      <ActionsMenu
        visible={menuOpen}
        actions={actions}
        onClose={() => setMenuOpen(false)}
      />
    </View>
  )
}
