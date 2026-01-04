import { logout } from "./auth.js";
import { createManager, getUsers, updateUser } from "./src/js/users.js";

/* ELEMENTS */
const usersTable = document.getElementById("usersTable");
const createBtn = document.getElementById("createBtn");
const logoutBtn = document.getElementById("logoutBtn");

const editModal = document.getElementById("editModal");
const editUserId = document.getElementById("editUserId");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const saveEditBtn = document.getElementById("saveEditBtn");

/* CREATE MANAGER */
createBtn.onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  await createManager(name, email, password);
  alert("Manager created successfully");

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";

  loadUsers();
};

/* LOAD USERS */
async function loadUsers() {
  const users = await getUsers();
  usersTable.innerHTML = "";

  users.forEach(u => {
    usersTable.innerHTML += `
      <tr>
        <td>${u.name || "-"}</td>
        <td>${u.email || "-"}</td>
        <td>${u.role}</td>
        <td>
          <button class="btn-sm" onclick="openEdit('${u.id}','${u.name}','${u.email}')">
            Edit
          </button>
        </td>
      </tr>
    `;
  });
}

/* EDIT USER */
window.openEdit = (id, name, email) => {
  editUserId.value = id;
  editName.value = name;
  editEmail.value = email;
  editModal.classList.remove("hidden");
};

window.closeEdit = () => {
  editModal.classList.add("hidden");
};

saveEditBtn.onclick = async () => {
  await updateUser(editUserId.value, {
    name: editName.value,
    email: editEmail.value
  });

  alert("User updated");
  closeEdit();
  loadUsers();
};

logoutBtn.onclick = logout;

loadUsers();
