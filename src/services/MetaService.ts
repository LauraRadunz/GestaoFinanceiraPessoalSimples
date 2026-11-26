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
} from 'firebase/firestore';
import { db } from './firebase';
import { Meta } from '../types/Meta';

const COLECAO = 'metas';

export function escutarMetas(perfilId: string, callback: (metas: Meta[]) => void): Unsubscribe {
  const q = query(collection(db, COLECAO), where('perfilId', '==', perfilId));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Meta));
      callback(lista);
    },
    (erro) => {
      // Sem isso, um erro do Firestore travava a tela girando para sempre
      // em silêncio, agora aparece no console (F12) e a lista volta
      // vazia em vez de ficar esperando para sempre. É omesmo erro q tava dando na conta service
      console.error('[MetaService] Erro ao escutar metas:', erro);
      callback([]);
    }
  );
}

export async function adicionarMeta(dados: Omit<Meta, 'id'>): Promise<Meta> {
  const ref = await addDoc(collection(db, COLECAO), dados);
  return { id: ref.id, ...dados };
}

export async function atualizarMeta(id: string, dados: Partial<Omit<Meta, 'id' | 'perfilId'>>): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await updateDoc(ref, dados);
}

export async function removerMeta(id: string): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await deleteDoc(ref);
}
