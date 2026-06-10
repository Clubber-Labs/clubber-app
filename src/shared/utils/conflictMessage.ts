// Mapeia respostas 409 (Conflict) do backend pra mensagem PT-BR amigável.
// O backend deve retornar a mensagem com o nome do campo que violou unique
// constraint (phone / email / username) — aqui só traduzimos pra UX.
import { getApiError, isConflictError } from '@/shared/lib/apiError'

const FIELD_MESSAGES: { keyword: string; message: string }[] = [
  {
    keyword: 'phone',
    message: 'Este telefone já está cadastrado em outra conta.',
  },
  {
    keyword: 'telefone',
    message: 'Este telefone já está cadastrado em outra conta.',
  },
  {
    keyword: 'email',
    message: 'Este e-mail já está cadastrado em outra conta.',
  },
  {
    keyword: 'e-mail',
    message: 'Este e-mail já está cadastrado em outra conta.',
  },
  { keyword: 'username', message: 'Este nome de usuário já está em uso.' },
  { keyword: 'usuário', message: 'Este nome de usuário já está em uso.' },
]

export function getConflictMessage(error: unknown): string | null {
  if (!isConflictError(error)) return null
  const { message } = getApiError(error)
  const lower = message.toLowerCase()
  const match = FIELD_MESSAGES.find(({ keyword }) => lower.includes(keyword))
  return match?.message ?? 'Este dado já está em uso em outra conta.'
}
