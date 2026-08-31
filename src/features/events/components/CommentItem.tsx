import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { HeartIcon } from 'phosphor-react-native'
import { useToggleCommentLike } from '../hooks/useComments'
import { CommentActionsSheet } from './CommentActionsSheet'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatRelative } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import type { EventComment } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  comment: EventComment
  eventId: string
  // Presente quando o usuário pode apagar: autor do comentário ou organizador.
  onDelete?: () => void
  // Presente só para comentários de terceiros.
  onReport?: () => void
}

const AVATAR = 32

/**
 * Uma linha de conversa — sem card, sem raio, sem borda em volta. A lista é
 * uma lista: o que separa um comentário do outro é o divisor que a seção
 * desenha, não uma caixa por item.
 *
 * Moderação some atrás do long-press: um ⋯ fixo em cada linha custaria ruído
 * permanente por uma ação rara.
 */
export function CommentItem({ comment, eventId, onDelete, onReport }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const [sheetOpen, setSheetOpen] = useState(false)
  const toggleLike = useToggleCommentLike(eventId)

  const moderable = !!onDelete || !!onReport
  // Comentário otimista ainda não existe no backend: curtir ou moderar iria
  // bater num id que não é o final.
  const settled = !comment.pending

  return (
    <>
      <Pressable
        onLongPress={
          moderable && settled ? () => setSheetOpen(true) : undefined
        }
        delayLongPress={300}
        className="flex-row gap-3 px-4 py-3"
        style={{ opacity: comment.pending ? 0.6 : 1 }}
      >
        <ProfileLink
          userId={comment.author.id}
          username={comment.author.username}
        >
          <UserAvatar
            name={comment.author.name}
            avatarUrl={comment.author.avatarUrl}
            size={AVATAR}
          />
        </ProfileLink>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-1.5">
            <ProfileLink
              userId={comment.author.id}
              username={comment.author.username}
              hitSlop={6}
            >
              <Text className="text-sm font-bold text-content">
                {comment.author.username}
              </Text>
            </ProfileLink>
            <Text className="text-xs text-content-subtle">
              {`· ${formatRelative(comment.createdAt, locale)}`}
            </Text>
          </View>

          <Text className="text-[15px] leading-[22px] text-content">
            {comment.content}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            toggleLike.mutate({
              commentId: comment.id,
              currentlyLiked: comment.userLiked,
            })
          }
          disabled={!settled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: comment.userLiked }}
          accessibilityLabel={
            comment.userLiked
              ? t('events.comments.unlike')
              : t('events.comments.like')
          }
          className="items-center gap-0.5 pt-0.5"
        >
          <HeartIcon
            size={16}
            weight={comment.userLiked ? 'fill' : 'regular'}
            color={comment.userLiked ? colors.danger : colors.contentMuted}
          />
          {comment.reactionsCount > 0 && (
            <Text
              className={`text-[11px] ${comment.userLiked ? 'text-danger' : 'text-content-muted'}`}
            >
              {comment.reactionsCount}
            </Text>
          )}
        </Pressable>
      </Pressable>

      <CommentActionsSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onReport={onReport}
        onDelete={onDelete}
      />
    </>
  )
}
