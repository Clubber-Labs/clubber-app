import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useReportFlow } from '../hooks/useReportFlow'
import { ReportReasonSheet } from './ReportReasonSheet'
import { TARGET_LABELS } from '../utils/reportLabels'
import type { ReportTarget } from '../types'

type Props = {
  target: ReportTarget
  // overlay: botão circular escuro pra sobrepor mídia (header de evento).
  // ghost: ícone simples pra usar inline ao lado de outras ações.
  variant?: 'overlay' | 'ghost'
}

// Gatilho de denúncia autossuficiente (gerencia o sheet e o submit via
// useReportFlow). Use em pontos de instância única — header de evento, perfil
// de terceiro. Para listas (comentários) prefira erguer um único sheet e
// passar onReport por item, evitando N modais montados.
export function ReportButton({ target, variant = 'overlay' }: Props) {
  const report = useReportFlow()
  const isOverlay = variant === 'overlay'

  return (
    <>
      <Pressable
        onPress={() => report.requestReport(target)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Denunciar ${TARGET_LABELS[target.type]}`}
        className={
          isOverlay
            ? 'w-10 h-10 items-center justify-center rounded-full bg-black/50'
            : 'w-9 h-9 items-center justify-center'
        }
      >
        <Ionicons
          name="flag-outline"
          size={isOverlay ? 20 : 22}
          color={isOverlay ? '#ffffff' : '#a1a1aa'}
        />
      </Pressable>
      <ReportReasonSheet
        target={report.target}
        onClose={report.close}
        onSubmit={report.submit}
      />
    </>
  )
}
