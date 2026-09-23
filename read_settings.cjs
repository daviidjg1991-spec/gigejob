const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "gigejob01",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const querySnapshot = await getDocs(collection(db, "settings"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} =>`, JSON.stringify(doc.data(), null, 2));
  });
  const catSnapshot = await getDocs(collection(db, "categories"));
  if (!catSnapshot.empty) {
    catSnapshot.forEach((doc) => {
        console.log(`category ${doc.id} =>`, JSON.stringify(doc.data(), null, 2));
    });
  }
}

main().catch(console.error);
