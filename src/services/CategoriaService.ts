import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Categoria, TipoCategoria } from '../types/Categoria';

const COLECAO = 'categorias';

export async function listarCategorias(perfilId: string): Promise<Categoria[]> {
  const q = query(collection(db, COLECAO), where('perfilId', '==', perfilId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Categoria));
}

export function escutarCategorias(perfilId: string, callback: (categorias: Categoria[]) => void): Unsubscribe {
  const q = query(collection(db, COLECAO), where('perfilId', '==', perfilId));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Categoria));
      callback(lista);
    },
    (erro) => {
      // Como tava dando errro tivemos q adicionar isso
      // Sem isso, um erro do Firestore travava a tela girando para sempre
      // em silêncio, agora aparece no console (F12) e a lista volta
      // vazia em vez de ficar esperando para sempre.
      console.error('[CategoriaService] Erro ao escutar categorias:', erro);
      callback([]);
    }
  );
}

export async function adicionarCategoria(dados: Omit<Categoria, 'id'>): Promise<Categoria> {
  const ref = await addDoc(collection(db, COLECAO), dados);
  return { id: ref.id, ...dados };
}

export async function atualizarCategoria(id: string, dados: Partial<Omit<Categoria, 'id' | 'perfilId'>>): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await updateDoc(ref, dados);
}

export async function removerCategoria(id: string): Promise<void> {
  const ref = doc(db, COLECAO, id);
  await deleteDoc(ref);
}

export function garantirCategoriaRepasse(usuarioId: string, tipo: TipoCategoria): string {
  const id = `repasse-${tipo}-${usuarioId}`;
  const ref = doc(db, COLECAO, id);
  setDoc(
    ref,
    {
      perfilId: usuarioId,
      nome: tipo === 'despesa' ? 'Repasses enviados' : 'Repasses recebidos',
      tipo,
      grupo: 'Divisão de gastos',
    },
    { merge: true }
  ).catch((erro) => {
    console.error('[CategoriaService] Falha ao garantir categoria de repasse:', erro);
  });
  return id;
}
