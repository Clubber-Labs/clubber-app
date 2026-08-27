# Integração Spotify — gosto musical real no Clubber

> **⚠️ STATUS (2026-08-27): DORMENTE.** F1/F2 foram implementadas, mas a feature
> está desligada em produção/TestFlight (env `SPOTIFY_CLIENT_ID` ausente do EAS)
> e **nenhum sistema do app deve ser construído assumindo dados do Spotify**.
> Motivos, verificados empiricamente contra a API:
>
> 1. O Spotify **removeu o campo `genres`** (e `popularity`/`followers`) dos
>    objetos de artista para apps novos — o import de gêneros retorna vazio.
>    O de-para e o pipeline funcionam; falta insumo. Plano B: tabela
>    artista→gênero (curadoria + MusicBrainz/Last.fm).
> 2. **Extended Quota Mode** (necessário pro público vincular) exige, desde
>    mai/2025, empresa registrada + serviço lançado + **250k MAU comprovados** +
>    prova de receita. O Development Mode limita o vínculo a uma allowlist de
>    ~5 contas de teste.
>
> O texto abaixo é o plano original — vale como referência de arquitetura, mas
> as premissas sobre `genres` e sobre o pedido de quota estão superadas.

Plano de implementação (2026-08-25, não iniciado). Objetivo: o usuário vincula
a conta do Spotify e o Clubber passa a conhecer o gosto musical REAL dele —
top artistas e gêneros — alimentando personalização, matching de eventos por
line-up e identidade cultural no perfil. Conta **vinculada**, nunca login: a
feature é aditiva e o app funciona 100% sem ela.

## O que a API dá (e o que não dá mais)

Com OAuth do usuário (escopos `user-top-read`, `user-follow-read`,
`playlist-read-private`):

- `/me/top/artists` — top artistas em 3 janelas (4 semanas / 6 meses /
  ~1 ano), cada artista com seus `genres`.
- `/me/following?type=artist` — artistas seguidos.
- `/me/playlists` — playlists do usuário.

⚠️ **Morto para apps novos desde nov/2024**: recommendations, audio-features,
related-artists. Nenhuma fase deste plano depende deles — qualquer ideia
futura baseada nesses endpoints nasce morta.

## Valor por fase (ordem de implementação)

| Fase | Entrega | Valor |
|---|---|---|
| 1 | Vincular conta + import de gêneros → interesses | Onboarding sem formulário: gosto real alimenta feed/mapa que já filtram por gênero |
| 2 | Top artistas no perfil público | Identidade cultural, sinal social |
| 3 | Line-up no evento + push por artista | **A killer feature**: "Brisotti, que você ouve direto, toca sexta a 2km" |
| 4 | Playlist vinculada ao evento | Preview da vibe no detalhe |

## Fluxo OAuth (Authorization Code + PKCE, tokens no backend)

Conta vinculada com sync server-side — o backend guarda os tokens e sincroniza
sem o app aberto:

```
app (expo-auth-session, PKCE)
  1. GET accounts.spotify.com/authorize  (code_challenge, escopos)
  2. usuário autoriza no browser → redirect clubber://spotify-callback?code=...
  3. app → POST /spotify/link { code, codeVerifier }        (API Clubber)
  4. backend troca code por access+refresh token (client_secret SÓ no backend)
  5. backend persiste refresh token CRIPTOGRAFADO + dispara primeiro sync
  6. app recebe { linked: true, genres: [...] } e oferece aplicar aos interesses
```

- `expo-auth-session` já faz PKCE; o redirect usa o scheme `clubber://` que já
  existe. Nada de client secret no app — ele vive só no env do backend.
- Desvincular: `DELETE /spotify/link` revoga e apaga tokens + dados derivados.

## Backend — módulo novo `spotify-link`

Seguindo o padrão dos módulos existentes (`social-auth` é a referência de
provider OAuth):

```
src/modules/spotify-link/
├── spotify-link.routes.ts      → POST /spotify/link · DELETE /spotify/link
│                                 GET /spotify/profile (estado + top artists)
├── spotify-link.service.ts     → troca de code, refresh, orquestra sync
├── spotify-link.repository.ts  → tokens (criptografados) + snapshot de gosto
├── spotify-link.sync.ts        → job periódico: top artists/genres → snapshot
└── spotify-link.mapping.ts     → de-para gêneros Spotify → taxonomia Clubber
```

- **Prisma**: `SpotifyLink` (userId único, refreshToken cifrado, scopes,
  syncedAt) e `SpotifyTasteSnapshot` (artistas top com id/nome/imagem/genres,
  janela). Snapshot separado do link: desvincular apaga os dois; o sync
  substitui o snapshot inteiro (dado derivado, não histórico).
- **Sync**: no vínculo + diário (job no padrão dos reconcilers existentes).
  Rate limit do Spotify é generoso pra esse volume; backoff padrão.
- **Mapeamento de gêneros** (`spotify-link.mapping.ts`): o Spotify devolve
  gêneros livres ("brazilian bass", "deep house", "funk carioca"); a taxonomia
  do Clubber é fechada (`Genre`/`appliesTo`). O de-para é uma tabela manual
  honesta (substring/keywords + curadoria) — começar pelos ~50 gêneros mais
  comuns do público-alvo e logar os não-mapeados pra iterar. É trabalho de
  produto tanto quanto de código.
- **LGPD**: gosto musical é dado pessoal — registrar propósito no módulo de
  consent existente, incluir no export de dados e no delete em cascata da
  conta.

## Mobile

```
features/spotify/
├── components/
│   ├── SpotifyLinkCard.tsx     → card em Configurações (e oferta pós-onboarding)
│   └── TopArtistsRow.tsx       → fase 2: fileira de artistas no perfil
├── hooks/
│   ├── useSpotifyLink.ts       → estado do vínculo + link/unlink
│   └── useSpotifyAuth.ts       → expo-auth-session (PKCE) encapsulado
└── services/
    └── spotifyLinkService.ts   → chamadas à NOSSA API (nunca ao Spotify direto)
```

- O app **nunca fala com a API do Spotify** fora do passo de autorização — todo
  dado vem da API do Clubber (fonte única, cache do TanStack Query normal).
- Pós-vínculo, a oferta de aplicar os gêneros importados aos interesses é
  opt-in explícito (mostra o que vai mudar), nunca sobrescrita silenciosa.
- Desvincular em Configurações, com `useConfirm` (padrão destrutivo da casa).

## Fase 3 — line-up e notificação (a grande)

Exige superfície de produto nova, além da integração:

- **Evento ganha line-up**: artistas vinculados na criação/edição (busca na
  API pública do Spotify por nome → guarda spotifyArtistId + nome + imagem).
  Campo opcional; eventos sem line-up seguem normais.
- **Matching**: no publish do evento (e no sync do usuário), cruzar
  `spotifyArtistId` do line-up × snapshots de gosto × raio de distância →
  notificação nova (`ARTIST_MATCH`) no fan-out existente, com dedupe por
  evento+usuário.
- Copy da push é o produto: "Fulano, que você ouve direto, toca sexta a 2km".
- Anti-ruído: no máx. 1 push de artista por evento; respeitar as preferências
  de notificação existentes.

## Burocracias externas (fazer CEDO — têm fila)

1. **App no Spotify Developer Dashboard** (do Neto): criar app, redirect URI
   `clubber://spotify-callback`, pegar client id/secret (secret → env do
   backend no Coolify).
2. **Development Mode = 25 usuários** na allowlist. Pra liberar geral:
   **Extended Quota Mode**, com review do Spotify — leva semanas e exige app
   com cara de produto (screenshots, descrição do uso de dados). Pedir assim
   que a fase 1 estiver testável, não no fim.

## Custos e termos

- **Dinheiro: zero.** Web API sem tier pago; developer account e Extended
  Quota gratuitos (liberado por review, não por pagamento). Funciona pra
  usuário de Spotify Free. Infra do sync é desprezível no volume atual.
- **Termos que importam**: os dados do Spotify NÃO podem alimentar targeting
  de anúncios, revenda nem treino de ML — personalização dentro do app é o
  uso permitido. Se o Clubber um dia tiver ads, o dado do Spotify fica fora
  desse circuito por contrato.
- **Atribuição visual**: exibir conteúdo do Spotify (artistas, playlist)
  exige logo/atribuição conforme as design guidelines deles — entra no
  design das fases 2 e 4.

## Riscos e decisões

- **Nem todo usuário tem Spotify** — a feature é aditiva, nunca portão de
  nada. Apple Music (MusicKit) fica como paralelo futuro; o desenho de
  snapshot de gosto é agnóstico de provedor de propósito.
- **De-para de gêneros é curadoria contínua** — começar pequeno, logar
  não-mapeados, iterar. Errar aqui personaliza errado, que é pior que não
  personalizar.
- **Custo por fase**: F1 ~3-4 dias (backend+mobile+de-para inicial) ·
  F2 ~1-2 dias · F3 ~1 semana + decisões de produto · F4 ~1 dia.
- Review do Spotify pode pedir ajustes de copy/consentimento — margem no
  cronograma da fase 1.
