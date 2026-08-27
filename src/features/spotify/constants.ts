/**
 * Teto de estilos importados de uma vez. Espelha a regra do servidor em
 * POST /spotify/apply-genres — o ranking do feed só considera os primeiros
 * interesses, então despejar tudo empurra pra fora o que a pessoa escolheu.
 */
export const MAX_IMPORTED_GENRES = 5

/**
 * Categoria adicionada quando nenhuma das compatíveis está marcada: um estilo
 * musical só casa com evento de vida noturna, então sem isso o import não
 * mudaria nada. Fixa aqui pra bater com a escolha do servidor no apply-genres
 * — divergir faria o mesmo import produzir perfis diferentes conforme a tela.
 */
export const FALLBACK_GENRE_CATEGORY = 'MUSIC'
