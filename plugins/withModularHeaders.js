const fs = require('fs')
const path = require('path')
const { withDangerousMod } = require('expo/config-plugins')

// Pods em Swift não conseguem importar dependências que não definem module map
// quando o link é estático — o AppCheckCore (que vem do Google Sign-In) depende
// destes dois e quebra o `pod install` inteiro.
const MODULAR_PODS = ['GoogleUtilities', 'RecaptchaInterop']

// Linha estável do Podfile gerado; as declarações entram logo depois dela,
// dentro do target.
const ANCHOR = '  config = use_native_modules!(config_command)\n'
const MARKER = '# modular headers — ver plugins/withModularHeaders.js'

/**
 * Declara `:modular_headers => true` para os pods que o AppCheckCore precisa
 * importar.
 *
 * O `extraPods` do expo-build-properties (em app.config.js) escreve a intenção
 * em `apple.extraPods` no Podfile.properties.json, mas nenhum template de
 * Podfile do SDK atual lê essa chave — a configuração fica inerte e o
 * `pod install` falha com "The following Swift pods cannot yet be integrated as
 * static libraries". Sem este plugin, o erro volta a cada prebuild.
 */
module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    modConfig => {
      const podfile = path.join(
        modConfig.modRequest.platformProjectRoot,
        'Podfile',
      )
      const contents = fs.readFileSync(podfile, 'utf8')
      if (contents.includes(MARKER)) return modConfig
      if (!contents.includes(ANCHOR)) {
        throw new Error(
          '[withModularHeaders] âncora não encontrada no Podfile — o template do Expo mudou e o plugin precisa ser revisto.',
        )
      }
      const declarations = MODULAR_PODS.map(
        name => `  pod '${name}', :modular_headers => true\n`,
      ).join('')
      fs.writeFileSync(
        podfile,
        contents.replace(ANCHOR, `${ANCHOR}\n  ${MARKER}\n${declarations}`),
      )
      return modConfig
    },
  ])
}
