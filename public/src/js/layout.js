import { logout } from "./js/auth.js";
import { requireAuth } from "./js/auth-guard.js";

requireAuth((user) => {
  console.log("Authenticated user:", user);

  /* =====================
     HEADER (SAFE)
  ===================== */
  const welcomeEl = document.getElementById("welcomeText");
  const roleEl = document.getElementById("roleText");

  if (welcomeEl && user?.name) {
    welcomeEl.textContent = `Hello, ${user.name} 👋`;
  }

  if (roleEl && user?.role) {
    roleEl.textContent = `Role: ${user.role}`;
  }

  /* =====================
     LOGOUT (GLOBAL)
  ===================== */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      try {
        await logout();
        window.location.href = "index.html";
      } catch (err) {
        console.error("Logout failed", err);
      }
    };
  }
});
