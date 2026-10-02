export type TipoConta = 'poupanca' | 'corrente' | 'dinheiro' | 'outro';

// A conta pertence a um PERFIL, não diretamente ao usuário. Só o perfil
// "principal" tem contas — perfis secundários (ex.: "Casa") não, por isso
// não existe aqui um usuarioId solto.
export type Conta = {
  id: string;
  perfilId: string;
  nome: string;
  tipo: TipoConta;
  saldoInicial: number;
};
