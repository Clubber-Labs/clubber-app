import { Image, Pressable, StyleSheet, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { StackIcon } from 'phosphor-react-native'
import Animated from 'react-native-reanimated'
import { memo, type ComponentProps } from 'react'
import type { UserPhoto } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  photo: UserPhoto
  size: number
  index: number
  total: number
  // > 0 no último tile do resumo quando há mais fotos além dele.
  veilCount: number
  // Opacidade do véu dirigida pelo palco — some conforme o mural expande.
  veilStyle: ComponentProps<typeof Animated.View>['style']
  onPress: (photo: UserPhoto) => void
}

const VEIL_BG = 'rgba(11, 11, 13, 0.55)'

// Tile reto (sem raio): a grade é colada à borda da tela, como um mural.
// Memoizado: o palco re-renderiza a grade ao encaixar, e 30 tiles com Image
// remontando é o que faria o fim da animação engasgar.
export const ProfileMuralTile = memo(function ProfileMuralTile({
  photo,
  size,
  index,
  total,
  veilCount,
  veilStyle,
  onPress,
}: Props) {
  const { t } = useTranslation()
  const cover = photo.images[0]?.url

  return (
    <Pressable
      onPress={() => onPress(photo)}
      accessibilityRole="imagebutton"
      accessibilityLabel={t('profile.mural.photoLabel', {
        index: index + 1,
        total,
      })}
      className="bg-surface-elevated"
      style={{ width: size, height: size }}
    >
      {!!cover && (
        <Image
          source={{ uri: cover }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      )}
      {photo.images.length > 1 && (
        <StackIcon
          size={14}
          weight="fill"
          color={colors.content}
          style={styles.stack}
        />
      )}
      {veilCount > 0 && (
        <Animated.View
          pointerEvents="none"
          className="items-center justify-center"
          style={[StyleSheet.absoluteFill, styles.veil, veilStyle]}
        >
          <Text className="text-[13px] font-bold text-content">
            {t('profile.mural.more', { count: veilCount })}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  )
})

const styles = StyleSheet.create({
  stack: { position: 'absolute', top: 6, right: 6 },
  veil: { backgroundColor: VEIL_BG },
})
