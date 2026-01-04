import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      alert("User record missing");
      return;
    }

    const userData = snap.data();

    // expose globally
    window.currentUser = {
      uid: user.uid,
      email: user.email,
      role: userData.role,
      name: userData.name || user.email
    };

    callback(window.currentUser);
  });
}
