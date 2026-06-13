import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { SheetModal } from './SheetModal'
import { colors } from '@/shared/theme'

type Props = {
  visible: boolean
  onClose: () => void
  onConfirm: (title: string) => void
  submitting?: boolean
  initialValue?: string
  heading?: string
  confirmLabel?: string
}

export function GroupTitleModal({
  visible,
  onClose,
  onConfirm,
  submitting,
  initialValue,
  heading = 'Nome do grupo',
  confirmLabel = 'Criar grupo',
}: Props) {
  const [title, setTitle] = useState(initialValue ?? '')

  useEffect(() => {
    if (visible) setTitle(initialValue ?? '')
  }, [visible, initialValue])

  const canConfirm = title.trim().length > 0 && !submitting

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <Text className="text-content font-semibold text-base px-5 pt-1 pb-2">
        {heading}
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ex: Squad do show"
        placeholderTextColor={colors.contentSubtle}
        maxLength={80}
        className="bg-surface rounded-xl px-4 py-3 text-content mx-5"
      />
      <View className="px-5 mt-3">
        <Pressable
          onPress={() => canConfirm && onConfirm(title.trim())}
          disabled={!canConfirm}
          className={`rounded-full py-3 items-center ${canConfirm ? 'bg-brand' : 'bg-surface-elevated'}`}
        >
          <Text
            className={`font-semibold ${canConfirm ? 'text-content' : 'text-content-subtle'}`}
          >
            {submitting ? 'Salvando…' : confirmLabel}
          </Text>
        </Pressable>
      </View>
    </SheetModal>
  )
}
