import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
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

export async function listarContas(perfilId: string): Promise<Conta[]> {
  const q = query(collection(db, COLECAO), where('perfilId', '==', perfilId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conta));
}

/**
 * "Escuta" a coleção de contas em tempo real: chama o callback assim que
 * conecta (com os dados atuais) e de novo automaticamente sempre que algo
 * mudar no Firestore — sem precisar recarregar manualmente depois de
 * salvar/editar/excluir. Retorna uma função para cancelar a escuta
 * (chamada no "cleanup" do useEffect da tela).
 */
export function escutarContas(perfilId: string, callback: (contas: Conta[]) => void): Unsubscribe {
  const q = query(collection(db, COLECAO), where('perfilId', '==', perfilId));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conta));
      callback(lista);
    },
    (erro) => {
      // Sem isso, um erro do Firestore travava a tela girando para sempre
      // em silêncio — agora aparece no console (F12) e a lista volta
      // vazia em vez de ficar esperando para sempre.
      console.error('[ContaService] Erro ao escutar contas:', erro);
      callback([]);
    }
  );
}

export async function buscarContaPorId(id: string): Promise<Conta | undefined> {
  const ref = doc(db, COLECAO, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return undefined;
  return { id: snapshot.id, ...snapshot.data() } as Conta;
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
