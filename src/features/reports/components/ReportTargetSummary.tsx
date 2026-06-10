import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  reportTargetId,
  reportTargetPreview,
  reportTargetType,
  reportTargetTypeLabel,
} from '../utils/reportTarget'
import type { Report } from '../types'

type Props = {
  report: Report
}

// Bloco de identificação do conteúdo denunciado no detalhe. Para evento e
// usuário oferece atalho de navegação; comentário e mensagem não têm rota
// isolada, então só exibem a prévia.
export function ReportTargetSummary({ report }: Props) {
  const router = useRouter()
  const type = reportTargetType(report)
  const id = reportTargetId(report)
  const preview = reportTargetPreview(report)

  const canOpen = (type === 'event' || type === 'user') && !!id
  function open() {
    if (!id) return
    if (type === 'event') router.push(`/events/${id}`)
    if (type === 'user') router.push(`/users/${id}`)
  }

  return (
    <View className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 gap-2">
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="pricetag-outline" size={14} color="#a78bfa" />
        <Text className="text-violet-300 text-xs font-semibold uppercase tracking-wider">
          {reportTargetTypeLabel(report)}
        </Text>
      </View>

      {preview ? (
        <Text className="text-zinc-100 text-base">{preview}</Text>
      ) : (
        <Text className="text-zinc-500 text-sm italic">
          Prévia indisponível
        </Text>
      )}

      {!!id && <Text className="text-zinc-600 text-xs">ID: {id}</Text>}

      {canOpen && (
        <Pressable
          onPress={open}
          className="flex-row items-center gap-1 self-start mt-1"
        >
          <Text className="text-violet-400 font-semibold text-sm">
            Ver {type === 'event' ? 'evento' : 'perfil'}
          </Text>
          <Ionicons name="arrow-forward" size={14} color="#a78bfa" />
        </Pressable>
      )}
    </View>
  )
}
