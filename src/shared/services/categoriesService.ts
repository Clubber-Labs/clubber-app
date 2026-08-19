import { api } from '@/shared/lib/api'
import type { CategoriesResponse } from '@/shared/types'

export const categoriesService = {
  // Rota pública (acessível antes do login). A instância Axios só anexa o
  // Authorization quando há token, então funciona no cadastro/onboarding — e o
  // Accept-Language do interceptor já traz a taxonomia no idioma escolhido.
  list: (): Promise<CategoriesResponse> =>
    api.get('/categories').then(r => r.data),
}
