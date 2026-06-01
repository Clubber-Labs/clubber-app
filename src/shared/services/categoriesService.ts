import { api } from '@/shared/lib/api'
import type { CategoriesResponse } from '@/shared/types'

// Único locale com dicionário hoje. Enviado via Accept-Language; o backend
// resolve idioma base e cai no fallback pt-BR para qualquer outro.
export const CATEGORIES_LOCALE = 'pt-BR'

export const categoriesService = {
  // Rota pública (acessível antes do login). A instância Axios só anexa o
  // Authorization quando há token, então funciona no cadastro/onboarding.
  list: (locale = CATEGORIES_LOCALE): Promise<CategoriesResponse> =>
    api
      .get('/categories', { headers: { 'Accept-Language': locale } })
      .then(r => r.data),
}
