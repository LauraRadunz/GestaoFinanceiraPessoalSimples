export type TipoPerfil = 'principal' | 'secundario';

export type Perfil = {
  id: string;
  nome: string;
  tipo: TipoPerfil;
<<<<<<< HEAD
  donoId: string; 
  membros: string[]; 
=======
  donoId: string; // quem criou o perfil (só o dono pode convidar/remover gente e excluir o perfil)
  membros: string[]; // usuarioIds com acesso; no perfil principal é sempre só [donoId]
>>>>>>> dccad0bf6c13c0cc0f1ea7700258fb83db96d2fc
  nomesMembros: Record<string, string>; // usuarioId -> nome (ou e-mail) de exibição, pra mostrar "Fulano deve R$50" em vez de um id
};
