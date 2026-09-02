import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBK6nEm0kdCp8aYb_dbTPGB5JP2OK7JhRw',
  authDomain: 'kalidad-pharmacy.firebaseapp.com',
  projectId: 'kalidad-pharmacy',
  storageBucket: 'kalidad-pharmacy.firebasestorage.app',
  messagingSenderId: '108387190764',
  appId: '1:108387190764:web:116afb6282a3150fa0e2c9',
  measurementId: 'G-PPDJTP0YFW'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
