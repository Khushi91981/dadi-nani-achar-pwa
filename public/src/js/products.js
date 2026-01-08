import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* REFERENCES */
const productsRef = collection(db, "products");
const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");

/* AUTH CHECK */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    loadProducts();
  }
});

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

  try {
    await addDoc(productsRef, {
      name,
      pricePerKg,
      madeBy,
      createdBy,
      createdAt: serverTimestamp()
    });

    productForm.reset();
    loadProducts();
  } catch (error) {
    alert("Error adding product");
    console.error(error);
  }
});

/* LOAD PRODUCTS */
async function loadProducts() {
  productTable.innerHTML = "";

  const snapshot = await getDocs(productsRef);

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.name}</td>
      <td>₹${data.pricePerKg}</td>
      <td>${data.madeBy}</td>
      <td>${data.createdBy}</td>
      <td>${data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "-"}</td>
      <td>
        <button onclick="deleteProduct('${docSnap.id}')">Delete</button>
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
