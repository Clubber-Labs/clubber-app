import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import {
  PlusIcon,
  CaretRightIcon,
  CalendarBlankIcon,
  SparkleIcon,
  type Icon,
} from 'phosphor-react-native'
import { SheetModal } from '@/shared/components/SheetModal'
import { colors } from '@/shared/theme'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'

type Props = {
  onCreateEvent: () => void
  onCreateSpot: () => void
}

// Ação única de criar, igual em todas as abas: o "+" abre um seletor (evento
// formal × rolê) em vez de FABs distintos por tela. Cada opção dispara o fluxo
// que a tela hospedeira passar (o rolê fora do mapa navega até ele).
export function CreateFab({ onCreateEvent, onCreateSpot }: Props) {
  const [open, setOpen] = useState(false)
  const tabBarClearance = useTabBarClearance()

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
        className="absolute right-4 h-14 w-14 items-center justify-center rounded-full bg-content"
        style={{
          bottom: tabBarClearance,
          shadowColor: colors.background,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <PlusIcon size={28} color={colors.background} />
      </Pressable>

      <SheetModal visible={open} onClose={() => setOpen(false)}>
        <View className="px-4 pb-2">
          <Text className="px-1 pb-2 text-lg font-bold text-content">
            Criar
          </Text>
          <CreateOption
            icon={CalendarBlankIcon}
            title="Evento"
            subtitle="Com data, local e lista de presença"
            onPress={() => choose(onCreateEvent)}
          />
          <CreateOption
            icon={SparkleIcon}
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
  icon: Icon,
  title,
  subtitle,
  onPress,
}: {
  icon: Icon
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
        <Icon size={22} color={colors.brandText} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-content">{title}</Text>
        <Text className="text-sm text-content-muted">{subtitle}</Text>
      </View>
      <CaretRightIcon size={18} color={colors.contentSubtle} />
    </Pressable>
  )
}
