// Raiz de uma aba: '(tabs)/<aba>' (ou só '(tabs)'). Telas empilhadas por cima
// têm mais segmentos e não contam.
export function isTabsRoot(segments: readonly string[]): boolean {
  return segments[0] === '(tabs)' && segments.length <= 2
}

// Aba Perfil em foco: a tab bar encolhe pra não engolir a vitrine de eventos,
// e o clearance das telas segue a mesma régua — os dois leem daqui.
export function isProfileTab(segments: readonly string[]): boolean {
  return isTabsRoot(segments) && segments.includes('profile')
}
