# EAS Update (OTA) — operação e rollback

Atualizações over-the-air entregam **código JS** aos apps já instalados, sem
passar pela App Store / Play Store. Configurado em `app.config.js` (`updates` +
`runtimeVersion`) e `eas.json` (`channel` por perfil de build).

---

## O que vai por OTA e o que não vai

| Vai (está no bundle JS) | Não vai (é nativo) |
|---|---|
| Tudo em `src/` — telas, hooks, services, lógica | Dependência nativa nova |
| `src/shared/i18n/locales/*.json` | Opção de config plugin: Info.plist, entitlements, textos de permissão do SO |
| Estilos NativeWind, imagens importadas por JS | Ícone, splash **nativa**, bundle id, upgrade de SDK |

**Regra prática:** precisou rodar `prebuild`? Precisa de binário novo. Não
precisou? Vai por OTA.

Você não precisa acertar essa decisão no olho — o `runtimeVersion` acerta por
você (abaixo).

---

## runtimeVersion: por que fingerprint

`runtimeVersion` é o que casa um bundle JS com os binários que conseguem rodá-lo.
A política aqui é `fingerprint`: um hash do projeto nativo (config, plugins,
deps nativas).

Mexeu em algo nativo → o hash muda → os binários antigos **deixam de receber**
esse canal, em vez de baixarem um bundle que chama um módulo nativo que eles não
têm e crasharem no boot.

O efeito prático que confunde na primeira vez: depois de uma mudança nativa,
`eas update` avisa que **nenhum build compatível existe** — a update foi
publicada, mas não alcança ninguém até sair um build novo com aquele
fingerprint. Isso é o sistema funcionando, não um erro.

---

## Canais

| Canal | Perfil de build | Quem recebe |
|---|---|---|
| `development` | `development` | Dev client local |
| `preview` | `preview` | Builds internos (`distribution: internal`) |
| `production` | `production` | **Todos os usuários** — App Store / TestFlight |

Um canal aponta pra uma branch de updates de mesmo nome. Publicar é mover a
branch; o canal segue junto.

---

## Publicar

```bash
pnpm update:preview       # canal interno, sem confirmação
pnpm update:production    # canal público, com confirmação na mão
```

Os dois passam por `scripts/publish-update.mjs`, que **recusa** publicar se:

1. **A árvore de trabalho está suja.** O bundle sai da sua working tree, não do
   repositório: publicar sujo entrega código que não existe em commit nenhum e
   que ninguém consegue reproduzir nem reverter.
2. **(Só `production`)** Você não está na `main`, ou seu HEAD diverge de
   `origin/main`. Update de produção não passa por review da Apple — o PR é a
   única revisão que existe nesse caminho.
3. **`typecheck` ou `lint` falham.**
4. **(Só `production`)** Você não digitou `production` pra confirmar. Sem TTY,
   ele recusa por desenho: nada automatizado deve alcançar a base inteira
   sozinho.

Antes de publicar ele imprime a **âncora de rollback** — o group id que está no
canal naquele momento, com o comando pronto pra voltar. Vale copiar.

A mensagem do update é sempre `<sha> <assunto do commit>`, então
`pnpm update:list` liga cada update publicada ao commit que a gerou.

---

## Rollback

Quem já baixou a update ruim só sai dela recebendo **outra** — não existe
"desfazer" retroativo. Por isso o rollback é sempre *publicar de volta*.

### 1. Descobrir o que está no ar

```bash
pnpm update:list                      # últimas 10 do canal production
```

No app, **Sobre** mostra `canal · id-curto` do bundle em execução — é o que
pedir pra quem reportou o problema.

### 2. Voltar para a update anterior (caminho normal)

```bash
pnpm exec eas update:republish --group <group-id-bom>
```

Republica um bundle conhecido como bom no topo do canal. É o caminho preferido:
você escolhe exatamente para onde volta, e o estado final fica explícito na
lista.

### 3. Voltar para o bundle do binário (quando nenhuma update serve)

```bash
pnpm update:rollback
```

Manda os aparelhos de volta ao bundle que veio no build da loja. Use quando o
problema estiver em todas as updates recentes, ou quando não houver update
anterior boa.

### 4. Quando o rollback não resolve

Se o app **não abre** (crash no boot antes do JS rodar), a OTA não te salva: o
`fallbackToCacheTimeout: 0` faz o app abrir com o bundle que já tem e só buscar
o novo depois — ou seja, ele precisa conseguir abrir pra se curar.

O `expo-updates` tem proteção automática: um crash no boot faz ele reverter
sozinho para o bundle anterior. Se nem isso pegar, o caminho é build novo pela
loja.

### Em qualquer caso

Rollback é contenção, não correção. Depois de estancar: abra o fix como PR
normal, mergeie e publique pela `main`. Nunca "conserte" direto na produção — o
portão da árvore limpa existe exatamente pra impedir isso.

---

## Quando o app aplica a atualização

`fallbackToCacheTimeout: 0` + `checkAutomatically: ON_LOAD`:

1. Usuário abre o app → roda o bundle que já tem, **sem esperar rede**
2. Em background, verifica e baixa se houver update compatível
3. Próximo **cold start** → já abre com o código novo

Ou seja: a update chega uma abertura depois. Quem deixa o app dias em background
demora mais. Foi escolha deliberada — bloquear o launch pra aplicar na hora
atrasaria a splash de quem está em rede ruim.

---

## Duas armadilhas do pnpm + Expo (já resolvidas)

Ficam registradas porque o sintoma não aponta para a causa, e qualquer uma
volta se o código for mexido.

**1. `Cannot find module 'babel-preset-expo'` ao publicar.** O `eas update`
chama o CLI do Expo pelo caminho real dentro de `node_modules/.pnpm`, pulando o
shim que o pnpm gera em `node_modules/.bin/expo` — e é o shim que exporta o
`NODE_PATH` apontando para o store isolado. Sem ele, o Babel do Metro não acha o
preset, que no layout do pnpm mora sob o diretório do `expo`, não na raiz. O
`publish-update.mjs` reproduz esse `NODE_PATH` e o passa para o processo filho.

Não caia na armadilha do diagnóstico: com o cache de transform do Metro quente,
o Babel nem chega a rodar e tudo parece funcionar. Só reproduz com `--clear`.

**2. `platforms` precisa estar declarado no config.** O `eas update` exporta com
`--platform=all`, e sem `platforms` o Expo assume `['ios','android','web']`.
Este projeto não tem `react-native-web`, então o export quebra. O
`app.config.js` declara `['ios','android']`.

**3. O `.env.local` precisa estar carregado ANTES do export.** O `app.config.js`
lê `API_URL` e os tokens de Mapbox/Stripe/Google de `process.env` e os publica em
`extra`, de onde o app os consome em runtime. No export do EAS o config é
avaliado antes de o Expo CLI carregar o `.env.local`: os valores saem
`undefined` e **somem do manifesto**. O export não falha — quem descobre é o
aparelho que baixar, e o sintoma é a tela "Sem conexão" (axios sem baseURL),
mapa vazio e pagamentos quebrados. O `publish-update.mjs` carrega o
`.env.local` e recusa publicar se faltar qualquer variável que vira `extra`.

---

## A ordem importa: publique DEPOIS de buildar

A política de seleção do `expo-updates` só aceita update **mais nova** que o
bundle em execução, comparando o `createdAt` da update com o `commitTime` do
bundle embutido. Publicar antes de gerar o binário produz uma update que o
aparelho encontra, avalia e **descarta** — o diagnóstico aparece como
`updateRejectedBySelectionPolicy`.

No fluxo normal isso não morde (build → loja → updates depois). Ao testar
localmente é fácil inverter: se a update não entra, compare o `createdAt` dela
com o `commitTime` em `Clubber.app/EXUpdates.bundle/app.manifest`.

---

## Testar OTA num build local

Um build feito por `expo run:ios` **não passa pelo EAS Build**, que é quem
carimba o canal no nativo. Sem canal, o app não recebe update nenhum — publicar
não dá erro, simplesmente não chega.

Para testar no aparelho, o canal entra por variável de ambiente:

```bash
env UPDATES_CHANNEL=preview pnpm exec expo prebuild --platform ios
env UPDATES_CHANNEL=preview pnpm exec expo run:ios --device "iPhone Neto" --configuration Release
```

**A mesma variável tem que estar na publicação:**

```bash
env UPDATES_CHANNEL=preview pnpm update:preview
```

Porque `UPDATES_CHANNEL` altera o `app.config.js` resolvido, e o fingerprint
hasheia o config — com e sem a variável são runtime versions diferentes. Publicar
de um lado e rodar do outro não acusa erro em lugar nenhum: a update fica no
servidor e o aparelho nunca a vê. O script avisa quando a variável está setada.

Nada disso afeta builds do EAS: sem a variável o bloco `requestHeaders` nem
existe no config, e o EAS carimba o canal do perfil normalmente.

Ao publicar de um build local, `eas update` avisa que **nenhum build compatível
foi encontrado** — esperado, porque o EAS não conhece binários compilados na sua
máquina. A update é publicada mesmo assim e o aparelho a recebe: o servidor casa
pela runtime version que o app manda, não por builds registrados.

---

## Primeira vez

`updates` e `runtimeVersion` são configuração **nativa**. Depois de adicioná-los
é preciso **um build novo** — o binário atual no TestFlight não sabe checar
updates. Desse build em diante, JS vai por OTA.
