import { SPOTIFY_WINDOWS, type SpotifyWindow } from '@/shared/types'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'

type Props = {
  value: SpotifyWindow
  onChange: (window: SpotifyWindow) => void
}

// Chaves, não frases: a constante avalia no import e congelaria o idioma.
const LABEL_KEYS = {
  short_term: 'spotify.windows.short_term',
  medium_term: 'spotify.windows.medium_term',
  long_term: 'spotify.windows.long_term',
} as const satisfies Record<SpotifyWindow, string>

/**
 * Escolha do período no perfil. Quem alterna é quem visita: "o que ele ouve
 * agora" e "o que ele sempre ouviu" são perguntas de quem está olhando, e o
 * dono já decidiu o que importa ao ligar o seletor.
 */
export function WindowSelector({ value, onChange }: Props) {
  const { t } = useTranslation()

  return (
    <View className="flex-row bg-surface rounded-full p-1 mt-3 gap-1">
      {SPOTIFY_WINDOWS.map(window => {
        const active = window === value
        return (
          <Pressable
            key={window}
            onPress={() => onChange(window)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center rounded-full py-1.5 active:opacity-70 ${
              active ? 'bg-surface-high' : ''
            }`}
          >
            <Text
              className={`text-xs ${
                active
                  ? 'text-content font-semibold'
                  : 'text-content-muted font-medium'
              }`}
            >
              {t(LABEL_KEYS[window])}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
