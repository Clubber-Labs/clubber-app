import { useFirstRunPermissions } from '../hooks/useFirstRunPermissions'
import { FirstRunPermissionsScreen } from './FirstRunPermissionsScreen'

// Montado na raiz com a sessão pronta. A tela só existe enquanto o pedido está
// de pé: o useOsPermissions dela assina AppState, e deixá-lo montado a sessão
// inteira relia as duas permissões a cada foreground sem ninguém olhando.
export function FirstRunPermissions() {
  const { visible, askPush, askLocation, dismiss } = useFirstRunPermissions()

  if (!visible) return null

  return (
    <FirstRunPermissionsScreen
      askPush={askPush}
      askLocation={askLocation}
      onDone={dismiss}
    />
  )
}
