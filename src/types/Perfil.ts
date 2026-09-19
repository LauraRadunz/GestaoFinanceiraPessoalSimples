export type TipoPerfil = 'principal' | 'secundario';

export type Perfil = {
  id: string;
  nome: string;
  tipo: TipoPerfil;
  donoId: string; 
  membros: string[];
  nomesMembros: Record<string, string>; 
};
