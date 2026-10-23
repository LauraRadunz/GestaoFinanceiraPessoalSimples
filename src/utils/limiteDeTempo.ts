export function dispararEscrita(promessa: Promise<unknown>): void {
  promessa.catch((erro) => {
    console.error('[dispararEscrita] Falha ao salvar em segundo plano:', erro);
  });
}

export function mensagemDeErroSalvar(): string {
  return 'Não foi possível salvar. Verifique sua conexão e tente novamente.';
}
