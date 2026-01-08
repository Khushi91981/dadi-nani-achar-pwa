import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { logout } from "./auth.js";

/* ======================
   HELPERS
====================== */
const formatDate = (ts) =>
  ts?.seconds
    ? new Date(ts.seconds * 1000).toISOString().split("T")[0]
    : "-";

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

  snap.docs.forEach((d) => {
    const p = d.data();

    tbody.innerHTML += `
      <tr data-id="${d.id}">
        <td>
          <input class="name" value="${p.name}" disabled>
        </td>

        <td>
          <input class="price" type="number" value="${p.pricePerKg}" disabled>
        </td>

        <td>
          <input class="madeBy" value="${p.madeBy}" disabled>
        </td>

        <td>
          <input class="createdBy" value="${p.createdBy}" disabled>
        </td>

        <td class="lock">
          ${formatDate(p.createdAt)}
        </td>

        <td>
          <button class="btn-sm edit-btn">Edit</button>
          <button class="btn-sm delete-btn">Delete</button>
        </td>
      </tr>
    `;
  });

  attachHandlers();
});

/* ======================
   EDIT + DELETE
====================== */
function attachHandlers() {

  /* EDIT / SAVE */
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      const name = row.querySelector(".name");
      const price = row.querySelector(".price");
      const madeBy = row.querySelector(".madeBy");
      const createdBy = row.querySelector(".createdBy");

      if (btn.innerText === "Edit") {
        row.classList.add("editing");
        [name, price, madeBy, createdBy].forEach(i => i.disabled = false);
        btn.innerText = "Save";
        return;
      }

      // SAVE
      await updateDoc(doc(db, "products", id), {
        name: name.value.trim(),
        pricePerKg: Number(price.value),
        madeBy: madeBy.value.trim(),
        createdBy: createdBy.value.trim()
      });

      row.classList.remove("editing");
      [name, price, madeBy, createdBy].forEach(i => i.disabled = true);
      btn.innerText = "Edit";
    };
  });

  /* DELETE */
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      if (!confirm("Delete this product?")) return;

      await deleteDoc(doc(db, "products", id));
    };
  });
}
