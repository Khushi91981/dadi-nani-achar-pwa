import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { logout } from "./auth.js";

const form = document.getElementById("recipeForm");
const table = document.getElementById("recipesTable");

document.getElementById("logoutBtn").onclick = async () => {
  await logout();
  location.href = "index.html";
};

/* ======================
   UPLOAD / REPLACE
====================== */
async function uploadRecipe(file, title, uploadedBy, replaceId = null) {
  const reader = new FileReader();

  reader.onload = async () => {
    const base64 = reader.result.split(",")[1];

    const res = await fetch("/.netlify/functions/upload-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileBase64: base64
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error("Upload failed");

    if (replaceId) {
      await updateDoc(doc(db, "recipes", replaceId), {
        filePath: data.filePath,
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, "recipes"), {
        title,
        uploadedBy,
        filePath: data.filePath,
        createdAt: serverTimestamp()
      });
    }

    form.reset();
  };

  reader.readAsDataURL(file);
}

/* ======================
   FORM SUBMIT
====================== */
form.onsubmit = async (e) => {
  e.preventDefault();

  const title = document.getElementById("titleInput").value.trim();
  const uploadedBy = document.getElementById("uploadedByInput").value.trim();
  const file = document.getElementById("fileInput").files[0];

  if (!title || !uploadedBy || !file) {
    alert("Fill all fields");
    return;
  }

  try {
    await uploadRecipe(file, title, uploadedBy);
  } catch (e) {
    alert("Upload failed");
  }
};

/* ======================
   LIST
====================== */
onSnapshot(collection(db, "recipes"), snap => {
  table.innerHTML = "";

  snap.forEach(d => {
    const r = d.data();

    table.innerHTML += `
      <tr>
        <td><strong>${r.title}</strong></td>
        <td><a href="${r.filePath}" target="_blank">Open</a></td>
        <td>${r.createdAt?.seconds
          ? new Date(r.createdAt.seconds * 1000).toISOString().split("T")[0]
          : "-"}</td>
        <td>${r.uploadedBy}</td>
        <td>
          <button class="btn-sm replace" data-id="${d.id}">Replace</button>
          <button class="btn-sm delete" data-id="${d.id}">Delete</button>
        </td>
      </tr>
    `;
  });

  /* Replace */
  document.querySelectorAll(".replace").forEach(btn => {
    btn.onclick = () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.onchange = () =>
        uploadRecipe(fileInput.files[0], null, null, btn.dataset.id);
      fileInput.click();
    };
  });

  /* Delete */
  document.querySelectorAll(".delete").forEach(btn => {
    btn.onclick = async () => {
      if (!confirm("Delete recipe?")) return;
      await deleteDoc(doc(db, "recipes", btn.dataset.id));
    };
  });
});
