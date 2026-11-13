import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Lancamento } from '../types/Lancamento';

const COLECAO = 'lancamentos';

export async function listarLancamentos(): Promise<Lancamento[]> {
  const snapshot = await getDocs(collection(db, COLECAO));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lancamento));
}

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

export async function atualizarLancamento(id: string, dados: Partial<Omit<Lancamento, 'id'>>): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await updateDoc(ref, dados);
}

export async function removerLancamento(id: string): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await deleteDoc(ref);
}
