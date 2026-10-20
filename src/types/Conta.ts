export type TipoConta = 'poupanca' | 'corrente' | 'dinheiro' | 'outro';

<<<<<<< HEAD

=======
>>>>>>> dccad0bf6c13c0cc0f1ea7700258fb83db96d2fc
export type Conta = {
  id: string;
  perfilId: string;
  nome: string;
  tipo: TipoConta;
  saldoInicial: number;
};
