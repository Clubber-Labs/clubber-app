// Substitui Alert.alert (banido). Ver CLAUDE.md → "Confirmações destrutivas".
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ConfirmDialog,
  type ConfirmOptions,
} from '../components/ConfirmDialog'

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

type Pending = {
  options: ConfirmOptions
  resolve: (value: boolean) => void
} | null

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending>(null)

  const confirm = useCallback<ConfirmFn>(options => {
    return new Promise(resolve => {
      setPending({ options, resolve })
    })
  }, [])

  function handleCancel() {
    pending?.resolve(false)
    setPending(null)
  }

  function handleConfirm() {
    pending?.resolve(true)
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
