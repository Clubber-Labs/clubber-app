import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  PlusIcon,
  CaretRightIcon,
  CalendarPlusIcon,
  ChatCircleDotsIcon,
  ImageSquareIcon,
  type Icon,
} from 'phosphor-react-native'
import { SheetModal } from '@/shared/components/SheetModal'
import { colors } from '@/shared/theme'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useSheetExit } from '@/shared/hooks/useSheetExit'

type Props = {
  onCreateEvent: () => void
  onCreateSpot: () => void
  onCreatePhoto: () => void
}

// Ação única de criar, igual em todas as abas: o "+" abre um seletor (evento
// formal × rolê × foto no mural) em vez de FABs distintos por tela. Cada opção
// dispara o fluxo que a tela hospedeira passar (o rolê fora do mapa navega
// até ele).
export function CreateFab({
  onCreateEvent,
  onCreateSpot,
  onCreatePhoto,
}: Props) {
  const { t } = useTranslation()
  const sheet = useSheetExit()
  const tabBarClearance = useTabBarClearance()

  return (
    <>
      <Pressable
        onPress={sheet.open}
        accessibilityRole="button"
        accessibilityLabel={t('shared.createFab.title')}
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
          <CreateOption
            icon={ImageSquareIcon}
            title={t('shared.createFab.photo')}
            subtitle={t('shared.createFab.photoHint')}
            onPress={() => sheet.exitTo(onCreatePhoto)}
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
