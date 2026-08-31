import { create } from 'zustand'

type PostLikesState = {
  // postId → curtido pelo viewer NESTA sessão.
  liked: Record<string, boolean>
  setLiked: (postId: string, value: boolean) => void
}

/**
 * Memória da curtida do viewer em posts, fora do cache do TanStack.
 *
 * Existe por uma falha do contrato: o GET de posts não devolve `userLiked` (ao
 * contrário de FeedEvent e EventComment). Guardar isso só no cache não
 * funciona — todo refetch (pull-to-refresh, paginação, o próprio invalidate da
 * mutation) apaga o estado, e aí o toque seguinte chama `like` de novo em vez
 * de `unlike`: o coração esvazia e a contagem sobe duas vezes.
 *
 * É um remendo com prazo: quando o backend passar `userLiked`, este store sai e
 * o PostItem volta a ler o campo direto.
 */
export const usePostLikesStore = create<PostLikesState>(set => ({
  liked: {},
  setLiked: (postId, value) =>
    set(state => ({ liked: { ...state.liked, [postId]: value } })),
}))

/**
 * Curtida do viewer num post: o que ele fez nesta sessão vence o que veio da
 * API. Mora aqui junto do store pra a gambiarra inteira caber num arquivo só —
 * quando o backend mandar `userLiked`, apaga-se este módulo e o PostItem passa
 * a ler `post.userLiked` direto.
 */
export function usePostLiked(postId: string, fromApi?: boolean): boolean {
  const override = usePostLikesStore(state => state.liked[postId])
  return override ?? fromApi ?? false
}
