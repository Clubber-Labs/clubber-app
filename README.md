# ConnectAI Mobile

Aplicativo mobile do ConnectAI — plataforma para descoberta e criação de eventos, conexão entre pessoas e feed social com mapa integrado.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 54 (bare workflow) |
| Linguagem | TypeScript (strict) |
| Navegação | Expo Router v6 (file-based) |
| Dados remotos | TanStack Query v5 |
| Estado global | Zustand v5 |
| HTTP | Axios |
| Formulários | React Hook Form + Zod v4 |
| Estilização | NativeWind v4 (Tailwind para RN) |
| Autenticação | JWT via Expo SecureStore |
| Câmera | react-native-vision-camera v3 |
| Mapas | @rnmapbox/maps |
| Push notifications | expo-notifications |
| Build / CI | EAS (Expo Application Services) |

## Pré-requisitos

- Node.js 18+
- npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) — para builds
- Xcode (iOS) ou Android Studio (Android)
- Conta no [Expo](https://expo.dev) — conta: `netobonato`

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/netobonato/connectai-mobile.git
cd connectai-mobile

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com os valores reais
```

## Variáveis de ambiente

Crie `.env.local` na raiz (nunca commitar):

```env
API_URL=http://localhost:3333
MAPBOX_DOWNLOAD_TOKEN=sk.ey...seu_token_aqui
```

> Em produção, os valores são injetados via EAS Secrets — nunca ficam no repositório.

## Desenvolvimento

```bash
# Iniciar o Metro bundler
npx expo start

# Rodar no simulador iOS
npx expo run:ios

# Rodar no emulador Android
npx expo run:android
```

> O projeto usa `--dev-client`, então é necessário ter um [development build](https://docs.expo.dev/develop/development-builds/introduction/) instalado no dispositivo/simulador antes de usar `expo start`.

## Estrutura de pastas

```
src/
├── app/                        # Rotas (Expo Router — file-based)
│   ├── _layout.tsx             # Layout raiz (providers globais)
│   ├── (auth)/                 # Telas públicas (não autenticadas)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # Telas autenticadas com tab bar
│   │   ├── _layout.tsx
│   │   ├── feed/
│   │   ├── map/
│   │   └── profile/
│   └── events/
│       ├── [id].tsx            # Detalhe do evento
│       └── create.tsx
│
├── features/                   # Domínios da aplicação
│   ├── auth/                   # Autenticação (login, cadastro, sessão)
│   ├── events/                 # Criação e visualização de eventos
│   ├── feed/                   # Feed de eventos
│   ├── follows/                # Sistema de follows
│   └── notifications/          # Push notifications
│
└── shared/                     # Código verdadeiramente compartilhado
    ├── components/             # Button, Input, Avatar...
    ├── hooks/                  # useDebounce, usePagination
    ├── lib/                    # api.ts, queryClient.ts, secureStore.ts
    └── types/                  # ApiError, PaginatedResponse...
```

A arquitetura segue **Feature-Sliced + Clean Architecture**: cada feature é autossuficiente, a tela nunca chama o service diretamente (sempre via hook), e `shared/` nunca importa de `features/`.

## Scripts

```bash
npm start              # Inicia o Metro bundler
npm run ios            # Roda no simulador iOS
npm run android        # Roda no emulador Android

npm run lint           # Reporta erros de ESLint
npm run lint:fix       # Corrige erros automaticamente
npm run format         # Formata o código com Prettier
npm run format:check   # Verifica formatação sem modificar
npm run typecheck      # Verificação de tipos TypeScript

npm run build:ios      # Build iOS via EAS
npm run build:android  # Build Android via EAS
npm run build:all      # Build iOS + Android via EAS
```

## Build com EAS

```bash
# Autenticar
eas login

# Build de desenvolvimento (com dev client)
eas build --profile development --platform ios

# Build de preview (TestFlight / APK interno)
eas build --profile preview --platform all

# Build de produção (App Store / Play Store)
eas build --profile production --platform all
```

Perfis disponíveis em [`eas.json`](eas.json):

| Perfil | Uso |
|---|---|
| `development` | Dev local com development client |
| `preview` | Testes internos (TestFlight / APK) |
| `production` | App Store / Play Store |

## Qualidade de código

O projeto usa ESLint v10 + Prettier v3. As regras principais:

- TypeScript strict — sem `any`, sem `as unknown`
- `import type` obrigatório para imports de tipo
- `react-hooks/rules-of-hooks` e `exhaustive-deps` ativos
- Formatação: sem ponto-e-vírgula, aspas simples, trailing comma, 80 chars

## Fluxo de contribuição

```
1. git checkout main && git pull
2. git checkout -b feat/nome-da-feature
3. Desenvolver e commitar seguindo Conventional Commits em português
4. git push origin feat/nome-da-feature
5. Abrir Pull Request no GitHub
6. Aguardar aprovação do owner para merge
```

Formato de commit:

```
feat: adicionar tela de listagem de eventos
fix: corrigir token expirado não redirecionando para login
chore: atualizar dependências do Expo SDK 54
```

## Licença

Privado — todos os direitos reservados.
