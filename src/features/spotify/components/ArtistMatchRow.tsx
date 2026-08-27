import { colors } from '@/shared/theme'
import type { ArtistMatch } from '@/shared/types'
import * as Linking from 'expo-linking'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, Text, View } from 'react-native'
import { SpotifyMark } from '@/shared/components/SpotifyMark'

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
            <Pressable
              key={artist.id}
              // Caminho de volta pro Spotify, que a atribuição exige. Não dá
              // pra contar com a fileira acima: o match cruza os vinte
              // sincronizados, e ela mostra cinco.
              onPress={() => {
                Linking.openURL(artist.spotifyUrl).catch(() => {})
              }}
              hitSlop={{ top: 8, bottom: 8 }}
              style={{
                width: FACE_SIZE,
                height: FACE_SIZE,
                borderRadius: FACE_SIZE / 2,
                borderWidth: 2,
                borderColor: colors.surface,
                marginLeft: index === 0 ? 0 : -11,
                overflow: 'hidden',
              }}
              className="bg-surface-elevated items-center justify-center active:opacity-70"
            >
              {artist.imageUrl ? (
                <Image
                  source={{ uri: artist.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <SpotifyMark size={16} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          {/* Só credita quando há conteúdo do Spotify na tela: no modo
              contagem não vai nome nem foto, então não há o que atribuir. */}
          {match.named.length > 0 && <SpotifyMark size={13} />}
          <Text className="text-content-secondary text-sm font-semibold">
            {t('spotify.match.count', { count: match.count })}
          </Text>
        </View>
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
