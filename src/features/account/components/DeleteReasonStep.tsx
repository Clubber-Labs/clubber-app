import { View, Text, TextInput, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RadioButtonIcon } from 'phosphor-react-native'
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
  const { t } = useTranslation()
  return (
    <View className="gap-1">
      <Text className="text-content text-xl font-bold mb-1">
        {t('account.reasons.title')}
      </Text>
      <Text className="text-content-muted text-sm mb-3">
        {t('account.reasons.subtitle')}
      </Text>

      {DELETE_REASON_OPTIONS.map(o => {
        const active = reason === o.value
        return (
          <Pressable
            key={o.value}
            onPress={() => onReasonChange(o.value)}
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-content-bright text-base">
              {t(o.labelKey)}
            </Text>
            <RadioButtonIcon
              size={20}
              color={active ? colors.brandEmphasis : colors.contentFaint}
              weight={active ? 'fill' : 'regular'}
            />
          </Pressable>
        )
      })}

      {reason === 'OTHER' && (
        <TextInput
          value={otherText}
          onChangeText={onOtherTextChange}
          placeholder={t('account.reasons.otherPlaceholder')}
          placeholderTextColor={colors.contentSubtle}
          maxLength={500}
          multiline
          className="bg-surface rounded-xl px-4 py-3 text-content mt-1"
          style={{ minHeight: 60, textAlignVertical: 'top' }}
        />
      )}

      <View className="gap-3 mt-5">
        <Button label={t('common.continue')} onPress={onContinue} />
        <Button
          label={t('account.reasons.skip')}
          onPress={onSkip}
          variant="secondary"
        />
      </View>
    </View>
  )
}
