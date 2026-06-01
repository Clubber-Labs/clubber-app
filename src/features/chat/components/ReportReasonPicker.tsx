import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SheetModal } from './SheetModal'
import type { ReportReason } from '../types'

type Props = {
  visible: boolean
  onClose: () => void
  onSubmit: (reason: ReportReason, details?: string) => void
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'HATE_SPEECH', label: 'Discurso de ódio' },
  { value: 'SPAM_OR_FRAUD', label: 'Spam ou fraude' },
  { value: 'HARASSMENT', label: 'Assédio' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Conteúdo inapropriado' },
  { value: 'OTHER', label: 'Outro' },
]

export function ReportReasonPicker({ visible, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')

  function submit() {
    if (!reason) return
    onSubmit(reason, details.trim() || undefined)
    setReason(null)
    setDetails('')
  }

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <Text className="text-white font-semibold text-base px-5 pt-1 pb-2">
        Denunciar mensagem
      </Text>
      {REASONS.map(r => {
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
