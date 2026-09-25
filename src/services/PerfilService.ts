import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Perfil } from '../types/Perfil';

const COLECAO = 'perfis';


function criarPerfil(id: string, dados: Omit<Perfil, 'id'>): Perfil {
  const ref = doc(db, COLECAO, id);
  setDoc(ref, dados, { merge: true }).catch((erro) => {
    console.error('[PerfilService] Falha ao criar perfil:', erro);
  });
  return { id: ref.id, ...dados };
}


export function criarPerfilPrincipal(usuarioId: string, nomeExibicao?: string): Perfil {
  return criarPerfil(usuarioId, {
    nome: 'Pessoal',
    tipo: 'principal',
    donoId: usuarioId,
    membros: [usuarioId],
    nomesMembros: { [usuarioId]: nomeExibicao || 'Você' },
  });
}

export function criarPerfilSecundario(usuarioId: string, nome: string, nomeExibicao?: string): Perfil {
  const idAleatorio = doc(collection(db, COLECAO)).id;
  return criarPerfil(idAleatorio, {
    nome: nome.trim(),
    tipo: 'secundario',
    donoId: usuarioId,
    membros: [usuarioId],
    nomesMembros: { [usuarioId]: nomeExibicao || 'Você' },
  });
}

// Um usuário enxerga um perfil sempre que aparece na lista de "membros" —
// tanto os perfis que ele mesmo criou quanto os perfis secundários que
// outra pessoa compartilhou com ele e que ele já aceitou.
export function escutarPerfis(usuarioId: string, callback: (perfis: Perfil[]) => void): Unsubscribe {
  const q = query(collection(db, COLECAO), where('membros', 'array-contains', usuarioId));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Perfil)));
    },
    (erro) => {
      console.error('[PerfilService] Erro ao escutar perfis:', erro);
      callback([]);
    }
  );
}

export async function buscarPerfilPorId(id: string): Promise<Perfil | undefined> {
  const snapshot = await getDoc(doc(db, COLECAO, id));
  if (!snapshot.exists()) return undefined;
  return { id: snapshot.id, ...snapshot.data() } as Perfil;
}

export function renomearPerfil(id: string, nome: string): void {
  updateDoc(doc(db, COLECAO, id), { nome: nome.trim() }).catch((erro) => {
    console.error('[PerfilService] Falha ao renomear perfil:', erro);
  });
}

export function removerPerfil(id: string): void {
  deleteDoc(doc(db, COLECAO, id)).catch((erro) => {
    console.error('[PerfilService] Falha ao remover perfil:', erro);
  });
}

export function adicionarMembro(perfilId: string, usuarioId: string, nomeExibicao?: string): void {
  updateDoc(doc(db, COLECAO, perfilId), {
    membros: arrayUnion(usuarioId),
    [`nomesMembros.${usuarioId}`]: nomeExibicao || 'Alguém',
  }).catch((erro) => {
    console.error('[PerfilService] Falha ao adicionar membro:', erro);
  });
}

export function removerMembro(perfilId: string, usuarioId: string): void {
  updateDoc(doc(db, COLECAO, perfilId), { membros: arrayRemove(usuarioId) }).catch((erro) => {
    console.error('[PerfilService] Falha ao remover membro:', erro);
  });
}
