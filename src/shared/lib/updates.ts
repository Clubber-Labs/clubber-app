import * as Updates from 'expo-updates'

/**
 * Identidade do bundle que ESTE aparelho está rodando, pra colar num relato de
 * bug. Sem ela, "atualizei e quebrou" não diz QUAL update quebrou — e é o id do
 * update que o rollback republica (ver docs/eas-update.md).
 *
 * `embedded` = o bundle que veio no binário, nenhuma OTA aplicada ainda; é o
 * estado normal logo depois de instalar da loja, e também o que sobra quando um
 * rollback manda todo mundo de volta pro que veio no build.
 */
export function bundleIdentity(): string {
  const channel = Updates.channel ?? 'dev'
  const update =
    Updates.isEmbeddedLaunch || !Updates.updateId
      ? 'embedded'
      : Updates.updateId.slice(0, 8)
  return `${channel} · ${update}`
}
