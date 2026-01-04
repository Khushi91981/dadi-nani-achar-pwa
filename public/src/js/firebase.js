import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBV4Ev4ROYZbYWNTjGAxC55QNZZpzZmB7w",
  authDomain: "dadi-nani-achar-manager.firebaseapp.com",
  projectId: "dadi-nani-achar-manager",
  storageBucket: "dadi-nani-achar-manager.firebasestorage.app",
  messagingSenderId: "1085012790972",
  appId: "1:1085012790972:web:a08ce967e1356e1ab74ab9"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* ✅ ADD THIS */
export const logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

