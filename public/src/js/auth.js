import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* LOGIN */
export async function login(email, password, remember) {
  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence
  );

  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
}

/* LOGOUT */
export async function logout() {
  await signOut(auth);
}

/* RESET PASSWORD (SELF ONLY) */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
