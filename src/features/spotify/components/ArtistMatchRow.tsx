import { colors } from '@/shared/theme'
import type { ArtistMatch } from '@/shared/types'
import { SpotifyLogoIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { Image, Text, View } from 'react-native'

type Props = {
  match: ArtistMatch | null | undefined
}

const FACE_SIZE = 34

/**
 * Artistas que vocês dois ouvem. É o que tira o gosto musical do enfeite e o
 * transforma em motivo pra falar com alguém.
 *
 * O servidor já decide o que pode aparecer: sem interseção vem `null`, e quem
 * escondeu a fileira vem só com a contagem, sem nomes. Aqui é só desenho.
 */
export function ArtistMatchRow({ match }: Props) {
  const { t } = useTranslation()

  if (!match || match.count === 0) return null

  const names = match.named.map(a => a.name).join(', ')

  return (
    <View className="flex-row items-center gap-3 mt-3 bg-surface border border-line rounded-xl px-3 py-2.5">
      {match.named.length > 0 && (
        <View className="flex-row">
          {match.named.map((artist, index) => (
            <View
              key={artist.id}
              style={{
                width: FACE_SIZE,
                height: FACE_SIZE,
                borderRadius: FACE_SIZE / 2,
                borderWidth: 2,
                borderColor: colors.surface,
                marginLeft: index === 0 ? 0 : -11,
                overflow: 'hidden',
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
                <SpotifyLogoIcon size={16} color={colors.contentFaint} />
              )}
            </View>
          ))}
        </View>
      )}

      <View className="flex-1">
        <Text className="text-content-secondary text-sm font-semibold">
          {t('spotify.match.count', { count: match.count })}
        </Text>
        {/* Sem nomes quando o dono escondeu a fileira: sobra só a contagem. */}
        {!!names && (
          <Text numberOfLines={1} className="text-content-muted text-xs mt-0.5">
            {names}
          </Text>
        )}
      </View>
    </View>
  )
}
