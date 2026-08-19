import { i18n } from '@/shared/i18n'

export const notificationKeys = {
  // `title`/`body` são renderizados pelo servidor a cada leitura: a MESMA linha
  // do banco muda de idioma conforme o Accept-Language. Por isso a lista é
  // cacheada por idioma — trocar de idioma vira cache miss, não uma invalidação
  // que alguém precisa lembrar de disparar.
  //
  // `lists` é o prefixo: o match parcial do TanStack alcança todos os idiomas de
  // uma vez (cancelar/invalidar). `list()` é a chave exata de um idioma, para
  // ler e escrever no cache — sem argumento, o que está na tela agora.
  lists: ['notifications', 'list'] as const,
  list: (locale: string = i18n.language) =>
    ['notifications', 'list', locale] as const,
  // Só um número: não tem texto para traduzir, então uma chave só.
  unreadCount: ['notifications', 'unread-count'] as const,
}
