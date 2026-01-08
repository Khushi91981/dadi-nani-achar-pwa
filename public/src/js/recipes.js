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
   ADD RECIPE (METADATA ONLY)
====================== */
document.getElementById("saveRecipe").onclick = async () => {
  const title = document.getElementById("title").value.trim();
  const filePath = document.getElementById("filePath").value.trim();
  const uploadedBy = document.getElementById("uploadedBy").value.trim() || "-";

  if (!title || !filePath) {
    alert("Title and file path are required");
    return;
  }

  await addDoc(collection(db, "recipes"), {
    title,
    filePath,
    uploadedBy,
    createdAt: serverTimestamp()
  });

  document.querySelectorAll(".form-grid input").forEach(i => i.value = "");
};

/* ======================
   LOAD RECIPES
====================== */
const tbody = document.getElementById("recipesTable");

onSnapshot(collection(db, "recipes"), snap => {
  const recipes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderRecipes(recipes);
});

/* ======================
   RENDER TABLE
====================== */
function renderRecipes(list) {
  tbody.innerHTML = "";

  list.forEach(r => {
    tbody.innerHTML += `
      <tr data-id="${r.id}">
        <td><strong>${r.title}</strong></td>
        <td>
          <a href="${r.filePath}" target="_blank" class="btn-sm">View</a>
        </td>
        <td>
          ${
            r.createdAt?.seconds
              ? new Date(r.createdAt.seconds * 1000).toISOString().split("T")[0]
              : "-"
          }
        </td>
        <td>${r.uploadedBy}</td>
        <td>
          <button class="btn-sm delete-btn">Delete</button>
        </td>
      </tr>
    `;
  });

  attachHandlers();
}

/* ======================
   DELETE RECIPE (METADATA ONLY)
====================== */
function attachHandlers() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      if (!confirm("Delete this recipe entry? (File remains on server)")) return;

      await deleteDoc(doc(db, "recipes", id));
    };
  });
}
