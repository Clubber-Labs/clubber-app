import { View, Text, Pressable } from 'react-native'
import { FlagIcon, TrashIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { SheetModal } from '@/shared/components/SheetModal'
import { colors } from '@/shared/theme'

type Props = {
  visible: boolean
  onClose: () => void
  // Ausente quando o comentário é do próprio usuário — ninguém se denuncia.
  onReport?: () => void
  // Ausente quando o usuário não pode apagar (nem autor, nem organizador).
  onDelete?: () => void
}

// Moderação de comentário, atrás do long-press. Fora da linha porque um ⋯ fixo
// por comentário encheria a lista de ruído para uma ação que quase ninguém usa.
export function CommentActionsSheet({
  visible,
  onClose,
  onReport,
  onDelete,
}: Props) {
  const { t } = useTranslation()

  function run(action: () => void) {
    onClose()
    action()
  }

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View className="px-2 pb-4 pt-2">
        {onReport && (
          <Pressable
            onPress={() => run(onReport)}
            accessibilityRole="button"
            className="flex-row items-center gap-3 rounded-xl px-4 py-4 active:opacity-70"
          >
            <FlagIcon size={20} color={colors.content} />
            <Text className="text-base text-content">
              {t('events.comments.report')}
            </Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            onPress={() => run(onDelete)}
            accessibilityRole="button"
            className="flex-row items-center gap-3 rounded-xl px-4 py-4 active:opacity-70"
          >
            <TrashIcon size={20} color={colors.dangerText} />
            <Text className="text-base text-danger-text">
              {t('events.comments.delete')}
            </Text>
          </Pressable>
        )}
      </View>
    </SheetModal>
  )
}
