import { SpotifyLogoIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'
import { colors } from '@/shared/theme'

type Props = {
  values: string[]
  /** Quais destes o Spotify sustenta — já resolvido pelo servidor. */
  confirmed?: string[]
}

// Exibição read-only das categorias preferidas no perfil. Rótulos vêm de
// /categories via useCategories; guarda o value e exibe o label.
export function ProfilePreferredCategories({ values, confirmed }: Props) {
  const { labelFor } = useCategories()
  const { t } = useTranslation()

  if (values.length === 0) return null

  const backed = new Set(confirmed ?? [])

  return (
    <View className="flex-row flex-wrap gap-1.5 mt-3">
      {values.map(value => {
        const label = labelFor(value)
        const isBacked = backed.has(value)

        return (
          <View
            key={value}
            className="bg-brand-surface px-2.5 py-1 rounded-md flex-row items-center gap-1"
            // O selo é só ícone: sem isto o leitor de tela anuncia o estilo
            // sem a única coisa que a marca acrescenta.
            accessibilityLabel={
              isBacked ? `${label}, ${t('spotify.confirmed.label')}` : undefined
            }
          >
            <Text className="text-brand-text-strong text-xs font-medium">
              {label}
            </Text>
            {isBacked && (
              <SpotifyLogoIcon size={11} color={colors.brandTextStrong} />
            )}
          </View>
        )
      })}
    </View>
  )
}
