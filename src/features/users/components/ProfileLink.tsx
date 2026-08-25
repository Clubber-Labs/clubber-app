import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useNavigateToProfile } from '../hooks/useNavigateToProfile'

type Props = {
  userId: string
  username: string
  children: ReactNode
  className?: string
  hitSlop?: number
}

// Identidade de usuário (foto e/ou nome) é sempre um link pro perfil. Pode ser
// aninhado dentro de outro Pressable (card do feed, linha de notificação): o
// responder mais interno vence o toque.
export function ProfileLink({
  userId,
  username,
  children,
  className,
  hitSlop,
}: Props) {
  const { t } = useTranslation()
  const navigateToProfile = useNavigateToProfile()

  return (
    <Pressable
      onPress={() => navigateToProfile(userId)}
      className={className}
      hitSlop={hitSlop}
      accessibilityRole="link"
      accessibilityLabel={t('shared.viewProfile', { username })}
    >
      {children}
    </Pressable>
  )
}
