export type StatusConvite = 'pendente' | 'aceito' | 'recusado';

export type Convite = {
  id: string;
  perfilId: string;
  perfilNome: string;
  deUsuarioId: string;
  deUsuarioNome: string;
  paraEmail: string; 
  status: StatusConvite;
  criadoEm: string; 
};
