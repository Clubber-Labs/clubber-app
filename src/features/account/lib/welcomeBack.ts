import { getAccountRecovery, clearAccountRecovery } from './accountRecovery'

type ShowBanner = (message: string) => void

// Chamado após login bem-sucedido. SEMPRE limpa o marker; só exibe o banner se
// ele pertence ao usuário que acabou de logar — evita banner cruzado entre
// contas/cadastros no mesmo device. O banner é global (sobrevive ao redirect
// reativo do AuthGuard).
export async function maybeShowWelcomeBack(
  showBanner: ShowBanner,
  loggedInUserId: string,
): Promise<void> {
  // Nunca pode quebrar o login: o welcome-back é só um detalhe de UX.
  try {
    const rec = await getAccountRecovery()
    await clearAccountRecovery()
    if (!rec || rec.userId !== loggedInUserId) return
    showBanner(
      rec.status === 'PENDING_DELETION'
        ? 'Bem-vindo de volta! Sua exclusão foi cancelada.'
        : 'Bem-vindo de volta! Sua conta foi reativada.',
    )
  } catch {
    // storage indisponível — segue sem banner.
  }
}
