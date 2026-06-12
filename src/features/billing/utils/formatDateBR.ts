import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDateBR(iso: string) {
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}
