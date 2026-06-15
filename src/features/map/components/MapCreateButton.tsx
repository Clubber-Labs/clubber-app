import { useState } from 'react'
import type { ComponentProps } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SheetModal } from '@/shared/components/SheetModal'
import { colors } from '@/shared/theme'

type IconName = ComponentProps<typeof Ionicons>['name']

type Props = {
  onCreateEvent: () => void
  onCreateSpot: () => void
}

// Ação única de criar no mapa: o "+" abre um seletor (evento formal × rolê) em
// vez de dois FABs separados. Cada opção dispara o fluxo da tela.
export function MapCreateButton({ onCreateEvent, onCreateSpot }: Props) {
  const [open, setOpen] = useState(false)

  function choose(action: () => void) {
    setOpen(false)
    action()
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Criar"
        className="absolute bottom-6 right-4 h-14 w-14 items-center justify-center rounded-full bg-brand"
        style={{
          shadowColor: colors.background,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color={colors.content} />
      </Pressable>

      <SheetModal visible={open} onClose={() => setOpen(false)}>
        <View className="px-4 pb-2">
          <Text className="px-1 pb-2 text-lg font-bold text-content">
            Criar
          </Text>
          <CreateOption
            icon="calendar-outline"
            title="Evento"
            subtitle="Com data, local e lista de presença"
            onPress={() => choose(onCreateEvent)}
          />
          <CreateOption
            icon="sparkles-outline"
            title="Rolê"
            subtitle="Um encontro rápido perto de você"
            onPress={() => choose(onCreateSpot)}
          />
        </View>
      </SheetModal>
    </>
  )
}

function CreateOption({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName
  title: string
  subtitle: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-xl px-1 py-3 active:bg-surface"
    >
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated">
        <Ionicons name={icon} size={22} color={colors.brandText} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-content">{title}</Text>
        <Text className="text-sm text-content-muted">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.contentSubtle} />
    </Pressable>
  )
}
