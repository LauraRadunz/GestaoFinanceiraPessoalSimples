import { TipoCategoria } from './Categoria';


export type Lancamento = {
  id: string;
  tipo: TipoCategoria; // 'receita' | 'despesa'
  contaId?: string;
  categoriaId: string;
  valor: number;
  data: string; // formato ISO (AAAA-MM-DD)
  descricao?: string;
  pagadorId?: string;
};
