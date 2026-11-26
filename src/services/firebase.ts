import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAuth, getAuth, browserLocalPersistence } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAYHsPZmOdm9JMW2jCISZ6--TpT_J40zjk",
  authDomain: "trabalhofinancas-ab159.firebaseapp.com",
  projectId: "trabalhofinancas-ab159",
  storageBucket: "trabalhofinancas-ab159.firebasestorage.app",
  messagingSenderId: "1082154569235",
  appId: "1:1082154569235:web:8bc57262f4f05fa83df9e6",
  measurementId: "G-Y9BPQ6VF92"
};

export const app = initializeApp(firebaseConfig);

// Cache local persistente: o onSnapshot responde na hora com o que já
// tinha salvo (mesmo antes do servidor confirmar, e mesmo offline), em
// vez de esperar um round-trip de rede a cada reload. persistentMultipleTabManager
// é o que permite testar duas contas ao mesmo tempo em abas normais
// diferentes do mesmo navegador sem uma travar a sincronização da outra
// (aba anônima já é isolada por padrão, não precisa disso pra ela).
//
// ignoreUndefinedProperties igual o do professor, sem isso meta sem prazo dava erro
// com isso o campo vazio so nao é salvo
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// No navegador (Expo Web), o getAuth() padrão às vezes não consegue
// decidir sozinho qual mecanismo de persistência usar, e o
// onAuthStateChanged nunca chama de volta — a tela de carregamento fica
// travada para sempre. Por isso, na web, inicializamos explicitamente com
// browserLocalPersistence (guarda a sessão no localStorage do navegador).
// No celular (Android/iOS), usamos o getAuth padrão normalmente.
// Se mesmo assim initializeAuth falhar (ex.: já foi chamado antes por
// causa de Fast Refresh), caímos de volta para getAuth() puro.
function inicializarAuth() {
  if (Platform.OS !== 'web') {
    return getAuth(app);
  }
  try {
    return initializeAuth(app, { persistence: browserLocalPersistence });
  } catch (erro) {
    console.warn('[Auth] initializeAuth falhou, usando getAuth() padrão:', erro);
    return getAuth(app);
  }
}

export const auth = inicializarAuth();
