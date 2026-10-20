import { Conta } from '../types/Conta';
<<<<<<< HEAD
import { Lancamento } from '../types/Lancamento';
import { mesAtual } from './formato';


export function calcularSaldoConta(conta: Conta, lancamentos: Lancamento[]): number {
  let saldo = conta.saldoInicial;
  for (const l of lancamentos) {
    if (l.contaId !== conta.id) continue;
    saldo += l.tipo === 'receita' ? l.valor : -l.valor;
  }
  return saldo;
}

export function calcularSaldoTotal(contas: Conta[], lancamentos: Lancamento[]): number {
  return contas.reduce((soma, conta) => soma + calcularSaldoConta(conta, lancamentos), 0);
}

export type ResumoMes = {
  receitas: number;
  despesas: number;
  saldo: number;
};

/** Resumo de receitas/despesas de um mês específico */
export function calcularResumoMes(lancamentos: Lancamento[], mes: string = mesAtual()): ResumoMes {
  let receitas = 0;
  let despesas = 0;

  for (const l of lancamentos) {
    if (!l.data.startsWith(mes)) continue;
    if (l.tipo === 'receita') receitas += l.valor;
    else despesas += l.valor;
  }

  return { receitas, despesas, saldo: receitas - despesas };
=======

export function calcularSaldoConta(conta: Conta): number {
  return conta.saldoInicial;
}

export function calcularSaldoTotal(contas: Conta[]): number {
  return contas.reduce((soma, conta) => soma + calcularSaldoConta(conta), 0);
>>>>>>> dccad0bf6c13c0cc0f1ea7700258fb83db96d2fc
}
