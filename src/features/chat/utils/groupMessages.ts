import { isSameDay } from 'date-fns'
import type { ChatMessage } from '../types'

export type MessageMeta = {
  // Separa um novo dia (renderizado acima da bolha).
  showDateSeparator: boolean
  // Grupo, mensagem de outro, topo de uma sequência → mostra nome do remetente.
  showSenderLabel: boolean
  // Base de uma sequência → mostra a hora.
  showTime: boolean
  // Topo de uma sequência (novo remetente/dia) → mais espaço acima.
  startsRun: boolean
  isMine: boolean
}

// `messages` vem em ordem decrescente (index 0 = mais recente), como o FlatList
// invertido espera: o vizinho mais antigo está em i+1, o mais novo em i-1.
// Sequência = mensagens consecutivas do mesmo remetente no mesmo dia.
export function buildMessageMeta(
  messages: ChatMessage[],
  myId: string,
  isGroup: boolean,
): MessageMeta[] {
  return messages.map((msg, i) => {
    const older = messages[i + 1]
    const newer = messages[i - 1]

    const sameDayOlder =
      !!older && isSameDay(new Date(msg.createdAt), new Date(older.createdAt))
    const sameSenderOlder =
      !!older && older.senderId === msg.senderId && sameDayOlder
    const sameDayNewer =
      !!newer && isSameDay(new Date(msg.createdAt), new Date(newer.createdAt))
    const sameSenderNewer =
      !!newer && newer.senderId === msg.senderId && sameDayNewer

    const isMine = msg.senderId === myId
    const startsRun = !sameSenderOlder
    const endsRun = !sameSenderNewer

    return {
      showDateSeparator: !older || !sameDayOlder,
      showSenderLabel: isGroup && !isMine && startsRun,
      showTime: endsRun,
      startsRun,
      isMine,
    }
  })
}
