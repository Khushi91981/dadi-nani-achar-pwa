import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc
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

/* ===============================
   ADD RECIPE
================================ */
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
          fileName: file.name,
          fileBase64: base64
        })
      });

      if (!res.ok) throw new Error("Upload failed");

      await addDoc(collection(db, "recipes"), {
        title,
        fileName: file.name,
        uploadedBy,
        createdAt: serverTimestamp()
      });

      alert("Recipe uploaded");
      form.reset();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  reader.readAsDataURL(file);
};

/* ===============================
   LIST RECIPES
================================ */
onSnapshot(collection(db, "recipes"), snap => {
  table.innerHTML = "";

  snap.docs.forEach(d => {
    const r = d.data();

    table.innerHTML += `
      <tr>
        <td><strong>${r.title}</strong></td>
        <td>
          <a href="/recipes/${r.fileName}" target="_blank">Open</a>
        </td>
        <td>
          ${r.createdAt?.seconds
            ? new Date(r.createdAt.seconds * 1000).toISOString().split("T")[0]
            : "-"}
        </td>
        <td>${r.uploadedBy}</td>
        <td>
          <button class="btn-sm replace" data-id="${d.id}" data-file="${r.fileName}">Replace</button>
          <button class="btn-sm delete" data-id="${d.id}">Delete</button>
        </td>
      </tr>
    `;
  });
});

/* ===============================
   DELETE + REPLACE
================================ */
document.body.addEventListener("click", async (e) => {

  /* DELETE */
  if (e.target.classList.contains("delete")) {
    if (!confirm("Delete recipe?")) return;
    await deleteDoc(doc(db, "recipes", e.target.dataset.id));
  }

  /* REPLACE */
  if (e.target.classList.contains("replace")) {
    const docId = e.target.dataset.id;
    const fileName = e.target.dataset.file;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.png,.jpg";

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64 = reader.result.split(",")[1];

          const res = await fetch("/.netlify/functions/upload-recipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName,
              fileBase64: base64
            })
          });

          if (!res.ok) throw new Error("Replace failed");

          await updateDoc(doc(db, "recipes", docId), {
            updatedAt: serverTimestamp()
          });

          alert("Recipe replaced");

        } catch (err) {
          console.error(err);
          alert("Replace failed");
        }
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }
});
