# Plano — trocar o login do Facebook pelo Sign in with Apple (mobile)

> Status: **implementado em 2026-08-21** (backend primeiro, mobile em seguida —
> PR desta branch). Escrito em 2026-08-20 após investigação dos dois repos.
> Contraparte do backend: `docs/plano-login-apple.md` no repo do backend.
> Decisão de botão (prevista abaixo, batida com screenshot no PR): o
> `AppleAuthenticationButton` oficial desenha o próprio label em SF na escala
> do sistema e destoou do par com o Google → ficou o Pressable custom com o
> glifo  e o título oficial da Apple verbatim (`auth.social.continueApple`
> nos 3 locales), como a HIG permite.

## Por quê

- **Guideline 4.8 da App Review:** app que oferece login de terceiros (temos
  Google) é **obrigado** a oferecer Sign in with Apple ou equivalente focado em
  privacidade. Sem isso a primeira submissão é rejeitada — essa troca destrava
  a loja, não é só preferência.
- O Facebook Login sai por decisão de produto (2026-08-20). Pré-lançamento,
  sem usuários reais com conta FB — não há migração de usuários.

## Estado atual (verificado no código)

| Peça | Onde | Observação |
|---|---|---|
| Botões | `features/auth/components/SocialLoginButtons.tsx` → `GoogleLoginButton` + `FacebookLoginButton` | Usados só em `app/(auth)/login.tsx` |
| SDKs por provider | `features/auth/lib/googleSignIn.ts` e `facebookLogin.ts` | Contrato por discriminated union (`success`/`cancelled`/`missing_email`) |
| Hook genérico | `features/auth/hooks/useSocialLogin.ts` | `getProviderToken(provider)` despacha pro SDK; erro via banner + contrato de código da API |
| Tipos | `features/auth/schemas/socialLoginSchema.ts` | `SocialProvider = 'google' \| 'facebook'` |
| Init do FB SDK | `app/_layout.tsx` (`initFacebookSDK()` num useEffect) | Sai junto |
| Config | `app.config.js` → `socialAuthPlugins()` com bloco `react-native-fbsdk-next` | + `extra.facebookAppId`, envs `FACEBOOK_*` |

## Passos

### 1. Dependências

```bash
pnpm exec expo install expo-apple-authentication
pnpm remove react-native-fbsdk-next
```

### 2. `app.config.js`

- `plugins`: entra `"expo-apple-authentication"` — no prebuild ele gera o
  entitlement `com.apple.developer.applesignin`. Android não é afetado.
- `socialAuthPlugins()`: sai o bloco do `react-native-fbsdk-next` e o warning
  de `FACEBOOK_APP_ID/CLIENT_TOKEN` ausentes.
- `extra.facebookAppId` sai. `FACEBOOK_APP_ID`/`FACEBOOK_CLIENT_TOKEN` saem do
  `.env.local` e do `.env.example`.
- **Efeito CNG:** o próximo `prebuild --clean` remove sozinho tudo que o plugin
  do FB escrevia (SKAdNetworkItems, LSApplicationQueriesSchemes e scheme
  `fb…` no Info.plist; `facebook_app_id` no strings.xml do Android). Nada de
  edição manual.

### 3. `features/auth`

- **`lib/appleSignIn.ts`** (novo, espelha o contrato dos irmãos):

  ```ts
  type AppleLoginResult =
    | { kind: 'success'; identityToken: string;
        fullName: { givenName: string | null; familyName: string | null } | null }
    | { kind: 'cancelled' }
  ```

  Usa `AppleAuthentication.signInAsync({ requestedScopes: [FULL_NAME, EMAIL] })`.
  `ERR_REQUEST_CANCELED` → `cancelled`. **Gotcha da Apple:** o nome só vem no
  PRIMEIRO consentimento (e fora do identityToken); logins seguintes devolvem
  `fullName` vazio — por isso ele segue pro backend só quando existir.

- **`schemas/socialLoginSchema.ts`**: `SocialProvider = 'google' | 'apple'`;
  `SocialLoginPayload` ganha `fullName?` (só enviado no fluxo Apple).

- **`hooks/useSocialLogin.ts`**:
  - `getProviderToken` ganha o branch `apple` (retorna token **e** fullName);
  - o ternário de label vira mapa `{ google: 'Google', apple: 'Apple' }`;
  - `missing_email` não existe no fluxo Apple (o identityToken sempre traz
    email — real ou private relay) — o caso continua existindo só pro Google.

- **`components/AppleLoginButton.tsx`** (novo):
  - Renderiza **só no iOS**: `Platform.OS === 'ios'` + `isAvailableAsync()`.
    Android fica Google + email/senha (Apple via web fora de escopo).
  - Estilo: usar o componente oficial `AppleAuthenticationButton`
    (compliance de marca garantida na revisão) com `cornerRadius` alto pra
    casar com a régua de pílulas e mesma altura dos irmãos. Se destoar
    visualmente, alternativa aceita pela HIG é Pressable custom com o glifo
     — decidir no PR com screenshot.

- **Deletar** `FacebookLoginButton.tsx` e `facebookLogin.ts`;
  `SocialLoginButtons` = Google + Apple; `initFacebookSDK` sai do
  `_layout.tsx` junto com o comentário de init.

### 4. i18n (3 locales, convenções do épico)

- Sai `continueFacebook`; entra `continueApple` com o título oficial da
  Apple verbatim por locale ("Continuar com a Apple" / "Continue with
  Apple" / "Continuar con Apple") — requisito da HIG pra botão custom.
- Varrer os 3 arquivos por menções ao Facebook em copy — já localizado:
  `sessions.socialBody` ("…você entrou com Google ou Facebook") vira
  "…Google ou Apple". Rodar `grep -rn -i facebook src/shared/i18n/`.

### 5. Validação

- Portão do repo: `pnpm typecheck && pnpm lint && pnpm format:check`.
- `pnpm exec expo prebuild --clean` + `expo run:ios`: entitlement presente,
  botão aparece, fluxo completo com Apple ID de teste (funciona no simulador
  logado com Apple ID).
- Regressão: login Google intacto no iOS **e** no Android; Android não mostra
  botão Apple.
- Release Android local (`--variant release`) pra confirmar que a remoção do
  FB SDK não quebrou nada no boot.

### 6. Fora do código (owner)

- **Capability "Sign In with Apple"** no App ID `com.netobonato.clubber`
  (developer.apple.com → Identifiers). O Xcode (auto-signing, conta paga) e o
  EAS ligam ao ver o entitlement, mas conferir no console na primeira vez.
- Depois que tudo estiver no ar: remover a plataforma iOS/app do console do
  Facebook Developers (higiene, opcional).

## Branch e ordem

- Branch **`feat/login-apple` empilhada na `feat/cng-full`** — mexe no mesmo
  trecho do `app.config.js` do PR #111. Abrir PR com base `feat/cng-full`; o
  GitHub retargeta pra `main` quando o #111 mergear.
- **Backend primeiro**, mobile depois. Sem janela de compatibilidade: app
  antigo com botão FB não existe em produção.
