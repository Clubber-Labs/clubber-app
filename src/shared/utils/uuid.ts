// Gerador de UUID v4 puro-JS (sem dependência nativa de crypto). Usa Math.random
// — suficiente pra `clientId`/`Idempotency-Key`, que só precisam ser únicos por
// envio dentro de uma sessão, não criptograficamente seguros. O formato não
// importa pro reconcile (casado por igualdade exata), só a unicidade.
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const rand = (Math.random() * 16) | 0
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8
    return value.toString(16)
  })
}
