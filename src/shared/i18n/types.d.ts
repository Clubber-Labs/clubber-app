import type pt from './locales/pt.json'

// pt.json é o dicionário canônico: chave inexistente em `t()` vira erro de tipo.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof pt }
  }
}
