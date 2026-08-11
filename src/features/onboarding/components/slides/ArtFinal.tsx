import { BrandWordmark } from '@/shared/components/brand'
import { Enter } from '../Enter'
import type { ArtProps } from '../../types'

// Slide 5 — Final: wordmark como herói (sem título competindo), entrando
// com pop — o momento de marca.
export function ArtFinal({ active }: ArtProps) {
  return (
    <Enter active={active} variant="pop">
      <BrandWordmark height={64} />
    </Enter>
  )
}
