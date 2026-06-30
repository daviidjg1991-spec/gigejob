import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
setLogLevel('silent');
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);

// Solamente inicializa analytics en el cliente
export const analytics = typeof window !== "undefined" 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null;
