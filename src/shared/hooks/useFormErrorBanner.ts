import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { FieldErrors } from 'react-hook-form'
import { useBanner } from '@/shared/lib/banner'
import { translateValidationMessage } from '@/shared/lib/validationKeys'
import type { KeyboardAwareForm } from './useKeyboardAwareForm'

/**
 * Erros do RHF em { campo: mensagem }, achatando um nível de aninhamento
 * (`consents.marketing` vira `consents`, que é o nome registrado pro foco).
 */
function findMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null
  const { message } = error as { message?: unknown }
  if (typeof message === 'string') return message
  for (const nested of Object.values(error)) {
    const found = findMessage(nested)
    if (found) return found
  }
  return null
}

export function messagesFromErrors(
  errors: FieldErrors,
): Record<string, string> {
  const messages: Record<string, string> = {}
  for (const [field, error] of Object.entries(errors)) {
    const message = findMessage(error)
    if (message) messages[field] = translateValidationMessage(message)
  }
  return messages
}

/**
 * Feedback de validação sem texto sob o input: a mensagem vai pro banner, a
 * borda do campo acende (cada form já faz isso) e a tela rola até ele.
 *
 * Dispare só em SUBMIT ou avanço de etapa — nunca no blur de cada campo, que
 * é quando o RHF revalida (mode 'onTouched'): seria um banner por campo tocado.
 *
 * A mensagem é sempre a do campo que ganhou o foco, e não a primeira do objeto
 * de erros: a ordem do RHF é de registro, não visual, então as duas divergem em
 * formulário com campo condicional — o banner falaria de um campo e a tela
 * pularia pra outro.
 */
export function useFormErrorBanner(form: KeyboardAwareForm) {
  const { t } = useTranslation()
  const showBanner = useBanner()

  return useCallback(
    async (messages: Record<string, string>) => {
      const focused = await form.focusFirstOf(Object.keys(messages))
      const message =
        (focused ? messages[focused] : null) ??
        Object.values(messages)[0] ??
        t('shared.form.checkFields')
      showBanner(message)
    },
    [form, showBanner, t],
  )
}
