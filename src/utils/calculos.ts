import { Conta } from '../types/Conta';
import { Lancamento } from '../types/Lancamento';
import { Transferencia } from '../types/Transferencia';
import { Orcamento } from '../types/Orcamento';
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

export function calcularRealizadoPorCategoria(lancamentos: Lancamento[], categoriaId: string, mes: string): number {
  return lancamentos
    .filter((l) => l.categoriaId === categoriaId && l.tipo === 'despesa' && l.data.startsWith(mes))
    .reduce((soma, l) => soma + l.valor, 0);
}


export function calcularComparativoOrcamento(
  orcamento: Orcamento,
  lancamentos: Lancamento[]
): { planejado: number; realizado: number; diferenca: number } {
  const realizado = calcularRealizadoPorCategoria(lancamentos, orcamento.categoriaId, orcamento.mes);
  return { planejado: orcamento.valorPlanejado, realizado, diferenca: orcamento.valorPlanejado - realizado };
}

export function calcularProgressoMeta(valorAlvo: number, valorAtual: number): number {
  if (valorAlvo <= 0) return 0;
  return Math.min(valorAtual / valorAlvo, 1);
}

export type SaldoMembro = {
  usuarioId: string;
  pago: number; 
  cota: number; 
  saldo: number;
};


export function calcularDivisaoDeGastos(lancamentos: Lancamento[], membros: string[]): SaldoMembro[] {
  const despesas = lancamentos.filter((l) => l.tipo === 'despesa');
  const total = despesas.reduce((soma, l) => soma + l.valor, 0);
  const cota = membros.length > 0 ? total / membros.length : 0;

  return membros.map((usuarioId) => {
    const pago = despesas
      .filter((l) => l.pagadorId === usuarioId)
      .reduce((soma, l) => soma + l.valor, 0);
    return { usuarioId, pago, cota, saldo: pago - cota };
  });
}

export type Acerto = { deUsuarioId: string; paraUsuarioId: string; valor: number };


export function calcularAcertos(saldos: SaldoMembro[]): Acerto[] {
  const credores = saldos
    .filter((s) => s.saldo > 0.01)
    .map((s) => ({ usuarioId: s.usuarioId, valor: s.saldo }))
    .sort((a, b) => b.valor - a.valor);
  const devedores = saldos
    .filter((s) => s.saldo < -0.01)
    .map((s) => ({ usuarioId: s.usuarioId, valor: -s.saldo }))
    .sort((a, b) => b.valor - a.valor);

  const acertos: Acerto[] = [];
  let i = 0;
  let j = 0;
  while (i < devedores.length && j < credores.length) {
    const devedor = devedores[i];
    const credor = credores[j];
    const valor = Math.min(devedor.valor, credor.valor);
    if (valor > 0.01) {
      acertos.push({ deUsuarioId: devedor.usuarioId, paraUsuarioId: credor.usuarioId, valor });
    }
    devedor.valor -= valor;
    credor.valor -= valor;
    if (devedor.valor <= 0.01) i++;
    if (credor.valor <= 0.01) j++;
  }
  return acertos;
}
