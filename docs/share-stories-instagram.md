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

1. A arte imprime **só o domínio** (`clubber.social`), numa pílula que também
   marca onde encaixar o sticker de Link — o sticker do IG mostra o mesmo
   texto e a cobre direitinho. A URL completa do convite saiu da arte (28/08):
   com token de 22 chars era intocável de digitar, e larga demais pro sticker
   cobrir. O link do evento existe no story **via sticker**.
2. **Android:** no share o app copia o link pro clipboard, e a folha de
   instrução manda colar no sticker de Link do próprio IG.
3. **iOS:** a cópia acontece quando o usuário **volta ao app** com o composer
   aberto — o Instagram limpa o pasteboard ao consumir a arte (provado em
   aparelho), então copiar antes não sobrevive e copiar em background é no-op.
   A folha ensina a dança: abrir → voltar (link copiado) → colar. Ver
   [a seção do pasteboard](#ios-o-pasteboard-o-instagram-e-a-cópia-na-volta).

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
5. **Pílula com o domínio** `clubber.social` — borda `line-strong`, texto
   `content`, Sora/sistema, legível em screenshot. A URL completa saiu (28/08):
   longa demais pra digitar e pro sticker de Link cobrir; a pílula é o alvo
   onde o sticker se encaixa.

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
│   │   ├── StoryLinkInstructions.tsx → folha do sticker de Link (iOS + Android)
│   │   └── StoryArtTemplate.tsx    → a view 1080×1920 (capturada, nunca visível)
├── hooks/
│   └── useShareToStories.ts        → orquestra: link → captura → instrução → IG
└── lib/
    └── instagramStories.ts         → única fronteira com o nativo
                                      (react-native-share nas duas plataformas)
```

- `useShareToStories`: `mutateAsync` do link → `captureRef` do template →
  folha de instrução → handoff via `Share.shareSingle` nas duas plataformas +
  cópia do link (Android: na hora; iOS: na volta ao app).
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
| 4 | Link colável no iOS: diagnóstico do pasteboard + cópia na volta | 0,5 dia | feito (28/08: IG limpa o pasteboard no launch; módulo nativo descartado — a própria lib faz o handoff) |
| 5 | `StoryLinkInstructions`: a instrução vira etapa do fluxo nas duas plataformas | 0,25 dia | feito |
| 6 | Teste em aparelho com IG real (simulador não tem IG!) iOS + Android | 0,5 dia | em andamento (diagnóstico iOS fechado; falta smoke da cópia-na-volta + Android) |

### Pegadinhas verificadas (2026-08-27)

- **Não há portão de aprovação da Meta neste fluxo.** Ele não chama API
  nenhuma: é handoff de SO (URL scheme no iOS, Intent no Android). Sem
  chamada, não há permissão a pedir, App Review a passar nem Advanced Access.
  A [doc oficial](https://developers.facebook.com/docs/instagram-platform/sharing-to-stories)
  lista um requisito só: "you must provide a Facebook AppID". O que se lê por
  aí sobre App Review de Instagram é da **Content Publishing API** (publicar
  via servidor), outro mecanismo. Diferença estrutural pro caso Spotify, que
  travou numa cota de API autenticada.
- **iOS: clipboard e arte disputam o MESMO pasteboard — e o Instagram o
  limpa.** O handoff é `UIPasteboard.setItems` + `openURL` (o IG lê no launch):
  copiar antes apaga a arte, escrever junto morre na limpeza do consumo,
  reescrever em background é no-op. A única cópia que existe E sobrevive é em
  primeiro plano DEPOIS do consumo — na volta ao app. Diagnóstico completo na
  seção do pasteboard, abaixo.
- **`clubber.social/e/<token>` está no ar** (verificado com token real: 200, a
  landing traz título e flyer do evento em `og:`; `apple-app-site-association`
  e `assetlinks.json` também servem 200). Token inexistente responde 404, que é
  o correto — não confundir com rota ausente. É a página que o sticker de
  Link do story abre.
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

## iOS: o pasteboard, o Instagram e a cópia na volta

O problema é o da pegadinha acima: no iOS o handoff **é** o pasteboard, então a
arte e a URL do convite disputariam o mesmo canal. O diagnóstico de 28/08
(abaixo) fechou a questão: **não há como entregar a URL junto do handoff** — o
Instagram limpa o pasteboard ao consumir a arte. O handoff leva SÓ a arte (via
`react-native-share`, como no Android); na volta do usuário ao app, uma folha
de cópia segura a instrução na tela até ele copiar o link e voltar ao
Instagram pra colar.

Existiu um módulo nativo local (`modules/story-share`, Expo Modules API) criado
pra tentar entregar a URL pelo pasteboard — reescrita em background, depois
segundo item. Com as duas vias provadas mortas, ele tinha virado uma réplica do
que a lib já faz pelo handoff da arte, e foi **descartado**: o fluxo é 100% JS,
alcançável por OTA.

### O veredito (28/08): o Instagram LIMPA o pasteboard ao consumir

Medição em aparelho (iPhone 16 Pro Max, iOS 26.6), com a URL escrita como
segundo item do pasteboard na MESMA escrita da arte, em primeiro plano, e um
leitor instrumentado dentro do próprio app lendo o pasteboard na volta do
share:

```
compartilhar:
  +0.0s handoff escrito: urlFirst=false itens=2 changeCount=253
  +0.1s open success=true
voltar ao app e ler:
  changeCount=254 itens=0 hasStrings=false hasURLs=false
```

Exatamente UMA mutação (253 → 254) aconteceu entre o open e a leitura — feita
por outro processo, já que a reescrita em background não existia mais — e ela
deixou o pasteboard VAZIO. No controle (a mesma escrita pelo botão de debug,
SEM abrir o Instagram), os dois itens persistiram e a URL de teste colava
normalmente. Escrita funciona sem IG; morre com IG: **é o Instagram que
limpa.**

Consequências:

- **C1 (URL como item 1) morre** — foi o testado acima; "Colar" não aparece no
  sticker de Link porque não sobra item nenhum.
- **C2 (inverter a ordem) morre junto** — não existe ordem que salve um
  pasteboard zerado.
- **Entregar a URL junto do handoff está ENCERRADO.** O que sobra — e virou o
  mecanismo do produto — é a cópia em primeiro plano DEPOIS do consumo: quando
  o usuário volta ao app com o composer aberto, a folha de cópia entra na tela
  e fica até ele copiar e voltar pro Instagram. O link do evento no story é o
  sticker; a arte imprime só o domínio.

### O que mais o aparelho provou (antes do veredito)

A primeira implementação seguia o modelo da Strava — reescrita **atrasada** da
URL, em background, segurada por `beginBackgroundTask`. O log que a matou:

```
+0.0s  bgTask concedida=true restante=ilimitado
+0.0s  handoff escrito: itens=2 changeCount=214
+0.1s  open success=true bgRestante=ilimitado
+8.5s  asyncAfter disparou: bgRestante=22s changeCount=4
+8.5s  reescrita: changeCount 4 -> 4 itens=0
+10.6s asyncAfter disparou: bgRestante=20s changeCount=4
+10.6s reescrita: changeCount 4 -> 4 itens=0
```

- **A background task funcionava.** O `asyncAfter` dispara, a janela conta
  certo (22s → 20s → …). O processo estava vivo — suspensão descartada.
- **Em background o app não enxerga o pasteboard real.** O `changeCount` cai de
  214 pra 4 e `numberOfItems` lê **0** logo após um `setItems`: é um proxy
  vazio.
- **Escrita em background é descartada em silêncio** (`changeCount 4 -> 4`).
  Sem erro, sem exceção, sem flag que destrave.
- **A reescrita atrasada é impossível por construção, não por calibração.** A
  janela em que uma escrita nossa vale (primeiro plano) é exatamente a janela
  em que o Instagram ainda não leu a arte — os dois requisitos se excluem. Por
  isso delay de 4s e de 8s deram idênticos.

O código da reescrita saiu na hora (custava 24s de background por share,
escrevendo num pasteboard fantasma); o módulo inteiro caiu depois, quando o
veredito matou também a via do segundo item. Esta seção é o registro que
impede re-tentativa.

### Uma inferência que quase enganou (metodologia)

"Colar no Notes ~12s após o share não ofereceu nada, logo o Instagram limpa o
pasteboard" — a conclusão até se confirmou depois, mas aquele teste **não
media nada**: a arte nunca seria colável no Notes (UTI proprietária
`com.instagram.sharedSticker.backgroundImage`, invisível pro menu de colar), a
URL não estava lá porque as reescritas em background eram no-ops — e, descoberto
na sequência, o Notes com conta Exchange como padrão recusa "anexo" e aborta a
colagem inteira. Quem fechou a questão de verdade foi o leitor instrumentado,
lendo o pasteboard de dentro do app, em primeiro plano, sem app de terceiro no
meio.

### Portas fechadas — não reabrir nenhuma

| Porta | Por quê está fechada |
|---|---|
| `sharedSticker.linkURL`/`linkText` | Restritos a parceiros da Meta; ignorados em aparelho |
| URL junto do handoff (2º item, C1) | O Instagram limpa o pasteboard INTEIRO ao consumir (leitor: 253 → 254, itens=0) |
| Ordem invertida (URL como item 0, C2) | Mesma limpeza — nenhuma ordem salva um pasteboard zerado |
| URL nas MESMAS chaves do item da arte | O IG tolera as chaves extras (a arte chega), mas o colar não oferece a URL |
| Reescrita atrasada em background | Escrita em background é no-op silencioso (proxy vazio, changeCount congelado) — impossível por construção |
| Timer em JS (`setTimeout` + `expo-clipboard`) pós-share | Suspenso junto com o app |
| Cópia comum ANTES do share | O `setItems` da arte a apaga |

A única via de link tocável automático que resta é **parceria com a Meta** (o
`contentURL` dos parceiros) — decisão de negócio, não de engenharia.

### O mecanismo final

Duas peças, cada uma no seu momento:

1. **Handoff ([`instagramStories.ts`](../src/features/events/lib/instagramStories.ts))**
   — `Share.shareSingle({ social: InstagramStories, backgroundImage, appId,
   linkUrl })`, nas DUAS plataformas. No iOS a lib faz exatamente a forma
   comprovada: converte a arte pra PNG, `setItems` como item único (expiração
   de 5 min) e abre `instagram-stories://share?source_application=<appId>`.
2. **Folha de cópia na volta (JS, [`useShareToStories`](../src/features/events/hooks/useShareToStories.ts)
   + `StoryLinkReturnSheet`)** — com o handoff feito, o hook arma um listener
   one-shot de AppState: quando o usuário volta ao app (o composer fica aberto
   no Instagram), entra a folha "Copie o link do convite", que FICA na tela
   até ele copiar ou dispensar — banner sozinho evaporava antes de o usuário
   se orientar (visto em aparelho). O botão copia em primeiro plano — onde
   escrita funciona — e uma cópia silenciosa de segurança já acontece na
   volta. A limpeza do IG foi no launch; a cópia da volta não disputa com
   nada.

A folha de instrução (`StoryLinkInstructions`) ensina a dança ANTES do share,
em dois passos numerados no iOS; no Android ela só ensina o sticker, porque lá
o link já vai copiado (Intent não disputa clipboard).

### O teste decisivo (T1–T3) — executado em 28/08, diagnóstico fechado

- **T1 = não.** Composer abriu com a arte; o campo do sticker de Link não
  ofereceu a URL escrita como 2º item. Log da escrita:
  `+0.0s handoff escrito: itens=2 changeCount=223` / `+0.1s open success=true`.
- **T2 = não.** Leitor instrumentado na volta do share: `changeCount=254
  itens=0 hasStrings=false hasURLs=false` (a escrita tinha sido `itens=2
  changeCount=253`). Exatamente uma mutação, feita por outro processo, deixou
  o pasteboard vazio.
- **T3 = sim.** A mesma escrita, sem abrir o Instagram, persistiu — a URL de
  teste `https://clubber.social/e/TESTE` colava normalmente.

T1 não + T2 não + T3 sim = **o Instagram limpa o pasteboard ao consumir**. A
instrumentação usada — sonda `note()`/`drainDiagnostics` drenada pro Metro,
leitor de pasteboard e botão de escrita isolada em Configurações (`__DEV__`),
flag `STORY_URL_FIRST` de ordem dos itens — foi removida com o fechamento;
este registro é a memória dela.

Armadilhas pra quem for reinstrumentar isso um dia:

- Instrumentação nativa exige `expo run:ios` a cada mudança em Swift — OTA/EAS
  Update não alcança nativo. Logs nativos vão pro unified log (Console.app,
  subsystem `com.netobonato.clubber`), que NÃO aparece no terminal do Metro; o
  diagnóstico drenava as linhas pro JS por isso.
- **Colar no Notes NÃO serve de teste** com conta Exchange como padrão: o item
  de dados (a arte) vira "anexo", o Exchange recusa ("Anexo indisponível") e a
  colagem inteira morre sem dizer nada sobre o texto.
- `Int(UIApplication.shared.backgroundTimeRemaining)` TRAPA em primeiro plano:
  a propriedade vale `Double.greatestFiniteMagnitude`, e `Int(...)` fora da
  faixa é `fatalError`, não exceção. Já custou uma build inteira.
- O app **não lê o pasteboard** nesse fluxo: leitura dispara o aviso de colar
  do iOS (e em background volta nil). O leitor do diagnóstico era dev-only e
  já saiu.
- Nunca logar a URL de convite real — ela carrega o token.

O `LSApplicationQueriesSchemes` com `instagram-stories` que o `canOpenURL` já
exigia continua sendo o mesmo, e serve aos dois caminhos. No **Android nada
muda**: o Intent não disputa clipboard, e lá quem copia é o JS.

### UX: o passo do sticker não é descobrível (nas DUAS plataformas)

O mecanismo difere por plataforma, o problema de descobribilidade não: é o
sticker de Link que torna o convite tocável, e o caminho até ele ninguém
adivinha. Por isso a instrução é **etapa do fluxo**, não detalhe do ramo iOS —
uma folha ([StoryLinkInstructions](../src/features/events/components/share/StoryLinkInstructions.tsx))
com botão de confirmação, entre a captura da arte e o handoff:

```
tocar em Stories → link + arte → folha de instrução → [confirmar] → Instagram
                                                    → [dispensar] → nada
iOS, após o handoff: voltar ao app → folha de cópia (fica até copiar) → IG → colar
```

Decisões de que a implementação depende:

- **Confirmação, não toast com timeout.** Logo depois disto o app vai pro
  background; um aviso que se dispensa sozinho some junto com a chance de ter
  sido lido. Dispensar a folha **não** compartilha.
- **A folha do iOS ensina a dança em dois passos numerados** (voltar pra
  copiar; voltar pro IG pra colar), e a folha da volta (`StoryLinkReturnSheet`)
  segura o passo seguinte na tela até o usuário agir — instrução no momento
  exato em que ela é acionável, sem evaporar.
- **No Android a copy não repete "link copiado"**: o 13+ já mostra o balão
  nativo de "conteúdo copiado", e o banner pós-share de lá saiu por dizer o
  mesmo que a folha, depois da hora e por trás do Instagram.

A folha aparece **sempre**. Suprimir depois de N usos depende de saber quantos
chegam a colar o link — evolução condicionada a telemetria, e a telemetria não
existe (ver abaixo).

### Telemetria: ainda não há onde plugar

`useTrackEventShare` é contador de compartilhamentos POR EVENTO (analytics do
autor), não pipeline de produto: aceita `(eventId, occurredAt)` e nada mais.
Misturar "instrução exibida" ali corromperia a contagem. Os pontos de
instrumentação estão marcados com `// TODO analytics` no
[useShareToStories](../src/features/events/hooks/useShareToStories.ts): exibição,
confirmação, dispensa e resultado do share. O último tem uma pendência própria —
`shareToInstagramStories` achata o motivo da falha (IG ausente, asset recusado,
cancelamento) num booleano; distinguir exige inspecionar o erro da lib.

### Fallback

Se o handoff não acontece (IG desinstalado no meio da sessão, binário sem o
módulo, imagem ilegível), o app copia a URL e abre o **share do sistema** com a
mesma arte. Esse caminho não passa pelo pasteboard, então a cópia sobrevive.

## Validação de aceite

1. Evento com flyer retrato → Stories → composer abre com a arte inteira,
   legível, pílula do domínio visível fora das zonas de UI do IG.
2. Evento sem capa → gradiente de fallback digno.
3. iOS: folha → confirmar → composer com a arte → voltar ao app → folha de
   cópia → "Copiar link" → voltar ao IG → sticker de Link → Colar → o sticker
   abre a landing/app (universal link). Android: igual, sem o passo da volta
   (o link já vai copiado).
4. IG não instalado → opção não aparece; share atual intacto.
5. Cancelar no composer → volta ao app sem erro visível.
6. Android: mesmo roteiro (Intent + FileProvider).

7. Dispensar a folha de instrução (botão de voltar, arrastar pra baixo, tocar
   fora) **não** abre o Instagram nem compartilha nada.

### O smoke que fecha a Fase 6 (aparelho físico)

O diagnóstico do link está fechado (seção do módulo); o que resta validar:

1. **A dança completa do iOS** (passo 3 do aceite) — **validada em 28/08**: o
   composer sobreviveu à troca de app, o IG não limpou o pasteboard na
   retomada, e o sticker de Link entrou no story com a URL colada. Falta
   repetir com a folha de cópia persistente e a pílula só-domínio desta
   revisão.
2. **Cold start**: matar o IG no app switcher e repetir — a escrita da arte
   acontece antes do launch; warm e cold devem se comportar igual.
3. **Sem Instagram** (simulador serve): o share do sistema abre com a arte e a
   URL na área de transferência.
4. Ignorar o sticker de Link e postar assim mesmo → o story sai normal.
5. **Android**: roteiro do aceite (Intent + FileProvider + colar no sticker).

## Riscos e decisões em aberto

- **Link tocável automático**: fora do alcance sem parceria Meta (mitigado
  pelo sticker de Link colado pelo usuário). Reavaliar se o programa abrir.
- **A retomada do Instagram foi validada em aparelho (28/08)**: o composer
  sobreviveu à ida-e-volta e o Colar inseriu a URL — sticker no story. Fica o
  risco residual de uma versão futura do IG limpar o pasteboard também na
  retomada; se acontecer, o caminho volta a ser imprimir a URL do evento na
  arte, e aí o TODO abaixo vira obrigatório.
- **TODO (backend, issue a abrir): token curto digitável.** Hoje o token é
  `randomBytes(16).toString('base64url')` — 22 caracteres case-sensitive
  (`event-invite-links.service.ts`). Requisito: 5–6 caracteres,
  case-insensitive, sem ambiguidade 0/O/1/l, mantendo o formato longo válido.
  Deixou de ser urgente com o sticker funcionando e a arte mostrando só o
  domínio; volta ao topo se a URL do evento voltar a ser impressa. Mudança de
  backend — não fazer junto com o mobile.
- **Quem pode compartilhar**: hoje o share é só do autor (endpoint de link é
  author-only). Se o produto quiser "qualquer um compartilha evento público
  nos stories", precisa do backend liberar o invite-link pra não-autor — 
  decisão de produto separada, mesmo espírito da que liberou o convite
  interno em público.
- A resolução do view-shot em aparelhos low-end (Android) pode pedir
  `pixelRatio` explícito na captura pra arte sair 1080p de verdade.
