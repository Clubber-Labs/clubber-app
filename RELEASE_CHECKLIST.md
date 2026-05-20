# Release Checklist

Pendências e configurações que precisam ser revisadas antes do primeiro build de produção (TestFlight / App Store / Play Store).

## iOS

### `aps-environment` — Debug vs Release

**Problema:** o entitlements gerado pelo `expo prebuild` (`ios/connectaimobile/connectaimobile.entitlements`) tem `aps-environment` hardcoded como `development`. O `CODE_SIGN_ENTITLEMENTS` aponta pro mesmo arquivo em ambas as configurações (Debug e Release), então builds de Release vão pra App Store/TestFlight com `development` em vez de `production` — push notifications vão falhar em produção.

**Fix idiomático:** uma das alternativas:

1. **Entitlements separados por configuração** — criar `connectaimobile.Debug.entitlements` e `connectaimobile.Release.entitlements`, configurar `CODE_SIGN_ENTITLEMENTS` com variável `$(CONFIGURATION)` no Xcode project settings.

2. **Build setting parametrizado** — definir `APS_ENVIRONMENT` como build setting (Debug=`development`, Release=`production`), e referenciar via `$(APS_ENVIRONMENT)` no entitlements.

3. **EAS Build hook** — investigar se o EAS Build já lida com isso automaticamente via post-install/credential setup. Caso afirmativo, não há nada a fazer no client.

**Antes de mexer:** confirmar com EAS Build se há mecanismo automático. Se sim, item resolvido. Se não, escolher entre opções 1 ou 2 e validar com primeiro build de produção.

**Apontado por:** code review do PR feat/explore-screen.

### Push Notifications — `expo-notifications` removido temporariamente

**Contexto:** o package `expo-notifications` foi removido porque o Apple Developer profile não tem Push Notifications capability registrada, e o config-plugin do package adicionava `aps-environment` automaticamente, quebrando builds em device físico (`Provisioning Profile does not support the Push Notifications capability`) e versionando um valor `development` indevido no entitlements.

**Quando reintegrar:**

1. Habilitar **Push Notifications** capability no Apple Developer Portal (`developer.apple.com` → Identifiers → `com.netobonato.connectaimobile` → Capabilities → Push Notifications)
2. Reinstalar package: `pnpm add expo-notifications`
3. Recriar `src/features/notifications/` (hook + service) — esqueleto antigo no histórico do git: `git show <hash>:src/features/notifications/hooks/usePushNotifications.ts`
4. Consumir `usePushNotifications` no layout autenticado (provavelmente `_layout.tsx` ou tab layout)
5. Rodar `npx expo prebuild --platform ios` pra regenerar entitlements com `aps-environment`
6. **Resolver o item acima** (`aps-environment` Debug vs Release) ANTES do primeiro build de produção, senão push falha em release

## Android

### Login social (Google + Facebook) — habilitar pra Android

**Contexto:** o login social foi implementado e validado em iOS primeiro. O código (`useSocialLogin`, wrappers de SDK, etc.) é o mesmo em ambas as plataformas — o que falta é a parte de config nativa do Android. Sem isso, os botões Google/Facebook na tela de login crasham em device Android.

**Pré-requisitos pra extrair credenciais:**

1. Instalar JDK no macOS (não vem por padrão — o `keytool` do macOS é só um stub que aponta pra Java.com):
   ```bash
   brew install --cask temurin@17
   ```
   Configurar `JAVA_HOME` no `~/.config/fish/config.fish`:
   ```fish
   set -gx JAVA_HOME (/usr/libexec/java_home -v 17)
   set -gx PATH $JAVA_HOME/bin $PATH
   ```

2. Garantir que `~/.android/debug.keystore` existe (criado automaticamente no 1º `expo run:android`, ou manualmente via `keytool -genkey` — senha padrão `android`).

**Extrair SHA-1 (Google OAuth Android Client):**

```bash
keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android | grep SHA1:
```

Formato esperado: `SHA1: AB:CD:EF:01:23:...` (hex com `:`).

**Extrair Key Hash (Facebook Android platform):**

```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android | openssl sha1 -binary | openssl base64
```

Formato esperado: string base64 de ~28 chars terminando em `=`.

**Registros a fazer nos painéis:**

1. **Google Cloud Console** → APIs & Services → Credentials → criar **OAuth Client ID** tipo **Android**:
   - Package name: `com.netobonato.connectaimobile`
   - SHA-1 fingerprint: o valor do passo anterior
   - Não precisa adicionar nada no `.env.local` — o SDK Android usa o `GOOGLE_WEB_CLIENT_ID` como `serverClientId` e descobre o Android Client pelo SHA-1.

2. **Facebook Developer Portal** → App → Settings → Basic → **+ Add Platform → Android**:
   - Google Play Package Name: `com.netobonato.connectaimobile`
   - Class Name: vazio
   - Key Hashes: o valor base64 do passo anterior

3. Em **Products → Facebook Login → Quick Start → Android**: clicar Next até o fim (não precisa copiar nenhum código — o plugin `react-native-fbsdk-next` já cobre o `AndroidManifest.xml`).

**Validar:**

```bash
pnpm exec expo run:android   # build dev
```

Cenários a testar (mesmos do iOS):
- Cancelar popup Google/Facebook → volta silencioso, sem banner
- Login com conta nova → vai pra `/complete-profile` → completar → feed
- Modo avião + tap → banner de erro de rede
- Login tradicional continua funcionando

### Login social — SHA-1 da keystore de **release**

**Quando for buildar release (Play Store):** o SHA-1 da debug keystore **não vale** pra build de produção — EAS Build/Play Store usa outra keystore. Pra release funcionar:

1. Pegar SHA-1 da keystore de produção via `eas credentials` (`eas credentials --platform android`) — ele mostra o fingerprint da keystore que o EAS gerencia.
2. Adicionar esse SHA-1 ao mesmo **Android OAuth Client** no Google Cloud (campo aceita múltiplos SHA-1 — um pra debug, um pra release).
3. Adicionar o **key hash de release** ao Facebook (mesmo lugar do debug — também aceita múltiplos).
4. Submeter o app Facebook pra **App Review** (sair do Development mode) — sem isso, só usuários listados em "App roles" conseguem logar.

### `CODE_SIGN_IDENTITY = "Apple Development"` na config Release (cuidado pós-prebuild)

**Problema:** com `appleTeamId` setado em `app.config.js`, o `expo prebuild --clean` aplica `CODE_SIGN_IDENTITY = "Apple Development"` **em ambas** as configs (Debug e Release) do target principal no `project.pbxproj`. Isso pode quebrar archive/IPA local de produção via Xcode — Release deveria usar Automatic Signing (vazio) ou `"Apple Distribution"`.

**Fix manual após cada `prebuild --clean`:** remover a linha `CODE_SIGN_IDENTITY = "Apple Development";` apenas do bloco `13B07F95... /* Release */` no `ios/connectaimobile.xcodeproj/project.pbxproj` (manter no Debug). Manter `DEVELOPMENT_TEAM` e `CODE_SIGN_STYLE = Automatic` — o Xcode escolhe a identity correta.

**Quando isso importa:** apenas pra archive local via Xcode (TestFlight manual). **EAS Build não é afetado** — ele tem seu próprio fluxo de assinatura com credenciais armazenadas no servidor; o pbxproj local é sobrescrito.

**Solução permanente (TODO):** mover `CODE_SIGN_IDENTITY` pra `ios/Config/Local.xcconfig` (já gitignored) ou criar um post-prebuild script. Por enquanto, ajustar manualmente é mais simples e o EAS dispensa pra prod.

## Sobre o `ios/Info.plist` versionado

**Contexto:** `ios/` é commitado (bare workflow), incluindo `Info.plist` com URL schemes (`fb<APP_ID>`, `com.googleusercontent.apps.<IOS_CLIENT_ID>`) e chaves `FacebookAppID`/`FacebookClientToken`. Esses valores vêm do `.env.local` no momento em que `expo prebuild --clean` foi rodado.

**Importante:**
- A **fonte de verdade** é o `app.config.js` + `.env.local`. O `Info.plist` é só o output do último prebuild local.
- Pra mudar credenciais (trocar de app Facebook, rotacionar Client ID), edita o `.env.local` e roda `pnpm exec expo prebuild --platform ios --clean` — o `Info.plist` é regenerado.
- `FACEBOOK_CLIENT_TOKEN` **não é secret** ([doc oficial do Facebook](https://developers.facebook.com/docs/facebook-login/security#client_token)): vai no app binário publicado. App ID e Client IDs do Google também são "públicos" por design.
- Em produção via EAS Build, o prebuild roda com `eas secret:create` no servidor — o `Info.plist` do repo não vai pra build de produção.

**Quando o `Info.plist` do repo deve ser commitado de novo:** sempre que algum plugin nativo for adicionado/removido OU credenciais sociais forem trocadas E você quer que o próximo dev consiga buildar sem rodar prebuild local. Caso contrário, deixa o último estado vencer.

## Antes de cada release

- [ ] Bump `version` em `app.config.js`
- [ ] Verificar que todos os secrets estão configurados no EAS (`eas secret:list`)
- [ ] Confirmar `API_URL` apontando pra produção
- [ ] Rodar `pnpm typecheck` e `pnpm lint` localmente
- [ ] Smoke test no simulador iOS e device físico Android
- [ ] Atribuição da Mapbox/OpenStreetMap acessível na tela "Sobre" (perfil → Sobre)
- [ ] Login social validado em Android (ver seção "Android" acima) — se ainda não foi feito
