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
    .kalidad-store-links{display:inline-flex;align-items:center;gap:6px;margin-left:8px}
    .kalidad-store-link{display:inline-flex!important;align-items:center;gap:6px;padding:9px 13px!important;border-radius:999px!important;font-weight:700!important;font-size:.82rem!important;text-decoration:none!important;white-space:nowrap}
    .kalidad-shop-link{background:#1E4F3B!important;color:#fff!important}
    .kalidad-account-link{background:#E6F3D9!important;color:#33581F!important}
    .kalidad-cart-link{background:transparent!important;color:#1E4F3B!important;border:1px solid #1E4F3B!important}
    .kalidad-staff-link{font-size:.72rem!important;opacity:.7;text-decoration:none!important}
    .kalidad-mobile-store{border-top:1px solid rgba(228,225,214,.7);margin-top:6px;padding-top:8px}
    @media(max-width:900px){.kalidad-store-links{display:none!important}.kalidad-mobile-store{display:flex;flex-direction:column}.kalidad-store-link{justify-content:flex-start;width:100%;padding:12px 8px!important;border-radius:10px!important}.kalidad-staff-link{padding:10px 8px!important}}
    @media(min-width:901px){.kalidad-mobile-store{display:none!important}}
    .kalidad-fallback-store{position:fixed;right:18px;top:92px;z-index:55;display:flex;gap:6px;filter:drop-shadow(0 8px 18px rgba(18,41,31,.18))}
    .kalidad-fallback-store a{font:700 12px/1 Lora,serif;padding:10px 12px;border-radius:999px;background:#1E4F3B;color:#fff;text-decoration:none}
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

function mount() {
  addStyles();
  const nav = document.querySelector("nav.main-nav");
  const mobile = document.querySelector(".mobile-menu");

  if (nav && !document.querySelector(".kalidad-store-links")) {
    const group = document.createElement("span");
    group.className = "kalidad-store-links";
    group.append(makeLink("Shop Online", STORE_URL, "kalidad-shop-link"));
    group.append(makeLink("My Account", LOGIN_URL, "kalidad-account-link"));
    group.append(makeLink("Cart (0)", CART_URL, "kalidad-cart-link"));
    nav.appendChild(group);
  }

  if (mobile && !mobile.querySelector(".kalidad-mobile-store")) {
    const group = document.createElement("div");
    group.className = "kalidad-mobile-store";
    group.append(makeLink("Shop Online", STORE_URL, "kalidad-shop-link"));
    group.append(makeLink("My Account", LOGIN_URL, "kalidad-account-link"));
    group.append(makeLink("Cart (0)", CART_URL, "kalidad-cart-link"));
    mobile.appendChild(group);
  }

  if (!nav && !mobile && !document.querySelector(".kalidad-fallback-store")) {
    const fallback = document.createElement("div");
    fallback.className = "kalidad-fallback-store";
    fallback.append(makeLink("Shop Online", STORE_URL, "kalidad-shop-link"));
    fallback.append(makeLink("My Account", LOGIN_URL, "kalidad-account-link"));
    document.body.appendChild(fallback);
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
  document.querySelectorAll(".kalidad-account-link").forEach(a => {
    a.href = relative(user ? ACCOUNT_URL : LOGIN_URL);
    a.textContent = user ? "My Account" : "My Account";
  });
}

function updateCartCount() {
  let count = 0;
  try {
    const cart = JSON.parse(localStorage.getItem("kalidad_cart") || "[]");
    count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  } catch (_) {}
  document.querySelectorAll(".kalidad-cart-link").forEach(a => a.textContent = `Cart (${count})`);
}

if (!location.pathname.includes("/store/") && !location.pathname.includes("/admin/")) {
  mount();
  onAuthStateChanged(auth, updateAccountState);
  updateCartCount();
  window.addEventListener("storage", updateCartCount);
  window.addEventListener("cartchange", updateCartCount);
}
