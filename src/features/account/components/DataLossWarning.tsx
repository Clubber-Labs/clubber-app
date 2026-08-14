import { View, Text, Pressable, ActivityIndicator, Linking } from 'react-native'
import {
  XCircleIcon,
  InfoIcon,
  DownloadSimpleIcon,
  ArrowSquareOutIcon,
} from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { colors } from '@/shared/theme'

type Props = {
  onExport: () => void
  exporting: boolean
  exportError: string | null
  onContinue: () => void
  onBack: () => void
}

const LOST_ITEMS = [
  'Seus eventos, posts e presenças',
  'Seus seguidores e quem você segue',
  'Seu perfil, foto e preferências',
]

export function DataLossWarning({
  onExport,
  exporting,
  exportError,
  onContinue,
  onBack,
}: Props) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-content text-xl font-bold">
          O que acontece ao excluir
        </Text>
        <Text className="text-content-muted text-sm leading-5">
          Você tem 30 dias para mudar de ideia. Dentro desse prazo, basta fazer
          login para cancelar a exclusão e recuperar tudo.
        </Text>
      </View>

      <View className="bg-surface-sunken border border-line rounded-xl p-4 gap-3">
        <Text className="text-content-tertiary text-sm font-semibold">
          Será removido permanentemente:
        </Text>
        {LOST_ITEMS.map(item => (
          <View key={item} className="flex-row items-start gap-2">
            <XCircleIcon size={16} color={colors.danger} weight="fill" />
            <Text className="text-content-tertiary text-sm flex-1">{item}</Text>
          </View>
        ))}
        <View className="flex-row items-start gap-2 pt-1 border-t border-line mt-1">
          <InfoIcon size={16} color={colors.contentMuted} weight="fill" />
          <Text className="text-content-muted text-xs flex-1 leading-4">
            Comentários e mensagens que você enviou em conteúdo de outras
            pessoas permanecem, mas anonimizados como “Usuário Excluído”.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onExport}
        disabled={exporting}
        className="flex-row items-center justify-between bg-surface-sunken border border-line rounded-xl px-4 py-4 active:opacity-70"
      >
        <View className="flex-1 pr-3">
          <Text className="text-sm font-medium text-content">
            Baixar histórico de consentimentos
          </Text>
          <Text className="text-xs text-content-subtle mt-0.5 leading-4">
            Portabilidade LGPD (Art. 18, V). Inclui só o histórico de
            consentimento — não eventos, posts ou mensagens.
          </Text>
          {exportError && (
            <Text className="text-danger text-xs mt-1">{exportError}</Text>
          )}
        </View>
        {exporting ? (
          <ActivityIndicator size="small" color={colors.brandText} />
        ) : (
          <DownloadSimpleIcon size={18} color={colors.contentSubtle} />
        )}
      </Pressable>

      <Pressable
        onPress={() => Linking.openURL('https://clubber.social/privacidade')}
        className="flex-row items-center gap-2 px-1"
      >
        <ArrowSquareOutIcon size={14} color={colors.brandText} />
        <Text className="text-brand-text text-sm">Política de Privacidade</Text>
      </Pressable>

      <View className="gap-3 mt-2">
        <Button label="Continuar" onPress={onContinue} />
        <Button label="Voltar" onPress={onBack} variant="secondary" />
      </View>
    </View>
  )
}
