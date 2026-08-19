// Medidas da composição de splash, em pt. Espelham src/shared/components/
// SplashScreen.tsx — o overlay de JS e a imagem da splash nativa têm que ser a
// MESMA arte, senão o corte entre os dois estágios do boot volta a aparecer.
//
// Lidas por scripts/build-splash-logo.mjs (que rasteriza) e por app.config.js
// (que precisa do lado do artboard em `imageWidth`). Mudou aqui? Ajuste o
// componente e rode `pnpm splash:build`.
export const STICKER = 180 // <BrandSticker size={180} />
export const GAP = 36 // gap-9 do NativeWind
export const SLOT = 44 // altura reservada pro wordmark (evita pulo)
export const WORDMARK = 35 // <BrandWordmark height={35} />

// Folga pra sombra dos adesivos não encostar na borda do artboard.
const PAD = 30

// O artboard é QUADRADO por imposição do plugin: o InterfaceBuilder do
// prebuild-config faz `height = imageWidth`, então imagem em retrato entra em
// `contain` e encolhe (a primeira tentativa, 160x200, saiu com o adesivo 20%
// menor). Como o lado vira `imageWidth`, a arte renderiza 1:1 e o adesivo sai
// exatamente nos pt declarados acima.
export const BOARD = STICKER + GAP + SLOT + PAD * 2
