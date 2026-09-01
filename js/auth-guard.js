import { watchAuth } from "./auth.js";
import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export function requireCustomer(redirect = "../store/login.html") {
  return watchAuth(async (user) => {
    if (!user) {
      window.location.replace(redirect);
      return;
    }
    return user;
  });
}

export function requireAdmin(redirect = "./login.html") {
  return watchAuth(async (user) => {
    if (!user) {
      window.location.replace(redirect);
      return;
    }

    const snapshot = await getDoc(doc(db, "users", user.uid));
    const profile = snapshot.exists() ? snapshot.data() : null;
    const allowed = profile && ["admin", "superadmin", "staff"].includes(profile.role);

    if (!allowed || profile.active === false) {
      window.location.replace("../store/index.html");
    }
  });
}
