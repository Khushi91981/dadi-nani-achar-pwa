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
   PRODUCT DROPDOWN
====================== */
const productSelect = document.getElementById("product");
const priceInput = document.getElementById("price");

let productsMap = {};

// Load products
onSnapshot(collection(db, "products"), snap => {
  productSelect.innerHTML = `<option value="">Select Product</option>`;
  productsMap = {};

  snap.docs.forEach(d => {
    const p = d.data();
    productsMap[d.id] = p;

    productSelect.innerHTML += `
      <option value="${p.name}" data-price="${p.pricePerKg}">
        ${p.name}
      </option>
    `;
  });
});

// Auto price fill
productSelect.onchange = () => {
  const selected = productSelect.selectedOptions[0];
  priceInput.value = selected?.dataset.price || "";
};

/* ======================
   QTY PRESET LOGIC
====================== */
const qtyPreset = document.getElementById("qtyPreset");
const qtyInput = document.getElementById("qty");

qtyPreset.onchange = () => {
  if (qtyPreset.value === "custom") {
    qtyInput.disabled = false;
    qtyInput.value = "";
  } else {
    qtyInput.disabled = true;
    qtyInput.value = qtyPreset.value || "";
  }
};

/* ======================
   ADD ORDER
====================== */
document.getElementById("saveOrder").onclick = async () => {
  const customer = document.getElementById("customer").value.trim();
  const product = productSelect.value;
  const price = Number(priceInput.value);
  const qty = Number(qtyInput.value);
  const delivery = Number(document.getElementById("delivery").value || 0);
  const payment = document.getElementById("payment").value;
  const status = document.getElementById("status").value;

  if (!customer || !product || !price || !qty) {
    alert("Fill all required fields");
    return;
  }

  await addDoc(collection(db, "orders"), {
    customer,
    product,
    price,
    qty,
    delivery,
    total: price * qty + delivery,
    payment_status: payment,
    order_status: status,
    created_at: serverTimestamp(),
    delivery_date: status === "Delivered" ? serverTimestamp() : null
  });

  document.querySelectorAll(".form-grid input").forEach(i => i.value = "");
  productSelect.value = "";
  qtyPreset.value = "";
  qtyInput.disabled = true;
};

/* ======================
   LOAD + SEARCH (UNCHANGED)
====================== */
const tbody = document.getElementById("ordersTable");
const searchInput = document.getElementById("orderSearch");

let allOrders = [];

onSnapshot(collection(db, "orders"), snap => {
  allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderOrders(allOrders);
});

searchInput.oninput = () => {
  const term = searchInput.value.toLowerCase();
  renderOrders(
    allOrders.filter(o =>
      o.customer.toLowerCase().includes(term) ||
      o.product.toLowerCase().includes(term) ||
      o.payment_status.toLowerCase().includes(term) ||
      o.order_status.toLowerCase().includes(term)
    )
  );
};

/* ======================
   RENDER (UNCHANGED)
====================== */
function renderOrders(list) {
  tbody.innerHTML = "";

  list.forEach(o => {
    const delivered = o.order_status === "Delivered";

    tbody.innerHTML += `
      <tr data-id="${o.id}" class="${delivered ? "row-disabled" : ""}">
        <td><strong>${o.customer}</strong></td>
        <td>${o.product}</td>

        <td><input class="qty" type="number" value="${o.qty}" disabled></td>
        <td><input class="price" type="number" value="${o.price}" disabled></td>
        <td><input class="delivery" type="number" value="${o.delivery}" disabled></td>

        <td><strong>₹${o.total}</strong></td>

        <td>
          <select class="payment" disabled>
            <option ${o.payment_status==="Not Paid Yet"?"selected":""}>Not Paid Yet</option>
            <option ${o.payment_status==="Paid"?"selected":""}>Paid</option>
          </select>
        </td>

        <td>
          <select class="status" disabled>
            <option ${o.order_status==="New"?"selected":""}>New</option>
            <option ${o.order_status==="Being Prepared"?"selected":""}>Being Prepared</option>
            <option ${o.order_status==="Delivered"?"selected":""}>Delivered</option>
          </select>
        </td>

        <td>${formatDate(o.created_at)}</td>
        <td>${formatDate(o.delivery_date)}</td>

        <td>
          ${
            delivered
              ? `<span class="lock">🔒 Delivered</span>`
              : `
                <button class="btn-sm edit-btn">Edit</button>
                <button class="btn-sm delete-btn">Delete</button>
              `
          }
        </td>
      </tr>
    `;
  });

  attachHandlers();
}

/* ======================
   EDIT + DELETE (UNCHANGED)
====================== */
function attachHandlers() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      const qty = row.querySelector(".qty");
      const price = row.querySelector(".price");
      const delivery = row.querySelector(".delivery");
      const payment = row.querySelector(".payment");
      const status = row.querySelector(".status");

      if (btn.innerText === "Edit") {
        row.classList.add("editing");
        [qty, price, delivery, payment, status].forEach(el => el.disabled = false);
        btn.innerText = "Save";
        return;
      }

      const q = Number(qty.value);
      const p = Number(price.value);
      const d = Number(delivery.value || 0);

      await updateDoc(doc(db, "orders", id), {
        qty: q,
        price: p,
        delivery: d,
        total: p * q + d,
        payment_status: payment.value,
        order_status: status.value,
        delivery_date:
          status.value === "Delivered" ? serverTimestamp() : null
      });

      row.classList.remove("editing");
      btn.innerText = "Edit";
    };
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      if (!confirm("Are you sure you want to delete this order?")) return;
      await deleteDoc(doc(db, "orders", id));
    };
  });
}
