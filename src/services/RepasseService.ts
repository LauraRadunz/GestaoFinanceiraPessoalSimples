import { collection, doc, setDoc, updateDoc, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { Repasse } from '../types/Repasse';
import { adicionarLancamento } from './LancamentoService';
import { garantirCategoriaRepasse } from './CategoriaService';

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


export function enviarRepasse(dados: DadosNovoRepasse, aoFalhar?: (erro: unknown) => void): Repasse {
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
  };
  const ref = doc(collection(db, COLECAO));

  const categoriaId = garantirCategoriaRepasse(dados.deUsuarioId, 'despesa');
  adicionarLancamento({
    tipo: 'despesa',
    contaId: dados.deContaId,
    categoriaId,
    valor: dados.valor,
    data: dados.data,
    descricao: `Repasse para ${dados.paraUsuarioNome} (${dados.perfilNome})`,
  })
    .then((lancamento) => {
      updateDoc(ref, { lancamentoDespesaId: lancamento.id }).catch(() => {});
    })
    .catch((erro) => {
      console.error('[RepasseService] Falha ao lançar a despesa do repasse:', erro);
      aoFalhar?.(erro);
    });

  setDoc(ref, registro).catch((erro) => {
    console.error('[RepasseService] Falha ao enviar repasse:', erro);
    aoFalhar?.(erro);
  });
  return { id: ref.id, ...registro };
}

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

export function receberRepasse(repasse: Repasse, contaDestinoId: string, data: string): void {
  const categoriaId = garantirCategoriaRepasse(repasse.paraUsuarioId, 'receita');
  adicionarLancamento({
    tipo: 'receita',
    contaId: contaDestinoId,
    categoriaId,
    valor: repasse.valor,
    data,
    descricao: `Recebido de ${repasse.deUsuarioNome} (${repasse.perfilNome})`,
  })
    .then((lancamento) => {
      updateDoc(doc(db, COLECAO, repasse.id), {
        status: 'recebido',
        contaDestinoId,
        recebidoEm: new Date().toISOString(),
        lancamentoReceitaId: lancamento.id,
      }).catch((erro) => console.error('[RepasseService] Falha ao confirmar recebimento:', erro));
    })
    .catch((erro) => {
      console.error('[RepasseService] Falha ao lançar a receita do repasse:', erro);
    });
}