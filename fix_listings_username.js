import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore/lite';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching users...");
  const usersSnapshot = await getDocs(collection(db, "users"));
  const users = {};
  usersSnapshot.forEach(doc => {
    users[doc.id] = doc.data();
    if (doc.data().email) {
      users[doc.data().email] = doc.data();
    }
  });

  console.log(`Found ${Object.keys(users).length} users. Fetching listings...`);
  const listingsSnapshot = await getDocs(collection(db, "listings"));
  let updated = 0;
  for (const listingDoc of listingsSnapshot.docs) {
    const listing = listingDoc.data();
    if (listing.author && !listing.author.username) {
      let user = users[listing.author.id] || users[listing.author.email];
      if (user && user.username) {
        console.log(`Updating listing ${listingDoc.id} with username ${user.username}`);
        listing.author.username = user.username;
        await updateDoc(doc(db, "listings", listingDoc.id), { author: listing.author });
        updated++;
      }
    }
  }
  console.log(`Done. Updated ${updated} listings.`);
}

run().catch(console.error);
