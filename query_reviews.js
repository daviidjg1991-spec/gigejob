import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json"));
const app = initializeApp(config);
const db = getFirestore(app);

async function testQuery() {
  const q = query(
    collection(db, "reviews"),
    where("targetId", "==", "test_id"),
    orderBy("createdAt", "desc")
  );
  try {
    await getDocs(q);
    console.log("Query success");
  } catch(e) {
    console.log("Query failed:", e.message);
  }
}
testQuery().then(() => process.exit(0));
