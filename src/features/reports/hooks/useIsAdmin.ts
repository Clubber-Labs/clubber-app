import { useMyProfile } from '@/features/users/hooks/useProfile'

// Papel é lido só de /users/me (useMyProfile). /users/:id não expõe `role`.
// Usado pra revelar a área de moderação no drawer e guardar as rotas admin.
export function useIsAdmin() {
  const { data, isLoading } = useMyProfile()
  return { isAdmin: data?.role === 'ADMIN', isLoading }
}
