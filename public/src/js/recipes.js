import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { logout } from "./auth.js";

/* ======================
 LOGOUT
====================== */
document.getElementById("logoutBtn").onclick = async () => {
  await logout();
  location.href = "index.html";
};

/* ======================
 ADD RECIPE
====================== */
const form = document.getElementById("recipeForm");

const recipeTitleInput = document.getElementById("recipeTitle");
const recipeFileInput = document.getElementById("recipeFile");
const uploadedByInput = document.getElementById("uploadedBy");

form.onsubmit = async (e) => {
  e.preventDefault();

  const title = recipeTitleInput.value.trim();
  const file = recipeFileInput.files[0];
  const uploadedBy = uploadedByInput.value.trim();

  if (!title || !file) {
    alert("Recipe title and file are required");
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
          fileName: file.name,
          fileBase64: base64,
          message: `Recipe upload: ${title}`
        })
      });

      const data = await res.json();

      if (!data.success) {
        console.error(data);
        alert("Upload failed");
        return;
      }

      await addDoc(collection(db, "recipes"), {
        title,
        fileUrl: data.url,
        uploadedBy: uploadedBy || "-",
        createdAt: serverTimestamp()
      });

      form.reset();
      alert("Recipe uploaded successfully ✅");

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  reader.readAsDataURL(file);
};

/* ======================
 LOAD RECIPES
====================== */
const tbody = document.getElementById("recipesTable");

onSnapshot(collection(db, "recipes"), snap => {
  tbody.innerHTML = "";

  snap.docs.forEach(d => {
    const r = d.data();
    const date = r.createdAt?.seconds
      ? new Date(r.createdAt.seconds * 1000).toISOString().split("T")[0]
      : "-";

    tbody.innerHTML += `
      <tr>
        <td><strong>${r.title}</strong></td>
        <td>
          <a href="${r.fileUrl}" target="_blank">Open</a>
        </td>
        <td>${date}</td>
        <td>${r.uploadedBy}</td>
        <td>
          <button class="btn-sm delete" data-id="${d.id}">Delete</button>
        </td>
      </tr>
    `;
  });

  attachDelete();
});

/* ======================
 DELETE
====================== */
function attachDelete() {
  document.querySelectorAll(".delete").forEach(btn => {
    btn.onclick = async () => {
      if (!confirm("Delete this recipe entry?")) return;
      await deleteDoc(doc(db, "recipes", btn.dataset.id));
    };
  });
}
