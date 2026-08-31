// Publica um bundle JS nos canais do EAS Update (OTA). Runbook completo e
// procedimento de rollback: docs/eas-update.md.
//
// Existe porque `eas update` sozinho é fácil demais de disparar errado: ele
// publica o que está na sua árvore de trabalho, não o que está no repositório —
// uma linha de debug esquecida vai pra base inteira de usuários sem passar por
// PR, review ou CI. E, ao contrário de um build de loja, não há revisão da Apple
// entre você e todo mundo. Os portões abaixo são o que substitui isso.
import { execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { stdin, stdout } from 'node:process'
import { config as loadDotenv } from 'dotenv'
import { EXTRA_FROM_ENV, OPTIONAL_EXTRA_ENV } from './extra-env.mjs'

// O app.config.js lê API_URL e os tokens de Mapbox/Stripe/Google de process.env
// e os publica em `extra` — de onde o app inteiro os consome em runtime. No
// export do EAS o config é avaliado ANTES de o Expo CLI carregar o .env.local:
// os valores saem undefined, somem do manifesto, e o app que baixar a update
// fica sem baseURL da API (tela "Sem conexão"), sem mapa e sem pagamentos.
// Carregar aqui garante que já estejam no ambiente quando o config for lido.
loadDotenv({ path: '.env.local' })

/**
 * Reproduz o NODE_PATH que o shim do pnpm (node_modules/.bin/expo) exporta.
 *
 * O `eas update` chama o CLI do Expo pelo caminho real dentro de
 * node_modules/.pnpm, pulando o shim — e é o shim que monta esse NODE_PATH. Sem
 * ele, o Babel do Metro não resolve `babel-preset-expo` (que no layout isolado
 * do pnpm mora sob o diretório do expo, não na raiz) e o export morre com
 * "Cannot find module 'babel-preset-expo'". Derivado em runtime porque o
 * diretório do store carrega um hash das peer deps: hardcodar quebra no
 * próximo `pnpm install`.
 */
function pnpmNodePath() {
  const require = createRequire(import.meta.url)
  const expoDir = path.dirname(require.resolve('expo/package.json'))
  return [
    path.join(expoDir, 'node_modules'),
    path.dirname(expoDir),
    path.join(process.cwd(), 'node_modules', '.pnpm', 'node_modules'),
    process.env.NODE_PATH,
  ]
    .filter(Boolean)
    .join(path.delimiter)
}

const CHANNELS = ['preview', 'production']
/** Canais cujo alcance justifica exigir código revisado e confirmação na mão. */
const PROTECTED = ['production']
const TRUNK = 'main'

const [channel, ...passthrough] = process.argv.slice(2)

function fail(message, hint) {
  console.error(`\n✗ ${message}`)
  if (hint) console.error(`  ${hint}`)
  process.exit(1)
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

/** Informativo: nada que falhe aqui deve impedir a publicação. */
function tryEas(args) {
  try {
    return execFileSync('pnpm', ['exec', 'eas', ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return null
  }
}

if (!CHANNELS.includes(channel)) {
  fail(
    `Canal inválido: ${channel ?? '(nenhum)'}`,
    `Use: pnpm update:${CHANNELS.join(' | pnpm update:')}`,
  )
}

const protectedChannel = PROTECTED.includes(channel)

// ── Portão 1: árvore limpa ───────────────────────────────────────
// O bundle sai da árvore de trabalho. Publicar com arquivo modificado entrega
// um código que não existe em commit nenhum — e que ninguém consegue reproduzir
// nem reverter depois.
if (git('status', '--porcelain')) {
  fail(
    'Há mudanças não commitadas.',
    'O update sai da árvore de trabalho: commite (ou stash) antes de publicar.',
  )
}

const sha = git('rev-parse', '--short', 'HEAD')
const subject = git('log', '-1', '--pretty=%s')
const branch = git('rev-parse', '--abbrev-ref', 'HEAD')

// ── Portão 2: canal protegido exige código revisado ──────────────
if (protectedChannel) {
  if (branch !== TRUNK) {
    fail(
      `Canal "${channel}" só publica a partir de ${TRUNK} (você está em ${branch}).`,
      'Abra o PR, mergeie, e publique da main.',
    )
  }

  try {
    execFileSync('git', ['fetch', '--quiet', 'origin', TRUNK], {
      stdio: 'ignore',
    })
  } catch {
    fail(
      'Não consegui falar com o origin pra conferir se seu HEAD está publicado.',
      'Sem rede não dá pra garantir que o código do update existe no remoto.',
    )
  }

  // HEAD que não está no remoto não é revisável nem reproduzível por mais
  // ninguém — e o rollback depende de conseguir voltar a um commit conhecido.
  if (git('rev-parse', 'HEAD') !== git('rev-parse', `origin/${TRUNK}`)) {
    fail(
      `Seu HEAD diverge de origin/${TRUNK}.`,
      'Faça pull/push até os dois baterem antes de publicar.',
    )
  }
}

// ── Portão 3: qualidade ──────────────────────────────────────────
// Mesmos portões do repo (ver CLAUDE.md). `format:check` fica de fora de
// propósito: o baseline não é prettier-clean e falharia em arquivo intocado.
for (const task of ['typecheck', 'lint']) {
  console.log(`\n▸ pnpm ${task}`)
  try {
    execFileSync('pnpm', [task], { stdio: 'inherit' })
  } catch {
    fail(`\`pnpm ${task}\` falhou.`, 'Corrija antes de publicar.')
  }
}

// ── Portão 4: o que vira `extra` no manifesto ────────────────────
// A lista vem do mesmo módulo que o app.config.js usa pra montar o `extra` —
// variável nova entra em um lugar só e este portão passa a cobri-la. Ausentes,
// o export NÃO falha: publica um manifesto sem elas, e só o aparelho que baixar
// descobre — sem baseURL de API a tela é "Sem conexão". Aconteceu em 23/08/2026.
// OPTIONAL_EXTRA_ENV fica de fora: são as que a ausência É o estado esperado
// (o interruptor do Spotify). Barrar por elas empurraria quem publica a
// defini-las só pra destravar o portão.
const absent = Object.values(EXTRA_FROM_ENV).filter(name => !process.env[name])
const missingEnv = absent.filter(name => !OPTIONAL_EXTRA_ENV.has(name))
if (missingEnv.length) {
  fail(
    `Faltam variáveis que o app.config.js publica em \`extra\`: ${missingEnv.join(', ')}.`,
    'Confira o .env.local — sem elas a update quebra quem a baixar.',
  )
}

// O inverso da armadilha: a variável dormente DEFINIDA na hora de publicar
// acende a feature pra quem baixar — e, por mudar o app.config.js, muda o
// fingerprint: a update nem chegaria nos binários instalados. Quem publica de
// uma máquina do círculo beta tem a do Spotify no .env.local e não faria ideia.
// Preview (interno) segue com aviso; production recusa.
const dormantPresent = [...OPTIONAL_EXTRA_ENV].filter(name => process.env[name])
if (dormantPresent.length) {
  if (protectedChannel) {
    fail(
      `Variável de feature dormente definida no ambiente: ${dormantPresent.join(', ')}.`,
      'Ela ligaria a feature pra base inteira e mudaria a runtime version (a update nem chegaria). Tire do .env.local antes de publicar production.',
    )
  }
  console.warn(
    `\n⚠  ${dormantPresent.join(', ')} definida — esta update sai com a feature LIGADA.`,
  )
}

/** Endereço que só resolve na máquina/rede de quem publica. */
function isLocalHost(url) {
  let host
  try {
    host = new URL(url).hostname
  } catch {
    return false
  }
  if (host === 'localhost' || host.endsWith('.local')) return true
  if (/^(127\.|10\.|192\.168\.|0\.0\.0\.0$)/.test(host)) return true
  return /^172\.(1[6-9]|2\d|3[01])\./.test(host)
}

// Publicar production apontando pra rede local deixaria a base inteira sem
// backend, e o revert só chega no cold start seguinte de cada usuário.
if (protectedChannel && isLocalHost(process.env.API_URL ?? '')) {
  fail(
    `API_URL aponta para a rede local (${process.env.API_URL}).`,
    'Uma update de production com essa URL deixa todos os usuários sem backend.',
  )
}

// ── Âncora de rollback ───────────────────────────────────────────
// O que está no canal AGORA é para onde se volta se a nova update quebrar.
// Impresso antes de publicar pra ficar no scrollback do terminal.
const current = tryEas([
  'update:list',
  '--branch',
  channel,
  '--limit',
  '1',
  '--json',
  '--non-interactive',
])
let anchor = null
try {
  // Tolerante às duas formas que o CLI já devolveu (lista crua e paginada):
  // a âncora é conveniência, não pode virar motivo pra publicação falhar.
  const parsed = JSON.parse(current ?? 'null')
  const groups = Array.isArray(parsed) ? parsed : (parsed?.currentPage ?? [])
  anchor = groups[0]?.group ?? null
} catch {
  // Formato mudou, canal ainda não existe, ou não há update — segue sem âncora.
}

console.log('\n─────────────────────────────────────────────')
console.log(`  canal      ${channel}`)
console.log(`  commit     ${sha} — ${subject}`)
console.log(`  substitui  ${anchor ?? '(nada publicado ainda)'}`)
const dormant = absent.filter(name => OPTIONAL_EXTRA_ENV.has(name))
if (dormant.length) {
  console.log(`  desligado  ${dormant.join(', ')}`)
}
// A variável entra no app.config.js, e o fingerprint hasheia o config: com ela
// a runtime version é OUTRA. Publicar sem ela, para um aparelho que rodou um
// build local com ela (ou o contrário), não dá erro — a update simplesmente
// nunca chega. Ver "Testar OTA num build local" em docs/eas-update.md.
if (process.env.UPDATES_CHANNEL) {
  console.log(
    `\n  ⚠  UPDATES_CHANNEL=${process.env.UPDATES_CHANNEL} está setada.`,
  )
  console.log('     Modo build LOCAL: runtime version diferente da dos builds')
  console.log('     do EAS. Use a mesma variável no build e na publicação.')
}
if (anchor) {
  console.log(`\n  rollback:  pnpm exec eas update:republish --group ${anchor}`)
}
console.log('─────────────────────────────────────────────')

// ── Portão 5: confirmação na mão ─────────────────────────────────
if (protectedChannel) {
  if (!stdin.isTTY) {
    fail(
      `Canal "${channel}" não publica sem confirmação interativa.`,
      'Por desenho: nada automatizado deve alcançar a base inteira sozinho.',
    )
  }
  const rl = createInterface({ input: stdin, output: stdout })
  const answer = await rl.question(
    `\n⚠  Isto chega em TODOS os usuários no próximo cold start deles.\n   Digite "${channel}" para confirmar: `,
  )
  rl.close()
  if (answer.trim() !== channel) fail('Cancelado.')
}

// `eas update` imprime a runtime version que casou; se ela não bater com
// nenhum build existente, ele avisa que a update não alcança ninguém.
console.log()
execFileSync(
  'pnpm',
  [
    'exec',
    'eas',
    'update',
    '--branch',
    channel,
    '--message',
    `${sha} ${subject}`,
    ...passthrough,
  ],
  { stdio: 'inherit', env: { ...process.env, NODE_PATH: pnpmNodePath() } },
)
