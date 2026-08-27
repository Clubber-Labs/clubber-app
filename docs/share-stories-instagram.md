# Compartilhar evento nos Stories do Instagram

Plano de implementação (2026-08-25). Objetivo: o botão de
compartilhar do evento ganha a opção "Stories do Instagram", que abre o
composer de story do IG com uma arte do evento já montada — flyer + marca +
data + URL do convite — igual Spotify faz com música. Cada story postado é um
outdoor com o link do convite.

## Como a integração funciona (e o que ela não faz)

O Instagram expõe uma porta nativa app-a-app, sem web no meio:

- **iOS**: o app coloca os assets no `UIPasteboard` e abre o scheme
  `instagram-stories://share?source_application=<FACEBOOK_APP_ID>`.
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
- **App ID da Meta**: é o MESMO app que o login social do Facebook já usa —
  o valor do `FACEBOOK_APP_ID` do backend. Não registrar app novo. Entra como
  env `FACEBOOK_APP_ID` no `.env.local`/EAS (via `extra`), com o mesmo nome do
  backend de propósito; só o ID, nunca o app secret.

## Fases

| Fase | Entrega | Estimativa | Estado |
|---|---|---|---|
| 0 | Registro do app na Meta (Neto) + env | 30 min | pendente |
| 1 | `instagramStories.ts` + deps (`react-native-share`, `expo-clipboard`) + config nativa + prebuild/build dev | 0,5 dia | feito (falta prebuild/build) |
| 2 | `StoryArtTemplate` + captura view-shot (o grosso: fazer bonito) | 0,5 dia | feito (design "Colagem", 27/08) |
| 3 | `ShareOptionsSheet` + `useShareToStories` + clipboard/banner + i18n (pt/en/es) | 0,5 dia | feito |
| 4 | Teste em aparelho com IG real (simulador não tem IG!) iOS + Android | 0,5 dia | pendente |

### Pegadinhas verificadas (2026-08-27)

- **Não há portão de aprovação da Meta neste fluxo.** Ele não chama API
  nenhuma: é handoff de SO (URL scheme no iOS, Intent no Android). Sem
  chamada, não há permissão a pedir, App Review a passar nem Advanced Access.
  A [doc oficial](https://developers.facebook.com/docs/instagram-platform/sharing-to-stories)
  lista um requisito só: "you must provide a Facebook AppID". O que se lê por
  aí sobre App Review de Instagram é da **Content Publishing API** (publicar
  via servidor), outro mecanismo. Diferença estrutural pro caso Spotify, que
  travou numa cota de API autenticada.
- **iOS: clipboard e arte disputam o MESMO pasteboard.** O handoff do iOS é
  `UIPasteboard.setItems` + `openURL`, e o Instagram só lê no launch. Copiar o
  link logo após o share apaga a arte antes de ela ser lida — o composer abre
  vazio. Por isso o clipboard/banner só roda no Android; no iOS a URL impressa
  na arte é o único caminho.
  - Ideia a testar na Fase 4: acrescentar `public.utf8-plain-text` ao MESMO
    item do pasteboard que leva os `com.instagram.sharedSticker.*`. Um item
    com várias representações serviria a arte pro IG e a URL pro sticker de
    Link. Exige patch na lib ou módulo nativo próprio — não fazer sem
    confirmar em aparelho que o IG ignora a chave extra.
- **`clubber.social/e/<token>` está no ar** (verificado com token real: 200, a
  landing traz título e flyer do evento em `og:`; `apple-app-site-association`
  e `assetlinks.json` também servem 200). Token inexistente responde 404, que é
  o correto — não confundir com rota ausente. A URL impressa na arte, que no
  iOS é o único caminho, leva a uma página real.
- **`react-native-share` 12.3.1 tem `codegenConfig`** (TurboModule): compatível
  com a New Architecture, que este projeto já usa (`newArchEnabled=true`).
- **A plataforma Android no painel da Meta só entra depois da publicação na
  Play.** O painel valida o nome do pacote contra a listagem PÚBLICA da loja
  marcada, e `com.netobonato.clubber` ainda responde 404 lá (o `eas.json`
  publica no track interno, que não tem página pública) — "Ocorreu um problema
  ao verificar o nome do pacote" é isso, não erro de digitação. Só o iOS está
  registrado (bundle `com.netobonato.clubber`), e basta: o `source_application`
  é uma string no Intent, e o hash de chave daquela tela serve ao Login com
  Facebook, que este app não usa.

### A arte: design "Colagem" (spec de 27/08)

Flyer levemente torto (+2°) preso por fitas adesivas, sticker do wordmark no
canto inferior dele, o "b" da marca sangrando do canto superior direito, e o
bloco de texto embaixo. Três coisas que a implementação precisa preservar:

- **O conteúdo é ancorado embaixo**, não em cima: a pílula da URL termina
  sempre em y=1650. O bloco de texto cresce pra cima quando o título ocupa duas
  linhas, e é isso que reduz o espaço do flyer — não o contrário.
- **O flyer é medido, não posicionado**: cabe numa caixa de 920×min(933, espaço
  restante), em contain da proporção real. Retrato encosta no topo (y=300);
  mais baixo que a caixa, centraliza na faixa.
- **As fitas não herdam a rotação do flyer.** É o desencontro entre os ângulos
  que faz a colagem parecer colagem — alinhar os dois mata o efeito.

Quantas linhas o título ocupa só o layout sabe, e disso depende a geometria
inteira. Por isso a arte é montada primeiro no caso de uma linha e a captura
espera duas respostas: `onTextLayout` do título e `onLoad` do flyer.

### Decisões tomadas na implementação

- **Canvas de 1080 com `u()`** ([storyCanvas.ts](../src/features/events/lib/storyCanvas.ts)):
  a medida da view sai de `1080/PixelRatio.get()`, não de um dp fixo. O
  view-shot do Android captura o bitmap no tamanho FÍSICO da view e só depois
  redimensiona — em dp fixo a arte sairia borrada em densidade baixa. Assim o
  bitmap nasce com 1080px reais em qualquer aparelho.
- **Captura em JPG**, não PNG: o caminho Android da lib manda o asset com mime
  `image/jpeg` fixo. No iOS não muda nada (a lib reconverte pra PNG antes de
  pôr no pasteboard).
- **`<queries>` do Instagram** ([plugins/withInstagramStories.js](../plugins/withInstagramStories.js)):
  com targetSdk 30+ o PackageManager esconde o IG, e tanto a detecção quanto o
  Intent falham mesmo com o app instalado. O `<provider>`/FileProvider vem do
  manifesto da própria lib, então o plugin cuida só da visibilidade.
- **Espera do fim da folha antes de agir** (`SHEET_EXIT_MS`): apresentar o
  share do sistema enquanto o modal desliza pra fora estoura
  "presentation is in progress" no iOS.
- **`allowFontScaling={false}`** em todo texto da arte — a peça não é UI, e a
  escala de fonte do sistema a deformaria.

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
