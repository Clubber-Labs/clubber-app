import { View, Text, Pressable } from 'react-native'
import {
  CalendarBlankIcon,
  LockIcon,
  PlusIcon,
  type Icon,
} from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Variant = 'own' | 'other' | 'private'

const CONTENT: Record<Variant, { icon: Icon; title: string; message: string }> =
  {
    own: {
      icon: CalendarBlankIcon,
      title: 'Nenhum evento ainda',
      message:
        'Crie seu primeiro rolê e ele aparece aqui pra todo mundo descobrir.',
    },
    other: {
      icon: CalendarBlankIcon,
      title: 'Nenhum evento ainda',
      message: 'Quando essa pessoa organizar algo, aparece por aqui.',
    },
    private: {
      icon: LockIcon,
      title: 'Este perfil é privado',
      message: 'Siga para ver os eventos que essa pessoa organiza.',
    },
  }

type Props = {
  variant: Variant
  // Só usado na variante 'own' — abre o fluxo de criar evento.
  onCreate?: () => void
}

export function ProfileEventsEmpty({ variant, onCreate }: Props) {
  const content = CONTENT[variant]
  return (
    <View className="items-center px-8 pb-8 pt-14">
      <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-surface">
        <content.icon size={26} color={colors.contentSubtle} />
      </View>
      <Text className="text-content text-base font-bold">{content.title}</Text>
      <Text className="text-content-muted mt-1 max-w-[260px] text-center text-sm leading-5">
        {content.message}
      </Text>
      {variant === 'own' && onCreate && (
        <Pressable
          onPress={onCreate}
          accessibilityRole="button"
          className="mt-5 flex-row items-center gap-1.5 rounded-lg bg-brand px-5 py-3"
        >
          <PlusIcon size={18} color={colors.content} />
          <Text className="text-content text-sm font-bold">Criar evento</Text>
        </Pressable>
      )}
    </View>
  )
}
