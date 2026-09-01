// Kalidad Pharmacy Firebase configuration
// Firebase Web App configuration. These values are intended for browser use.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBK6nEm0kdCp8aYb_dbTPGB5JP2OK7JhRw",
  authDomain: "kalidad-pharmacy.firebaseapp.com",
  projectId: "kalidad-pharmacy",
  storageBucket: "kalidad-pharmacy.firebasestorage.app",
  messagingSenderId: "108387190764",
  appId: "1:108387190764:web:116afb6282a3150fa0e2c9",
  measurementId: "G-PPDJTP0YFW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };
