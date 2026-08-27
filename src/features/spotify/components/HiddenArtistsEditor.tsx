import { colors } from '@/shared/theme'
import { EyeSlashIcon, SpotifyLogoIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, Text, View } from 'react-native'
import type { SpotifyArtist } from '../types'

type Props = {
  artists: SpotifyArtist[]
  isSaving: boolean
  onToggle: (hiddenArtistIds: string[]) => void
}

const FACE_SIZE = 56

/**
 * Escolha de quais artistas aparecem no perfil. O escondido continua na lista,
 * apagado e com o ícone — sumir seria tirar do dono a única forma de trazê-lo
 * de volta.
 *
 * Vale mesmo com a exibição geral desligada: o artista escondido também sai da
 * contagem de artistas em comum, que é o que sobra pra quem desligou a fileira.
 */
export function HiddenArtistsEditor({ artists, isSaving, onToggle }: Props) {
  const { t } = useTranslation()

  if (artists.length === 0) return null

  const hiddenCount = artists.filter(a => a.hidden).length

  function toggle(artistId: string) {
    const next = artists
      .filter(a => (a.id === artistId ? !a.hidden : a.hidden))
      .map(a => a.id)
    onToggle(next)
  }

  return (
    <View className="bg-surface border border-line rounded-2xl p-5 gap-4">
      <View className="gap-1">
        <Text className="text-content font-semibold text-sm">
          {t('spotify.hidden.title')}
        </Text>
        <Text className="text-content-muted text-xs leading-4">
          {hiddenCount > 0
            ? t('spotify.hidden.someHidden', { count: hiddenCount })
            : t('spotify.hidden.body')}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {artists.map(artist => (
          <Pressable
            key={artist.id}
            onPress={() => toggle(artist.id)}
            disabled={isSaving}
            accessibilityRole="switch"
            accessibilityState={{ checked: !artist.hidden }}
            accessibilityLabel={artist.name}
            style={{ width: FACE_SIZE }}
            className="items-center active:opacity-70"
          >
            <View
              style={{
                width: FACE_SIZE,
                height: FACE_SIZE,
                borderRadius: FACE_SIZE / 2,
                overflow: 'hidden',
                opacity: artist.hidden ? 0.35 : 1,
              }}
              className="bg-surface-elevated items-center justify-center"
            >
              {artist.imageUrl ? (
                <Image
                  source={{ uri: artist.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <SpotifyLogoIcon size={22} color={colors.contentFaint} />
              )}
            </View>

            {artist.hidden && (
              <View
                style={{ top: FACE_SIZE / 2 - 11 }}
                className="absolute h-[22px] w-[22px] items-center justify-center rounded-full bg-background"
              >
                <EyeSlashIcon size={13} color={colors.contentMuted} />
              </View>
            )}

            <Text
              numberOfLines={1}
              style={{ opacity: artist.hidden ? 0.5 : 1 }}
              className="text-content-secondary text-[11px] mt-1.5 text-center"
            >
              {artist.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
