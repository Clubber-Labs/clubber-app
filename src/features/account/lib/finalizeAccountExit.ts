import { endSession } from '@/features/auth/lib/session'
import { setAccountRecovery, type AccountRecovery } from './accountRecovery'

// Encerramento da sessão após desativar/excluir: grava o marker (pro welcome-back
// no próximo login) e chama endSession SEM expired — não é sessão expirada, então
// o login não mostra "Sua sessão expirou". NÃO navega: a tela é a dona do
// router.replace (igual ao useLogout), pra ter um único dono da navegação.
export async function finalizeAccountExit(rec: AccountRecovery): Promise<void> {
  // O marker é best-effort (welcome-back). O logout é crítico e SEMPRE roda — uma
  // falha ao gravar o marker não pode deixar o usuário logado numa conta inativa.
  try {
    await setAccountRecovery(rec)
  } catch {
    // segue sem o marker; o relogin reativa a conta de qualquer forma.
  }
  await endSession()
}
