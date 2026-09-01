import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const STORE_URL = "store/index.html";
const LOGIN_URL = "store/login.html";
const ACCOUNT_URL = "store/account.html";
const CART_URL = "store/cart.html";
const ADMIN_URL = "admin/login.html";

function relative(path) {
  const depth = Math.max(0, location.pathname.split("/").filter(Boolean).length - 1);
  return `${"../".repeat(depth)}${path}`;
}

function addStyles() {
  if (document.getElementById("kalidad-store-access-styles")) return;
  const style = document.createElement("style");
  style.id = "kalidad-store-access-styles";
  style.textContent = `
    .kalidad-store-link{display:inline-flex!important;align-items:center;gap:6px;padding:9px 13px!important;border-radius:999px!important;font-weight:700!important;font-size:.82rem!important;text-decoration:none!important;white-space:nowrap}
    .kalidad-shop-link{background:#1E4F3B!important;color:#fff!important}
    .kalidad-account-link{background:#E6F3D9!important;color:#33581F!important}
    .kalidad-cart-link{background:transparent!important;color:#1E4F3B!important;border:1px solid #1E4F3B!important}
    .kalidad-mobile-store{border-top:1px solid rgba(228,225,214,.7);margin-top:6px;padding-top:8px}
    @media(max-width:900px){.kalidad-mobile-store{display:flex;flex-direction:column}.kalidad-store-link{justify-content:flex-start;width:100%;padding:12px 8px!important;border-radius:10px!important}}
    @media(min-width:901px){.kalidad-mobile-store{display:none!important}}
  `;
  document.head.appendChild(style);
}

function makeLink(text, href, className) {
  const a = document.createElement("a");
  a.href = relative(href);
  a.textContent = text;
  a.className = `kalidad-store-link ${className || ""}`;
  return a;
}

function normalizedText(value) {
  return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function findLink(container, labels) {
  if (!container) return null;
  const wanted = new Set(labels.map(normalizedText));
  return [...container.querySelectorAll("a")].find(a => wanted.has(normalizedText(a.textContent))) || null;
}

function removeDuplicateLinks(container, labels) {
  if (!container) return;
  const wanted = new Set(labels.map(normalizedText));
  const seen = new Set();
  [...container.querySelectorAll("a")].forEach(a => {
    const label = normalizedText(a.textContent);
    if (!wanted.has(label)) return;
    if (seen.has(label)) a.remove();
    else seen.add(label);
  });
}

function ensureLink(container, text, href, className) {
  if (!container) return null;
  const existing = findLink(container, [text]);
  if (existing) {
    existing.href = relative(href);
    existing.classList.add("kalidad-store-link", className);
    return existing;
  }
  const link = makeLink(text, href, className);
  container.appendChild(link);
  return link;
}

function mount() {
  addStyles();
  const nav = document.querySelector("nav.main-nav");
  const mobile = document.querySelector(".mobile-menu");

  // The public pages already contain their normal header links. Keep one copy only.
  // Add missing store links only where they do not already exist.
  if (nav) {
    removeDuplicateLinks(nav, ["Shop Online", "My Account", "Cart", "Cart (0)"]);
    ensureLink(nav, "Shop Online", STORE_URL, "kalidad-shop-link");
    ensureLink(nav, "My Account", LOGIN_URL, "kalidad-account-link");
    ensureLink(nav, "Cart (0)", CART_URL, "kalidad-cart-link");
  }

  if (mobile) {
    removeDuplicateLinks(mobile, ["Shop Online", "My Account", "Cart", "Cart (0)"]);
    const existingShop = findLink(mobile, ["Shop Online"]);
    const existingAccount = findLink(mobile, ["My Account"]);
    const existingCart = findLink(mobile, ["Cart", "Cart (0)"]);
    const group = document.createElement("div");
    group.className = "kalidad-mobile-store";
    if (existingShop) group.appendChild(existingShop);
    else group.appendChild(makeLink("Shop Online", STORE_URL, "kalidad-shop-link"));
    if (existingAccount) group.appendChild(existingAccount);
    else group.appendChild(makeLink("My Account", LOGIN_URL, "kalidad-account-link"));
    if (existingCart) group.appendChild(existingCart);
    else group.appendChild(makeLink("Cart (0)", CART_URL, "kalidad-cart-link"));
    mobile.appendChild(group);
  }

  const footer = document.querySelector("footer");
  if (footer && !footer.querySelector(".kalidad-staff-login")) {
    const staff = document.createElement("a");
    staff.className = "kalidad-staff-login";
    staff.href = relative(ADMIN_URL);
    staff.textContent = "Staff / Admin login";
    staff.style.cssText = "display:inline-block;margin-top:18px;color:inherit;opacity:.72;font-size:.75rem;font-weight:700";
    footer.appendChild(staff);
  }
}

function updateAccountState(user) {
  const containers = [document.querySelector("nav.main-nav"), document.querySelector(".mobile-menu")];
  containers.forEach(container => {
    if (!container) return;
    [...container.querySelectorAll("a")].forEach(a => {
      if (normalizedText(a.textContent) === "my account") {
        a.href = relative(user ? ACCOUNT_URL : LOGIN_URL);
        a.textContent = "My Account";
      }
    });
  });
}

function updateCartCount() {
  let count = 0;
  try {
    const cart = JSON.parse(localStorage.getItem("kalidad_cart") || "[]");
    count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  } catch (_) {}
  const update = container => {
    if (!container) return;
    [...container.querySelectorAll("a")].forEach(a => {
      const label = normalizedText(a.textContent);
      if (label === "cart" || label === "cart (0)" || /^cart \(\d+\)$/.test(label)) {
        a.textContent = `Cart (${count})`;
        a.href = relative(CART_URL);
      }
    });
  };
  update(document.querySelector("nav.main-nav"));
  update(document.querySelector(".mobile-menu"));
}

if (!location.pathname.includes("/store/") && !location.pathname.includes("/admin/")) {
  mount();
  onAuthStateChanged(auth, updateAccountState);
  updateCartCount();
  window.addEventListener("storage", updateCartCount);
  window.addEventListener("cartchange", updateCartCount);
}
