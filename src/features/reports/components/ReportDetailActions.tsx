import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import type { ReportStatus } from '../types'

type IconName = ComponentProps<typeof Ionicons>['name']

type Props = {
  status: ReportStatus
  onSetStatus: (status: ReportStatus) => void
  onRemoveTarget?: () => void
  onDelete: () => void
  isPending: boolean
}

// Transições de status oferecidas no painel (PATCH /reports/:id). Espelham os
// valores reais do backend; 'PENDING' é só inicial, não é uma ação manual.
const STATUS_ACTIONS: {
  status: ReportStatus
  label: string
  icon: IconName
  color: string
}[] = [
  {
    status: 'REVIEWED',
    label: 'Marcar como em análise',
    icon: 'eye-outline',
    color: '#60a5fa',
  },
  {
    status: 'RESOLVED_INVALID',
    label: 'Marcar como improcedente',
    icon: 'close-circle-outline',
    color: '#a1a1aa',
  },
  {
    status: 'RESOLVED_REMOVED',
    label: 'Marcar como removido',
    icon: 'checkmark-circle-outline',
    color: '#34d399',
  },
]

// Ações de moderação no detalhe. Remover alvo é diferente de excluir a denúncia:
// a primeira apaga o conteúdo denunciado; a segunda remove só o registro.
export function ReportDetailActions({
  status,
  onSetStatus,
  onRemoveTarget,
  onDelete,
  isPending,
}: Props) {
  const available = STATUS_ACTIONS.filter(a => a.status !== status)

  return (
    <View className="gap-3">
      <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
        Ações
      </Text>

      {available.map(action => (
        <Pressable
          key={action.status}
          onPress={() => onSetStatus(action.status)}
          disabled={isPending}
          className={`flex-row items-center gap-3 rounded-xl border border-zinc-700 px-4 py-3 ${
            isPending ? 'opacity-50' : 'active:bg-zinc-800'
          }`}
        >
          <Ionicons name={action.icon} size={20} color={action.color} />
          <Text className="text-zinc-100 font-medium text-base">
            {action.label}
          </Text>
        </Pressable>
      ))}

      {onRemoveTarget && status !== 'RESOLVED_REMOVED' && (
        <Pressable
          onPress={onRemoveTarget}
          disabled={isPending}
          className={`flex-row items-center gap-3 rounded-xl border border-red-900 px-4 py-3 mt-1 ${
            isPending ? 'opacity-50' : 'active:bg-red-950'
          }`}
        >
          <Ionicons name="remove-circle-outline" size={20} color="#f87171" />
          <Text className="text-red-300 font-semibold text-base">
            Remover conteúdo denunciado
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={onDelete}
        disabled={isPending}
        className={`flex-row items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 mt-1 ${
          isPending ? 'opacity-50' : 'active:bg-red-950'
        }`}
      >
        <Ionicons name="trash-outline" size={20} color="#a1a1aa" />
        <Text className="text-zinc-300 font-medium text-base">
          Excluir denúncia
        </Text>
      </Pressable>
    </View>
  )
}
