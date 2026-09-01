import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

export async function registerCustomer({ firstName, lastName, phone, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = credential.user;

  await updateProfile(user, {
    displayName: `${firstName.trim()} ${lastName.trim()}`.trim()
  });

  await setDoc(doc(db, "users", user.uid), {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone.trim(),
    email: user.email,
    role: "customer",
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return user;
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email.trim());
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
