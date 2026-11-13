// Transferencia também não guarda perfilId: o perfil é descoberto a
// partir da conta de origem (contaOrigemId), só existem transferências
// dentro do perfil principal, já que só ele tem contas.
export type Transferencia = {
  id: string;
  contaOrigemId: string;
  contaDestinoId: string;
  valor: number;
  data: string; // ISO
  descricao?: string;
};
