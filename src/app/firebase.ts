import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nnccampaignplatformproduction.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sales-online-e8186",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nnccampaignplatformproduction.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "659401525984",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:659401525984:web:87d54441766c4a051cde85",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
