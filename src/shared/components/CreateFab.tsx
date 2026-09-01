import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  PlusIcon,
  CaretRightIcon,
  CalendarPlusIcon,
  ChatCircleDotsIcon,
  type Icon,
} from 'phosphor-react-native'
import { Fab } from '@/shared/components/Fab'
import { SheetModal } from '@/shared/components/SheetModal'
import { colors } from '@/shared/theme'
import { useSheetExit } from '@/shared/hooks/useSheetExit'

type Props = {
  onCreateEvent: () => void
  onCreateSpot: () => void
}

// Ação de criar do feed e do mapa: o "+" abre um seletor (evento formal ×
// rolê) em vez de FABs distintos por tela. Cada opção dispara o fluxo que a
// tela hospedeira passar (o rolê fora do mapa navega até ele). Postar foto
// não entra aqui: é conteúdo do perfil, e lá o "+" vai direto.
export function CreateFab({ onCreateEvent, onCreateSpot }: Props) {
  const { t } = useTranslation()
  const sheet = useSheetExit()

  return (
    <>
      <Fab
        icon={PlusIcon}
        accessibilityLabel={t('shared.createFab.title')}
        onPress={sheet.open}
      />

      <SheetModal
        visible={sheet.visible}
        onClose={sheet.close}
        instantExit={sheet.instantExit}
      >
        <View className="px-4 pb-2">
          <Text className="px-1 pb-2 text-lg font-bold text-content">
            {t('shared.createFab.title')}
          </Text>
          <CreateOption
            icon={CalendarPlusIcon}
            title={t('shared.createFab.event')}
            subtitle={t('shared.createFab.eventHint')}
            onPress={() => sheet.exitTo(onCreateEvent)}
          />
          <CreateOption
            icon={ChatCircleDotsIcon}
            title={t('shared.createFab.spot')}
            subtitle={t('shared.createFab.spotHint')}
            onPress={() => sheet.exitTo(onCreateSpot)}
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
