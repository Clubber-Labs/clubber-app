export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  const mid = d.length <= 10 ? 6 : 7
  return `(${d.slice(0, 2)}) ${d.slice(2, mid)}-${d.slice(mid)}`
}

// Mascara o e-mail preservando 1ª letra e domínio: joao@gmail.com → j***@gmail.com
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  return `${local.slice(0, 1)}***@${domain}`
}
