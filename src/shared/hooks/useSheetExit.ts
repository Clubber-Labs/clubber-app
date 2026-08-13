import { useCallback, useState } from 'react'

export function useSheetExit() {
  const [visible, setVisible] = useState(false)
  const [instantExit, setInstantExit] = useState(false)

  const open = useCallback(() => {
    setInstantExit(false)
    setVisible(true)
  }, [])

  const close = useCallback(() => setVisible(false), [])

  const exitTo = useCallback((action: () => void) => {
    setInstantExit(true)
    requestAnimationFrame(() => {
      setVisible(false)
      action()
    })
  }, [])

  return { visible, instantExit, open, close, exitTo }
}
