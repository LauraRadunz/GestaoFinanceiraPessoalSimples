// Meta pertence a um PERFIL, do mesmo jeito que Conta e Categoria.
export type Meta = {
  id: string;
  perfilId: string;
  nome: string;
  valorAlvo: number;
  prazo?: string; // ISO, opcional
  contaId?: string; // conta vinculada para acompanhar progresso automaticamente
};
