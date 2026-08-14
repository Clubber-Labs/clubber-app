import { useQuery } from '@tanstack/react-query'
import { usersService } from '../services/usersService'
import { userKeys } from './cacheKeys'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { hasValidUsernameFormat } from '@/shared/utils/username'

export type UsernameAvailability = 'idle' | 'checking' | 'available' | 'taken'

const DEBOUNCE_MS = 450

/**
 * Disponibilidade do username enquanto o usuário digita.
 *
 * É conveniência, não portão: falha de rede e 429 voltam 'idle' — sem indicador
 * e sem travar nada. A verdade continua sendo o 409 do submit, que é o único
 * ponto onde a checagem e a gravação acontecem sob a mesma transação.
 */
export function useUsernameAvailability(
  username: string,
): UsernameAvailability {
  const debounced = useDebounce(username, DEBOUNCE_MS)
  // O input pode ter mudado depois do debounce: enquanto os dois não coincidem,
  // qualquer veredito em mãos é de OUTRO valor e não pode ser exibido.
  const settled = debounced === username
  const validFormat = hasValidUsernameFormat(username)

  const { data, isFetching, isError } = useQuery({
    queryKey: userKeys.usernameAvailability(debounced),
    queryFn: ({ signal }) =>
      usersService.checkUsernameAvailability(debounced, signal),
    // Formato inválido já tem erro do Zod: consultar gastaria request e ainda
    // mostraria dois estados conflitantes no mesmo campo.
    enabled: settled && validFormat,
    // Sem retry: 429 é justamente o sinal de parar, e insistir na rede não muda
    // um desfecho que, por contrato, não bloqueia ninguém.
    retry: false,
  })

  if (!validFormat) return 'idle'
  if (!settled || isFetching) return 'checking'
  if (isError || !data) return 'idle'
  return data.available ? 'available' : 'taken'
}
