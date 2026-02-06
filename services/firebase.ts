
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCUBVpn5pTNTo0x5qQev6_ZKTx8R9f-UqE",
  authDomain: "ejc-sfc.firebaseapp.com",
  projectId: "ejc-sfc",
  storageBucket: "ejc-sfc.firebasestorage.app",
  messagingSenderId: "327159078703",
  appId: "1:327159078703:web:e296a8258aafec530a0bda",
};

export const isConfigured = !!(firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes("COLE_AQUI"));

let db: any = null;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase inicializado.");
  } catch (error) {
    console.error("Falha Firebase:", error);
  }
}

export { db };
