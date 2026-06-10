// Substitui Alert.alert (banido). Ver CLAUDE.md → "Confirmações destrutivas".
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfirmDialog, type ConfirmOptions } from '../components/ConfirmDialog'

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

type Pending = {
  options: ConfirmOptions
  resolve: (value: boolean) => void
} | null

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending>(null)
  // Ref espelha o pending pra resolver o anterior fora do updater de
  // setState (que precisa ser puro — ver StrictMode/render replays).
  const pendingRef = useRef<Pending>(null)

  const confirm = useCallback<ConfirmFn>(options => {
    return new Promise(resolve => {
      // Supersede: resolve a confirmação anterior como cancelada antes de
      // substituí-la pra não deixar o caller travado em await infinito
      // (ex: double tap, ações concorrentes).
      pendingRef.current?.resolve(false)
      const next: Pending = { options, resolve }
      pendingRef.current = next
      setPending(next)
    })
  }, [])

  function handleCancel() {
    pendingRef.current?.resolve(false)
    pendingRef.current = null
    setPending(null)
  }

  function handleConfirm() {
    pendingRef.current?.resolve(true)
    pendingRef.current = null
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        visible={!!pending}
        options={pending?.options ?? { title: '' }}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext)
  if (!fn) {
    throw new Error('useConfirm must be used within <ConfirmProvider>')
  }
  return fn
}
