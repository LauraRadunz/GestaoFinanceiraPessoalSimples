import {
  collection,
  doc,
  setDoc,
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

export function convidarParaPerfil(dados: DadosNovoConvite, aoFalhar?: (erro: unknown) => void): Convite {
  const registro: Omit<Convite, 'id'> = {
    perfilId: dados.perfilId,
    perfilNome: dados.perfilNome,
    deUsuarioId: dados.deUsuarioId,
    deUsuarioNome: dados.deUsuarioNome || 'Alguém',
    paraEmail: dados.paraEmail.trim().toLowerCase(),
    status: 'pendente',
    criadoEm: new Date().toISOString(),
  };
  const ref = doc(collection(db, COLECAO));
  setDoc(ref, registro).catch((erro) => {
    console.error('[ConviteService] Falha ao enviar convite:', erro);
    aoFalhar?.(erro);
  });
  return { id: ref.id, ...registro };
}

// Convites pendentes para o e-mail da pessoa logada — é assim que ela
// "recebe uma solicitação para aceitar" ao fazer login (veja TelaInicio).
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

export function aceitarConvite(convite: Convite, usuarioId: string, nomeExibicao?: string): void {

  adicionarMembro(convite.perfilId, usuarioId, nomeExibicao);
  updateDoc(doc(db, COLECAO, convite.id), { status: 'aceito' }).catch((erro) => {
    console.error('[ConviteService] Falha ao aceitar convite:', erro);
  });
}

export function recusarConvite(convite: Convite): void {
  updateDoc(doc(db, COLECAO, convite.id), { status: 'recusado' }).catch((erro) => {
    console.error('[ConviteService] Falha ao recusar convite:', erro);
  });
}
