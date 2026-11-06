import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Orcamento } from '../types/Orcamento';

const COLECAO = 'orcamentos';

export async function listarOrcamentos(): Promise<Orcamento[]> {
  const snapshot = await getDocs(collection(db, COLECAO));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Orcamento));
}


export function escutarOrcamentosPorCategorias(
  categoriaIds: string[],
  callback: (orcamentos: Orcamento[]) => void
): Unsubscribe {
  if (categoriaIds.length === 0) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, COLECAO), where('categoriaId', 'in', categoriaIds.slice(0, 30)));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Orcamento));
      callback(lista);
    },
    (erro) => {
      console.error('[OrcamentoService] Erro ao escutar orcamentos:', erro);
      callback([]);
    }
  );
}

export async function adicionarOrcamento(dados: Omit<Orcamento, 'id'>): Promise<Orcamento> {
  const ref = await addDoc(collection(db, COLECAO), dados);
  return { id: ref.id, ...dados };
}

export async function removerOrcamento(id: string): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await deleteDoc(ref);
}
