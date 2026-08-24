import { useCallback, useEffect, useState } from 'react'
import {
  decideFirstRunPermissions,
  markFirstRunPermissionsAsked,
} from '../lib/firstRunPermissions'

type Result = {
  visible: boolean
  askPush: boolean
  askLocation: boolean
  dismiss: () => void
}

/**
 * Decide uma vez, na entrada da sessão, se o pedido de permissões do primeiro
 * uso ainda cabe — e nunca mais volta a perguntar neste aparelho.
 */
export function useFirstRunPermissions(): Result {
  const [state, setState] = useState({
    visible: false,
    askPush: false,
    askLocation: false,
  })

  useEffect(() => {
    let cancelled = false

    decideFirstRunPermissions()
      .then(decision => {
        if (cancelled || decision.kind === 'skip') return
        setState({
          visible: true,
          askPush: decision.push,
          askLocation: decision.location,
        })
        return markFirstRunPermissionsAsked()
      })
      .catch(() => {
        // Storage indisponível: o priming das ações sociais e o card do mapa
        // continuam de pé — nada aqui pode segurar a entrada no app.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const dismiss = useCallback(
    () => setState(s => ({ ...s, visible: false })),
    [],
  )

  return { ...state, dismiss }
}
