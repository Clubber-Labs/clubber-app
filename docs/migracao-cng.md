# Migração para CNG (Continuous Native Generation)

> Status: **planejado** — fase 1 pendente. Última atualização: 2026-08-19.

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
| **Splash Android** (`drawable-*/splashscreen_logo.png` + `splashscreen_background`) | ⚠️ plugin cobre, saída NÃO adotada | O commitado **funciona**, por um caminho antigo: `ic_launcher_background.xml` é um layer-list (cor + logo centralizado) usado como `windowBackground` do `Theme.App.SplashScreen`. O plugin gera o caminho moderno (`Theme.SplashScreen` do androidx + `windowSplashScreenAnimatedIcon`) e de quebra corrige `colorPrimaryDark` e `android:statusBarColor` de `#ffffff` para `#0B0B0D`. É mudança de comportamento no Android — adotar exige verificar em emulador, então ficou de fora deste PR |
| `PrivacyInfo.xcprivacy` | ❌ (arquivo solto em `ios/`) | Conferir se o gerado pelo Expo cobre; senão `ios.privacyManifests` |
| **`<lang>.lproj/InfoPlist.strings`** (pt-BR/en/es em `ios/Clubber/Supporting/`) + refs no pbxproj | ✅ `expo.locales` → `assets/native-locales/*.json` | **Drift zero, verificado**: o conteúdo dos `.lproj` e as entradas do pbxproj foram copiados do que o próprio prebuild emitiu numa worktree descartável, UUIDs inclusive. Rodar prebuild de novo não muda nenhuma dessas linhas. Efeito colateral esperado quando o Android entrar: 3 `values-b+<lang>/strings.xml` VAZIOS — o mod de lá consome o mesmo mapa, e as chaves estão sob `"ios"` porque no Android não há o que traduzir |
| `NSFaceIDUsageDescription` | ✅ `expo-secure-store` → `faceIDPermission` | Era o texto genérico em inglês do plugin |
| ~193 linhas modificadas no `project.pbxproj` | ❓ | Diff da fase 1 revela (provavelmente assinatura + refs) |

### Prévia da fase 1 medida em worktree descartável (2026-08-19)

Rodando `expo prebuild --no-install` (sem `--clean`) numa worktree, o que resta de
diff **depois** do plugin de splash entrar:

**iOS — praticamente fechado.** Sobra só ruído de aspas no pbxproj
(`PRODUCT_NAME = Clubber` → `"Clubber"`, `TARGETED_DEVICE_FAMILY = 1` → `"1"`) e o
PNG do `AppIcon` re-encodado. Nada de assinatura, nada de Info.plist, nada de
splash, nada de i18n.

**Android — o gap real está aqui**, e a primeira medição (só-iOS) não o mostrava:

- tema de splash antigo vs. o androidx (linha da tabela acima);
- `colorPrimaryDark` e `android:statusBarColor` commitados em `#ffffff`;
- ícone do launcher: o repo tem PNG em `mipmap-*`, o plugin gera **`.webp`** e
  reescreve os `ic_launcher.xml`/`ic_launcher_round.xml` do `anydpi-v26`;
- `values-b+{en,es,pt+BR}/strings.xml` vazios, como a linha de i18n previa.

Ou seja: o custo da fase 1 é quase todo Android, e a parte que precisa de olho
humano é a mudança de tema/status bar. A ressalva do passo 1 abaixo continua
valendo — falta rodar com `--clean`.

## Fase 1 — paridade de config (SEM depender da conta Apple paga)

Custo estimado: ~1h–1h30. Nada muda no dia a dia; o nativo continua commitado.
A validação é por diff de arquivos gerados, sem build de aparelho.

1. Criar **worktree descartável** e rodar `npx expo prebuild --clean` nela.
2. Diffar o nativo gerado contra o commitado — o diff é a lista real de gaps.
3. Fechar cada gap no `app.config.js` (começando pelo plugin do
   `expo-splash-screen`) e iterar prebuild→diff até o resíduo ser só ruído
   (hashes, timestamps, ordenação).
4. Commitar a paridade. O config vira espelho fiel do nativo.

## Fase 2 — o "flip" (QUANDO a conta Apple/Google estiver paga)

Fazer junto da preparação de loja (Apple US$ 99/ano, Google US$ 25 único):

1. Remover `ios/` e `android/` do git + adicionar ao `.gitignore`.
2. Aposentar o hack `IOS_DISABLE_PUSH` (push passa a funcionar de verdade).
3. `eas credentials` — assinatura/provisioning gerenciados pelo EAS.
4. Primeiro build de loja via **EAS Build** (prebuild roda no servidor — a
   paridade da fase 1 é o que garante que ele sai certo).
5. Pendências do rename ConnectAI→Clubber que dependem das contas:
   re-provisionar push/Firebase (bundle id `com.netobonato.clubber`), Stripe,
   domínio clubber.social.
6. Atualizar CLAUDE.md (fluxo de build muda) e apagar a seção de proibição do
   `prebuild --clean` — ele vira o caminho normal.

## Riscos conhecidos

- **Assinatura com conta gratuita** num pbxproj recém-gerado é o maior atrito —
  por isso a fase 1 NÃO faz build de aparelho; o flip só acontece com conta paga.
- Plugin de splash precisa reproduzir o visual atual (logo branco 200pt sobre
  `#0B0B0D`, edge-to-edge) — conferir contra os assets do handoff.
- Enquanto a fase 2 não acontece, **toda edição nativa manual nova deve ser
  espelhada no config** (ou anotada na tabela acima), senão a paridade da
  fase 1 apodrece.
