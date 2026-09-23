import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore/lite';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching users...");
  const usersSnapshot = await getDocs(collection(db, "users"));
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.firstName === "Juan" || data.name === "Juan Linares" || (data.email && data.email.includes("juan"))) {
       console.log(doc.id, data.firstName, data.lastName1, data.username, data.email);
    }
  });
}
run().catch(console.error);
