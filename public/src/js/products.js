import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
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
   ADD PRODUCT
====================== */
const productForm = document.getElementById("productForm");

productForm.onsubmit = async (e) => {
  e.preventDefault();

  const name = productForm.name.value.trim();
  const pricePerKg = Number(productForm.pricePerKg.value);
  const madeBy = productForm.madeBy.value.trim();
  const createdBy = productForm.createdBy.value.trim();

  if (!name || !pricePerKg || !madeBy || !createdBy) {
    alert("Fill all required fields");
    return;
  }

  await addDoc(collection(db, "products"), {
    name,
    pricePerKg,
    madeBy,
    createdBy,
    createdAt: serverTimestamp()
  });

  productForm.reset();
};

/* ======================
   LOAD PRODUCTS (LIVE)
====================== */
const tbody = document.getElementById("productTable");

onSnapshot(collection(db, "products"), (snap) => {
  tbody.innerHTML = "";

  snap.docs.forEach(d => {
    const p = d.data();

    tbody.innerHTML += `
      <tr data-id="${d.id}">
        <td><strong>${p.name}</strong></td>
        <td>₹${p.pricePerKg}</td>
        <td>${p.madeBy}</td>
        <td>${p.createdBy}</td>
        <td>${formatDate(p.createdAt)}</td>
        <td>
          <button class="btn-sm delete-btn">Delete</button>
        </td>
      </tr>
    `;
  });

  attachDeleteHandlers();
});

/* ======================
   HELPERS
====================== */
const formatDate = (ts) =>
  ts?.seconds
    ? new Date(ts.seconds * 1000).toISOString().split("T")[0]
    : "-";

/* ======================
   DELETE
====================== */
function attachDeleteHandlers() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      if (!confirm("Delete this product?")) return;

      await deleteDoc(doc(db, "products", id));
    };
  });
}
