// Mesmo domínio do universal link de convite (clubber.social/e/<token>). A
// landing /u/<username> ainda precisa existir no institucional — ver PR.
const PROFILE_BASE_URL = 'https://clubber.social/u'

export function profileShareUrl(username: string): string {
  return `${PROFILE_BASE_URL}/${encodeURIComponent(username)}`
}
