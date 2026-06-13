import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SheetModal } from '@/shared/components/SheetModal'
import { REASON_OPTIONS, reportSheetTitle } from '../utils/reportLabels'
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
        {target ? reportSheetTitle(target.type) : 'Denunciar'}
      </Text>
      {REASON_OPTIONS.map(r => {
        const active = reason === r.value
        return (
          <Pressable
            key={r.value}
            onPress={() => setReason(r.value)}
            className="flex-row items-center justify-between px-5 py-3"
          >
            <Text className="text-content-bright text-base">{r.label}</Text>
            <Ionicons
              name={active ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={active ? colors.brandEmphasis : colors.contentFaint}
            />
          </Pressable>
        )
      })}
      <TextInput
        value={details}
        onChangeText={setDetails}
        placeholder="Detalhes (opcional)"
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
            Enviar denúncia
          </Text>
        </Pressable>
      </View>
    </SheetModal>
  )
}
