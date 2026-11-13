import { Conta } from '../types/Conta';
import { Lancamento } from '../types/Lancamento';
import { Transferencia } from '../types/Transferencia';
import { Orcamento } from '../types/Orcamento';
import { Repasse } from '../types/Repasse';
import { mesAtual } from './formato';

/**
 * Saldo de uma conta = saldo inicial
 *   + soma das receitas na conta
 *   - soma das despesas na conta
 *   + transferências recebidas
 *   - transferências enviadas
 * (repasses entre pessoas também entram aqui automaticamente: eles geram
 * um lançamento de despesa/receita de verdade — ver RepasseService — em
 * vez de precisar de um cálculo especial só pra eles)
 */
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
}

/** Soma o valor realizado (despesas) de uma categoria em um mês */
export function calcularRealizadoPorCategoria(
  lancamentos: Lancamento[],
  categoriaId: string,
  mes: string
): number {
  return lancamentos
    .filter((l) => l.categoriaId === categoriaId && l.tipo === 'despesa' && l.data.startsWith(mes))
    .reduce((soma, l) => soma + l.valor, 0);
}

/**
 * Orçamento aqui é uma ESTIMATIVA de gasto (quanto a pessoa precisa
 * separar para pagar as contas), não uma meta a ser "batida" — por isso
 * não existe percentual de progresso: só planejado, realizado e a
 * diferença entre os dois (positiva = sobrou, negativa = passou do
 * previsto).
 */
export function calcularComparativoOrcamento(
  orcamento: Orcamento,
  lancamentos: Lancamento[]
): { planejado: number; realizado: number; diferenca: number } {
  const realizado = calcularRealizadoPorCategoria(lancamentos, orcamento.categoriaId, orcamento.mes);
  return { planejado: orcamento.valorPlanejado, realizado, diferenca: orcamento.valorPlanejado - realizado };
}

/** Progresso de uma meta com base no saldo de uma conta vinculada (se houver) */
export function calcularProgressoMeta(valorAlvo: number, valorAtual: number): number {
  if (valorAlvo <= 0) return 0;
  return Math.min(valorAtual / valorAlvo, 1);
}

export type SaldoMembro = {
  usuarioId: string;
  pago: number; // quanto essa pessoa já pagou de despesas do perfil
  cota: number; // quanto seria a parte igual de cada um (total / nº de membros)
  saldo: number; // pago - cota: positivo = tem a receber, negativo = deve
};

/**
 * Divisão de gastos de um perfil secundário compartilhado: soma todas as
 * despesas, divide igualmente entre os membros e calcula, pra cada um,
 * se pagou mais ou menos do que a sua parte.
 *
 * `repasses` são os acertos já feitos entre os membros desse perfil
 * (ver RepasseService/TelaLancamentos "Marcar como enviado"): quem
 * mandou já teve seu saldo "quitado" por aquele valor (mesmo que quem
 * recebeu ainda não tenha escolhido a conta de destino — o dinheiro já
 * saiu de verdade), e quem recebeu já não precisa mais receber aquela
 * parte. Sem isso, a dívida ficaria pra sempre marcada como pendente na
 * tela, mesmo depois de paga.
 */
export function calcularDivisaoDeGastos(
  lancamentos: Lancamento[],
  membros: string[],
  repasses: Repasse[] = []
): SaldoMembro[] {
  const despesas = lancamentos.filter((l) => l.tipo === 'despesa');
  const total = despesas.reduce((soma, l) => soma + l.valor, 0);
  const cota = membros.length > 0 ? total / membros.length : 0;

  return membros.map((usuarioId) => {
    const pago = despesas
      .filter((l) => l.pagadorId === usuarioId)
      .reduce((soma, l) => soma + l.valor, 0);
    const enviado = repasses
      .filter((r) => r.deUsuarioId === usuarioId)
      .reduce((soma, r) => soma + r.valor, 0);
    const recebido = repasses
      .filter((r) => r.paraUsuarioId === usuarioId)
      .reduce((soma, r) => soma + r.valor, 0);
    return { usuarioId, pago, cota, saldo: pago + enviado - recebido - cota };
  });
}

export type Acerto = { deUsuarioId: string; paraUsuarioId: string; valor: number };

/**
 * A partir dos saldos de cada membro (calcularDivisaoDeGastos), monta a
 * lista mínima de "fulano paga tanto pra beltrano" que zera as contas de
 * todo mundo — é o "quem deve quanto pra quem" que fecha a divisão.
 */
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
