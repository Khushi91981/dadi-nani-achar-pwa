import { auth, db } from "./src/js/firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* CREATE MANAGER */
export async function createManager(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    role: "manager",
    created_at: serverTimestamp()
  });
}

/* GET USERS */
export async function getUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* UPDATE USER */
export async function updateUser(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updated_at: serverTimestamp()
  });
}
