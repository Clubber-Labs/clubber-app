import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon, GearSixIcon, type Icon } from 'phosphor-react-native'
import type { OsPermission } from '@/features/notifications/hooks/useOsPermissions'
import { colors } from '@/shared/theme'

type Props = {
  icon: Icon
  label: string
  description: string
  status: OsPermission
  onPress: () => void
}

/**
 * Item do pedido de primeiro uso: explica a permissão e oferece o botão que
 * abre o prompt NATIVO. Concedida, o botão dá lugar ao estado — o item fica na
 * lista pra pessoa ver o que já resolveu antes de seguir.
 *
 * Recusada de vez, o botão continua, mas discreto e com a engrenagem: dali em
 * diante ele leva aos Ajustes do sistema, não a um prompt que não voltaria.
 */
export function PermissionRequestRow({
  icon: IconComponent,
  label,
  description,
  status,
  onPress,
}: Props) {
  const { t } = useTranslation()

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-sunken p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
        <IconComponent size={20} color={colors.content} weight="fill" />
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold text-content">{label}</Text>
        <Text className="text-xs text-content-muted mt-1 leading-4">
          {description}
        </Text>
      </View>

      {status === 'granted' && (
        <View className="flex-row items-center gap-1.5">
          <CheckCircleIcon size={18} color={colors.successText} weight="fill" />
          <Text className="text-xs font-semibold text-success-text">
            {t('privacy.permission.granted')}
          </Text>
        </View>
      )}

      {status === 'undetermined' && (
        <Pressable
          onPress={onPress}
          className="rounded-full bg-content px-4 py-2.5 active:opacity-80"
        >
          <Text className="text-xs font-bold text-background">
            {t('privacy.permission.enable')}
          </Text>
        </Pressable>
      )}

      {status === 'denied' && (
        <Pressable
          onPress={onPress}
          className="flex-row items-center gap-1.5 rounded-full border border-line-strong px-4 py-2.5 active:opacity-70"
        >
          <GearSixIcon size={14} color={colors.contentMuted} />
          <Text className="text-xs font-semibold text-content-muted">
            {t('privacy.permission.enable')}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
