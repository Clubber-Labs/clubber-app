# Migração para CNG (Continuous Native Generation)

> Status: **fase 1 fechada** — paridade medida com `--clean`, adotada e validada
> em emulador Android (API 35, imagem 16 KB page size, builds debug e release).
> Conta Apple Developer paga em 2026-08-20 (Team ID inalterado: K238P4B9K4);
> conta Google Play ainda não paga. Última atualização: 2026-08-20.

## Contexto — por que este documento existe

O repo está em **bare workflow híbrido**: as pastas `ios/` e `android/` são
commitadas e recebem edições manuais (storyboard do splash, ícones, assinatura),
enquanto o `app.config.js` descreve *parte* do nativo. São duas fontes de
verdade — e por isso **`npx expo prebuild --clean` é PROIBIDO hoje**: ele
regeneraria o nativo a partir do config e destruiria tudo que só existe na mão.

CNG é o modelo em que `ios/`/`android/` não vão pro git — são artefato
reproduzível a partir do config + plugins (como `node_modules/` a partir do
`package.json`). Todas as dependências nativas deste app têm config plugin
maduro, então o perfil do projeto é ideal pra CNG. A dívida acumulou por
atritos reais: conta Apple gratuita (hacks de assinatura/push), handoffs de
design instruindo substituição direta de PNGs nativos, e iteração rápida em
aparelho físico.

## Edições manuais conhecidas no nativo (inventário parcial)

| Item | Estado no config | Observação |
|---|---|---|
| Ícone iOS (`AppIcon.appiconset`) | ✅ `expo.icon` / `ios.icon` | Aplicado nos dois lados em 2026-08-11 |
| Adaptive icon Android (`mipmap-*`, `anydpi-v26`) | ✅ `android.adaptiveIcon` | Idem; safe zone ok (círculo a 62,5%) |
| `DEVELOPMENT_TEAM` no pbxproj | ✅ `ios.appleTeamId` | Cicatriz de prebuild antigo |
| Entitlement de push removível | ✅ plugin `withoutIosPushEntitlement` | Só p/ conta gratuita (`IOS_DISABLE_PUSH=1`) |
| **Splash iOS** (storyboard + `SplashScreenLogo.imageset` + colorset `#0b0b0d`) | ✅ plugin `expo-splash-screen` → `assets/splash-logo.png` | **Drift zero, verificado.** Os valores não foram escolhidos: `imageWidth: 200` saiu das constraints do storyboard e `#0B0B0D` do colorset. Artefatos adotados da saída do gerador. O plugin dimensiona pelo tamanho intrínseco (imageset 200/400/600), por isso o storyboard novo não tem constraint de width/height — é equivalente ao antigo |
| **Splash Android** (`drawable-*/splashscreen_logo.png` + `splashscreen_background`) | ✅ adotada e validada em emulador (2026-08-20) | Caminho antigo (`ic_launcher_background.xml` layer-list como `windowBackground`) trocado pelo moderno: `Theme.SplashScreen` do androidx + `windowSplashScreenAnimatedIcon` + `SplashScreenManager.registerOnActivity` no `MainActivity.kt`. Junto: `colorPrimaryDark` e `android:statusBarColor` `#ffffff` → `#0B0B0D`. **Decisão de design validada em emulador:** o Android 12+ recorta o ícone da splash num círculo — a composição adesivo+wordmark sai mutilada (e o caminho antigo nem chegava à tela: o sistema mostrava a splash default dele por cima). Por isso o config tem override `android.image` apontando pro `icon.png` (balão redondo, sobrevive à máscara); a composição completa fica no 2º estágio (SplashOverlay JS). iOS segue com a arte inteira |
| `PrivacyInfo.xcprivacy` | ✅ `ios.privacyManifests` (2026-08-20) | O prebuild **não** gera o arquivo sem a chave (confirmado com `--clean`: apagava arquivo + referência no pbxproj). Config espelha o conteúdo que era commitado à mão; arquivo commitado re-adotado da saída do gerador (idêntico + `NSPrivacyTrackingDomains` vazio) |
| **`<lang>.lproj/InfoPlist.strings`** (pt-BR/en/es em `ios/Clubber/Supporting/`) + refs no pbxproj | ✅ `expo.locales` → `assets/native-locales/*.json` | **Drift zero, verificado**: o conteúdo dos `.lproj` e as entradas do pbxproj foram copiados do que o próprio prebuild emitiu numa worktree descartável, UUIDs inclusive. Rodar prebuild de novo não muda nenhuma dessas linhas. Efeito colateral esperado quando o Android entrar: 3 `values-b+<lang>/strings.xml` VAZIOS — o mod de lá consome o mesmo mapa, e as chaves estão sob `"ios"` porque no Android não há o que traduzir |
| `NSFaceIDUsageDescription` | ✅ `expo-secure-store` → `faceIDPermission` | Era o texto genérico em inglês do plugin |
| ~193 linhas modificadas no `project.pbxproj` | ❓ | Diff da fase 1 revela (provavelmente assinatura + refs) |

### Medição definitiva com `--clean` em worktree descartável (2026-08-20)

`npx expo prebuild --clean --no-install` numa worktree, rodado com o mesmo
`.env.local` da árvore principal (**incluindo** `IOS_DISABLE_PUSH=1`, porque o
`ios/` commitado foi gerado com o hack ativo — `Clubber.entitlements` vazio).

**Gaps reais encontrados e fechados:**

- `PrivacyInfo.xcprivacy` não era gerado (a prévia sem `--clean` não pegava
  porque o arquivo sobrevivia no lugar) → `ios.privacyManifests` no config.
- Todo o pacote Android de splash/tema/ícone previsto na prévia → saída do
  plugin adotada por cópia da worktree (a árvore principal nunca rodou
  `--clean`): `MainActivity.kt`, `styles.xml`, `colors.xml`, `strings.xml`,
  `mipmap-anydpi-v26/*.xml`, `drawable-*/splashscreen_logo.png` (200dp→canvas
  288dp), launcher `mipmap-*` PNG→**WebP**, `values-b+{en,es,pt+BR}/strings.xml`
  vazios (efeito previsto do `expo.locales`).

**Classificado como ruído (não requer ação; verificado item a item):**

- pbxproj: tudo que o `pod install` escreve (`baseConfigurationReference`,
  `libPods`, fases `[CP]`/`[Expo] Configure project`, `REACT_NATIVE_PATH`,
  `USE_HERMES`, flags Swift), aspas (`PRODUCT_NAME = "Clubber"`), ordenação de
  build settings e UUIDs dos `InfoPlist.strings` (o `--clean` sorteia UUIDs
  novos a cada rodada — a idempotência "drift zero" da prévia só valia sem
  `--clean`);
- `Podfile.lock` + `Clubber.xcworkspace` ausentes no gerado (artefatos do
  `pod install`, pulado com `--no-install`);
- PNG 1024 do `AppIcon` re-encodado (comparado pixel a pixel: 0 bytes de
  diferença);
- `ic_launcher_background.xml` e `debug.keystore` regeneram byte-idênticos
  (são do template — a prévia listava o primeiro como edição manual, não é).

**Resultado do aceite:** `diff -rq` do nativo gerado contra o adotado —
Android **zero diff**; iOS só os itens de ruído acima. Warning residual do
prebuild: `android: userInterfaceStyle` precisa de `expo-system-ui` (hoje o
Android já ignora essa chave no nativo commitado — sem mudança de
comportamento; avaliar na fase 3).

## Fase 1 — paridade de config (SEM depender da conta Apple paga)

Custo estimado: ~1h–1h30. Nada muda no dia a dia; o nativo continua commitado.
A validação é por diff de arquivos gerados, sem build de aparelho.

1. ✅ Criar **worktree descartável** e rodar `npx expo prebuild --clean` nela.
2. ✅ Diffar o nativo gerado contra o commitado — o diff é a lista real de gaps.
3. ✅ Fechar cada gap no `app.config.js` (começando pelo plugin do
   `expo-splash-screen`) e iterar prebuild→diff até o resíduo ser só ruído
   (hashes, timestamps, ordenação). Ver medição de 2026-08-20 acima.
4. ✅ Commitar a paridade. O config vira espelho fiel do nativo. O gate visual
   passou em emulador API 35 (debug e release): splash com balão íntegro, status
   bar escura, launcher icon WebP ok. A validação ainda rendeu dois achados
   fora do escopo CNG, corrigidos em commits próprios: `react-native-vision-camera`
   3.9.2 não compila com RN 0.81 e não tinha nenhum uso (removida), e o peer
   `expo-asset` ausente fazia a Sora falhar silenciosamente em build de release
   (wordmark caía na fonte de sistema — instalado).

## Fase 2 — o "flip" (QUANDO a conta Apple/Google estiver paga)

Fazer junto da preparação de loja (Apple US$ 99/ano, Google US$ 25 único):

1. ✅ Remover `ios/` e `android/` do git + adicionar ao `.gitignore`
   (2026-08-20). O `debug.keystore` foi junto: é o do template do prebuild,
   regenera byte-idêntico — verificado na medição da fase 1.
2. ✅ Aposentar o hack `IOS_DISABLE_PUSH` (plugin `withoutIosPushEntitlement`
   removido do config e flag removido do `.env.local`). Push iOS volta a
   entrar no entitlement em qualquer prebuild.
3. ⏳ `eas credentials` — assinatura/provisioning gerenciados pelo EAS + APNs
   key. Mexe na conta Apple; aguardando autorização do owner.
4. ⏳ Primeiro build de loja via **EAS Build** (prebuild roda no servidor — a
   paridade da fase 1 é o que garante que ele sai certo).
5. Pendências do rename ConnectAI→Clubber que dependem das contas:
   re-provisionar push/Firebase (bundle id `com.netobonato.clubber`), Stripe,
   domínio, e OAuth client Android do Google (login Google no Android falha
   com DEVELOPER_ERROR sem ele — verificado em emulador).
6. ✅ Atualizar CLAUDE.md (fluxo de build muda) e apagar a seção de proibição
   do `prebuild --clean` — ele vira o caminho normal.

## Fase 3 — nota sobre `expo.install.exclude` (2026-08-20)

Os quatro pacotes excluídos do check de versão do `expo install`/`expo-doctor`
são **bumps deliberados** acima do que o SDK 54 espera — o JSON não aceita
comentário, então o porquê fica aqui: `@react-native-community/datetimepicker`
9.x e `react-native-worklets` 0.8.1 foram subidos por commits próprios (suporte
a fuso do date-fns / exigência do reanimated 4), e `react-native-svg` +
`@react-navigation/bottom-tabs` acompanham minors estáveis usados pelo chrome
custom. Efeito colateral: num bump de SDK esses quatro NÃO são sinalizados
automaticamente — revisar a lista a cada upgrade de SDK antes de confiar no
doctor.

## Riscos conhecidos

- **Assinatura com conta gratuita** num pbxproj recém-gerado é o maior atrito —
  por isso a fase 1 NÃO faz build de aparelho; o flip só acontece com conta paga.
- Plugin de splash precisa reproduzir o visual atual (logo branco 200pt sobre
  `#0B0B0D`, edge-to-edge) — conferir contra os assets do handoff.
- Enquanto a fase 2 não acontece, **toda edição nativa manual nova deve ser
  espelhada no config** (ou anotada na tabela acima), senão a paridade da
  fase 1 apodrece.
