import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2gg4JLsd-Q0vPRYuukZ3oujb6RiR53NE",
  authDomain: "my-e-portal.firebaseapp.com",
  projectId: "my-e-portal",
  storageBucket: "my-e-portal.firebasestorage.app",
  messagingSenderId: "628881859766",
  appId: "1:628881859766:web:e45df5cb372d58960c7217"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const ADMIN_EMAIL = "admin@eportal.com";

// Get role from email
function getRole(email) {
  return email === ADMIN_EMAIL ? "admin" : "student";
}

// Save session to storage
function saveSession(user, remember = false) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("cp_uid", user.uid);
  storage.setItem("cp_email", user.email);
  storage.setItem("cp_role", getRole(user.email));
  storage.setItem("cp_name", user.displayName || user.email.split("@")[0]);
}

// Clear session from both storages
function clearSession() {
  ["cp_uid", "cp_email", "cp_role", "cp_name"].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

// Get current session
function getSession() {
  const uid = localStorage.getItem("cp_uid") || sessionStorage.getItem("cp_uid");
  const email = localStorage.getItem("cp_email") || sessionStorage.getItem("cp_email");
  const role = localStorage.getItem("cp_role") || sessionStorage.getItem("cp_role");
  const name = localStorage.getItem("cp_name") || sessionStorage.getItem("cp_name");
  if (!uid) return null;
  return { uid, email, role, name };
}

// PROTECT ADMIN PAGES
// Call this at top of admin.html, assignments.html, tracker.html
function requireAdmin(onSuccess) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      window.location.href = "dashboard.html";
      return;
    }
    saveSession(user);
    if (onSuccess) onSuccess(user);
  });
}

// PROTECT STUDENT PAGES
// Call this at top of dashboard.html, upload.html, status.html
function requireStudent(onSuccess) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    if (user.email === ADMIN_EMAIL) {
      window.location.href = "admin.html";
      return;
    }
    saveSession(user);
    if (onSuccess) onSuccess(user);
  });
}

// LOGOUT
function logout() {
  clearSession();
  signOut(auth).then(() => window.location.href = "login.html");
}

// AUTO REDIRECT (for index.html and login.html)
function autoRedirect() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.email === ADMIN_EMAIL) {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
    }
  });
}

export { auth, requireAdmin, requireStudent, logout, autoRedirect, saveSession, clearSession, getSession, getRole };