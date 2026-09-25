import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAuth, getAuth, browserLocalPersistence } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBmuukHVrpdvImtlZ-Muh_Mfeez3Y_E5bE",
  authDomain: "trabalhofinancas-fc131.firebaseapp.com",
  projectId: "trabalhofinancas-fc131",
  storageBucket: "trabalhofinancas-fc131.firebasestorage.app",
  messagingSenderId: "27695715847",
  appId: "1:27695715847:web:a7a33e0bcf5c36e8713ca2"
  };

export const app = initializeApp(firebaseConfig);


export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});


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
