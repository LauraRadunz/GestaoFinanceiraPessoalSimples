// nas telas a gente nao usa await pra salvar porque o addDoc so termina quando o servidor responde
// mas o onSnapshot ja mostra o item na lista na hora, entao nao precisa travar a tela esperando
// se der erro aparece o alerta depois

export function dispararEscrita(promessa: Promise<unknown>): void {
  promessa.catch((erro) => {
    console.error('[dispararEscrita] Falha ao salvar em segundo plano:', erro);
  });
}

export function mensagemDeErroSalvar(): string {
  return 'Não foi possível salvar. Verifique sua conexão e tente novamente.';
}
