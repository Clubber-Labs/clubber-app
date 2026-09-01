// Recorte circular na lateral — o picote do ingresso. `y` é o centro dos dois
// furos em coordenadas do card; `radius` é o raio deles.
export type OutlineNotch = { y: number; radius: number }

type Params = {
  width: number
  height: number
  // Raio dos cantos JÁ resolvido pelo chamador. Não derivamos de `inset` aqui
  // porque os dois consumidores discordam de propósito: a aresta do card
  // encolhe o raio junto com o recuo (pra casar com o clip do rounded-xl), e a
  // moldura de destaque mantém o raio cheio — foi ajustada no olho.
  radius: number
  // Recuo do traçado em relação à borda. O stroke do SVG é centrado no
  // caminho: correr na borda exata deixaria metade fora do viewport.
  inset: number
  // Sem recorte o caminho é um retângulo arredondado comum — é o caso do tile
  // do perfil e do card de spot, que não são ingressos.
  notch?: OutlineNotch | null
}

/**
 * Contorno de um card-ingresso num traçado só: cantos arredondados e os dois
 * recortes do picote como arcos DO PRÓPRIO contorno (varredura 0 = a curva
 * entra pra dentro do card).
 *
 * Com as pontas do arco a ±raio do centro sobre a linha recuada, a curva sai
 * uma semicircunferência exata — o recorte inteiro apenas desliza pra dentro
 * junto com o recuo, que é o que faz traços de recuos diferentes ficarem
 * paralelos ao longo do furo.
 */
export function ticketOutlinePath({
  width,
  height,
  radius,
  inset,
  notch,
}: Params): string {
  const left = inset
  const top = inset
  const right = width - inset
  const bottom = height - inset
  const r = Math.max(0, radius)
  const n = notch?.radius ?? 0

  const rightNotch = notch
    ? [`L ${right} ${notch.y - n}`, `A ${n} ${n} 0 0 0 ${right} ${notch.y + n}`]
    : []
  const leftNotch = notch
    ? [`L ${left} ${notch.y + n}`, `A ${n} ${n} 0 0 0 ${left} ${notch.y - n}`]
    : []

  return [
    `M ${left + r} ${top}`,
    `L ${right - r} ${top}`,
    `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
    ...rightNotch,
    `L ${right} ${bottom - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
    `L ${left + r} ${bottom}`,
    `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
    ...leftNotch,
    `L ${left} ${top + r}`,
    `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
    'Z',
  ].join(' ')
}
