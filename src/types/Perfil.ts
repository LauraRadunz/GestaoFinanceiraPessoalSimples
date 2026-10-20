export type TipoPerfil = 'principal' | 'secundario';

export type Perfil = {
  id: string;
  nome: string;
  tipo: TipoPerfil;
  donoId: string; 
  membros: string[]; 
  nomesMembros: Record<string, string>; // usuarioId -> nome (ou e-mail) de exibição, pra mostrar "Fulano deve R$50" em vez de um id
};
