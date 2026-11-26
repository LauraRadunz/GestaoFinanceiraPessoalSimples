import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  WriteBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Lancamento } from '../types/Lancamento';

const COLECAO = 'lancamentos';

// join manual igual o do professor, lancamento nao tem perfilId
// entao a tela pega as categorias do perfil e aqui busca os lancamentos delas
// o in so aceita 30 valores, se passar da erro e some tudo, por isso o slice
export function escutarLancamentosPorCategorias(
  categoriaIds: string[],
  callback: (lancamentos: Lancamento[]) => void
): Unsubscribe {
  if (categoriaIds.length === 0) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, COLECAO), where('categoriaId', 'in', categoriaIds.slice(0, 30)));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lancamento));
      callback(lista);
    },
    (erro) => {
      console.error('[LancamentoService] Erro ao escutar lancamentos:', erro);
      callback([]);
    }
  );
}

// esse é pro saldo das contas, busca pela conta e nao pela categoria
// porque um gasto da Casa pode sair de uma conta do Pessoal
export function escutarLancamentosPorContas(
  contaIds: string[],
  callback: (lancamentos: Lancamento[]) => void
): Unsubscribe {
  if (contaIds.length === 0) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, COLECAO), where('contaId', 'in', contaIds.slice(0, 30)));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lancamento));
      callback(lista);
    },
    (erro) => {
      console.error('[LancamentoService] Erro ao escutar lancamentos por conta:', erro);
      callback([]);
    }
  );
}

export async function adicionarLancamento(dados: Omit<Lancamento, 'id'>): Promise<Lancamento> {
  const ref = await addDoc(collection(db, COLECAO), dados);
  return { id: ref.id, ...dados };
}

// mesma coisa do adicionarLancamento mas so entra no lote do repasse, nao grava na hora
export function incluirLancamentoNoLote(lote: WriteBatch, dados: Omit<Lancamento, 'id'>): string {
  const ref = doc(collection(db, COLECAO));
  lote.set(ref, dados);
  return ref.id;
}

export async function atualizarLancamento(id: string, dados: Partial<Omit<Lancamento, 'id'>>): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await updateDoc(ref, dados);
}

export async function removerLancamento(id: string): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await deleteDoc(ref);
}
