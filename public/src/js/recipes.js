import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { logout } from "./auth.js";

const form = document.getElementById("recipeForm");
const table = document.getElementById("recipesTable");

const titleInput = document.getElementById("titleInput");
const uploadedByInput = document.getElementById("uploadedByInput");
const fileInput = document.getElementById("fileInput");

document.getElementById("logoutBtn").onclick = async () => {
  await logout();
  location.href = "index.html";
};

/* ======================
   UPLOAD / REPLACE
====================== */
form.onsubmit = async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const uploadedBy = uploadedByInput.value.trim();
  const file = fileInput.files[0];

  if (!title || !uploadedBy || !file) {
    alert("Fill all fields");
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const base64 = reader.result.split(",")[1];

      const res = await fetch("/.netlify/functions/upload-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          uploadedBy,
          fileName: file.name,
          fileBase64: base64
        })
      });

      if (!res.ok) throw new Error("Upload failed");

      await addDoc(collection(db, "recipes"), {
        title,
        uploadedBy,
        fileUrl: `/recipes/${file.name}`,
        createdAt: serverTimestamp()
      });

      alert("Recipe uploaded / replaced");
      form.reset();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  reader.readAsDataURL(file);
};

/* ======================
   LIST
====================== */
onSnapshot(collection(db, "recipes"), snap => {
  table.innerHTML = "";

  snap.docs.forEach(d => {
    const r = d.data();
    const date = r.createdAt?.seconds
      ? new Date(r.createdAt.seconds * 1000).toISOString().split("T")[0]
      : "-";

    table.innerHTML += `
      <tr>
        <td><strong>${r.title}</strong></td>
        <td><a href="${r.fileUrl}" target="_blank">Open</a></td>
        <td>${date}</td>
        <td>${r.uploadedBy}</td>
        <td>
          <button class="btn-sm delete" data-id="${d.id}">Delete</button>
        </td>
      </tr>
    `;
  });

  document.querySelectorAll(".delete").forEach(btn => {
    btn.onclick = async () => {
      if (!confirm("Delete recipe entry? File will remain.")) return;
      await deleteDoc(doc(db, "recipes", btn.dataset.id));
    };
  });
});
