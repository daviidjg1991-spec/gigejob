import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';
import { Capacitor } from '@capacitor/core';

const app = initializeApp(firebaseConfig);
setLogLevel('silent');
export const db = getFirestore(app);

// Use indexedDB explicitly on Capacitor iOS to prevent signIn hanging
// Firebase Auth configured with authorized domains: localhost, 127.0.0.1, firebaseapp, vercel domains
export const auth = Capacitor.isNativePlatform() 
  ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
  : getAuth(app);

export const storage = getStorage(app);

// Solamente inicializa analytics en el cliente
export const analytics = typeof window !== "undefined" 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null;
