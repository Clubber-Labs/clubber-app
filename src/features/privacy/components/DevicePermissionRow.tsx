import { Pressable, Text, View } from 'react-native'
import { GearSixIcon } from 'phosphor-react-native'
import type { OsPermission } from '@/features/notifications/hooks/useOsPermissions'
import { colors } from '@/shared/theme'

type Props = {
  label: string
  description: string
  status: OsPermission
  onPress: () => void
  isLast?: boolean
}

const STATUS_LABEL: Record<OsPermission, string> = {
  granted: 'Ativado',
  denied: 'Desativado',
  undetermined: 'Ativar',
}

/**
 * Linha de permissão do SISTEMA — deliberadamente NÃO é um switch. O app não
 * consegue desligar uma permissão do SO, e um controle que não honra o gesto
 * (o usuário arrasta, nada acontece) faz a culpa parecer do app.
 *
 * 'undetermined' ainda pode virar prompt nativo; 'denied' é definitivo e só os
 * Ajustes resolvem — quem decide qual dos dois caminhos é o onPress.
 */
export function DevicePermissionRow({
  label,
  description,
  status,
  onPress,
  isLast,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-start px-4 py-4 active:opacity-70 ${
        !isLast ? 'border-b border-line' : ''
      }`}
    >
      <View className="flex-1 mr-4">
        <Text className="text-sm font-semibold text-content">{label}</Text>
        <Text className="text-xs text-content-muted mt-1 leading-4">
          {description}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text
          className={`text-xs font-semibold ${
            status === 'granted' ? 'text-success-text' : 'text-content-subtle'
          }`}
        >
          {STATUS_LABEL[status]}
        </Text>
        <GearSixIcon size={16} color={colors.contentSubtle} />
      </View>
    </Pressable>
  )
}
