export type StatusRepasse = 'pendente' | 'recebido';

export type Repasse = {
  id: string;
  perfilId: string; // perfil secundário (ex. "Casa") em que a divisão foi calculada
  perfilNome: string; // copiado no momento do envio, pra descrição do lançamento
  deUsuarioId: string;
  deUsuarioNome: string; // copiado no momento do envio (mesmo padrão do Convite)
  paraUsuarioId: string;
  paraUsuarioNome: string; // copiado no momento do envio
  deContaId: string; // conta de origem, no perfil principal de quem enviou
  contaDestinoId?: string; // preenchido só quando a pessoa "abre a caixinha"
  valor: number;
  status: StatusRepasse;
  criadoEm: string; // ISO
  recebidoEm?: string; // ISO
  lancamentoDespesaId?: string; // despesa lançada no perfil principal de quem enviou
  lancamentoReceitaId?: string; // receita lançada no perfil principal de quem recebeu
};
