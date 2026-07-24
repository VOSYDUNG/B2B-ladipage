import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseClient {
  app: FirebaseApp;
  db: Firestore;
}

let singleton: FirebaseClient | null | undefined;

function readFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  };
}

export function getFirebaseClient(): FirebaseClient | null {
  if (singleton !== undefined) return singleton;

  const config = readFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.appId) {
    singleton = null;
    return singleton;
  }

  const app = getApps()[0] ?? initializeApp(config);
  singleton = { app, db: getFirestore(app) };
  return singleton;
}
