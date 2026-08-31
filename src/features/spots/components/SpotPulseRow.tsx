import { useState } from 'react'
import { View, Text } from 'react-native'
import { Trans, useTranslation } from 'react-i18next'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { Spot } from '../types'

type Props = {
  spot: Spot
  live: boolean
}

const AVATAR_SIZE = 36
const OVERLAP = -12
// Caixa real de cada círculo: sem largura explícita, o Yoga SOMA o border-2
// do wrapper ao avatar — 36 vira 40. Medir com 36 superestimava o fit e o
// último rosto podia vazar da linha (flex-row não quebra nem clipa).
const AVATAR_BOX = AVATAR_SIZE + 4
// Passo horizontal de cada círculo além do primeiro (avatar ou disco "+N").
const AVATAR_STEP = AVATAR_BOX + OVERLAP
// Antes de as medições chegarem: o mínimo histórico, sem risco de estourar.
const FALLBACK_AVATARS = 3
// O gap-2.5 entre a pilha e a frase — sai do espaço disponível pros círculos.
const ROW_GAP = 10

// Quantos círculos cabem na largura dada sem quebrar.
function fitCount(width: number): number {
  if (width < AVATAR_BOX) return 1
  return 1 + Math.floor((width - AVATAR_BOX) / AVATAR_STEP)
}

/**
 * Pulso social: quem já está no rolê, em fotos e em uma frase. É a primeira
 * linha do corpo porque num rolê a pergunta é "quem vai estar lá", não "o que
 * é" — o título vem depois.
 *
 * UMA linha, sempre: a frase é estática (sem nomes — nome dinâmico tornava a
 * largura imprevisível e empurrava texto pra segunda linha) e mede o que mede;
 * os círculos ocupam o que sobrar, com o disco "+N" na última vaga. Quem se
 * adapta é a quantidade de avatares, nunca a linha. O backend manda a prévia
 * já limitada — ver SPOT_MEMBER_PREVIEW no feed.service.
 */
export function SpotPulseRow({ spot, live }: Props) {
  const { t } = useTranslation()
  const [rowWidth, setRowWidth] = useState<number | null>(null)
  const [phraseWidth, setPhraseWidth] = useState<number | null>(null)
  const members = spot.members?.length ? spot.members : [spot.creator]
  const bold = <Text className="font-bold text-content" />

  // Só o criador: não há pulso pra mostrar, e a linha vira a assinatura dele.
  if (spot.memberCount <= 1) {
    return (
      <ProfileLink
        userId={spot.creator.id}
        username={spot.creator.username}
        className="flex-row items-center gap-2.5"
      >
        <UserAvatar
          name={spot.creator.name}
          avatarUrl={spot.creator.avatarUrl}
          size={AVATAR_SIZE}
        />
        <Text className="flex-1 text-[13px] text-content-muted">
          <Trans
            i18nKey="spots.feedCard.pulseSolo"
            values={{ username: spot.creator.username }}
            components={{ b: bold }}
          />
        </Text>
      </ProfileLink>
    )
  }

  const avatarSpace =
    rowWidth !== null && phraseWidth !== null
      ? rowWidth - phraseWidth - ROW_GAP
      : null
  const fit = avatarSpace === null ? FALLBACK_AVATARS : fitCount(avatarSpace)
  let visible = members.slice(0, fit)
  let overflow = spot.memberCount - visible.length
  if (overflow > 0 && visible.length === fit) {
    // O disco "+N" ocupa um círculo: abre a vaga dele (sem zerar os rostos).
    visible = visible.slice(0, Math.max(1, fit - 1))
    overflow = spot.memberCount - visible.length
  }

  return (
    <View
      className="flex-row items-center gap-2.5"
      onLayout={e => {
        const next = Math.floor(e.nativeEvent.layout.width)
        setRowWidth(prev => (prev === next ? prev : next))
      }}
    >
      <View className="flex-row">
        {visible.map((member, i) => (
          <View
            key={member.id}
            className="rounded-full border-2 border-surface"
            style={{ marginLeft: i === 0 ? 0 : OVERLAP }}
          >
            <ProfileLink userId={member.id} username={member.username}>
              <UserAvatar
                name={member.name}
                avatarUrl={member.avatarUrl}
                size={AVATAR_SIZE}
              />
            </ProfileLink>
          </View>
        ))}
        {overflow > 0 && (
          <View
            className="items-center justify-center rounded-full border-2 border-surface bg-surface-elevated"
            // AVATAR_BOX, não AVATAR_SIZE: com largura explícita a borda entra
            // no box (border-box) — 36 deixaria o disco 4px menor que os rostos.
            style={{
              marginLeft: OVERLAP,
              width: AVATAR_BOX,
              height: AVATAR_BOX,
            }}
          >
            <Text className="text-[11px] font-bold text-content-secondary">
              {`+${overflow}`}
            </Text>
          </View>
        )}
      </View>
      <Text
        className="text-[13px] text-content-muted"
        numberOfLines={1}
        // A frase não encolhe nem quebra: ela é a medida fixa da conta acima.
        style={{ flexShrink: 0 }}
        onLayout={e => {
          const next = Math.ceil(e.nativeEvent.layout.width)
          setPhraseWidth(prev => (prev === next ? prev : next))
        }}
      >
        {t(live ? 'spots.feedCard.pulseLive' : 'spots.feedCard.pulseGroup')}
      </Text>
    </View>
  )
}
