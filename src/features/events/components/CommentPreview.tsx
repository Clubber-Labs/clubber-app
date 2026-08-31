import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import type { EventComment } from '@/shared/types'

type Props = {
  // Amostra que a listagem já entrega junto do evento — não vale uma
  // requisição por card só pra mostrar uma linha.
  comments: EventComment[]
  totalCount: number
  onExpand: () => void
}

/**
 * Escolhe o comentário que representa a conversa: o mais curtido, e o mais
 * recente como desempate. Note que a escolha vale só DENTRO da amostra que
 * veio no payload — o campeão global exigiria um campo do backend.
 */
function highlight(comments: EventComment[]): EventComment | undefined {
  return comments.reduce<EventComment | undefined>((best, comment) => {
    if (!best) return comment
    if (comment.reactionsCount !== best.reactionsCount) {
      return comment.reactionsCount > best.reactionsCount ? comment : best
    }
    return comment.createdAt > best.createdAt ? comment : best
  }, undefined)
}

// Prévia no estilo do Instagram: uma linha só, nome colado no texto. O bloco
// inteiro abre a seção — o alvo de toque é o comentário, não um link fino.
export function CommentPreview({ comments, totalCount, onExpand }: Props) {
  const { t } = useTranslation()
  const navigateToProfile = useNavigateToProfile()
  const featured = highlight(comments)
  if (!featured) return null

  return (
    <Pressable
      onPress={onExpand}
      accessibilityRole="button"
      className="gap-1 px-4 pb-3"
    >
      {/* O nome é <Text onPress>, e NÃO um ProfileLink: aquele é um Pressable,
          e View dentro de Text vira bloco inline — sai da linha de base e o
          texto ao lado desalinha. */}
      <Text className="text-sm text-content-tertiary" numberOfLines={2}>
        <Text
          className="font-bold text-content"
          onPress={() => navigateToProfile(featured.author.id)}
          suppressHighlighting
          accessibilityRole="link"
          accessibilityLabel={t('shared.viewProfile', {
            username: featured.author.username,
          })}
        >
          {featured.author.username}
        </Text>
        {` ${featured.content}`}
      </Text>
      {totalCount > 1 && (
        <View>
          <Text className="text-xs text-content-subtle">
            {t('events.comments.viewCount', { count: totalCount })}
          </Text>
        </View>
      )}
    </Pressable>
  )
}
