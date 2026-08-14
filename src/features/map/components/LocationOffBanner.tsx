import { Pressable, Text } from 'react-native'
import { GpsSlashIcon, CaretRightIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  /** Distância do topo — o mapa passa o headerClearance. */
  top: number
  onPress: () => void
}

/**
 * Aviso permanente enquanto faltar permissão de localização no mapa.
 *
 * Diz o que a pessoa está perdendo em vez de só pedir permissão: sem isso, o
 * avatar simplesmente não aparece e a ausência parece bug do app. Fica no topo
 * porque o rodapé é do preview de evento/spot.
 *
 * É tocável de propósito: o convite com botão só aparece uma vez, então sem um
 * caminho aqui a permissão viraria um beco sem saída depois dele.
 */
export function LocationOffBanner({ top, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute left-3 right-3 flex-row items-center gap-2 rounded-lg border border-line-strong bg-surface/95 px-3 py-2 active:opacity-70"
      style={{ top }}
    >
      <GpsSlashIcon size={16} color={colors.contentMuted} weight="fill" />
      <Text className="flex-1 text-xs text-content leading-4">
        Sua posiçao é exibida somente para  Habilite sua localização no
        mapa e descobrir eventos e roles perto de voce.
      </Text>
      <Text className="text-xs font-semibold text-content">Ativar</Text>
      <CaretRightIcon size={12} color={colors.contentSubtle} />
    </Pressable>
  )
}
