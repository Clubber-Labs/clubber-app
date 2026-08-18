import { Pressable, Text, View } from 'react-native'
import { MapPinIcon } from 'phosphor-react-native'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { colors } from '@/shared/theme'

type Props = {
  onEnable: () => void
  onDismiss: () => void
}

/**
 * Convite de localização sobre o mapa — ESTE card é o priming.
 *
 * Existe porque o mapa é a tela de entrada: quem acaba de criar a conta cai
 * aqui sem a própria posição e sem rolês por perto, e o botão de centralizar é
 * fácil de não notar. Em vez de disparar o prompt do sistema sozinho (que no
 * iOS só aparece uma vez na vida do app, e recusado só volta pelos Ajustes), o
 * pedido é oferecido com o mapa visível atrás — e "Agora não" não gasta essa
 * chance única.
 */
export function LocationInviteCard({ onEnable, onDismiss }: Props) {
  const tabBarClearance = useTabBarClearance()

  return (
    <View
      className="absolute left-3 right-3 rounded-xl border border-line-strong bg-surface p-4 gap-3"
      style={{ bottom: tabBarClearance }}
    >
      <View className="flex-row items-start gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
          <MapPinIcon size={18} color={colors.content} weight="fill" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-content">
            Ver o que rola perto de você
          </Text>
          <Text className="text-sm text-content-muted mt-1 leading-5">
            Ative a localização para encontrar rolês na sua região e aparecer no
            mapa.
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={onDismiss}
          className="flex-1 rounded-full border border-line-strong py-3 items-center active:opacity-70"
        >
          <Text className="text-sm font-semibold text-content-muted">
            Agora não
          </Text>
        </Pressable>
        <Pressable
          onPress={onEnable}
          className="flex-1 rounded-full bg-content py-3 items-center active:opacity-80"
        >
          <Text className="text-sm font-bold text-background">Ativar</Text>
        </Pressable>
      </View>
    </View>
  )
}
