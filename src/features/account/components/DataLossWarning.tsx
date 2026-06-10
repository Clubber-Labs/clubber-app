import { View, Text, Pressable, ActivityIndicator, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/shared/components/Button'

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
        <Text className="text-white text-xl font-bold">
          O que acontece ao excluir
        </Text>
        <Text className="text-zinc-400 text-sm leading-5">
          Você tem 30 dias para mudar de ideia. Dentro desse prazo, basta fazer
          login para cancelar a exclusão e recuperar tudo.
        </Text>
      </View>

      <View className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 gap-3">
        <Text className="text-zinc-300 text-sm font-semibold">
          Será removido permanentemente:
        </Text>
        {LOST_ITEMS.map(item => (
          <View key={item} className="flex-row items-start gap-2">
            <Ionicons name="close-circle" size={16} color="#ef4444" />
            <Text className="text-zinc-300 text-sm flex-1">{item}</Text>
          </View>
        ))}
        <View className="flex-row items-start gap-2 pt-1 border-t border-zinc-800 mt-1">
          <Ionicons name="information-circle" size={16} color="#a1a1aa" />
          <Text className="text-zinc-400 text-xs flex-1 leading-4">
            Comentários e mensagens que você enviou em conteúdo de outras
            pessoas permanecem, mas anonimizados como “Usuário Excluído”.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onExport}
        disabled={exporting}
        className="flex-row items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 active:opacity-70"
      >
        <View className="flex-1 pr-3">
          <Text className="text-sm font-medium text-white">
            Baixar histórico de consentimentos
          </Text>
          <Text className="text-xs text-zinc-500 mt-0.5 leading-4">
            Portabilidade LGPD (Art. 18, V). Inclui só o histórico de
            consentimento — não eventos, posts ou mensagens.
          </Text>
          {exportError && (
            <Text className="text-red-500 text-xs mt-1">{exportError}</Text>
          )}
        </View>
        {exporting ? (
          <ActivityIndicator size="small" color="#a78bfa" />
        ) : (
          <Ionicons name="download-outline" size={18} color="#71717a" />
        )}
      </Pressable>

      <Pressable
        onPress={() => Linking.openURL('https://connectai.app/privacidade')}
        className="flex-row items-center gap-2 px-1"
      >
        <Ionicons name="open-outline" size={14} color="#a78bfa" />
        <Text className="text-violet-400 text-sm">Política de Privacidade</Text>
      </Pressable>

      <View className="gap-3 mt-2">
        <Button label="Continuar" onPress={onContinue} />
        <Button label="Voltar" onPress={onBack} variant="secondary" />
      </View>
    </View>
  )
}
