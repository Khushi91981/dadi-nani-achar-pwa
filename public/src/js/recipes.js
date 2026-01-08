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

document.getElementById("logoutBtn").onclick = async () => {
  await logout();
  location.href = "index.html";
};

form.onsubmit = async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const uploadedBy = document.getElementById("uploadedBy").value.trim();
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  if (!title || !uploadedBy || !file) {
    alert("All fields required");
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const res = await fetch("/.netlify/functions/upload-recipe", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          content: reader.result.split(",")[1]
        })
      });

      const data = await res.json();
      if (!data.url) throw new Error("Upload failed");

      await addDoc(collection(db, "recipes"), {
        title,
        fileUrl: data.url,
        uploadedBy,
        createdAt: serverTimestamp()
      });

      form.reset();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  reader.readAsDataURL(file);
};

onSnapshot(collection(db, "recipes"), snap => {
  table.innerHTML = "";
  snap.docs.forEach(d => {
    const r = d.data();
    table.innerHTML += `
      <tr>
        <td><strong>${r.title}</strong></td>
        <td><a href="${r.fileUrl}" target="_blank">Open</a></td>
        <td>${r.createdAt?.seconds ? new Date(r.createdAt.seconds*1000).toISOString().split("T")[0] : "-"}</td>
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
