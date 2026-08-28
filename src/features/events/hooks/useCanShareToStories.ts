import { useEffect, useState } from 'react'
import { canShareToInstagramStories } from '../lib/instagramStories'

// Sem Instagram (ou sem App ID da Meta no build) a opção nem aparece — o botão
// de compartilhar segue indo direto pro share do sistema.
export function useCanShareToStories() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    let alive = true
    canShareToInstagramStories().then(ok => {
      if (alive) setAvailable(ok)
    })
    return () => {
      alive = false
    }
  }, [])

  return available
}
