import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export async function cadastrarUsuario(nome: string, email: string, senha: string): Promise<User> {
  const credencial = await createUserWithEmailAndPassword(auth, email, senha);
  if (nome.trim()) {
    await updateProfile(credencial.user, { displayName: nome });
  }

  return credencial.user;
}

export async function entrarUsuario(email: string, senha: string): Promise<User> {
  const credencial = await signInWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}

export async function sairUsuario(): Promise<void> {
  await signOut(auth);
}

/** Chama o callback sempre que o estado de login mudar (login, logout, app abrindo). */
export function observarUsuario(callback: (usuario: User | null) => void) {
  console.log('[Auth] Iniciando escuta de autenticação...');
  return onAuthStateChanged(
    auth,
    (u) => {
      console.log('[Auth] Resposta recebida. Usuário:', u ? u.email : 'nenhum (deslogado)');
      callback(u);
    },
    (erro) => {
      console.error('[Auth] Erro no listener de autenticação:', erro);
    }
  );
}

/** Traduz os códigos de erro mais comuns do Firebase Auth para mensagens em português. */
export function traduzirErroAuth(erro: unknown): string {
  const codigo = (erro as { code?: string })?.code ?? '';
  const mapa: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  };
  return mapa[codigo] ?? 'Ocorreu um erro. Tente novamente.';
}
