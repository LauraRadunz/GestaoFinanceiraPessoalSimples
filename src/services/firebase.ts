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
