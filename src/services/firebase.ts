import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAuth, getAuth, browserLocalPersistence } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyDLw7P8f5zGglFzc_a4czpdNJ-d0UeUOAE',
  authDomain: 'trabalhofinancas-dcea8.firebaseapp.com',
  projectId: 'trabalhofinancas-dcea8',
  storageBucket: 'trabalhofinancas-dcea8.firebasestorage.app',
  messagingSenderId: '1030994551857',
  appId: '1:1030994551857:web:5f1a6bcc969e608755e110',
  measurementId: 'G-5Z50W583Q1',
};

export const app = initializeApp(firebaseConfig);

// Cache local persistente: o onSnapshot responde na hora com o que já
// tinha salvo (mesmo antes do servidor confirmar, e mesmo offline), em
// vez de esperar um round-trip de rede a cada reload. persistentMultipleTabManager
// é o que permite testar duas contas ao mesmo tempo em abas normais
// diferentes do mesmo navegador sem uma travar a sincronização da outra
// (aba anônima já é isolada por padrão, não precisa disso pra ela).
export const db = initializeFirestore(app, {
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
  console.log('[Auth] Plataforma detectada:', Platform.OS);
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
