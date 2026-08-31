/**
 * Espera TODAS as promessas — a falha de uma não cancela as outras — e relança
 * a primeira que falhou.
 *
 * É o meio-termo que o upload em lote pede: `Promise.all` abortaria a espera e
 * deixaria as demais subindo sem ninguém olhando, e `allSettled` sozinho engole
 * o erro. Assim o que subiu fica e quem chamou ainda fica sabendo.
 */
export async function settleAll(tasks: Promise<unknown>[]): Promise<void> {
  const results = await Promise.allSettled(tasks)
  const failed = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  )
  if (failed) throw failed.reason
}
