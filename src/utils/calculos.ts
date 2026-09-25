import { Conta } from '../types/Conta';


export function calcularSaldoConta(conta: Conta): number {
  return conta.saldoInicial;
}

export function calcularSaldoTotal(contas: Conta[]): number {
  return contas.reduce((soma, conta) => soma + calcularSaldoConta(conta), 0);
}
