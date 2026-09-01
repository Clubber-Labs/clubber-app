import { View, Text, Pressable } from 'react-native'
import {
  FlagIcon,
  ProhibitIcon,
  ShareNetworkIcon,
  type Icon,
} from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { SheetModal } from '@/shared/components/SheetModal'
import { colors } from '@/shared/theme'

type Props = {
  visible: boolean
  username: string
  onClose: () => void
  onShare: () => void
  onReport: () => void
  onBlock: () => void
}

// Folha do ⋯ do perfil de terceiro: linhas retas (estrutura), a última em
// vermelho porque bloquear é destrutivo.
export function ProfileMoreSheet({
  visible,
  username,
  onClose,
  onShare,
  onReport,
  onBlock,
}: Props) {
  const { t } = useTranslation()

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View className="px-2">
        <Row
          icon={ShareNetworkIcon}
          label={t('profile.more.share')}
          onPress={onShare}
        />
        <Row
          icon={FlagIcon}
          label={t('profile.more.report')}
          onPress={onReport}
        />
        <Row
          icon={ProhibitIcon}
          label={t('profile.more.block', { username })}
          onPress={onBlock}
          danger
          last
        />
      </View>
    </SheetModal>
  )
}

function Row({
  icon: RowIcon,
  label,
  onPress,
  danger,
  last,
}: {
  icon: Icon
  label: string
  onPress: () => void
  danger?: boolean
  last?: boolean
}) {
  const color = danger ? colors.dangerText : colors.contentSecondary
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`min-h-[52px] flex-row items-center gap-3 px-4 ${
        last ? '' : 'border-b border-line'
      }`}
    >
      <RowIcon size={20} color={color} />
      <Text
        className={`text-base font-medium ${
          danger ? 'text-danger-text' : 'text-content'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
