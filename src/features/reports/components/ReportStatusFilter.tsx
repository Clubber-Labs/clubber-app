import { ScrollView, Pressable, Text } from 'react-native'
import { STATUS_LABELS } from '../utils/reportLabels'
import type { ReportStatus } from '../types'

type Props = {
  value: ReportStatus | undefined
  onChange: (status: ReportStatus | undefined) => void
}

const STATUSES: ReportStatus[] = [
  'PENDING',
  'REVIEWED',
  'RESOLVED_INVALID',
  'RESOLVED_REMOVED',
]

// Filtro de status da fila. `undefined` = todas.
export function ReportStatusFilter({ value, onChange }: Props) {
  const options: { key: string; label: string; status?: ReportStatus }[] = [
    { key: 'ALL', label: 'Todas', status: undefined },
    ...STATUSES.map(s => ({ key: s, label: STATUS_LABELS[s], status: s })),
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {options.map(opt => {
        const active = value === opt.status
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.status)}
            className={`px-4 py-2 rounded-full border ${
              active
                ? 'bg-violet-600 border-violet-600'
                : 'bg-transparent border-zinc-700'
            }`}
          >
            <Text
              className={`text-sm font-medium ${active ? 'text-white' : 'text-zinc-300'}`}
            >
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
