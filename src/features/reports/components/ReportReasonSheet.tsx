import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SheetModal } from '@/shared/components/SheetModal'
import { REASON_OPTIONS, reportSheetTitle } from '../utils/reportLabels'
import type { ReportReason, ReportTarget } from '../types'

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
      <Text className="text-white font-semibold text-base px-5 pt-1 pb-2">
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
            <Text className="text-zinc-100 text-base">{r.label}</Text>
            <Ionicons
              name={active ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={active ? '#8b5cf6' : '#52525b'}
            />
          </Pressable>
        )
      })}
      <TextInput
        value={details}
        onChangeText={setDetails}
        placeholder="Detalhes (opcional)"
        placeholderTextColor="#71717a"
        maxLength={500}
        multiline
        className="bg-zinc-900 rounded-xl px-4 py-3 text-white mx-5 mt-2"
        style={{ minHeight: 60, textAlignVertical: 'top' }}
      />
      <View className="px-5 mt-3">
        <Pressable
          onPress={submit}
          disabled={!reason}
          className={`rounded-full py-3 items-center ${reason ? 'bg-violet-600' : 'bg-zinc-800'}`}
        >
          <Text
            className={`font-semibold ${reason ? 'text-white' : 'text-zinc-500'}`}
          >
            Enviar denúncia
          </Text>
        </Pressable>
      </View>
    </SheetModal>
  )
}
