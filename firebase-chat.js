/* Kalidad Pharmacy — Firebase live pharmacist chat layer. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const cfg = window.KALIDAD_FIREBASE_CONFIG;
if (!cfg || !cfg.apiKey || cfg.apiKey.indexOf('PASTE_') === 0) throw new Error('Firebase web configuration is not installed.');
const app = getApps().length ? getApps()[0] : initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

export async function ensureCustomer() {
  if (auth.currentUser) return auth.currentUser;
  await signInAnonymously(auth);
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, user => { if (user) { stop(); resolve(user); } });
    setTimeout(() => { stop(); reject(new Error('Firebase authentication timed out.')); }, 10000);
  });
}

export async function createHandoff({ history = [], reason = 'clinical-question' } = {}) {
  const user = await ensureCustomer();
  const ref = await addDoc(collection(db, 'conversations'), {
    customerUid: user.uid,
    status: 'waiting',
    channel: 'website',
    reason: String(reason).slice(0, 120),
    privacyConsent: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp()
  });
  const messages = Array.isArray(history) ? history.slice(-12) : [];
  for (const m of messages) {
    const body = String(m?.content || '').trim().slice(0, 2000);
    if (!body) continue;
    await addDoc(collection(db, 'conversations', ref.id, 'messages'), {
      senderUid: user.uid,
      senderType: m.role === 'user' ? 'customer' : 'assistant',
      body,
      createdAt: serverTimestamp()
    });
  }
  await addDoc(collection(db, 'conversations', ref.id, 'messages'), {
    senderUid: 'system', senderType: 'system',
    body: 'The AI assistant handed this conversation to the Kalidad pharmacist team.', createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function sendCustomerMessage(conversationId, body) {
  const user = await ensureCustomer();
  const text = String(body || '').trim().slice(0, 2000);
  if (!text) return;
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderUid: user.uid, senderType: 'customer', body: text, createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, 'conversations', conversationId), { updatedAt: serverTimestamp(), lastMessageAt: serverTimestamp(), status: 'active' });
}

export function watchCustomerMessages(conversationId, callback) {
  const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'), limit(100));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function getCustomerConversation(conversationId) {
  const user = await ensureCustomer();
  const snap = await getDoc(doc(db, 'conversations', conversationId));
  if (!snap.exists() || snap.data().customerUid !== user.uid) throw new Error('Conversation not found.');
  return { id: snap.id, ...snap.data() };
}

export async function staffLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const staff = await getDoc(doc(db, 'staff', cred.user.uid));
  if (!staff.exists() || !['pharmacist', 'admin'].includes(staff.data().role)) {
    await signOut(auth);
    throw new Error('This account is not authorised for the pharmacist portal.');
  }
  return { user: cred.user, profile: staff.data() };
}

export async function staffProfile() {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return null;
  const snap = await getDoc(doc(db, 'staff', user.uid));
  return snap.exists() ? { user, ...snap.data() } : null;
}

export function watchWaitingConversations(callback) {
  const q = query(collection(db, 'conversations'), where('status', '==', 'waiting'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function watchActiveConversations(callback) {
  const q = query(collection(db, 'conversations'), where('status', '==', 'active'), orderBy('updatedAt', 'desc'), limit(50));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function watchConversation(conversationId, callback) {
  return onSnapshot(doc(db, 'conversations', conversationId), snap => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null));
}

export function watchStaffMessages(conversationId, callback) {
  const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'), limit(200));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function sendStaffMessage(conversationId, body) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) throw new Error('Staff login required.');
  const text = String(body || '').trim().slice(0, 2000);
  if (!text) return;
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderUid: user.uid, senderType: 'staff', body: text, createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, 'conversations', conversationId), { status: 'active', assignedStaffUid: user.uid, updatedAt: serverTimestamp(), lastMessageAt: serverTimestamp() });
}

export async function updateConversation(conversationId, fields) {
  const allowed = {};
  if (['waiting','active','resolved'].includes(fields.status)) allowed.status = fields.status;
  if (fields.assignedStaffUid) allowed.assignedStaffUid = fields.assignedStaffUid;
  allowed.updatedAt = serverTimestamp();
  await updateDoc(doc(db, 'conversations', conversationId), allowed);
}

export async function logoutStaff() { await signOut(auth); }
