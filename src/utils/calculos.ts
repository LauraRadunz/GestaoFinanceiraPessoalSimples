import { Conta } from '../types/Conta';
import { Lancamento } from '../types/Lancamento';
import { Transferencia } from '../types/Transferencia';
import { mesAtual } from './formato';

export function calcularSaldoConta(conta: Conta, lancamentos: Lancamento[], transferencias: Transferencia[]): number {
  let saldo = conta.saldoInicial;

  for (const l of lancamentos) {
    if (l.contaId !== conta.id) continue;
    saldo += l.tipo === 'receita' ? l.valor : -l.valor;
  }

  for (const t of transferencias) {
    if (t.contaOrigemId === conta.id) saldo -= t.valor;
    if (t.contaDestinoId === conta.id) saldo += t.valor;
  }

  return saldo;
}

export function calcularSaldoTotal(contas: Conta[], lancamentos: Lancamento[], transferencias: Transferencia[]): number {
  return contas.reduce((soma, conta) => soma + calcularSaldoConta(conta, lancamentos, transferencias), 0);
}

export type ResumoMes = {
  receitas: number;
  despesas: number;
  saldo: number;
};

export function calcularResumoMes(lancamentos: Lancamento[], mes: string = mesAtual()): ResumoMes {
  let receitas = 0;
  let despesas = 0;

  for (const l of lancamentos) {
    if (!l.data.startsWith(mes)) continue;
    if (l.tipo === 'receita') receitas += l.valor;
    else despesas += l.valor;
  }

  return { receitas, despesas, saldo: receitas - despesas };
}

export function calcularProgressoMeta(valorAlvo: number, valorAtual: number): number {
  if (valorAlvo <= 0) return 0;
  return Math.min(valorAtual / valorAlvo, 1);
}
