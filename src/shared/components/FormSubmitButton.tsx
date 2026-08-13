import {
  useWatch,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import type { Icon } from 'phosphor-react-native'
import { Button } from './Button'
import { areFilled } from '../utils/formValues'

type Props<T extends FieldValues> = {
  control: Control<T>
  /** Campos que precisam ter valor pra ação liberar. */
  required: Path<T>[]
  label: string
  onPress: () => void
  loading?: boolean
  /** Trava adicional da tela (ex: mínimo de categorias). */
  disabled?: boolean
  icon?: Icon
}

// Assina só os campos obrigatórios: a digitação re-renderiza este botão, e não
// o formulário inteiro (que carrega mapa, pickers e listas).
export function FormSubmitButton<T extends FieldValues>({
  control,
  required,
  disabled,
  ...buttonProps
}: Props<T>) {
  const values = useWatch({ control, name: required })

  return <Button {...buttonProps} disabled={disabled || !areFilled(values)} />
}
