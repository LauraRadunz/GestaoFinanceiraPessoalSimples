export type TipoConta = 'poupanca' | 'corrente' | 'dinheiro' | 'outro';

export type Conta = {
  id: string;
  perfilId: string;
  nome: string;
  tipo: TipoConta;
  saldoInicial: number;
};
