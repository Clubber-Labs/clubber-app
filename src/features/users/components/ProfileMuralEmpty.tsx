import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ImageSquareIcon } from 'phosphor-react-native'
import { MURAL_EMPTY_HEIGHT } from '../utils/profileStage'
import { colors } from '@/shared/theme'

type Props = {
  isOwnProfile: boolean
}

// Altura fixa: o palco calcula o resumo do mural sem medir — ver profileStage.
export function ProfileMuralEmpty({ isOwnProfile }: Props) {
  const { t } = useTranslation()
  return (
    <View
      className="items-center justify-center gap-2 px-8"
      style={{ height: MURAL_EMPTY_HEIGHT }}
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
        <ImageSquareIcon size={22} color={colors.contentSubtle} />
      </View>
      <Text className="text-center text-[13px] text-content-muted">
        {t(
          isOwnProfile ? 'profile.mural.emptyOwn' : 'profile.mural.emptyOther',
        )}
      </Text>
    </View>
  )
}
