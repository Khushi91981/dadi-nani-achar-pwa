import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";
import { db } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth } from "./firebase.js";

const messaging = getMessaging();

export async function registerPushToken(user) {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY_HERE"
    });

    if (!token) return;

    // save token only for managers
    if (user.role === "manager") {
      await setDoc(
        doc(db, "fcm_tokens", user.uid),
        {
          uid: user.uid,
          role: user.role,
          token
        },
        { merge: true }
      );
    }
  } catch (e) {
    console.error("FCM error", e);
  }
}
