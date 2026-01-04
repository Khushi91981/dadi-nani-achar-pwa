import { db } from "./src/js/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ============================
   DATE RANGE HELPERS
============================ */

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end)
  };
}

function getThisMonthRange() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);

  return {
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end)
  };
}

/* ============================
   MAIN REPORT LOGIC
============================ */

async function loadReports(range = "month") {
  let dateRange;

  if (range === "today") {
    dateRange = getTodayRange();
  } else {
    dateRange = getThisMonthRange();
  }

  let totalOrders = 0;
  let totalExpenses = 0;

  /* -------- ORDERS -------- */
  const ordersQuery = query(
    collection(db, "orders"),
    where("created_at", ">=", dateRange.start),
    where("created_at", "<=", dateRange.end)
  );

  const ordersSnap = await getDocs(ordersQuery);

  ordersSnap.forEach(doc => {
    const data = doc.data();
    totalOrders += Number(data.total || 0);
  });

  /* -------- EXPENSES -------- */
  const expensesQuery = query(
    collection(db, "expenses"),
    where("created_at", ">=", dateRange.start),
    where("created_at", "<=", dateRange.end)
  );

  const expensesSnap = await getDocs(expensesQuery);

  expensesSnap.forEach(doc => {
    const data = doc.data();
    totalExpenses += Number(data.amount || 0);
  });

  /* -------- UI UPDATE -------- */
  document.getElementById("totalOrders").innerText = `₹${totalOrders}`;
  document.getElementById("totalExpenses").innerText = `₹${totalExpenses}`;
  document.getElementById("netProfit").innerText = `₹${totalOrders - totalExpenses}`;
}

/* ============================
   INITIAL LOAD
============================ */

loadReports("month");

/* ============================
   OPTIONAL: FILTER BUTTONS
============================ */

window.filterReports = (type) => {
  loadReports(type);
};
