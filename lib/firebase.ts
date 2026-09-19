import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgorM5kEgInnlXLNqsy1logbZioXxi194",
  authDomain: "student-9c986.firebaseapp.com",
  projectId: "student-9c986",
  storageBucket: "student-9c986.firebasestorage.app",
  messagingSenderId: "776620693558",
  appId: "1:776620693558:web:467345a727af944d00e097",
  measurementId: "G-6HBZCSN5W7",
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export { isFirebaseConfigured };