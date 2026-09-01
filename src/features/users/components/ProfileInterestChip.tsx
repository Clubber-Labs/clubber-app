import { Pressable, Text, type LayoutChangeEvent } from 'react-native'
import { SpotifyLogoIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  label: string
  // "+N" e "adicionar" são contorno; os interesses são preenchidos.
  outline?: boolean
  // Selo passivo do Spotify (ver CLAUDE.md): só desenha o que o servidor diz.
  confirmed?: boolean
  accessibilityLabel?: string
  onPress?: () => void
  onLayout?: (e: LayoutChangeEvent) => void
}

// Chip compacto de interesse no header do perfil. Pílula (toca e age) de uma
// linha só — quem decide quantos cabem é a fileira.
export function ProfileInterestChip({
  label,
  outline,
  confirmed,
  accessibilityLabel,
  onPress,
  onLayout,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onLayout={onLayout}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
        outline ? 'border border-line-strong' : 'bg-surface-elevated'
      }`}
    >
      <Text
        numberOfLines={1}
        className={`text-[11px] font-semibold ${
          outline ? 'text-content-muted' : 'text-content-secondary'
        }`}
      >
        {label}
      </Text>
      {confirmed && (
        <SpotifyLogoIcon size={11} color={colors.brandTextStrong} />
      )}
    </Pressable>
  )
}
