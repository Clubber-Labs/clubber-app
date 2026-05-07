# ConnectAI Mobile — Guia de Colaboração

## Stack

- **Framework:** React Native com Expo (bare workflow)
- **Linguagem:** TypeScript
- **Navegação:** Expo Router (file-based routing)
- **Dados remotos:** TanStack Query (cache, loading, invalidação)
- **Estado global:** Zustand (sessão do usuário, preferências)
- **HTTP:** Axios
- **Formulários:** React Hook Form + Zod
- **Estilização:** NativeWind (Tailwind para React Native)
- **Autenticação:** JWT armazenado com Expo SecureStore
- **Câmera:** react-native-vision-camera v3
- **Mapas:** @rnmapbox/maps
- **Push notifications:** expo-notifications
- **Build / CI:** EAS (Expo Application Services)
- **Package manager:** npm

---

## Scripts disponíveis

```bash
# Desenvolvimento
npx expo start              # inicia o Metro bundler
npx expo run:ios            # compila e roda no simulador iOS
npx expo run:android        # compila e roda no emulador Android

# Build
npx expo prebuild           # gera as pastas ios/ e android/ (necessário após mudar plugins)
eas build --profile development   # build de desenvolvimento via EAS
eas build --profile preview       # build de preview (TestFlight / APK interno)
eas build --profile production    # build de produção (App Store / Play Store)

# EAS
eas login                   # autenticar na conta Expo
eas whoami                  # verificar conta logada
eas secret:create           # adicionar variável de ambiente segura no EAS

# Qualidade de código
npx tsc --noEmit            # verificação de tipos
```

---

## Variáveis de ambiente

Variáveis em runtime são lidas via `expo-constants` — o React Native não suporta `.env` nativamente.

### Desenvolvimento local

Crie `.env.local` na raiz (nunca commite este arquivo):

```env
API_URL=http://localhost:3333
MAPBOX_DOWNLOAD_TOKEN=sk.ey...seu_token
```

No `app.config.js`, exponha via `extra`:

```js
import 'dotenv/config'

export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL,
    },
    // ...
  }
}
```

No código do app:

```ts
import Constants from 'expo-constants'
const API_URL = Constants.expoConfig?.extra?.apiUrl
```

### Produção

Secrets sensíveis ficam no EAS — nunca no repositório:

```bash
eas secret:create --scope project --name API_URL --value https://api.connectai.com
eas secret:create --scope project --name MAPBOX_DOWNLOAD_TOKEN --value sk.ey...
```

---

## Arquitetura: Feature-Sliced + Clean Architecture

A arquitetura segue os princípios de **Clean Architecture** e **SOLID**, organizando o código por **feature** (domínio) em vez de por tipo técnico. Cada feature é autossuficiente e não depende de outra feature diretamente — apenas de camadas compartilhadas.

```
src/
├── app/                    → rotas (Expo Router — file-based)
│   ├── (auth)/             → telas públicas (login, cadastro)
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/             → telas autenticadas com tab bar
│   │   ├── feed/
│   │   │   └── index.tsx
│   │   ├── map/
│   │   │   └── index.tsx
│   │   └── profile/
│   │       └── index.tsx
│   ├── events/
│   │   ├── [id].tsx        → detalhe do evento
│   │   └── create.tsx
│   └── _layout.tsx         → layout raiz (providers globais)
│
├── features/               → domínios da aplicação
│   ├── auth/
│   │   ├── components/     → LoginForm, RegisterForm
│   │   ├── hooks/          → useLogin, useRegister
│   │   ├── services/       → authService.ts (chamadas HTTP)
│   │   ├── schemas/        → loginSchema.ts (Zod)
│   │   └── store/          → authStore.ts (Zustand)
│   ├── events/
│   │   ├── components/     → EventCard, EventMap, EventHeader
│   │   ├── hooks/          → useEvents, useEvent, useCreateEvent
│   │   ├── services/       → eventsService.ts
│   │   └── schemas/        → createEventSchema.ts
│   ├── feed/
│   │   ├── components/     → FeedList, FeedItem
│   │   └── hooks/          → useFeed
│   ├── follows/
│   │   ├── hooks/          → useFollow, useFollowers
│   │   └── services/       → followsService.ts
│   └── notifications/
│       ├── hooks/          → usePushNotifications
│       └── services/       → notificationsService.ts
│
├── shared/                 → código verdadeiramente compartilhado
│   ├── components/         → Button, Input, Avatar, Modal, Skeleton
│   ├── hooks/              → useDebounce, usePagination
│   ├── lib/
│   │   ├── api.ts          → instância Axios configurada
│   │   ├── queryClient.ts  → configuração do TanStack Query
│   │   └── secureStore.ts  → wrapper do SecureStore
│   ├── utils/              → funções utilitárias puras e reutilizáveis
│   │   └── masks.ts        → formatPhone, futuros formatadores de input
│   └── types/              → tipos globais (ApiError, PaginatedResponse, etc.)
│
└── global.css              → diretivas Tailwind (NativeWind)
```

---

## Responsabilidade de cada camada

| Camada | Faz | Nunca faz |
|---|---|---|
| `app/` (rotas) | Renderiza telas, compõe componentes, passa parâmetros de rota | Lógica de negócio, chamadas HTTP diretas |
| `features/<nome>/components/` | UI específica da feature, recebe dados via props | Chamadas HTTP, acesso ao store global |
| `features/<nome>/hooks/` | Orquestra TanStack Query + service, expõe dados e ações para a tela | Lógica de UI, navegação |
| `features/<nome>/services/` | Chamadas HTTP via Axios | Lógica de UI, acesso ao store |
| `features/<nome>/schemas/` | Schemas Zod e tipos inferidos | Qualquer lógica |
| `features/<nome>/store/` | Estado global da feature via Zustand | Chamadas HTTP diretas |
| `shared/components/` | Componentes genéricos e reutilizáveis | Lógica de domínio |
| `shared/utils/` | Funções puras reutilizáveis (formatadores, máscaras, parsers) | Side-effects, chamadas HTTP |
| `shared/lib/api.ts` | Configuração do Axios (baseURL, interceptors, token) | Lógica de negócio |

---

## Fluxo de dados

```
Tela (app/) → hook (features/*/hooks/) → service (features/*/services/) → API
                    ↕                         ↕
              TanStack Query              shared/lib/api.ts
                    ↕
              Zustand store (quando estado global necessário)
```

**Princípio:** a tela nunca chama o service diretamente — sempre via hook. O hook nunca acessa o Axios diretamente — sempre via service.

**Princípio de granularidade de componentes:** cada componente tem seu próprio arquivo. Nunca definir múltiplos componentes exportáveis no mesmo arquivo. Componentes auxiliares de um fluxo complexo (ex: steps de cadastro) ficam em subpastas:

```
features/auth/components/
├── RegisterForm.tsx         → orquestra o fluxo
├── RegisterProgressBar.tsx  → componente auxiliar reutilizável
└── steps/
    ├── StepName.tsx
    ├── StepUsername.tsx
    └── ...
```

---

## Exemplo: criando uma nova feature

Seguindo `events` como referência:

### 1. Schema (Zod)
```ts
// features/events/schemas/createEventSchema.ts
import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(3),
  date: z.string().datetime(),
  isPublic: z.boolean(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
```

### 2. Service (HTTP)
```ts
// features/events/services/eventsService.ts
import { api } from '../../../shared/lib/api'
import type { CreateEventInput } from '../schemas/createEventSchema'

export const eventsService = {
  list: () => api.get('/events').then(r => r.data),
  getById: (id: string) => api.get(`/events/${id}`).then(r => r.data),
  create: (data: CreateEventInput) => api.post('/events', data).then(r => r.data),
}
```

### 3. Hook (TanStack Query)
```ts
// features/events/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type { CreateEventInput } from '../schemas/createEventSchema'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: eventsService.list,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventInput) => eventsService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}
```

### 4. Componente
```tsx
// features/events/components/EventCard.tsx
import { View, Text, Pressable } from 'react-native'

type Props = {
  title: string
  date: string
  onPress: () => void
}

export function EventCard({ title, date, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-500 mt-1">{date}</Text>
    </Pressable>
  )
}
```

### 5. Tela
```tsx
// app/(tabs)/feed/index.tsx
import { FlatList, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useEvents } from '../../../features/events/hooks/useEvents'
import { EventCard } from '../../../features/events/components/EventCard'

export default function FeedScreen() {
  const { data: events, isLoading } = useEvents()
  const router = useRouter()

  if (isLoading) return <View className="flex-1 bg-white" />

  return (
    <FlatList
      data={events}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <EventCard
          title={item.title}
          date={item.date}
          onPress={() => router.push(`/events/${item.id}`)}
        />
      )}
    />
  )
}
```

---

## Configuração do cliente HTTP

```ts
// shared/lib/api.ts
import axios from 'axios'
import Constants from 'expo-constants'
import { getToken } from './secureStore'

export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
})

api.interceptors.request.use(async config => {
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // limpar sessão e redirecionar para login
    }
    return Promise.reject(err)
  },
)
```

---

## Autenticação

O JWT é armazenado com `expo-secure-store` — nunca em `AsyncStorage` (não criptografado).

```ts
// shared/lib/secureStore.ts
import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'auth_token'

export const saveToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token)
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY)
export const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY)
```

O store de autenticação (Zustand) mantém o estado da sessão em memória:

```ts
// features/auth/store/authStore.ts
import { create } from 'zustand'

type AuthState = {
  userId: string | null
  isAuthenticated: boolean
  setUser: (userId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  userId: null,
  isAuthenticated: false,
  setUser: userId => set({ userId, isAuthenticated: true }),
  logout: () => set({ userId: null, isAuthenticated: false }),
}))
```

---

## Regras de código

- **TypeScript estrito** — sem `any`, sem `as unknown`
- **Tipos sempre inferidos do Zod** — não criar interfaces duplicadas
- **Tela nunca chama service diretamente** — sempre via hook
- **Hook nunca acessa Axios diretamente** — sempre via service
- **Componente nunca acessa store global** — recebe dados via props ou hook da própria feature
- **`shared/components/`** nunca importa de `features/` — dependência só desce, nunca sobe
- **`shared/utils/`** para funções puras reutilizáveis — se uma função de formatação/máscara/parse for usada em mais de um lugar (ou puder ser), ela vai em `shared/utils/`, não embutida no componente. Ex: `formatPhone` em `masks.ts`, não dentro de `StepAccount.tsx`
- **NativeWind para estilos** — evitar `StyleSheet.create` exceto para casos não suportados pelo Tailwind
- Erros de API tratados nos interceptors do Axios — não repetir tratamento em cada hook

---

## Separação de responsabilidades

Princípio guia: **cada arquivo, função e camada tem uma única responsabilidade clara**. Quando uma função tem `if/else` aninhados, `try/catch` misturados com mutação de estado, ou um `useEffect` com mais de 15 linhas, é sinal de que há responsabilidades misturadas.

### Pure functions vs orchestration

Separe **decisão** (pura, testável, sem efeitos) de **orquestração** (efeitos colaterais, side-effects no store, navegação).

❌ **Errado** — lógica de decisão e efeitos misturados num `useEffect`:
```tsx
useEffect(() => {
  async function run() {
    const token = await getToken()
    if (!token) { setHydrated(); return }
    const userId = await getUserId()
    if (userId) {
      setUser(userId)
      authService.me().catch(err => {
        if (err.response?.status === 401) {
          clearAuthSession()
          logout()
        }
      })
      setHydrated()
      return
    }
    try {
      const me = await authService.me()
      await saveUserId(me.id)
      setUser(me.id)
    } catch (err) { /* ... */ }
    setHydrated()
  }
  run()
}, [])
```

✅ **Certo** — decisão isolada em função pura, orquestração no hook:
```ts
// função pura: retorna o que deve acontecer
async function loadSession(): Promise<SessionResult> {
  const token = await getToken()
  if (!token) return { kind: 'unauthenticated' }
  const stored = await getUserId()
  if (stored) return { kind: 'authenticated', userId: stored }
  // ... recovery
}

// hook: aplica os efeitos
export function useRestoreSession() {
  useEffect(() => {
    loadSession().then(session => {
      if (session.kind === 'authenticated') setUser(session.userId)
      setHydrated()
    })
  }, [])
}
```

### Discriminated unions ao invés de booleanos múltiplos

Quando uma operação tem 3+ resultados possíveis, use um tipo discriminado em vez de retornar booleans/null:

❌ `Promise<{ ok: boolean; userId: string | null; reason: string | null }>`
✅ `Promise<{ kind: 'authenticated'; userId: string } | { kind: 'unauthenticated' }>`

Discriminated unions forçam o consumidor a tratar todos os casos — o TypeScript não compila se você esquecer.

### Layouts e telas focados

- **`_layout.tsx`** existe pra prover providers globais e roteamento. Não coloque lógica de domínio (auth, fetch, validação) direto nele — delega via hook.
- **Telas (`app/.../index.tsx`)** orquestram componentes e passam dados. Lógica de negócio vai em hooks.
- **Hooks** orquestram services + estado. Lógica pura (transformações, decisões) vai em funções puras dentro do mesmo arquivo ou em `utils/`.

### Sinais de que falta separação

- Mesmo `useEffect` lendo storage **e** chamando API **e** setando estado **e** redirecionando
- Função com múltiplos `try/catch` aninhados
- Componente com mais de 1 estado de loading misturado a lógica condicional de UI
- Helper que faz I/O (rede/disco) e ainda muta estado global

Quando perceber qualquer desses, extraia.

---

## Sugestões de code review (Copilot, humano, IA)

**Não aplique sugestões mecanicamente.** Cada comentário precisa passar por uma reflexão antes de virar código:

1. **Reproduza o problema mentalmente.** A sugestão descreve um cenário real que ocorre no nosso uso, ou uma edge case teórica que dificilmente acontece com nossos dados? Ex: bug com dados malformados de uma API que sabemos que sempre retorna o esperado.

2. **Pese custo vs. benefício.** Adicionar union-find pra resolver fronteiras de grid é tecnicamente correto, mas se geocoders sempre retornam coordenadas idênticas para o mesmo endereço, é complexidade desnecessária.

3. **Forme uma opinião própria e justifique.** Se vai aplicar, explique por quê com argumentos do nosso contexto. Se vai recusar, diga **por que** não faz sentido aqui — não só "já está bom".

4. **Pode ser uma terceira via.** Às vezes a sugestão original é cara demais e dispensar é negligente. Procure a versão **mais barata que resolve o caso real** — ex: em vez de union-find completo, verificar os 8 buckets vizinhos é O(n) com fator constante 9, suficiente.

5. **Sugestões podem estar desatualizadas.** Reviews automáticos como Copilot podem estar comentando sobre um trecho que já foi refatorado em outra sugestão. Valide primeiro contra o estado atual do código.

❌ **Não faça:** "Copilot disse X, vou aplicar X"
✅ **Faça:** "Copilot apontou um problema de fronteira em buckets. No nosso caso, isso só afetaria geocoders inconsistentes — improvável. Mas como o custo de checar 8 vizinhos é trivial e elimina toda a classe de bug, aplico essa versão mais simples ao invés do union-find completo."

---

## Navegação (Expo Router)

O Expo Router usa file-based routing — o nome do arquivo define a rota:

| Arquivo | Rota |
|---|---|
| `app/index.tsx` | `/` |
| `app/(tabs)/feed/index.tsx` | `/feed` |
| `app/events/[id].tsx` | `/events/:id` |
| `app/(auth)/login.tsx` | `/login` |

Grupos entre parênteses `(auth)`, `(tabs)` são invisíveis na URL — servem apenas para organização e layouts compartilhados.

Para navegar:

```ts
import { useRouter } from 'expo-router'

const router = useRouter()
router.push('/events/123')
router.replace('/login')
router.back()
```

---

## Branches e Pull Requests

### Nomenclatura de branches

```
<tipo>/<descricao-curta>
```

| Tipo | Quando usar |
|---|---|
| `feat/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `refactor/` | Refatoração sem mudança de comportamento |
| `chore/` | Configuração, dependências, scripts |
| `docs/` | Documentação |

### Regras de branch

- **Nunca commitar diretamente na `main`**
- Sempre criar uma branch a partir da `main` atualizada
- Uma branch deve ter **um único objetivo**
- Deletar a branch após o merge do PR

### Fluxo de trabalho

```
1. git checkout main && git pull
2. git checkout -b feat/nome-da-feature
3. Desenvolver e commitar
4. git push origin feat/nome-da-feature
5. Abrir PR no GitHub
6. Aguardar code review e aprovação
7. Merge feito pelo owner do repositório
```

### Commits

Seguir o padrão **Conventional Commits** em **português**, no imperativo:

```
<tipo>: <descrição curta no imperativo>
```

Tipos válidos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`

**Exemplos:**
```
feat: adicionar tela de listagem de eventos
fix: corrigir token expirado não redirecionando para login
refactor: extrair lógica de paginação para hook usePagination
chore: atualizar dependências do Expo SDK 54
```

### Abrindo um Pull Request

- **Título:** mesmo formato do commit (`feat: ...`) em português, máximo 72 caracteres
- **Descrição** deve ter as seções:
  - `## O que foi feito`
  - `## Por que foi feito`
  - `## Como testar`
- Referenciar a issue relacionada se houver (`Closes #123`)
- O PR só pode ser mergeado após **aprovação do owner**

---

## Configurando mensagens de commit via IA (Claude Code)

### Pré-requisitos

- Ter o [Claude Code](https://claude.ai/code) instalado (`npm install -g @anthropic-ai/claude-code`)
- Estar autenticado (`claude auth`)

### Configuração

Edite `~/.claude/settings.json`:

```json
{
  "systemPrompt": "Ao gerar mensagens de commit, siga rigorosamente o padrão Conventional Commits: use o formato `<tipo>: <descrição curta no imperativo>` em português. Tipos válidos: feat, fix, refactor, chore, docs, test, style. Mantenha o assunto com menos de 72 caracteres. Se necessário, adicione uma linha em branco seguida de um corpo explicando O PORQUÊ (não o quê). Nunca use mensagens vagas como 'atualizar código' ou 'corrigir bug'."
}
```

### Uso no dia a dia

```
faça o commit das minhas alterações
abra um PR com as minhas alterações
```

---

## Configuração EAS

- **Conta Expo:** netobonato
- **Project ID:** `89ff5c01-195a-42ea-a8d0-94425a85a89d`
- Configurado no `app.config.js` em `extra.eas.projectId`

### Perfis de build (`eas.json`)

| Perfil | Uso | Distribuição |
|---|---|---|
| `development` | Dev local com development client | Interna |
| `preview` | Testes (TestFlight / APK interno) | Interna |
| `production` | App Store / Play Store | Pública |

### Variáveis de ambiente

- **Desenvolvimento local:** `.env.local` na raiz (nunca commitar)
- **Produção:** secrets no EAS via `eas secret:create`

Variáveis necessárias:

| Variável | Descrição |
|---|---|
| `API_URL` | URL base da API (ex: `http://localhost:3333` em dev) |
| `MAPBOX_DOWNLOAD_TOKEN` | Token `sk.ey...` do Mapbox para download do SDK |

### Comandos EAS do dia a dia

```bash
eas whoami                              # verificar conta logada
eas build --profile development         # build de desenvolvimento
eas build --profile preview             # build para testes internos
eas build --profile production          # build de produção
eas secret:list                         # listar secrets cadastrados
eas secret:create --scope project --name NOME --value VALOR
```

---

## Qualidade de código: ESLint + Prettier

### Ferramentas

- **ESLint v10** com flat config (`eslint.config.js`)
- **Prettier v3** para formatação consistente
- **Plugins:** `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`
- `eslint-config-prettier` desativa regras do ESLint que conflitam com o Prettier

### Scripts

```bash
npm run lint          # reporta erros de lint
npm run lint:fix      # corrige automaticamente o que for possível
npm run format        # formata todos os arquivos em src/
npm run format:check  # verifica formatação sem modificar (uso em CI)
npm run typecheck     # verificação de tipos TypeScript (tsc --noEmit)
```

### Regras ativas

| Regra | Nível | Motivo |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | error | alinhado com `strict: true` |
| `@typescript-eslint/no-unused-vars` | error | prefixo `_` para ignorar intencionalmente |
| `@typescript-eslint/consistent-type-imports` | error | força `import type` para tipos |
| `react-hooks/rules-of-hooks` | error | hooks só em componentes/hooks |
| `react-hooks/exhaustive-deps` | warn | dependências de efeitos |
| `react/self-closing-comp` | error | componentes sem filhos devem ser auto-fechados |
| `no-console` | warn | remover antes de commitar |

### Configuração do Prettier (`.prettierrc`)

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```
