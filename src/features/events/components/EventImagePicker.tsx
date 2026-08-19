import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { XIcon, PlusIcon } from 'phosphor-react-native'
import { usePickImages } from '@/shared/hooks/usePickImages'
import { colors } from '@/shared/theme'

type Props = {
  uris: string[]
  onChange: (uris: string[]) => void
  maxCount?: number
  label?: string
}

export function EventImagePicker({
  uris,
  onChange,
  maxCount = 5,
  label,
}: Props) {
  const { t } = useTranslation()
  const remaining = Math.max(1, maxCount - uris.length)
  const pick = usePickImages(
    picked => onChange([...uris, ...picked].slice(0, maxCount)),
    { maxCount: remaining },
  )

  function remove(index: number) {
    onChange(uris.filter((_, i) => i !== index))
  }

  const canAddMore = uris.length < maxCount

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-content-tertiary">
        {label ?? t('events.imagePicker.label')}{' '}
        <Text className="text-content-subtle text-xs">
          ({uris.length}/{maxCount})
        </Text>
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {uris.map((uri, i) => (
          <View key={`${uri}-${i}`} className="relative">
            <Image
              source={{ uri }}
              className="w-20 h-20 rounded-xl bg-surface-elevated"
              resizeMode="cover"
            />
            {i === 0 && (
              <View className="absolute bottom-1 left-1 rounded bg-background/70 border border-line-strong px-1.5 py-0.5">
                <Text className="text-content text-[9px] font-bold uppercase">
                  {t('events.imagePicker.cover')}
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => remove(i)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-surface border border-line-strong items-center justify-center"
              hitSlop={6}
              accessibilityLabel={t('events.imagePicker.removePhoto')}
            >
              <XIcon size={14} color={colors.contentBright} />
            </Pressable>
          </View>
        ))}
        {canAddMore && (
          <Pressable
            onPress={pick}
            className="w-20 h-20 rounded-xl bg-surface border border-dashed border-line-strong items-center justify-center"
            accessibilityLabel={t('events.imagePicker.addPhotos')}
          >
            <PlusIcon size={24} color={colors.contentMuted} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}
