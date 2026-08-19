const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const reactPlugin = require('eslint-plugin-react')
const reactHooksPlugin = require('eslint-plugin-react-hooks')
const i18nextPlugin = require('eslint-plugin-i18next')
const prettierConfig = require('eslint-config-prettier')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', 'dist/**', '.expo/**', '*.js'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      i18next: i18nextPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/self-closing-comp': 'error',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Geral
      'no-console': 'warn',

      // i18n: copy em JSX/props de copy vem do dicionário, não de literal.
      // `error` desde o fim da Fase 3 — copy nova em português não passa no CI.
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          // Sem isto o plugin ignora template literal, e copy interpolada
          // (`Ver perfil de ${nome}`) passa batida — foi assim que 11 sites
          // escaparam das fases 3.4/3.5.
          'should-validate-template': true,
          'jsx-attributes': {
            include: [
              'accessibilityLabel',
              'accessibilityHint',
              'placeholder',
              'label',
              'title',
            ],
          },
          // exclude substitui os defaults do plugin — os dois primeiros itens de
          // cada lista são eles (t/i18n; números, pontuação e CONSTANT_CASE).
          // O resto: âncora/registro de campo (nome de campo, não copy) e
          // valores de estilo/cor RN dentro de JSX.
          callees: {
            exclude: ['i18n(ext)?', 't', 'form.anchor', 'form.input'],
          },
          words: {
            exclude: [
              '[0-9!-/:-@[-`{-~]+',
              '[A-Z_-]+',
              'absolute',
              'hidden',
              'rgba\\(.*\\)',
              '\\s*km\\s*',
              '★',
              '[\\s·]+',
              // Marca e atribuição de terceiros: nome do app e os créditos que
              // a licença do Mapbox/OSM exige exibir literalmente. O plugin casa
              // o padrão com a string INTEIRA, então isto não abre brecha:
              // "Bem-vindo ao Clubber" continua sendo barrado.
              'Clubber',
              '©.*',
            ],
          },
        },
      ],

      // Design system: proíbe cor hex crua — use token do tema
      // (className bg-/text-/border-* ou colors.* de @/shared/theme).
      // Cores de marca de terceiros (FB, iOS) podem usar eslint-disable com justificativa.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i]',
          message:
            'Cor hex literal proibida: use um token do design system (classe bg-/text-/border-* ou colors.* de @/shared/theme).',
        },
        {
          // Ponto cego do i18next/no-literal-string: em modo jsx-only ele só vê
          // JSX, e copy também entra como VALOR de objeto — título/mensagem do
          // useConfirm, do Share.share, mensagem de schema. Foi assim que copy em
          // português sobreviveu à Fase 3 inteira. Casa só o que parece frase
          // (duas palavras), pra não pegar chave de cache nem token de config.
          selector:
            'Property[key.name=/^(title|message|label|description|placeholder|confirmLabel|cancelLabel)$/] > Literal[value=/[A-Za-zÀ-ÿ]{2,}[ ,]+[A-Za-zÀ-ÿ]{2,}/]',
          message:
            'Copy fora do JSX: mova para o dicionário e use t(...) — o i18next/no-literal-string não enxerga propriedade de objeto.',
        },
        {
          // Mesmo ponto cego, outra forma: a copy entra como ARGUMENTO das
          // funções que exibem texto. Lista fechada de propósito — `new Error`
          // e `console.*` continuam livres, que é onde mora mensagem de dev.
          // Ela enumera os canais de exibição do app, que o CLAUDE.md mantém
          // fechado (sem toast, sem Alert): canal novo entra AQUI também.
          selector:
            'CallExpression[callee.name=/^(showBanner|setError|setInlineError|setFormError)$/] > Literal[value=/[A-Za-zÀ-ÿ]{2,}[ ,]+[A-Za-zÀ-ÿ]{2,}/]',
          message:
            'Copy fora do JSX: mova para o dicionário e use t(...) — o i18next/no-literal-string não enxerga argumento de chamada.',
        },
        {
          // Mensagem de schema Zod é copy e vive fora do JSX. Deve guardar a
          // CHAVE, traduzida no messagesFromErrors (ver VALIDATION_KEYS).
          selector:
            'CallExpression[callee.property.name=/^(min|max|length|email|url|uuid|regex|refine|superRefine|nonempty)$/] > Literal[value=/[A-Za-zÀ-ÿ]{2,}[ ,]+[A-Za-zÀ-ÿ]{2,}/]',
          message:
            'Mensagem de schema em texto: guarde a chave do dicionário (VALIDATION_KEYS a traduz no submit).',
        },
      ],
    },
  },
  {
    // o arquivo-fonte de cores define os hex dos tokens
    files: ['src/shared/theme/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // wordmark "clu/ber" é marca, não copy — nunca se traduz
    files: ['src/shared/components/brand/**/*.{ts,tsx}'],
    rules: {
      'i18next/no-literal-string': 'off',
    },
  },
  prettierConfig,
]
