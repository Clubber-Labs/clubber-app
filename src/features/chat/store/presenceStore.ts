import { create } from 'zustand'

export type Presence = {
  online: boolean
  // ISO; só preenchido quando offline. Null quando online ou desconhecido.
  lastSeenAt: string | null
}

type PresenceState = {
  // Presença GLOBAL por usuário (sem conversa) — alimentada pelos frames
  // `presence` do socket. A presença inicial não vem do REST (o backend não
  // expõe no detalhe da conversa), então cada usuário fica "desconhecido"
  // (ausente do mapa) até a primeira transição chegar pelo WS.
  //
  // LIMITAÇÃO conhecida: o backend não manda snapshot no (re)connect e só anuncia
  // TRANSIÇÕES. Após uma reconexão (queda de rede / volta do background) o estado
  // aqui pode estar levemente obsoleto (ex.: parceiro saiu durante o gap) até a
  // próxima transição. Aceito como best-effort: a bolinha "online" é cosmética, e
  // não zeramos no reconnect pra não fazê-la piscar a cada troca de app.
  byUser: Record<string, Presence>
  setPresence: (
    userId: string,
    online: boolean,
    lastSeenAt: string | null,
  ) => void
  // Zera tudo. Chamado no logout (endSession) pra a presença de uma conta não
  // vazar pra próxima na mesma sessão de app.
  reset: () => void
}

export const usePresenceStore = create<PresenceState>(set => ({
  byUser: {},
  setPresence: (userId, online, lastSeenAt) =>
    set(state => ({
      byUser: {
        ...state.byUser,
        // online não carrega lastSeenAt; preserva o último conhecido só pra debug.
        [userId]: { online, lastSeenAt: online ? null : lastSeenAt },
      },
    })),
  reset: () => set({ byUser: {} }),
}))
