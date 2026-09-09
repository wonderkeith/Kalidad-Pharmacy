/* Kalidad Pharmacy — Firebase live pharmacist chat layer. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, where, onSnapshot, serverTimestamp, limit, orderBy } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

var DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBK6nEm0kdCp8aYb_dbTPGB5JP2OK7JhRw',
  authDomain: 'kalidad-pharmacy.firebaseapp.com',
  projectId: 'kalidad-pharmacy',
  storageBucket: 'kalidad-pharmacy.firebasestorage.app',
  messagingSenderId: '108387190764',
  appId: '1:108387190764:web:302264adc7dc73d7a0e2c9',
  measurementId: 'G-XCHJSSPV6M'
};

var cfg = window.KALIDAD_FIREBASE_CONFIG && window.KALIDAD_FIREBASE_CONFIG.apiKey
  ? window.KALIDAD_FIREBASE_CONFIG
  : DEFAULT_FIREBASE_CONFIG;

var app = getApps().length ? getApps()[0] : initializeApp(cfg);
var auth = getAuth(app);
var db = getFirestore(app);
var notificationPermissionRequested = false;
var audioContext = null;
var baseDocumentTitle = null;
var CHAT_COLLECTION = 'main_conversations';

function isPortal() {
  return typeof window !== 'undefined' && window.location.pathname.indexOf('/pharmacist.html') !== -1;
}

function installWaitingStyle() {
  if (!isPortal() || document.getElementById('kalidadWaitingAlertStyle')) return;
  var style = document.createElement('style');
  style.id = 'kalidadWaitingAlertStyle';
  style.textContent = '.tab.kc-pending{animation:kalidadWaitingPulse 1.15s ease-in-out infinite;background:#e6f3d9;color:#33581f;box-shadow:0 0 0 2px rgba(143,184,36,.18)}@keyframes kalidadWaitingPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}';
  document.head.appendChild(style);
}

function setWaitingVisual(hasWaiting) {
  if (!isPortal()) return;
  installWaitingStyle();
  var tab = document.getElementById('waitingTab');
  if (!tab) return;
  if (hasWaiting) tab.classList.add('kc-pending');
  else tab.classList.remove('kc-pending');
}

function setPendingTitle() {
  if (!isPortal()) return;
  if (baseDocumentTitle === null) baseDocumentTitle = document.title || 'Kalidad Pharmacy | Customer Support';
  document.title = 'You have a new message!';
}

export function clearStaffNotificationTitle() {
  if (!isPortal()) return;
  document.title = baseDocumentTitle || 'Kalidad Pharmacy | Customer Support';
  baseDocumentTitle = null;
}

async function prepareStaffNotifications() {
  if (!isPortal() || notificationPermissionRequested) return;
  notificationPermissionRequested = true;
  if ('Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch (e) {}
  }
  try {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioContext = audioContext || new AudioCtx();
      if (audioContext.state === 'suspended') await audioContext.resume();
    }
  } catch (e) {}
}

function notifyStaff(conversationId) {
  if (!isPortal()) return;
  setPendingTitle();
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    var n = new Notification('You have a new message!', {
      body: 'Kalidad customer care',
      icon: '/kalidad-icon.png',
      tag: 'kalidad-chat-' + conversationId,
      renotify: true,
      requireInteraction: true
    });
    n.onclick = function() {
      try { window.focus(); } catch (e) {}
      clearStaffNotificationTitle();
      try { n.close(); } catch (e) {}
    };
  } catch (e) {}
}

export async function ensureCustomer() {
  if (auth.currentUser && auth.currentUser.isAnonymous) return auth.currentUser;
  var result = await signInAnonymously(auth);
  return result.user;
}

export async function createHandoff(options) {
  options = options || {};
  var history = Array.isArray(options.history) ? options.history : [];
  var reason = options.reason || 'clinical-question';
  var user = await ensureCustomer();
  var ref = await addDoc(collection(db, CHAT_COLLECTION), {
    customerUid: user.uid,
    status: 'waiting',
    channel: 'website',
    reason: String(reason).slice(0, 120),
    privacyConsent: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp()
  });
  var recent = history.slice(-12);
  for (var i = 0; i < recent.length; i++) {
    var m = recent[i];
    if (!m || m.role !== 'user') continue;
    var body = String(m.content || '').trim().slice(0, 2000);
    if (body) {
      await addDoc(collection(db, CHAT_COLLECTION, ref.id, 'messages'), {
        senderUid: user.uid,
        senderType: 'customer',
        body: body,
        createdAt: serverTimestamp()
      });
    }
  }
  return ref.id;
}

export async function sendCustomerMessage(conversationId, body) {
  var user = await ensureCustomer();
  var text = String(body || '').trim().slice(0, 2000);
  if (!text) return;
  var conversation = await getDoc(doc(db, CHAT_COLLECTION, conversationId));
  if (!conversation.exists() || conversation.data().customerUid !== user.uid) throw new Error('Conversation not found.');
  if (conversation.data().status === 'closed' || conversation.data().status === 'resolved') throw new Error('This conversation is closed.');
  await addDoc(collection(db, CHAT_COLLECTION, conversationId, 'messages'), {
    senderUid: user.uid,
    senderType: 'customer',
    body: text,
    createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, CHAT_COLLECTION, conversationId), {
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    status: 'active'
  });
}

export async function closeCustomerConversation(conversationId) {
  var user = await ensureCustomer();
  var ref = doc(db, CHAT_COLLECTION, conversationId);
  var snapshot = await getDoc(ref);
  if (!snapshot.exists() || snapshot.data().customerUid !== user.uid) throw new Error('Conversation not found.');
  if (snapshot.data().status === 'closed' || snapshot.data().status === 'resolved') return;
  await updateDoc(ref, {
    status: 'closed',
    closedByCustomer: true,
    closedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export function watchCustomerMessages(id, callback, onError) {
  return onSnapshot(
    query(collection(db, CHAT_COLLECTION, id, 'messages'), orderBy('createdAt', 'asc'), limit(100)),
    function(snapshot) {
      callback(snapshot.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); }));
    },
    function(error) {
      console.error('Customer message listener:', error);
      if (typeof onError === 'function') onError(error);
    }
  );
}

export async function getCustomerConversation(id) {
  var user = await ensureCustomer();
  var snapshot = await getDoc(doc(db, CHAT_COLLECTION, id));
  if (!snapshot.exists() || snapshot.data().customerUid !== user.uid) throw new Error('Conversation not found.');
  return Object.assign({ id: snapshot.id }, snapshot.data());
}

export async function staffLogin(email, password) {
  var credential = await signInWithEmailAndPassword(auth, email, password);
  var snapshot = await getDoc(doc(db, 'staff', credential.user.uid));
  if (!snapshot.exists() || (snapshot.data().role !== 'pharmacist' && snapshot.data().role !== 'admin')) {
    await signOut(auth);
    throw new Error('This account is not authorised for the pharmacist portal.');
  }
  if (snapshot.data().active === false) {
    await signOut(auth);
    throw new Error('This pharmacist account is inactive.');
  }
  await prepareStaffNotifications();
  return { user: credential.user, profile: snapshot.data() };
}

export async function staffProfile() {
  var user = auth.currentUser;
  if (!user || user.isAnonymous) return null;
  var snapshot = await getDoc(doc(db, 'staff', user.uid));
  if (!snapshot.exists()) return null;
  return Object.assign({ user: user }, snapshot.data());
}

async function requireStaffUser() {
  var user = auth.currentUser;
  if (!user) {
    user = await new Promise(function(resolve, reject) {
      var done = false;
      var timer = setTimeout(function() { if (!done) { done = true; reject(new Error('Firebase authentication timed out.')); } }, 10000);
      var stop = onAuthStateChanged(auth, function(current) {
        if (current && !done) {
          done = true;
          clearTimeout(timer);
          stop();
          resolve(current);
        }
      });
    });
  }
  if (!user || user.isAnonymous) throw new Error('Staff login required.');
  var snapshot = await getDoc(doc(db, 'staff', user.uid));
  if (!snapshot.exists() || (snapshot.data().role !== 'pharmacist' && snapshot.data().role !== 'admin') || snapshot.data().active === false) throw new Error('Staff login required.');
  return { user: user, profile: snapshot.data() };
}

export function watchWaitingConversations(callback) {
  var initialized = false;
  return onSnapshot(
    query(collection(db, CHAT_COLLECTION), where('status', '==', 'waiting'), limit(50)),
    function(snapshot) {
      var list = snapshot.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      list.sort(function(a, b) { return (b.createdAt && b.createdAt.seconds || 0) - (a.createdAt && a.createdAt.seconds || 0); });
      callback(list);
      setWaitingVisual(list.length > 0);
      if (!initialized) { initialized = true; return; }
      snapshot.docChanges().filter(function(change) { return change.type === 'added'; }).forEach(function(change) { notifyStaff(change.doc.id); });
    },
    function(error) {
      console.error('Waiting conversations listener:', error);
      var queue = document.getElementById('queue');
      if (queue) queue.innerHTML = '<div class="empty">Unable to load waiting conversations.<br><small>' + String(error && error.message ? error.message : 'Firestore listener error.').replace(/[&<>]/g, '') + '</small></div>';
    }
  );
}

export function watchActiveConversations(callback) {
  return onSnapshot(
    query(collection(db, CHAT_COLLECTION), where('status', '==', 'active'), limit(50)),
    function(snapshot) {
      var list = snapshot.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      list.sort(function(a, b) { return (b.updatedAt && b.updatedAt.seconds || 0) - (a.updatedAt && a.updatedAt.seconds || 0); });
      callback(list);
    },
    function(error) {
      console.error('Active listener:', error);
    }
  );
}

export function watchResolvedConversations(callback) {
  return onSnapshot(
    query(collection(db, CHAT_COLLECTION), where('status', '==', 'resolved'), limit(100)),
    function(snapshot) {
      var list = snapshot.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      list.sort(function(a, b) { return (b.resolvedAt && b.resolvedAt.seconds || b.updatedAt && b.updatedAt.seconds || 0) - (a.resolvedAt && a.resolvedAt.seconds || a.updatedAt && a.updatedAt.seconds || 0); });
      callback(list);
    },
    function(error) {
      console.error('History listener:', error);
    }
  );
}

export function watchConversation(id, callback, onError) {
  return onSnapshot(
    doc(db, CHAT_COLLECTION, id),
    function(snapshot) { callback(snapshot.exists() ? Object.assign({ id: snapshot.id }, snapshot.data()) : null); },
    function(error) { console.error('Conversation listener:', error); if (typeof onError === 'function') onError(error); }
  );
}

export function watchStaffMessages(id, callback, onError) {
  clearStaffNotificationTitle();
  return watchCustomerMessages(id, callback, onError);
}

export async function sendStaffMessage(id, body) {
  var result = await requireStaffUser();
  var text = String(body || '').trim().slice(0, 2000);
  if (!text) return;
  await addDoc(collection(db, CHAT_COLLECTION, id, 'messages'), {
    senderUid: result.user.uid,
    senderType: 'staff',
    body: text,
    createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, CHAT_COLLECTION, id), {
    status: 'active',
    assignedStaffUid: result.user.uid,
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp()
  });
}

export async function updateConversation(id, fields) {
  var result = await requireStaffUser();
  if (typeof fields === 'string') fields = { status: fields };
  fields = fields || {};
  var updates = {};
  if (fields.status === 'waiting' || fields.status === 'active' || fields.status === 'resolved') updates.status = fields.status;
  if (fields.assignedStaffUid) updates.assignedStaffUid = fields.assignedStaffUid;
  if (fields.status === 'resolved') {
    updates.resolvedByUid = result.user.uid;
    updates.resolvedByName = String(result.profile.displayName || result.user.email || 'Kalidad pharmacist').slice(0, 160);
    updates.resolvedAt = serverTimestamp();
  } else if (fields.status === 'active' || fields.status === 'waiting') {
    updates.resolvedByUid = null;
    updates.resolvedByName = null;
    updates.resolvedAt = null;
  }
  updates.updatedAt = serverTimestamp();
  await updateDoc(doc(db, CHAT_COLLECTION, id), updates);
}

export async function logoutStaff() {
  clearStaffNotificationTitle();
  await signOut(auth);
}
