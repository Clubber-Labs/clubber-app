# Compartilhar evento nos Stories do Instagram

Plano de implementação (2026-08-25, ainda não iniciado). Objetivo: o botão de
compartilhar do evento ganha a opção "Stories do Instagram", que abre o
composer de story do IG com uma arte do evento já montada — flyer + marca +
data + URL do convite — igual Spotify faz com música. Cada story postado é um
outdoor com o link do convite.

## Como a integração funciona (e o que ela não faz)

O Instagram expõe uma porta nativa app-a-app, sem web no meio:

- **iOS**: o app coloca os assets no `UIPasteboard` e abre o scheme
  `instagram-stories://share?source_application=<META_APP_ID>`.
- **Android**: Intent implícito `com.instagram.share.ADD_TO_STORY` com URIs de
  FileProvider.

O IG abre direto no composer com a arte posicionada; o usuário ajusta e posta.
Exige Instagram instalado e um **App ID da Meta** (registro em
developers.facebook.com — burocracia de ~30 min, do Neto).

**Limitação honesta — o link tocável:** o "toque para abrir" dos stories do
Spotify (`contentURL`) é restrito a parceiros da Meta. App comum não ganha o
link clicável automático. Nosso mundo real:

1. A URL `clubber.social/e/<token>` vai **impressa na arte** (legível e curta).
2. No momento do share, o app **copia o link pro clipboard** e avisa
   ("Link copiado — cola no sticker de Link do story"), pra quem posta
   adicionar o sticker de Link do próprio IG em dois toques.

É o padrão dos apps não-parceiros. Se um dia a Meta abrir o programa, o
`contentURL` é um campo a mais na mesma chamada.

## Fluxo de UX

Hoje o `EventShareButton` (header do detalhe, só autor) vai direto pro share
sheet do sistema. Passa a abrir um **SheetModal** (componente já existente)
com duas opções, no padrão de raio da casa (opções = rows retas, sheet =
rounded-2xl):

```
╭──────────────────────────────────╮
│         Compartilhar             │
│  📸 Stories do Instagram         │  ← só se o IG estiver instalado
│  🔗 Outros apps                  │  ← o Share.share() atual
╰──────────────────────────────────╯
```

- Detecção do IG: `Linking.canOpenURL('instagram-stories://share')` (iOS exige
  `LSApplicationQueriesSchemes`; ver Mudanças nativas). Sem IG → sheet nem
  oferece a opção, vai direto pro fluxo atual.
- Ambos os caminhos passam pelo `POST /events/:id/invite-links` já existente —
  o token/URL é o mesmo do fluxo atual, nada muda no backend.
- `onShared`/analytics: o caminho Stories dispara o mesmo tracking do share
  concluído.

## A arte do story (o grosso do trabalho)

Template 1080×1920 renderizado como view invisível no app e capturado com
`react-native-view-shot` (dep 4.0.3 já instalada; padrão de captura fora da
tela já existe em `features/map/components/UserAvatarIconCapture.tsx`).

Composição (de cima pra baixo, sobre fundo `#0b0b0d`):

1. **Flyer do evento** dominando o quadro — proporção real com clamp (mesma
   regra da tela de convite), cantos `rounded-2xl`, levemente afastado das
   bordas pra área de segurança do IG (o composer sobrepõe UI no topo/rodapé:
   ~250px de margem em cima e embaixo).
2. Sem capa → gradiente radial da marca (mesmo fallback das outras telas).
3. **Sticker do wordmark** (asset oficial `sticker-wordmark.png` — mesmo dos
   e-mails/landing) no canto superior do flyer, pequeno, inclinado como o
   sticker é.
4. Bloco de texto sob o flyer: título (Sora bold), data no fuso do evento
   (`formatDayOfMonthAtTime`), `por @autor`.
5. **Pílula com a URL** `clubber.social/e/<token>` — borda `line-strong`,
   texto `content`, monoespaçado não: Sora/sistema mesmo, legível em
   screenshot.

Decisão de composição: mandar a arte como **backgroundImage** (ocupa o story
inteiro, usuário não redimensiona) e não como sticker — flyer é vertical, a
tela é dele. Alternativa sticker-sobre-fundo fica documentada como variação
se o feedback pedir.

## Arquitetura (feature slice)

```
features/events/
├── components/
│   ├── EventShareButton.tsx        → passa a abrir o sheet de opções
│   ├── share/
│   │   ├── ShareOptionsSheet.tsx   → SheetModal com as duas rows
│   │   └── StoryArtTemplate.tsx    → a view 1080×1920 (capturada, nunca visível)
├── hooks/
│   └── useShareToStories.ts        → orquestra: link → captura → IG → clipboard
└── lib/
    └── instagramStories.ts         → wrapper fino do react-native-share
                                      (única fronteira com a lib nativa)
```

- `useShareToStories`: `mutateAsync` do link → `captureRef` do template →
  `Share.shareSingle({ social: InstagramStories, backgroundImage, appId })` →
  `Clipboard.setStringAsync(url)` → banner "Link copiado".
- Erros: silenciosos no padrão do app (IG fechou, usuário cancelou); falha ao
  gerar o link segue o catch atual do share.
- Clipboard: `expo-clipboard` (adicionar — já é do ecossistema Expo).

## Mudanças nativas (exigem build novo, não OTA)

No `app.config.js`:

```js
ios: {
  infoPlist: {
    LSApplicationQueriesSchemes: ['instagram-stories'],
  },
},
```

- `react-native-share`: autolink no CNG, sem config plugin próprio; conferir
  no prebuild se o FileProvider do Android sai correto (a lib documenta o
  merge automático).
- **Meta App ID**: criar app em developers.facebook.com (tipo "None"/consumer,
  não precisa de review pra esse uso — o `source_application` só identifica).
  Entra como env `META_APP_ID` no `.env.local`/EAS (via `extra`), não
  hardcoded.

## Fases

| Fase | Entrega | Estimativa |
|---|---|---|
| 0 | Registro do app na Meta (Neto) + env | 30 min |
| 1 | `instagramStories.ts` + deps (`react-native-share`, `expo-clipboard`) + config nativa + prebuild/build dev | 0,5 dia |
| 2 | `StoryArtTemplate` + captura view-shot (o grosso: fazer bonito) | 0,5 dia |
| 3 | `ShareOptionsSheet` + `useShareToStories` + clipboard/banner + i18n (pt/en/es) | 0,5 dia |
| 4 | Teste em aparelho com IG real (simulador não tem IG!) iOS + Android | 0,5 dia |

Total ~2 dias com folga. **Testes só em aparelho físico** — o simulador não
tem Instagram; o fluxo inteiro depende de device.

## Validação de aceite

1. Evento com flyer retrato → Stories → composer abre com a arte inteira,
   legível, URL visível fora das zonas de UI do IG.
2. Evento sem capa → gradiente de fallback digno.
3. Banner "link copiado" + colar o link no sticker de Link do IG → sticker
   abre a landing/app (universal link).
4. IG não instalado → opção não aparece; share atual intacto.
5. Cancelar no composer → volta ao app sem erro visível.
6. Android: mesmo roteiro (Intent + FileProvider).

## Riscos e decisões em aberto

- **Link tocável**: fora do alcance sem parceria Meta (mitigado pelo
  clipboard + URL na arte). Reavaliar se o programa abrir.
- **Quem pode compartilhar**: hoje o share é só do autor (endpoint de link é
  author-only). Se o produto quiser "qualquer um compartilha evento público
  nos stories", precisa do backend liberar o invite-link pra não-autor — 
  decisão de produto separada, mesmo espírito da que liberou o convite
  interno em público.
- A resolução do view-shot em aparelhos low-end (Android) pode pedir
  `pixelRatio` explícito na captura pra arte sair 1080p de verdade.
