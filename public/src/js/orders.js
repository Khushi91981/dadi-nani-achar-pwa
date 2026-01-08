import { db } from "/src/js/firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { logout } from "/src/js/auth.js";

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
   DOM REFERENCES
====================== */
const productSelect = document.getElementById("product");
const priceInput = document.getElementById("price");

const qtyPreset = document.getElementById("qtyPreset");
const qtyInput = document.getElementById("qty");

const customerInput = document.getElementById("customer");
const deliveryInput = document.getElementById("delivery");
const paymentSelect = document.getElementById("payment");
const statusSelect = document.getElementById("status");

const saveBtn = document.getElementById("saveOrder");

/* ======================
   PRODUCT STORE (IN-MEMORY)
====================== */
let PRODUCTS = {}; // { name: { pricePerKg } }

/* ======================
   LOAD PRODUCTS (PRIORITY)
====================== */
productSelect.innerHTML =
  `<option value="">Loading products…</option>`;

onSnapshot(
  collection(db, "products"),
  (snapshot) => {
    PRODUCTS = {};
    productSelect.innerHTML =
      `<option value="">Select Product</option>`;

    snapshot.forEach(doc => {
      const p = doc.data();
      if (!p?.name || !p?.pricePerKg) return;

      PRODUCTS[p.name] = p;

      const opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = p.name;
      productSelect.appendChild(opt);
    });

    if (snapshot.empty) {
      productSelect.innerHTML =
        `<option value="">No products found</option>`;
    }
  },
  (error) => {
    console.error("❌ Product load failed:", error);
    productSelect.innerHTML =
      `<option value="">Failed to load products</option>`;
  }
);

/* ======================
   PRODUCT → PRICE BINDING
====================== */
productSelect.addEventListener("change", () => {
  const selected = productSelect.value;
  priceInput.value =
    PRODUCTS[selected]?.pricePerKg || "";
});

/* ======================
   QTY PRESET LOGIC
====================== */
function syncQtyUI() {
  if (qtyPreset.value === "custom") {
    qtyInput.classList.remove("hidden");
    qtyInput.value = "";
    qtyInput.focus();
  } else if (qtyPreset.value) {
    qtyInput.classList.add("hidden");
    qtyInput.value = qtyPreset.value;
  } else {
    qtyInput.classList.add("hidden");
    qtyInput.value = "";
  }
}

qtyPreset.addEventListener("change", syncQtyUI);
syncQtyUI();

/* ======================
   ADD ORDER
====================== */
saveBtn.onclick = async () => {
  const customer = customerInput.value.trim();
  const product = productSelect.value;
  const price = Number(priceInput.value);
  const qty = Number(qtyInput.value);
  const delivery = Number(deliveryInput.value || 0);

  if (!customer || !product || !price || !qty) {
    alert("Please fill all required fields");
    return;
  }

  await addDoc(collection(db, "orders"), {
    customer,
    product,
    price,
    qty,
    delivery,
    total: price * qty + delivery,
    payment_status: paymentSelect.value,
    order_status: statusSelect.value,
    created_at: serverTimestamp(),
    delivery_date:
      statusSelect.value === "Delivered"
        ? serverTimestamp()
        : null
  });

  /* Reset form */
  customerInput.value = "";
  productSelect.value = "";
  priceInput.value = "";
  qtyPreset.value = "";
  deliveryInput.value = "";
  syncQtyUI();
};

/* ======================
   ORDERS LIST
====================== */
const tbody = document.getElementById("ordersTable");
const searchInput = document.getElementById("orderSearch");

let ALL_ORDERS = [];

onSnapshot(collection(db, "orders"), snap => {
  ALL_ORDERS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderOrders(ALL_ORDERS);
});

searchInput.oninput = () => {
  const term = searchInput.value.toLowerCase();
  renderOrders(
    ALL_ORDERS.filter(o =>
      o.customer.toLowerCase().includes(term) ||
      o.product.toLowerCase().includes(term) ||
      o.payment_status.toLowerCase().includes(term) ||
      o.order_status.toLowerCase().includes(term)
    )
  );
};

/* ======================
   RENDER ORDERS
====================== */
function renderOrders(list) {
  tbody.innerHTML = "";

  list.forEach(o => {
    const delivered = o.order_status === "Delivered";

    tbody.innerHTML += `
      <tr data-id="${o.id}" class="${delivered ? "row-disabled" : ""}">
        <td><strong>${o.customer}</strong></td>
        <td>${o.product}</td>
        <td><input class="qty" value="${o.qty}" disabled></td>
        <td><input class="price" value="${o.price}" disabled></td>
        <td><input class="delivery" value="${o.delivery}" disabled></td>
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
   EDIT + DELETE
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
        [qty, price, delivery, payment, status]
          .forEach(el => el.disabled = false);
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
          status.value === "Delivered"
            ? serverTimestamp()
            : null
      });

      row.classList.remove("editing");
      btn.innerText = "Edit";
    };
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const row = btn.closest("tr");
      const id = row.dataset.id;

      if (!confirm("Delete this order?")) return;
      await deleteDoc(doc(db, "orders", id));
    };
  });
}
