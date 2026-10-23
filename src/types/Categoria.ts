export type TipoCategoria = 'receita' | 'despesa';

export type Categoria = {
  id: string;
  perfilId: string;
  nome: string;
  tipo: TipoCategoria;
  grupo: string;
};
