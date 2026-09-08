/* Kalidad Pharmacy — Firebase live pharmacist chat layer. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, where, onSnapshot, serverTimestamp, limit } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const cfg = window.KALIDAD_FIREBASE_CONFIG;
if (!cfg || !cfg.apiKey || cfg.apiKey.indexOf('PASTE_') === 0) {
  throw Error('Firebase web configuration is not installed.');
}

const app = getApps().length ? getApps()[0] : initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

export async function ensureCustomer() {
  if (auth.currentUser && !auth.currentUser.isAnonymous) return auth.currentUser;
  await signInAnonymously(auth);
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, user => {
      if (user) {
        stop();
        resolve(user);
      }
    });
    setTimeout(() => {
      stop();
      reject(Error('Firebase authentication timed out.'));
    }, 10000);
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

  // Store only the customer's recent messages as handoff context.
  // AI/system messages are deliberately not client-written to Firestore.
  for (const m of (Array.isArray(history) ? history.slice(-12) : [])) {
    if (m?.role !== 'user') continue;
    const body = String(m?.content || '').trim().slice(0, 2000);
    if (!body) continue;
    await addDoc(collection(db, 'conversations', ref.id, 'messages'), {
      senderUid: user.uid,
      senderType: 'customer',
      body,
      createdAt: serverTimestamp()
    });
  }

  return ref.id;
}

export async function sendCustomerMessage(conversationId, body) {
  const user = await ensureCustomer();
  const text = String(body || '').trim().slice(0, 2000);
  if (!text) return;

  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderUid: user.uid,
    senderType: 'customer',
    body: text,
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(db, 'conversations', conversationId), {
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    status: 'active'
  });
}

export function watchCustomerMessages(id, cb) {
  const q = query(collection(db, 'conversations', id, 'messages'), limit(100));
  return onSnapshot(q, snapshot => {
    cb(snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => ((a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))));
  });
}

export async function getCustomerConversation(id) {
  const user = await ensureCustomer();
  const snapshot = await getDoc(doc(db, 'conversations', id));
  if (!snapshot.exists() || snapshot.data().customerUid !== user.uid) {
    throw Error('Conversation not found.');
  }
  return { id: snapshot.id, ...snapshot.data() };
}

export async function staffLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snapshot = await getDoc(doc(db, 'staff', cred.user.uid));
  if (!snapshot.exists() || !['pharmacist', 'admin'].includes(snapshot.data().role)) {
    await signOut(auth);
    throw Error('This account is not authorised for the pharmacist portal.');
  }
  return { user: cred.user, profile: snapshot.data() };
}

export async function staffProfile() {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return null;
  const snapshot = await getDoc(doc(db, 'staff', user.uid));
  return snapshot.exists() ? { user, ...snapshot.data() } : null;
}

export function watchWaitingConversations(cb) {
  return onSnapshot(
    query(collection(db, 'conversations'), where('status', '==', 'waiting'), limit(50)),
    snapshot => cb(snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => ((b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))))
  );
}

export function watchActiveConversations(cb) {
  return onSnapshot(
    query(collection(db, 'conversations'), where('status', '==', 'active'), limit(50)),
    snapshot => cb(snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => ((b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))))
  );
}

export function watchConversation(id, cb) {
  return onSnapshot(doc(db, 'conversations', id), snapshot => {
    cb(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  });
}

export function watchStaffMessages(id, cb) {
  return watchCustomerMessages(id, cb);
}

export async function sendStaffMessage(id, body) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) throw Error('Staff login required.');

  const text = String(body || '').trim().slice(0, 2000);
  if (!text) return;

  await addDoc(collection(db, 'conversations', id, 'messages'), {
    senderUid: user.uid,
    senderType: 'staff',
    body: text,
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(db, 'conversations', id), {
    status: 'active',
    assignedStaffUid: user.uid,
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp()
  });
}

export async function updateConversation(id, fields) {
  const updates = {};
  if (['waiting', 'active', 'resolved'].includes(fields.status)) {
    updates.status = fields.status;
  }
  if (fields.assignedStaffUid) {
    updates.assignedStaffUid = fields.assignedStaffUid;
  }
  updates.updatedAt = serverTimestamp();
  await updateDoc(doc(db, 'conversations', id), updates);
}

export async function logoutStaff() {
  await signOut(auth);
}
