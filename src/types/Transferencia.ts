
export type Transferencia = {
  id: string;
  contaOrigemId: string;
  contaDestinoId: string;
  valor: number;
  data: string; // ISO
  descricao?: string;
};
