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
