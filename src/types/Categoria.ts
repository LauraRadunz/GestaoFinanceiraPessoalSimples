export type TipoCategoria = 'receita' | 'despesa';

// Categoria pertence a um PERFIL (não ao usuário direto), do mesmo jeito
// que Conta — assim, cada perfil (Pessoal, Casa, etc.) tem seu próprio
// conjunto de categorias.
export type Categoria = {
  id: string;
  perfilId: string;
  nome: string;
  tipo: TipoCategoria;
  grupo: string; // ex: "Alimentação", "Transporte"
};
