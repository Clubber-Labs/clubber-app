import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useMe } from '@/features/auth/hooks/useMe'
import { UserAvatar } from '@/shared/components/UserAvatar'

type Props = {
  onPress: () => void
}

const AVATAR = 24

/**
 * A pílula de comentar do rodapé do card. Parece o campo, mas não é: tocar
 * abre o drawer, que é onde o campo de verdade vive. Ter o input real aqui
 * significaria dois composers montados pro mesmo alvo.
 */
export function CommentComposerButton({ onPress }: Props) {
  const { t } = useTranslation()
  const { data: me } = useMe()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('events.comments.openComments')}
      className="mx-4 mb-3"
    >
      {/* min-h casa com a pílula real do drawer (avatar + input min-h-7 + py):
          as duas são a mesma coisa aos olhos de quem toca. */}
      <View className="min-h-12 flex-row items-center gap-2 rounded-full border border-line px-3 py-2.5">
        <UserAvatar
          name={me?.name ?? ''}
          avatarUrl={me?.avatarUrl}
          size={AVATAR}
        />
        <Text className="text-sm text-content-subtle">
          {t('events.comments.composerPlaceholder')}
        </Text>
      </View>
    </Pressable>
  )
}
