import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePickImages } from '@/shared/hooks/usePickImages'
import { colors } from '@/shared/theme'

type Props = {
  uris: string[]
  onChange: (uris: string[]) => void
  maxCount?: number
}

export function EventImagePicker({ uris, onChange, maxCount = 5 }: Props) {
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
        Fotos do evento{' '}
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
            <Pressable
              onPress={() => remove(i)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-surface border border-line-strong items-center justify-center"
              hitSlop={6}
              accessibilityLabel="Remover foto"
            >
              <Ionicons name="close" size={14} color={colors.contentBright} />
            </Pressable>
          </View>
        ))}
        {canAddMore && (
          <Pressable
            onPress={pick}
            className="w-20 h-20 rounded-xl bg-surface border border-dashed border-line-strong items-center justify-center"
            accessibilityLabel="Adicionar fotos"
          >
            <Ionicons name="add" size={24} color={colors.contentMuted} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}
