// Junta nome + sobrenome colapsando espaços extras. Dados podem vir com espaço
// sobrando (ex: "Neto " + "Bonato"), e o template literal geraria "Neto  Bonato"
// — o trim() das pontas não resolve o do meio.
export function formatFullName(name: string, lastname: string): string {
  return `${name} ${lastname}`.replace(/\s+/g, ' ').trim()
}
