// Gera assets/splash-logo.png — a imagem que o expo-splash-screen centraliza na
// splash NATIVA. Ela precisa ser pixel a pixel a mesma composição que o
// SplashScreen.tsx monta em runtime, senão o corte entre a splash nativa e a de
// JS volta a aparecer. Por isso o raster é gerado, não desenhado: as medidas
// abaixo são as do componente, e mudar lá exige rodar `pnpm splash:build`.
//
// Usa Chrome headless porque a Sora ExtraBold é fonte de verdade — texto
// convertido "no olho" não casa com o que o RN renderiza. O caminho abaixo é o
// do macOS; em Linux/CI passe CHROME_PATH. É ferramenta de dev: nada no build
// depende dela, só a regeneração do asset.
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BOARD, GAP, SLOT, STICKER, WORDMARK } from './splash-spec.mjs'

const require = createRequire(import.meta.url)

// As medidas vêm do spec, que o app.config.js também lê pra montar o
// `imageWidth` — sem isso o lado do artboard e o do plugin saem de sincronia (já
// aconteceu: artboard em retrato e imageWidth quadrado encolheram a arte 20%).
const BG = '#05080D' // colors.background
const FG = '#ffffff' // colors.content
const SCALE = 4

const CHROME =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// BrandB.tsx — viewBox 0 0 100 100, uma cor só
const brandB = size => `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100">
    <rect x="27" y="16" width="13" height="64" rx="6.5" fill="${BG}"/>
    <circle cx="55" cy="60.5" r="15.5" fill="none" stroke="${BG}" stroke-width="12"/>
    <path d="M61 77 Q69 86 81 88 Q75 80 74 68 Q69 74.5 61 77 Z" fill="${BG}"/>
  </svg>`

// BrandSticker.tsx — círculo sólido, b a 66%, rotação fixa de -8° e a sombra que
// descola do fundo escuro (shadowRadius/Offset do RN em proporção do tamanho).
const sticker = size => `
  <div style="width:${size}px;height:${size}px;border-radius:50%;background:${FG};
              display:flex;align-items:center;justify-content:center;
              transform:rotate(-8deg);
              box-shadow:0 ${size * 0.1}px ${size * 0.2}px rgba(0,0,0,.55)">
    ${brandB(size * 0.66)}
  </div>`

const font = readFileSync(
  require.resolve('@expo-google-fonts/sora/800ExtraBold/Sora_800ExtraBold.ttf'),
).toString('base64')

// BrandWordmark.tsx — "clu" + adesivo (1.6x da fonte) + "ber", alinhados pela base
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Sora';font-weight:800;
  src:url('data:font/ttf;base64,${font}') format('truetype')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${BOARD}px;height:${BOARD}px;background:${process.env.SPLASH_PREVIEW ? BG : 'transparent'}}
.stage{width:${BOARD}px;height:${BOARD}px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:${GAP}px}
.slot{height:${SLOT}px;display:flex;align-items:center}
.wordmark{display:flex;align-items:flex-end}
.wordmark span{font-family:'Sora';font-weight:800;font-size:${WORDMARK}px;
  line-height:${WORDMARK}px;letter-spacing:${-0.052 * WORDMARK}px;color:${FG}}
.wordmark .wrap{margin-bottom:${-WORDMARK * 0.1}px;margin-right:-1px}
</style>
<div class="stage">
  ${sticker(STICKER)}
  <div class="slot"><div class="wordmark">
    <span>clu</span>
    <div class="wrap">${sticker(WORDMARK * 1.6)}</div>
    <span>ber</span>
  </div></div>
</div>`

const dir = mkdtempSync(join(tmpdir(), 'splash-'))
const page = join(dir, 'splash.html')
writeFileSync(page, html)

const out = process.env.SPLASH_OUT ?? 'assets/splash-logo.png'
execFileSync(
  CHROME,
  [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    // sem isto o Chrome pinta branco atrás e a transparência se perde
    '--default-background-color=00000000',
    `--force-device-scale-factor=${SCALE}`,
    `--window-size=${BOARD},${BOARD}`,
    `--screenshot=${out}`,
    `file://${page}`,
  ],
  { stdio: 'ignore' },
)

console.log(
  `${out} — ${BOARD * SCALE}x${BOARD * SCALE}px (imageWidth: ${BOARD})`,
)
