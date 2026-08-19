import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RadioButtonIcon } from 'phosphor-react-native'
import { SheetModal } from '@/shared/components/SheetModal'
import { REASON_OPTIONS, REPORT_TITLE_KEYS } from '../utils/reportLabels'
import type { ReportReason, ReportTarget } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  // Quando != null o sheet abre; o título é derivado do tipo do alvo.
  target: ReportTarget | null
  onClose: () => void
  onSubmit: (reason: ReportReason, details?: string) => void
}

// Seletor de motivo + detalhes opcional, reutilizável por qualquer alvo
// (mensagem, evento, comentário, usuário). Substitui o antigo
// ReportReasonPicker específico de chat.
export function ReportReasonSheet({ target, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const visible = target !== null
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')

  // Reseta ao fechar pra não reabrir com seleção/old text de outra denúncia.
  useEffect(() => {
    if (!visible) {
      setReason(null)
      setDetails('')
    }
  }, [visible])

  function submit() {
    if (!reason) return
    onSubmit(reason, details.trim() || undefined)
  }

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <Text className="text-content font-semibold text-base px-5 pt-1 pb-2">
        {target ? t(REPORT_TITLE_KEYS[target.type]) : t('reports.title')}
      </Text>
      {REASON_OPTIONS.map(r => {
        const active = reason === r.value
        return (
          <Pressable
            key={r.value}
            onPress={() => setReason(r.value)}
            className="flex-row items-center justify-between px-5 py-3"
          >
            <Text className="text-content-bright text-base">
              {t(r.labelKey)}
            </Text>
            <RadioButtonIcon
              weight={active ? 'fill' : 'regular'}
              size={20}
              color={active ? colors.brandEmphasis : colors.contentFaint}
            />
          </Pressable>
        )
      })}
      <TextInput
        value={details}
        onChangeText={setDetails}
        placeholder={t('reports.detailsPlaceholder')}
        placeholderTextColor={colors.contentSubtle}
        maxLength={500}
        multiline
        className="bg-surface rounded-xl px-4 py-3 text-content mx-5 mt-2"
        style={{ minHeight: 60, textAlignVertical: 'top' }}
      />
      <View className="px-5 mt-3">
        <Pressable
          onPress={submit}
          disabled={!reason}
          className={`rounded-full py-3 items-center ${reason ? 'bg-brand' : 'bg-surface-elevated'}`}
        >
          <Text
            className={`font-semibold ${reason ? 'text-content' : 'text-content-subtle'}`}
          >
            {t('reports.submit')}
          </Text>
        </Pressable>
      </View>
    </SheetModal>
  )
}
