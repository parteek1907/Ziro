import { initializeApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyABqQBCqzHscsuPDDNTfHZV9BHQlJqbiMI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ziro-webb.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ziro-webb",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ziro-webb.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "427677138400",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:427677138400:web:bac185ebc6813b84afff85",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3Z7QP45E3C",
};

let app;
let auth: Auth | null = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
}

export { app, auth };
