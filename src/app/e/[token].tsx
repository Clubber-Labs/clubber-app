import { Redirect, useLocalSearchParams } from 'expo-router'

// Espelho do path público do universal link (https://clubber.social/e/<token>).
// O expo-router mapeia o path do link direto pra esta rota; a tela real é a de
// convite, compartilhada com o scheme clubber://invites/<token>.
export default function InviteShortLink() {
  const { token } = useLocalSearchParams<{ token: string }>()
  return <Redirect href={`/invites/${token}`} />
}
