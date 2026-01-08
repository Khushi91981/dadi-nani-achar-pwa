import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* REFERENCES */
const productsRef = collection(db, "products");
const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");

/* LOAD PRODUCTS IMMEDIATELY */
loadProducts();

/* ADD PRODUCT */
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = productForm.name.value.trim();
  const pricePerKg = Number(productForm.pricePerKg.value);
  const madeBy = productForm.madeBy.value.trim();
  const createdBy = productForm.createdBy.value.trim();

  if (!name || !pricePerKg || !madeBy || !createdBy) {
    alert("All fields are required");
    return;
  }

  await addDoc(productsRef, {
    name,
    pricePerKg,
    madeBy,
    createdBy,
    createdAt: serverTimestamp()
  });

  productForm.reset();
  loadProducts();
});

/* LOAD PRODUCTS */
async function loadProducts() {
  productTable.innerHTML = "";

  const snapshot = await getDocs(productsRef);

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.name}</td>
      <td>₹${p.pricePerKg}</td>
      <td>${p.madeBy}</td>
      <td>${p.createdBy}</td>
      <td>${p.createdAt ? p.createdAt.toDate().toLocaleDateString() : "-"}</td>
      <td>
        <button class="btn-sm delete-btn" onclick="deleteProduct('${docSnap.id}')">
          Delete
        </button>
      </td>
    `;

    productTable.appendChild(tr);
  });
}

/* DELETE PRODUCT */
window.deleteProduct = async (id) => {
  if (!confirm("Delete this product?")) return;

  await deleteDoc(doc(db, "products", id));
  loadProducts();
};
