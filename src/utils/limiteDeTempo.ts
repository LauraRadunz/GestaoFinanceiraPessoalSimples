/**
 * O Firestore aplica uma escrita no cache local (e por isso a lista já
 * atualiza na hora, via onSnapshot) MESMO antes do servidor confirmar o
 * recebimento — a confirmação em si pode demorar bastante, ou nunca
 * chegar, se a conexão do navegador até o Firestore estiver instável ou
 * bloqueada. Esperar (`await`) por essa confirmação antes de liberar o
 * formulário deixava o botão preso em "Salvando..." indefinidamente,
 * mesmo quando os dados já tinham sido salvos de verdade.
 *
 * Por isso as telas NÃO esperam a escrita terminar pra limpar o
 * formulário: disparam a escrita, seguem em frente, e só mostram um
 * aviso se ela realmente vier a falhar (erro de permissão, por
 * exemplo) — o que pode acontecer bem depois, em segundo plano.
 */
export function dispararEscrita(promessa: Promise<unknown>): void {
  promessa.catch((erro) => {
    console.error('[dispararEscrita] Falha ao salvar em segundo plano:', erro);
  });
}

export function mensagemDeErroSalvar(): string {
  return 'Não foi possível salvar. Verifique sua conexão e tente novamente.';
}
