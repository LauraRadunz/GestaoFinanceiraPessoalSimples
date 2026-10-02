export type StatusConvite = 'pendente' | 'aceito' | 'recusado';

// Convite para participar de um perfil secundário (ex.: dividir as contas
// da "Casa"). Guardamos perfilNome/deUsuarioNome copiados no próprio
// convite para a tela de "convites pendentes" não precisar buscar o
// perfil e o usuário inteiros só para mostrar dois nomes.
export type Convite = {
  id: string;
  perfilId: string;
  perfilNome: string;
  deUsuarioId: string;
  deUsuarioNome: string;
  paraEmail: string; // sempre em minúsculas
  status: StatusConvite;
  criadoEm: string; // ISO
};
