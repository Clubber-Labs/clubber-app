import { Text } from 'react-native'

type Props = {
  message: string | null | undefined
}

// Use só em forms (login, edição, criação) — ações otimistas usam silent
// revert. Ver CLAUDE.md → "Tratamento de erros e feedback ao usuário".
export function FormError({ message }: Props) {
  if (!message) return null
  return <Text className="text-white text-sm text-center">{message}</Text>
}
