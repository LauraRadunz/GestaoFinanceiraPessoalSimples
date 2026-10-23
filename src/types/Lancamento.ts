import { TipoCategoria } from './Categoria';

export type Lancamento = {
  id: string;
  tipo: TipoCategoria;
  contaId?: string;
  categoriaId: string;
  valor: number;
  data: string;
  descricao?: string;
  pagadorId?: string;
};
