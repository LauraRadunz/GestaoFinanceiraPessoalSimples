import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { Categoria } from '../types/Categoria';

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
