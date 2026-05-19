// Banner imperativo, mesmo padrão do confirm.tsx. Mostra uma mensagem fixa no
// topo da tela com slide-in animado. Auto-dismiss em 5s; tap fecha imediato.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Banner } from '../components/Banner'

type ShowBannerFn = (message: string) => void

const BannerContext = createContext<ShowBannerFn | null>(null)

const AUTO_DISMISS_MS = 5000

export function BannerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<string | null>(null)
  // Counter incrementado a cada showBanner pra forçar remount do Banner
  // (e disparar a animação de slide-in mesmo se a mensagem for a mesma).
  const [version, setVersion] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const showBanner = useCallback<ShowBannerFn>(
    message => {
      clearTimer()
      setCurrent(message)
      setVersion(v => v + 1)
      timerRef.current = setTimeout(() => {
        setCurrent(null)
        timerRef.current = null
      }, AUTO_DISMISS_MS)
    },
    [clearTimer],
  )

  function handleDismiss() {
    clearTimer()
    setCurrent(null)
  }

  useEffect(() => clearTimer, [clearTimer])

  return (
    <BannerContext.Provider value={showBanner}>
      {children}
      {current && (
        <Banner key={version} message={current} onDismiss={handleDismiss} />
      )}
    </BannerContext.Provider>
  )
}

export function useBanner(): ShowBannerFn {
  const fn = useContext(BannerContext)
  if (!fn) {
    throw new Error('useBanner must be used within <BannerProvider>')
  }
  return fn
}
