import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Convite } from '../types/Convite';
import { adicionarMembro } from './PerfilService';

const COLECAO = 'convites';

type DadosNovoConvite = {
  perfilId: string;
  perfilNome: string;
  deUsuarioId: string;
  deUsuarioNome: string;
  paraEmail: string;
};

// o convite vai pelo email porque a pessoa pode nem ter conta ainda
// quando ela logar com esse email o convite aparece no painel dela
export async function convidarParaPerfil(dados: DadosNovoConvite): Promise<Convite> {
  const registro: Omit<Convite, 'id'> = {
    perfilId: dados.perfilId,
    perfilNome: dados.perfilNome,
    deUsuarioId: dados.deUsuarioId,
    deUsuarioNome: dados.deUsuarioNome || 'Alguém',
    paraEmail: dados.paraEmail.trim().toLowerCase(), // minusculo pra bater com o email do login
    status: 'pendente',
    criadoEm: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLECAO), registro);
  return { id: ref.id, ...registro };
}

// dois where juntos, tem que bater os dois
export function escutarConvitesPendentes(email: string, callback: (convites: Convite[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLECAO),
    where('paraEmail', '==', email.trim().toLowerCase()),
    where('status', '==', 'pendente')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Convite)));
    },
    (erro) => {
      console.error('[ConviteService] Erro ao escutar convites:', erro);
      callback([]);
    }
  );
}

// aceitar é entrar nos membros do perfil e marcar o convite como aceito
export async function aceitarConvite(convite: Convite, usuarioId: string, nomeExibicao?: string): Promise<void> {
  await adicionarMembro(convite.perfilId, usuarioId, nomeExibicao);
  await updateDoc(doc(db, COLECAO, convite.id), { status: 'aceito' });
}

export async function recusarConvite(convite: Convite): Promise<void> {
  await updateDoc(doc(db, COLECAO, convite.id), { status: 'recusado' });
}
