import { db, auth } from "./firebase-config.js";
import { collection, addDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

export async function createOrder({ items, deliveryAddress, customerNotes = "", paymentMethod = "cash_on_delivery", deliveryFee = 0 }) {
  if (!auth.currentUser) throw new Error("Please log in before placing an order.");
  if (!items?.length) throw new Error("Your cart is empty.");
  const subtotal = items.reduce((n, x) => n + Number(x.price) * Number(x.quantity), 0);
  const total = subtotal + Number(deliveryFee);
  const orderRef = await addDoc(collection(db, "orders"), {
    orderNumber: "",
    userId: auth.currentUser.uid,
    customer: { name: auth.currentUser.displayName || auth.currentUser.email, phone: deliveryAddress.phone || "" },
    items, subtotal, deliveryFee: Number(deliveryFee), total, paymentMethod,
    paymentStatus: "pending", orderStatus: "pending", deliveryAddress, customerNotes,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
  const orderNumber = `KAL-${orderRef.id.slice(-6).toUpperCase()}`;
  await updateDoc(orderRef, { orderNumber });
  return orderRef.id;
}

export async function getMyOrders() {
  if (!auth.currentUser) throw new Error("Not signed in");
  const s = await getDocs(query(collection(db, "orders"), where("userId", "==", auth.currentUser.uid), orderBy("createdAt", "desc")));
  return s.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getMyOrder(orderId) {
  if (!auth.currentUser) throw new Error("Not signed in");
  const s = await getDoc(doc(db, "orders", orderId));
  if (!s.exists()) return null;
  const order = { id: s.id, ...s.data() };
  if (order.userId !== auth.currentUser.uid) throw new Error("You are not allowed to view this order.");
  return order;
}
