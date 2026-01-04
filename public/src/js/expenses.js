import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { logout } from "./auth.js";

/* ======================
   LOGOUT
====================== */
document.getElementById("logoutBtn").onclick = async () => {
  await logout();
  window.location.href = "index.html";
};

/* ======================
   ADD EXPENSE
====================== */
document.getElementById("saveExpense").onclick = async () => {
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const notes = document.getElementById("notes").value.trim();

  if (!title || !category || !amount) {
    alert("Please fill required fields");
    return;
  }

  await addDoc(collection(db, "expenses"), {
    title,
    category,
    amount,
    notes,
    created_at: serverTimestamp()
  });

  document.querySelectorAll(".form-grid input").forEach(i => i.value = "");
};

/* ======================
   LOAD + DELETE EXPENSES
====================== */
const tbody = document.getElementById("expensesTable");

onSnapshot(collection(db, "expenses"), snapshot => {
  tbody.innerHTML = "";

  snapshot.forEach(docSnap => {
    const e = docSnap.data();
    const id = docSnap.id;

    const date = e.created_at
      ? e.created_at.toDate().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "-";

    tbody.innerHTML += `
      <tr>
        <td>${e.title}</td>
        <td>${e.category}</td>
        <td><strong>₹${e.amount}</strong></td>
        <td>${e.notes || "-"}</td>
        <td>${date}</td>
        <td>
          <button class="btn-sm" onclick="deleteExpense('${id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
});

/* ======================
   DELETE FUNCTION
====================== */
window.deleteExpense = async (id) => {
  if (!confirm("Are you sure you want to delete this expense?")) return;

  await deleteDoc(doc(db, "expenses", id));
};
