import { Alert } from 'react-native'
import { Button } from '@/shared/components/Button'
import type { FollowStatus } from '@/shared/types'

type Props = {
  status: FollowStatus
  loading?: boolean
  onFollow: () => void
  onUnfollow: () => void
}

export function FollowButton({ status, loading, onFollow, onUnfollow }: Props) {
  function handlePress() {
    if (status === 'ACCEPTED') {
      Alert.alert('Deixar de seguir', 'Tem certeza que deseja deixar de seguir?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Deixar de seguir', style: 'destructive', onPress: onUnfollow },
      ])
      return
    }
    if (status === 'PENDING') {
      Alert.alert('Cancelar solicitação', 'Deseja cancelar o pedido de seguir?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Cancelar pedido', style: 'destructive', onPress: onUnfollow },
      ])
      return
    }
    onFollow()
  }

  const label =
    status === 'ACCEPTED' ? 'Seguindo' : status === 'PENDING' ? 'Solicitado' : 'Seguir'
  const variant = status === null ? 'primary' : 'secondary'

  return (
    <Button
      label={label}
      onPress={handlePress}
      loading={loading}
      variant={variant}
    />
  )
}
