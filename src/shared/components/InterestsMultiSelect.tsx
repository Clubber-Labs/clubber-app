import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useCategories } from '@/shared/hooks/useCategories'
import { InterestGroup } from './InterestGroup'
import { colors } from '@/shared/theme'

type Props = {
  value: string[]
  onChange: (next: string[]) => void
  max?: number
}

// Seletor LIVRE de interesses (subcategorias + gêneros) para perfil/onboarding.
// Recolhido por padrão (accordion) para não alongar o formulário. Sem regra de
// coerência — no perfil o usuário marca qualquer interesse livremente.
export function InterestsMultiSelect({ value, onChange, max = 30 }: Props) {
  const { categories, genres, isLoading } = useCategories()
  const [expanded, setExpanded] = useState(false)

  function toggle(itemValue: string) {
    if (value.includes(itemValue)) {
      onChange(value.filter(v => v !== itemValue))
      return
    }
    if (value.length >= max) return
    onChange([...value, itemValue])
  }

  const atMax = value.length >= max

  return (
    <View className="gap-3">
      <Pressable
        onPress={() => setExpanded(e => !e)}
        className="flex-row items-center justify-between bg-surface border border-line rounded-xl px-4 py-3.5"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-medium text-content">Interesses</Text>
          {value.length > 0 && (
            <View className="bg-brand rounded-full px-2 py-0.5">
              <Text className="text-content text-xs font-semibold">
                {value.length}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.contentTertiary}
        />
      </Pressable>

      {expanded &&
        (isLoading && categories.length === 0 ? (
          <ActivityIndicator
            size="small"
            color={colors.brandEmphasis}
            className="self-start"
          />
        ) : (
          <View className="gap-4 px-1">
            {categories.map(category => (
              <InterestGroup
                key={category.value}
                title={category.label}
                items={category.subcategories ?? []}
                selected={value}
                onToggle={toggle}
                atMax={atMax}
              />
            ))}
            <InterestGroup
              title="Gêneros musicais"
              items={genres}
              selected={value}
              onToggle={toggle}
              atMax={atMax}
            />
          </View>
        ))}
    </View>
  )
}
