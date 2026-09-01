// Guarda contra a deriva entre o vocabulário de erros do backend e a copy do
// app — as duas pontas são listas mantidas à mão, e nada além disto compara uma
// com a outra.
//
// O que só existe aqui é a comparação com o backend: código novo lá passa
// batido no build e cai na genérica em silêncio. As checagens de dicionário
// abaixo são cinto e suspensório — o tsc já cobre os três idiomas, porque
// i18n/index.ts declara `resources` como Record<Locale, typeof pt>.
//
// De onde vem o vocabulário do backend:
//   (padrão)                 repo em disco: ../connectai-backend ou BACKEND_DIR
//   --backend-source -       o error-codes.ts do backend pelo stdin
//   --backend-source <path>  o error-codes.ts do backend por caminho
//   --codes A,B,C            os códigos já extraídos
//
// Não roda no CI deste repo de propósito: a deriva nasce no backend, no PR que
// cria o código, e é lá que ela tem que barrar. Os modos por stdin/argumento
// existem pra um CI de fora chamar sem clonar o backend inteiro; localmente,
// rode ao mexer em erro dos dois lados.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const USAGE = `uso: node scripts/check-error-codes.mjs [--backend-source <path|->] [--codes A,B,C]
  sem opção: lê $BACKEND_DIR/src/lib/errors/error-codes.ts (padrão ../connectai-backend)`

function parseArgs(argv) {
  const opts = { backendSource: null, codes: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const value = argv[i + 1]
    if (arg === '--backend-source' && value) opts.backendSource = argv[++i]
    else if (arg === '--codes' && value) opts.codes = argv[++i]
    else if (arg === '--help' || arg === '-h') {
      console.log(USAGE)
      process.exit(0)
    } else {
      console.error(`Opção inválida: ${arg}\n\n${USAGE}`)
      process.exit(1)
    }
  }
  if (opts.backendSource && opts.codes) {
    console.error(`--backend-source e --codes são excludentes.\n\n${USAGE}`)
    process.exit(1)
  }
  return opts
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const opts = parseArgs(process.argv.slice(2))

// Lê o array literal direto da fonte: o backend não publica esse vocabulário
// como pacote, e vendorizar uma cópia criaria uma terceira lista pra derivar.
function codesFrom(source, name, file) {
  const start = source.indexOf(`export const ${name} = [`)
  if (start === -1) throw new Error(`${name} não encontrado em ${file}`)
  const end = source.indexOf('] as const', start)
  if (end === -1) throw new Error(`${name} sem fechamento em ${file}`)
  const body = source.slice(start, end)
  return [...body.matchAll(/'([A-Z_0-9]+)'/g)].map(m => m[1])
}

function backendCodes({ backendSource, codes }) {
  if (codes) {
    const list = codes.split(/[\s,]+/).filter(Boolean)
    const invalid = list.filter(code => !/^[A-Z][A-Z_0-9]*$/.test(code))
    if (invalid.length) {
      console.error(`--codes com valor fora do padrão: ${invalid.join(', ')}`)
      process.exit(1)
    }
    return list
  }

  if (backendSource === '-') {
    return codesFrom(readFileSync(0, 'utf8'), 'ERROR_CODES', 'stdin')
  }

  const backendFile =
    backendSource ??
    join(
      process.env.BACKEND_DIR ?? resolve(root, '../connectai-backend'),
      'src/lib/errors/error-codes.ts',
    )
  if (!existsSync(backendFile)) {
    console.error(`Vocabulário do backend não encontrado em:\n  ${backendFile}`)
    console.error(
      '\nAponte com BACKEND_DIR=/caminho/do/connectai-backend, ' +
        '--backend-source <path|-> ou --codes A,B,C',
    )
    process.exit(1)
  }
  return codesFrom(
    readFileSync(backendFile, 'utf8'),
    'ERROR_CODES',
    backendFile,
  )
}

const appFile = join(root, 'src/shared/lib/errorCodes.ts')
const appSource = readFileSync(appFile, 'utf8')

let backend
try {
  backend = backendCodes(opts)
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
}
if (backend.length === 0) {
  console.error('Vocabulário do backend veio vazio.')
  process.exit(1)
}
const translated = codesFrom(appSource, 'TRANSLATED_ERROR_CODES', appFile)
const untranslated = codesFrom(appSource, 'UNTRANSLATED_ERROR_CODES', appFile)

const LOCALES = ['pt', 'en', 'es']
const dicts = Object.fromEntries(
  LOCALES.map(locale => {
    const file = join(root, `src/shared/i18n/locales/${locale}.json`)
    return [locale, JSON.parse(readFileSync(file, 'utf8')).errors ?? {}]
  }),
)

const problems = []
const report = (title, codes, hint) => {
  if (codes.length) problems.push({ title, codes, hint })
}

const classified = new Set([...translated, ...untranslated])
const backendSet = new Set(backend)

report(
  'Código no backend que o app não classificou',
  backend.filter(code => !classified.has(code)),
  'Traduza nos 3 dicionários (+ TRANSLATED_ERROR_CODES) ou justifique em UNTRANSLATED_ERROR_CODES.',
)
report(
  'Código classificado no app que não existe mais no backend',
  [...classified].filter(code => !backendSet.has(code)),
  'O backend removeu o código: tire das listas e a copy dos dicionários.',
)
report(
  'Código nas duas listas ao mesmo tempo',
  translated.filter(code => untranslated.includes(code)),
  'Ou tem copy, ou cai na genérica — nunca os dois.',
)

for (const locale of LOCALES) {
  report(
    `Código traduzido sem chave errors.* no ${locale}.json`,
    translated.filter(code => !(code in dicts[locale])),
    'Escreva a copy neste idioma.',
  )
  report(
    `Copy órfã no ${locale}.json`,
    // Só chaves em CAIXA_ALTA são código de erro; default/network/validation
    // e afins são copy de estado, não de código.
    Object.keys(dicts[locale]).filter(
      key => /^[A-Z][A-Z_0-9]*$/.test(key) && !translated.includes(key),
    ),
    'Chave errors.* que não está em TRANSLATED_ERROR_CODES — sobrou de remoção?',
  )
}

if (problems.length === 0) {
  console.log(
    `OK — ${backend.length} códigos do backend classificados: ` +
      `${translated.length} com copy em ${LOCALES.length} idiomas, ` +
      `${untranslated.length} caem na genérica de propósito.`,
  )
  process.exit(0)
}

for (const { title, codes, hint } of problems) {
  console.error(`\n${title} (${codes.length}):`)
  for (const code of codes) console.error(`  ${code}`)
  console.error(`  → ${hint}`)
}
process.exit(1)
