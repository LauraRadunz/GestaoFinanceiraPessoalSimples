import { collection, doc, query, where, onSnapshot, writeBatch, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { Repasse } from '../types/Repasse';
import { incluirLancamentoNoLote } from './LancamentoService';
import { incluirCategoriaRepasseNoLote } from './CategoriaService';

const COLECAO = 'repasses';

type DadosNovoRepasse = {
  perfilId: string;
  perfilNome: string;
  deUsuarioId: string;
  deUsuarioNome: string;
  paraUsuarioId: string;
  paraUsuarioNome: string;
  deContaId: string;
  valor: number;
  data: string; // AAAA-MM-DD — data da despesa lançada no perfil de quem envia
};

// enviar repasse grava 3 coisas: a categoria, a despesa e o repasse
// com o writeBatch vai tudo junto, ou grava tudo ou nao grava nada
// antes era separado e se uma falhasse ficava despesa sem repasse
export async function enviarRepasse(dados: DadosNovoRepasse): Promise<Repasse> {
  const lote = writeBatch(db);

  const categoriaId = incluirCategoriaRepasseNoLote(lote, dados.deUsuarioId, 'despesa');
  const lancamentoDespesaId = incluirLancamentoNoLote(lote, {
    tipo: 'despesa',
    contaId: dados.deContaId,
    categoriaId,
    valor: dados.valor,
    data: dados.data,
    descricao: `Repasse para ${dados.paraUsuarioNome} (${dados.perfilNome})`,
  });

  const registro: Omit<Repasse, 'id'> = {
    perfilId: dados.perfilId,
    perfilNome: dados.perfilNome,
    deUsuarioId: dados.deUsuarioId,
    deUsuarioNome: dados.deUsuarioNome || 'Alguém',
    paraUsuarioId: dados.paraUsuarioId,
    paraUsuarioNome: dados.paraUsuarioNome || 'Alguém',
    deContaId: dados.deContaId,
    valor: dados.valor,
    status: 'pendente',
    criadoEm: new Date().toISOString(),
    lancamentoDespesaId, // ja tem o id entao salva junto
  };
  const ref = doc(collection(db, COLECAO));
  lote.set(ref, registro);

  await lote.commit();
  return { id: ref.id, ...registro };
}

// caixinha do painel, repasses que mandaram pra mim e ainda nao confirmei
export function escutarRepassesPendentesPara(usuarioId: string, callback: (repasses: Repasse[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLECAO),
    where('paraUsuarioId', '==', usuarioId),
    where('status', '==', 'pendente')
  );
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Repasse))),
    (erro) => {
      console.error('[RepasseService] Erro ao escutar repasses pendentes:', erro);
      callback([]);
    }
  );
}

// repasses do perfil, usa pra tirar da divisao o que ja foi pago
export function escutarRepassesDoPerfil(perfilId: string, callback: (repasses: Repasse[]) => void): Unsubscribe {
  const q = query(collection(db, COLECAO), where('perfilId', '==', perfilId));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Repasse))),
    (erro) => {
      console.error('[RepasseService] Erro ao escutar repasses do perfil:', erro);
      callback([]);
    }
  );
}

// mesma ideia do enviar, a receita e o status vao juntos
export async function receberRepasse(repasse: Repasse, contaDestinoId: string, data: string): Promise<void> {
  const lote = writeBatch(db);

  const categoriaId = incluirCategoriaRepasseNoLote(lote, repasse.paraUsuarioId, 'receita');
  const lancamentoReceitaId = incluirLancamentoNoLote(lote, {
    tipo: 'receita',
    contaId: contaDestinoId,
    categoriaId,
    valor: repasse.valor,
    data,
    descricao: `Recebido de ${repasse.deUsuarioNome} (${repasse.perfilNome})`,
  });

  lote.update(doc(db, COLECAO, repasse.id), {
    status: 'recebido',
    contaDestinoId,
    recebidoEm: new Date().toISOString(),
    lancamentoReceitaId,
  });

  await lote.commit();
}
