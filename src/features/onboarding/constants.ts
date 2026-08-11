import { categoryHue } from '@/shared/theme'

// Caixa de arte com dimensão inline (não classe): as posições absolutas dos
// pins são calibradas em px contra ela — e classes de tamanho inéditas
// (w-64/h-56) já renderam caixa colapsada por cache stale do NativeWind em
// build Release.
export const ART_BOX = { width: 384, height: 336 } as const

// Matizes dos campos dos pins: tokens reais das categorias (praticamente os
// mesmos hex dos mockups aprovados) — o onboarding mostra os pins como eles
// são no mapa de verdade.
export const FIELD_MUSIC = categoryHue('MUSIC').pinField
export const FIELD_DRINKS = categoryHue('NIGHTLIFE').pinField
export const FIELD_CAMP = categoryHue('OUTDOORS').pinField
