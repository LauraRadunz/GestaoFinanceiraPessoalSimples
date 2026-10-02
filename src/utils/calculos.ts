import { Conta } from '../types/Conta';

/**
 * Nesta etapa ainda não existem lançamentos nem transferências — o saldo
 * de uma conta é simplesmente o saldo inicial informado no cadastro. As
 * próximas semanas vão estender esta função para somar/subtrair
 * lançamentos (Semana 5) e transferências (Semana 6).
 */
export function calcularSaldoConta(conta: Conta): number {
  return conta.saldoInicial;
}

export function calcularSaldoTotal(contas: Conta[]): number {
  return contas.reduce((soma, conta) => soma + calcularSaldoConta(conta), 0);
}
