export type TipoPerfil = 'principal' | 'secundario';

// Todo usuário tem, desde o cadastro, um perfil "principal" (só ele, não
// compartilhável, onde ficam as contas de dinheiro e a renda). Perfis
// "secundarios" são criados à parte (ex.: "Casa") para registrar GASTOS
// compartilhados — não têm contas próprias; cada gasto lançado neles pode
// apontar para uma conta do perfil principal de quem pagou, e o total é
// dividido igualmente entre os membros (veja calcularDivisaoDeGastos em
// utils/calculos.ts).
export type Perfil = {
  id: string;
  nome: string;
  tipo: TipoPerfil;
  donoId: string; // quem criou o perfil (só o dono pode convidar/remover gente e excluir o perfil)
  membros: string[]; // usuarioIds com acesso; no perfil principal é sempre só [donoId]
  nomesMembros: Record<string, string>; // usuarioId -> nome (ou e-mail) de exibição, pra mostrar "Fulano deve R$50" em vez de um id
};
