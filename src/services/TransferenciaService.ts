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
import { Transferencia } from '../types/Transferencia';

const COLECAO = 'transferencias';

export async function listarTransferencias(): Promise<Transferencia[]> {
  const snapshot = await getDocs(collection(db, COLECAO));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transferencia));
}

export function escutarTransferenciasPorContas(
  contaIds: string[],
  callback: (transferencias: Transferencia[]) => void
): Unsubscribe {
  if (contaIds.length === 0) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, COLECAO), where('contaOrigemId', 'in', contaIds.slice(0, 30)));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transferencia));
      callback(lista);
    },
    (erro) => {
      console.error('[TransferenciaService] Erro ao escutar transferencias:', erro);
      callback([]);
    }
  );
}

export async function adicionarTransferencia(dados: Omit<Transferencia, 'id'>): Promise<Transferencia> {
  const ref = await addDoc(collection(db, COLECAO), dados);
  return { id: ref.id, ...dados };
}

export async function removerTransferencia(id: string): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await deleteDoc(ref);
}
