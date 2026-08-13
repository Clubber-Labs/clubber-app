import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { KeyboardAwareForm } from '../hooks/useKeyboardAwareForm'

const FormFocusContext = createContext<KeyboardAwareForm | null>(null)

// Ponte para os formulários cuja ScrollView pertence à tela (fluxos de auth): a
// tela cria o useKeyboardAwareForm e publica aqui, e os campos — inclusive os
// que vivem em componentes de step — se registram sem prop drilling.
export function FormFocusProvider({
  value,
  children,
}: {
  value: KeyboardAwareForm
  children: ReactNode
}) {
  return (
    <FormFocusContext.Provider value={value}>
      {children}
    </FormFocusContext.Provider>
  )
}

export function useFormFocus(): KeyboardAwareForm {
  const form = useContext(FormFocusContext)
  if (!form)
    throw new Error('useFormFocus precisa de um <FormFocusProvider> acima.')
  return form
}
