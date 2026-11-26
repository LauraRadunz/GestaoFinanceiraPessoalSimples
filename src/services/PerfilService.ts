import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Perfil } from '../types/Perfil';

const COLECAO = 'perfis';

// setDoc em vez de addDoc porque a gente escolhe o id
// com o merge, se rodar de novo so atualiza o mesmo documento
async function criarPerfil(id: string, dados: Omit<Perfil, 'id'>): Promise<Perfil> {
  const ref = doc(db, COLECAO, id);
  await setDoc(ref, dados, { merge: true });
  return { id: ref.id, ...dados };
}

// o id do Pessoal é o uid do usuario, por isso nunca duplica
export async function criarPerfilPrincipal(usuarioId: string, nomeExibicao?: string): Promise<Perfil> {
  return criarPerfil(usuarioId, {
    nome: 'Pessoal',
    tipo: 'principal',
    donoId: usuarioId,
    membros: [usuarioId],
    nomesMembros: { [usuarioId]: nomeExibicao || 'Você' },
  });
}

// secundario pode ter varios entao o id é aleatorio, essa linha so gera o id
export async function criarPerfilSecundario(usuarioId: string, nome: string, nomeExibicao?: string): Promise<Perfil> {
  const idAleatorio = doc(collection(db, COLECAO)).id;
  return criarPerfil(idAleatorio, {
    nome: nome.trim(),
    tipo: 'secundario',
    donoId: usuarioId,
    membros: [usuarioId],
    nomesMembros: { [usuarioId]: nomeExibicao || 'Você' },
  });
}

// traz todos os perfis que o usuario é membro, o Pessoal e os compartilhados
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

export async function removerPerfil(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO, id));
}

// arrayUnion nao deixa repetir o id na lista
// e o nomesMembros com ponto atualiza so o nome dessa pessoa
export async function adicionarMembro(perfilId: string, usuarioId: string, nomeExibicao?: string): Promise<void> {
  await updateDoc(doc(db, COLECAO, perfilId), {
    membros: arrayUnion(usuarioId),
    [`nomesMembros.${usuarioId}`]: nomeExibicao || 'Alguém',
  });
}
