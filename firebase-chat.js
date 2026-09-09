/* Kalidad Pharmacy — Firebase live pharmacist chat layer. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, where, onSnapshot, serverTimestamp, limit } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const cfg = window.KALIDAD_FIREBASE_CONFIG;
if (!cfg || !cfg.apiKey || cfg.apiKey.indexOf('PASTE_') === 0) throw Error('Firebase web configuration is not installed.');
const app = getApps().length ? getApps()[0] : initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

let notificationPermissionRequested = false;
let audioContext = null;
let baseDocumentTitle = null;

function isPharmacistPortal() {
  return typeof window !== 'undefined' && window.location.pathname.endsWith('/pharmacist.html');
}

function installWaitingAlertStyle() {
  if (!isPharmacistPortal() || document.getElementById('kalidadWaitingAlertStyle')) return;
  const s = document.createElement('style');
  s.id = 'kalidadWaitingAlertStyle';
  s.textContent = '.tab.kc-pending{animation:kalidadWaitingPulse 1.15s ease-in-out infinite;background:#e6f3d9;color:#33581f;box-shadow:0 0 0 2px rgba(143,184,36,.18)}@keyframes kalidadWaitingPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(143,184,36,.12)}50%{transform:scale(1.035);box-shadow:0 0 0 6px rgba(143,184,36,.16)}}';
  document.head.appendChild(s);
}

function setWaitingVisual(hasWaiting) {
  if (!isPharmacistPortal()) return;
  installWaitingAlertStyle();
  const tab = document.getElementById('waitingTab');
  if (!tab) return;
  tab.classList.toggle('kc-pending', !!hasWaiting);
  tab.setAttribute('aria-label', hasWaiting ? 'Waiting conversations — new customer requests pending' : 'Waiting conversations');
}

function setPendingStaffTitle() {
  if (!isPharmacistPortal()) return;
  if (baseDocumentTitle === null) baseDocumentTitle = document.title || 'Kalidad Pharmacy | Customer Support';
  document.title = 'You have a new message!';
}

export function clearStaffNotificationTitle() {
  if (!isPharmacistPortal()) return;
  document.title = baseDocumentTitle || 'Kalidad Pharmacy | Customer Support';
  baseDocumentTitle = null;
}

async function prepareStaffNotifications() {
  if (!isPharmacistPortal() || notificationPermissionRequested) return;
  notificationPermissionRequested = true;
  if ('Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch (_) {}
  }
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioContext = audioContext || new AudioCtx();
      if (audioContext.state === 'suspended') await audioContext.resume();
    }
  } catch (_) {}
}

function playStaffChime() {
  if (!audioContext) return;
  try {
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    gain.connect(audioContext.destination);
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.setValueAtTime(988, now + 0.16);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.55);
  } catch (_) {}
}

function showStaffNotification(conversationId) {
  if (!isPharmacistPortal()) return;
  setPendingStaffTitle();
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const n = new Notification('You have a new message!', {
      body: 'Kalidad customer care',
      icon: '/kalidad-icon.png',
      tag: `kalidad-chat-${conversationId}`,
      renotify: true,
      requireInteraction: true
    });
    n.onclick = () => {
      try { window.focus(); } catch (_) {}
      clearStaffNotificationTitle();
      try { n.close(); } catch (_) {}
    };
  } catch (_) {}
}

function waitForAuthUser(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer = null;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      try { stop(); } catch (_) {}
      fn(value);
    };
    const stop = onAuthStateChanged(auth, user => {
      if (user) finish(resolve, user);
    });
    if (auth.currentUser) finish(resolve, auth.currentUser);
    timer = setTimeout(() => finish(reject, Error('Firebase authentication timed out.')), timeoutMs);
  });
}

export async function ensureCustomer() {
  if (auth.currentUser?.isAnonymous) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function createHandoff({ history = [], reason = 'clinical-question' } = {}) {
  const user = await ensureCustomer();
  const ref = await addDoc(collection(db, 'conversations'), {
    customerUid: user.uid, status: 'waiting', channel: 'website',
    reason: String(reason).slice(0, 120), privacyConsent: true,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastMessageAt: serverTimestamp()
  });
  for (const m of (Array.isArray(history) ? history.slice(-12) : [])) {
    if (m?.role !== 'user') continue;
    const body = String(m?.content || '').trim().slice(0, 2000);
    if (!body) continue;
    await addDoc(collection(db, 'conversations', ref.id, 'messages'), {
      senderUid: user.uid, senderType: 'customer', body, createdAt: serverTimestamp()
    });
  }
  return ref.id;
}

export async function sendCustomerMessage(conversationId, body) {
  const user = await ensureCustomer();
  const text = String(body || '').trim().slice(0, 2000);
  if (!text) return;
  const conversation = await getDoc(doc(db, 'conversations', conversationId));
  if (!conversation.exists() || conversation.data().customerUid !== user.uid) throw Error('Conversation not found.');
  if (['closed', 'resolved'].includes(conversation.data().status)) throw Error('This conversation is closed.');
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderUid: user.uid, senderType: 'customer', body: text, createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, 'conversations', conversationId), {
    updatedAt: serverTimestamp(), lastMessageAt: serverTimestamp(), status: 'active'
  });
}

export async function closeCustomerConversation(conversationId) {
  const user = await ensureCustomer();
  const ref = doc(db, 'conversations', conversationId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists() || snapshot.data().customerUid !== user.uid) throw Error('Conversation not found.');
  const status = snapshot.data().status;
  if (status === 'closed' || status === 'resolved') return;
  await updateDoc(ref, {
    status: 'closed', closedByCustomer: true, closedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export function watchCustomerMessages(id, cb) {
  const q = query(collection(db, 'conversations', id, 'messages'), limit(100));
  return onSnapshot(q, snapshot => cb(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => ((a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)))));
}

export async function getCustomerConversation(id) {
  const user = await ensureCustomer();
  const snapshot = await getDoc(doc(db, 'conversations', id));
  if (!snapshot.exists() || snapshot.data().customerUid !== user.uid) throw Error('Conversation not found.');
  return { id: snapshot.id, ...snapshot.data() };
}

export async function staffLogin(email, password) {
  await setPersistence(auth, browserSessionPersistence);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snapshot = await getDoc(doc(db, 'staff', cred.user.uid));
  if (!snapshot.exists() || !['pharmacist', 'admin'].includes(snapshot.data().role) || snapshot.data().active === false) {
    await signOut(auth);
    throw Error('This account is not authorised for the pharmacist portal.');
  }
  await prepareStaffNotifications();
  return { user: cred.user, profile: snapshot.data() };
}

export async function staffProfile() {
  let user = auth.currentUser;
  if (!user) {
    try { user = await waitForAuthUser(); } catch (_) { return null; }
  }
  if (!user || user.isAnonymous) return null;
  const snapshot = await getDoc(doc(db, 'staff', user.uid));
  if (!snapshot.exists() || !['pharmacist', 'admin'].includes(snapshot.data().role) || snapshot.data().active === false) return null;
  await prepareStaffNotifications();
  return { user, ...snapshot.data() };
}

async function requireStaffUser() {
  let user = auth.currentUser;
  if (!user) user = await waitForAuthUser();
  if (!user || user.isAnonymous) throw Error('Staff login required.');
  const snapshot = await getDoc(doc(db, 'staff', user.uid));
  if (!snapshot.exists() || !['pharmacist', 'admin'].includes(snapshot.data().role) || snapshot.data().active === false) {
    throw Error('Staff login required.');
  }
  return { user, profile: snapshot.data() };
}

export function watchWaitingConversations(cb) {
  let initialized = false;
  return onSnapshot(query(collection(db, 'conversations'), where('status', '==', 'waiting'), limit(50)), snapshot => {
    const conversations = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => ((b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    cb(conversations);
    setWaitingVisual(conversations.length > 0);
    if (!initialized) {
      initialized = true;
      return;
    }
    snapshot.docChanges().filter(change => change.type === 'added').forEach(change => {
      playStaffChime();
      showStaffNotification(change.doc.id);
    });
  });
}

export function watchActiveConversations(cb) {
  return onSnapshot(query(collection(db, 'conversations'), where('status', '==', 'active'), limit(50)), snapshot => cb(
    snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => ((b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)))
  ));
}

export function watchResolvedConversations(cb) {
  return onSnapshot(query(collection(db, 'conversations'), where('status', '==', 'resolved'), limit(100)), snapshot => cb(
    snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => ((b.resolvedAt?.seconds || b.updatedAt?.seconds || 0) - (a.resolvedAt?.seconds || a.updatedAt?.seconds || 0)))
  ));
}

export function watchConversation(id, cb) {
  return onSnapshot(doc(db, 'conversations', id), snapshot => cb(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null));
}

export function watchStaffMessages(id, cb) {
  clearStaffNotificationTitle();
  return watchCustomerMessages(id, messages => cb(messages));
}

export async function sendStaffMessage(id, body) {
  const { user } = await requireStaffUser();
  const text = String(body || '').trim().slice(0, 2000);
  if (!text) return;
  await addDoc(collection(db, 'conversations', id, 'messages'), {
    senderUid: user.uid, senderType: 'staff', body: text, createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, 'conversations', id), {
    status: 'active', assignedStaffUid: user.uid,
    updatedAt: serverTimestamp(), lastMessageAt: serverTimestamp()
  });
}

export async function updateConversation(id, fields) {
  const { user, profile: staffData } = await requireStaffUser();
  fields = typeof fields === 'string' ? { status: fields } : (fields || {});
  const updates = {};
  if (['waiting', 'active', 'resolved'].includes(fields.status)) updates.status = fields.status;
  if (fields.assignedStaffUid) updates.assignedStaffUid = fields.assignedStaffUid;
  if (fields.status === 'resolved') {
    updates.resolvedByUid = user.uid;
    updates.resolvedByName = String(staffData.displayName || user.email || 'Kalidad pharmacist').slice(0, 160);
    updates.resolvedAt = serverTimestamp();
  } else if (fields.status === 'active' || fields.status === 'waiting') {
    updates.resolvedByUid = null; updates.resolvedByName = null; updates.resolvedAt = null;
  }
  updates.updatedAt = serverTimestamp();
  await updateDoc(doc(db, 'conversations', id), updates);
}

export async function logoutStaff() {
  clearStaffNotificationTitle();
  await signOut(auth);
}
