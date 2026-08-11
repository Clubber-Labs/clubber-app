import { Pressable, Text, ActivityIndicator } from 'react-native'
import type { Icon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Variant = 'primary' | 'secondary' | 'destructive' | 'neutral'

// 'lg' = pílula-herói do onboarding/auth: mais alta (18px de padding vertical
// vs 12 do 'md') e texto maior — mesma paleta das variants. Override inline de
// propósito: classes de tamanho inéditas já quebraram em Release por cache do
// NativeWind.
type Size = 'md' | 'lg'

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: Variant
  size?: Size
  // Ícone opcional à esquerda do label (oculto enquanto carrega).
  icon?: Icon
}

const containerStyles: Record<Variant, string> = {
  // Primário neutro (identidade A): branco cheio com texto escuro — o pop vem
  // do contraste, não de cor de marca. Sem gradiente em botão, nunca.
  primary: 'bg-content',
  secondary: 'border border-line-strong',
  // Vermelho igual ao botão destrutivo do ConfirmDialog.
  destructive: 'bg-danger-strong',
  // Cinza cheio (surface-elevated) — secundário sólido, sem puxar pro violeta.
  neutral: 'bg-surface-elevated',
}

const textStyles: Record<Variant, string> = {
  primary: 'text-background',
  secondary: 'text-content-secondary',
  destructive: 'text-content',
  neutral: 'text-content',
}

const iconColors: Record<Variant, string> = {
  primary: colors.background,
  secondary: colors.contentSecondary,
  destructive: colors.content,
  neutral: colors.content,
}

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  size = 'md',
  icon: IconComponent,
}: Props) {
  const base =
    'rounded-full py-3 px-6 items-center justify-center flex-row gap-2'
  const lg = size === 'lg'

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`${base} ${containerStyles[variant]} ${disabled && !loading ? 'opacity-40' : ''}`}
      style={lg ? { paddingVertical: 18 } : undefined}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? colors.background
              : variant === 'secondary'
                ? colors.lineStrong
                : colors.content
          }
        />
      ) : (
        IconComponent && <IconComponent size={18} color={iconColors[variant]} />
      )}
      <Text
        className={`font-semibold text-base ${textStyles[variant]}`}
        style={lg ? { fontSize: 17, fontWeight: '700' } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  )
}
