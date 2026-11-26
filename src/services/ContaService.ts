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
import { Conta } from '../types/Conta';

const COLECAO = 'contas';

// o professor usa getDocs que busca uma vez so, a gente usa onSnapshot que fica escutando
// e atualiza sozinho quando muda alguma coisa
export function escutarContas(perfilId: string, callback: (contas: Conta[]) => void): Unsubscribe {
  const q = query(collection(db, COLECAO), where('perfilId', '==', perfilId));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conta));
      callback(lista);
    },
    (erro) => {
      console.error('[ContaService] Erro ao escutar contas:', erro);
      callback([]);
    }
  );
}

export async function adicionarConta(dados: Omit<Conta, 'id'>): Promise<Conta> {
  const ref = await addDoc(collection(db, COLECAO), dados);
  return { id: ref.id, ...dados };
}

export async function atualizarConta(id: string, dados: Partial<Omit<Conta, 'id' | 'perfilId'>>): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await updateDoc(ref, dados);
}

export async function removerConta(id: string): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await deleteDoc(ref);
}
