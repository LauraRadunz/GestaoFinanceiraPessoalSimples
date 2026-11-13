// Orcamento também não guarda perfilId: o dono é a categoria
// (categoriaId), mesmo padrão de Lancamento.
export type Orcamento = {
  id: string;
  categoriaId: string;
  mes: string; // formato "AAAA-MM"
  valorPlanejado: number;
};
