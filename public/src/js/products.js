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
   LOGOUT
====================== */
document.getElementById("logoutBtn").onclick = async () => {
  await logout();
  location.href = "index.html";
};

/* ======================
   ADD PRODUCT
====================== */
document.getElementById("saveProduct").onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const madeBy = document.getElementById("madeBy").value.trim() || "-";
  const createdBy = document.getElementById("createdBy").value.trim() || "-";

  if (!name || !price) {
    alert("Product name and price are required");
    return;
  }

  await addDoc(collection(db, "products"), {
    name,
    pricePerKg: price,
    madeBy,
    createdBy,
    createdAt: serverTimestamp()
  });

  document.querySelectorAll(".form-grid input").forEach(i => i.value = "");
};

/* ======================
   LOAD PRODUCTS
====================== */
const tbody = document.getElementById("productsTable");

onSnapshot(collection(db, "products"), snap => {
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderProducts(products);
});

/* ======================
   RENDER TABLE
====================== */
function renderProducts(list) {
  tbody.innerHTML = "";

  list.forEach(p => {
    tbody.innerHTML += `
      <tr data-id="${p.id}">
        <!-- NAME LOCKED -->
        <td><strong class="product-name">${p.name}</strong></td>

        <td>
          <input class="price" type="number" value="${p.pricePerKg}" disabled>
        </td>

        <td>
          <input class="madeBy" value="${p.madeBy}" disabled>
        </td>

        <td>
          <input class="createdBy" value="${p.createdBy}" disabled>
        </td>

        <td>
          ${
            p.createdAt?.seconds
              ? new Date(p.createdAt.seconds * 1000).toISOString().split("T")[0]
              : "-"
          }
        </td>

        <td>
          <button class="btn-sm edit-btn">Edit</button>
          <button class="btn-sm delete-btn">Delete</button>
        </td>
      </tr>
    `;
  });

  attachHandlers();
}

/* ======================
   EDIT + DELETE
====================== */
function attachHandlers() {

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      const price = row.querySelector(".price");
      const madeBy = row.querySelector(".madeBy");
      const createdBy = row.querySelector(".createdBy");

      if (btn.innerText === "Edit") {
        row.classList.add("editing");
        [price, madeBy, createdBy].forEach(el => el.disabled = false);
        btn.innerText = "Save";
        return;
      }

      await updateDoc(doc(db, "products", id), {
        pricePerKg: Number(price.value),
        madeBy: madeBy.value.trim(),
        createdBy: createdBy.value.trim()
      });

      row.classList.remove("editing");
      btn.innerText = "Edit";
    };
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      if (!confirm("Delete this product?")) return;

      await deleteDoc(doc(db, "products", id));
    };
  });
}
