import type { ProfileArtist } from '@/shared/types'
import * as Linking from 'expo-linking'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SpotifyMark } from '@/shared/components/SpotifyMark'

type Props = {
  artists: ProfileArtist[]
}

const ARTIST_SIZE = 64

/**
 * Artistas mais ouvidos no perfil. A lista já vem filtrada do servidor (toggle
 * desligado, artista oculto ou vínculo revogado chegam como lista vazia), então
 * aqui é só desenho — e some sozinha quando não há o que mostrar.
 *
 * O logo e o toque que leva de volta ao Spotify atendem às design guidelines
 * deles: exibir o conteúdo exige creditar a origem e dar o caminho de volta.
 */
export function TopArtistsRow({ artists }: Props) {
  const { t } = useTranslation()

  if (artists.length === 0) return null

  return (
    <View className="mt-4 gap-2">
      <View className="flex-row items-center gap-1.5">
        <SpotifyMark size={14} />
        <Text className="text-content-muted text-xs font-medium">
          {t('spotify.profile.title')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 8 }}
      >
        {artists.map(artist => (
          <Pressable
            key={artist.id}
            onPress={() => {
              // Abre o app do Spotify quando instalado (universal link) — é o
              // destino que a atribuição pede. Falha em silêncio: um artista
              // que não abre não vale um erro na cara de quem só tocou.
              Linking.openURL(artist.spotifyUrl).catch(() => {})
            }}
            className="items-center active:opacity-70"
            style={{ width: ARTIST_SIZE }}
          >
            {artist.imageUrl ? (
              <Image
                source={{ uri: artist.imageUrl }}
                style={{
                  width: ARTIST_SIZE,
                  height: ARTIST_SIZE,
                  borderRadius: ARTIST_SIZE / 2,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: ARTIST_SIZE,
                  height: ARTIST_SIZE,
                  borderRadius: ARTIST_SIZE / 2,
                }}
                className="bg-surface border border-line items-center justify-center"
              >
                <SpotifyMark size={24} />
              </View>
            )}
            <Text
              numberOfLines={1}
              className="text-content-secondary text-[11px] mt-1.5 text-center"
            >
              {artist.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
