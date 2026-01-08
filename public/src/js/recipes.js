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

const titleInput = document.getElementById("title");
const uploadedByInput = document.getElementById("uploadedBy");
const fileInput = document.getElementById("file");

document.getElementById("logoutBtn").onclick = async () => {
  await logout();
  location.href = "index.html";
};

/* ======================
   ADD RECIPE
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

      // 1️⃣ Upload to GitHub via Netlify Function
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // 2️⃣ Save metadata to Firestore
      await addDoc(collection(db, "recipes"), {
        title,
        uploadedBy,
        filePath: data.url, // 👈 IMPORTANT
        createdAt: serverTimestamp()
      });

      alert("Recipe uploaded successfully");
      form.reset();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  reader.readAsDataURL(file);
};

/* ======================
   LOAD RECIPES
====================== */
onSnapshot(collection(db, "recipes"), snap => {
  table.innerHTML = "";

  snap.docs.forEach(d => {
    const r = d.data();

    table.innerHTML += `
      <tr>
        <td><strong>${r.title}</strong></td>
        <td>
          <a href="${r.filePath}" target="_blank">Open</a>
        </td>
        <td>
          ${r.createdAt?.seconds
            ? new Date(r.createdAt.seconds * 1000)
                .toISOString()
                .split("T")[0]
            : "-"
          }
        </td>
        <td>${r.uploadedBy}</td>
        <td>
          <button class="btn-sm delete" data-id="${d.id}">Delete</button>
        </td>
      </tr>
    `;
  });

  document.querySelectorAll(".delete").forEach(btn => {
    btn.onclick = async () => {
      if (!confirm("Delete recipe?")) return;
      await deleteDoc(doc(db, "recipes", btn.dataset.id));
    };
  });
});
