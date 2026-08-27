import { colors } from '@/shared/theme'
import type { FeaturedArtist } from '@/shared/types'
import * as Linking from 'expo-linking'
import { SpotifyLogoIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, Text, View } from 'react-native'

type Props = {
  artist: FeaturedArtist | null | undefined
}

const FACE_SIZE = 52

/**
 * O mais ouvido, acima da fileira: o número um diz mais sobre alguém do que os
 * outros quatro juntos, e some na fileira se desenhado do mesmo tamanho.
 *
 * Os gêneros crus do Spotify vão como legenda — são a ponte entre o artista e
 * os estilos que aparecem nos chips do perfil.
 */
export function FeaturedArtistCard({ artist }: Props) {
  const { t } = useTranslation()

  if (!artist) return null

  return (
    <Pressable
      onPress={() => {
        Linking.openURL(artist.spotifyUrl).catch(() => {})
      }}
      className="flex-row items-center gap-3 mt-3 active:opacity-70"
    >
      <View
        style={{
          width: FACE_SIZE,
          height: FACE_SIZE,
          borderRadius: FACE_SIZE / 2,
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
          <SpotifyLogoIcon size={20} color={colors.contentFaint} />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <SpotifyLogoIcon size={12} color={colors.contentSubtle} />
          <Text className="text-content-subtle text-[10px] font-semibold uppercase tracking-wider">
            {t('spotify.featured.label')}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          className="text-content text-base font-bold mt-0.5"
        >
          {artist.name}
        </Text>
        {/* Vocabulário do Spotify, não o nosso: os chips do perfil usam a
            taxonomia do Clubber, e aqui é o que ELES chamam o artista. */}
        {artist.genres.length > 0 && (
          <Text numberOfLines={1} className="text-content-muted text-xs">
            {artist.genres.join(' · ')}
          </Text>
        )}
      </View>
    </Pressable>
  )
}
