import { View, Text, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/shared/components/Button'
import {
  DELETE_REASON_OPTIONS,
  type DeleteReason,
} from '../utils/deleteReasons'
import { colors } from '@/shared/theme'

type Props = {
  reason: DeleteReason | null
  onReasonChange: (r: DeleteReason) => void
  otherText: string
  onOtherTextChange: (t: string) => void
  onContinue: () => void
  onSkip: () => void
}

export function DeleteReasonStep({
  reason,
  onReasonChange,
  otherText,
  onOtherTextChange,
  onContinue,
  onSkip,
}: Props) {
  return (
    <View className="gap-1">
      <Text className="text-content text-xl font-bold mb-1">
        Por que está saindo?
      </Text>
      <Text className="text-content-muted text-sm mb-3">
        Opcional — sua resposta nos ajuda a melhorar o app.
      </Text>

      {DELETE_REASON_OPTIONS.map(o => {
        const active = reason === o.value
        return (
          <Pressable
            key={o.value}
            onPress={() => onReasonChange(o.value)}
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-content-bright text-base">{o.label}</Text>
            <Ionicons
              name={active ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={active ? colors.brandEmphasis : colors.contentFaint}
            />
          </Pressable>
        )
      })}

      {reason === 'OTHER' && (
        <TextInput
          value={otherText}
          onChangeText={onOtherTextChange}
          placeholder="Conte um pouco mais (opcional)"
          placeholderTextColor={colors.contentSubtle}
          maxLength={500}
          multiline
          className="bg-surface rounded-xl px-4 py-3 text-content mt-1"
          style={{ minHeight: 60, textAlignVertical: 'top' }}
        />
      )}

      <View className="gap-3 mt-5">
        <Button label="Continuar" onPress={onContinue} />
        <Button label="Pular" onPress={onSkip} variant="secondary" />
      </View>
    </View>
  )
}
