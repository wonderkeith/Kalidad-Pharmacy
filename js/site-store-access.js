import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const SITE_BASE = new URL("../", import.meta.url);
const STORE_URL = "store/index.html";
const LOGIN_URL = "store/login.html";
const ACCOUNT_URL = "store/account.html";
const CART_URL = "store/cart.html";
const ADMIN_URL = "admin/login.html";
const PRESCRIPTION_HASH = "#prescription-filling";

function relative(path) { return new URL(path, SITE_BASE).href; }
function normalizedText(value) { return (value || "").replace(/\s+/g, " ").trim().toLowerCase(); }
function pageName() { return location.pathname.split("/").pop().toLowerCase() || "index.html"; }
function isHomePage() { return pageName() === "index.html" || pageName() === ""; }
function isCareersOrAbout() { const n = pageName(); return n.includes("career") || n.includes("about"); }
function isServicesPage() { return pageName() === "services.html"; }

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
    .kalidad-staff-login{display:inline-flex!important;align-items:center!important;gap:7px!important;margin-top:18px!important;padding:8px 12px!important;border:1px solid currentColor!important;border-radius:999px!important;font-size:.75rem!important;font-weight:700!important;text-decoration:none!important;opacity:.78!important;cursor:pointer!important}
    .kalidad-staff-login:hover{opacity:1!important}
    .kalidad-staff-fallback{position:fixed!important;right:18px!important;bottom:18px!important;z-index:9999!important;background:#1E4F3B!important;color:#fff!important;padding:9px 13px!important;border-radius:999px!important;font-size:.72rem!important;font-weight:700!important;box-shadow:0 8px 24px rgba(18,41,31,.22)!important;text-decoration:none!important;cursor:pointer!important}
    .kalidad-auth-hidden{display:none!important}
    @media(max-width:900px){.kalidad-mobile-store{display:flex;flex-direction:column}.kalidad-store-link{justify-content:flex-start;width:100%;padding:12px 8px!important;border-radius:10px!important}.kalidad-staff-fallback{right:12px!important;bottom:12px!important}}
    @media(min-width:901px){.kalidad-mobile-store{display:none!important}}
  `;
  document.head.appendChild(style);
}

function makeLink(text, href, className) {
  const a = document.createElement("a");
  a.href = relative(href); a.textContent = text;
  a.className = `kalidad-store-link ${className || ""}`;
  return a;
}
function findLink(container, labels) {
  if (!container) return null;
  const wanted = new Set(labels.map(normalizedText));
  return [...container.querySelectorAll("a")].find(a => wanted.has(normalizedText(a.textContent))) || null;
}
function removeLinks(container, labels) {
  if (!container) return;
  const wanted = new Set(labels.map(normalizedText));
  [...container.querySelectorAll("a")].forEach(a => { if (wanted.has(normalizedText(a.textContent))) a.remove(); });
}
function removeDuplicateLinks(container, labels) {
  if (!container) return;
  const wanted = new Set(labels.map(normalizedText)); const seen = new Set();
  [...container.querySelectorAll("a")].forEach(a => {
    const label = normalizedText(a.textContent); if (!wanted.has(label)) return;
    if (seen.has(label)) a.remove(); else seen.add(label);
  });
}
function ensureLink(container, text, href, className) {
  if (!container) return null;
  const existing = findLink(container, [text]);
  if (existing) { existing.href = relative(href); existing.classList.add("kalidad-store-link", className); return existing; }
  const link = makeLink(text, href, className); container.appendChild(link); return link;
}
function createStaffLink(className) {
  const staff = document.createElement("a"); staff.className = className;
  staff.href = relative(ADMIN_URL); staff.textContent = "Staff / Admin login";
  staff.setAttribute("aria-label", "Staff and Admin login"); return staff;
}

function mountStoreLinks() {
  const nav = document.querySelector("nav.main-nav");
  const mobile = document.querySelector(".mobile-menu");
  const home = isHomePage();
  const restrictedAccountPage = home || isCareersOrAbout();

  [nav, mobile].forEach(container => removeDuplicateLinks(container, ["Shop Online", "My Account", "Cart", "Cart (0)"]));

  if (home) {
    removeLinks(nav, ["My Account", "Cart", "Cart (0)"]);
    removeLinks(mobile, ["My Account", "Cart", "Cart (0)"]);
  }

  if (nav) {
    ensureLink(nav, "Shop Online", home ? LOGIN_URL : STORE_URL, "kalidad-shop-link");
    if (auth.currentUser) {
      // Logged-in customers do not need the Shop Online entry point.
      removeLinks(nav, ["Shop Online"]);
      if (!restrictedAccountPage) ensureLink(nav, "My Account", ACCOUNT_URL, "kalidad-account-link");
      else removeLinks(nav, ["My Account"]);
    } else {
      removeLinks(nav, ["My Account"]);
    }
    if (!home) ensureLink(nav, "Cart (0)", CART_URL, "kalidad-cart-link");
    else removeLinks(nav, ["Cart", "Cart (0)"]);
  }

  if (mobile) {
    const oldShop = findLink(mobile, ["Shop Online"]);
    removeLinks(mobile, ["My Account", "Cart", "Cart (0)"]);
    const group = document.createElement("div"); group.className = "kalidad-mobile-store";
    if (!auth.currentUser) group.appendChild(oldShop || makeLink("Shop Online", home ? LOGIN_URL : STORE_URL, "kalidad-shop-link"));
    if (auth.currentUser && !restrictedAccountPage) group.appendChild(makeLink("My Account", ACCOUNT_URL, "kalidad-account-link"));
    if (!home) group.appendChild(makeLink("Cart (0)", CART_URL, "kalidad-cart-link"));
    if (group.children.length) mobile.appendChild(group);
  }
}

function hideLoggedInElements() {
  if (!auth.currentUser) return;

  // Remove/hide any Shop Online controls left in page-specific headers.
  document.querySelectorAll("a,button").forEach(el => {
    const text = normalizedText(el.textContent);
    if (text === "shop online") el.classList.add("kalidad-auth-hidden");
  });

  // Hide the 24/7 availability span/badge while authenticated.
  document.querySelectorAll("span,div,p").forEach(el => {
    const text = normalizedText(el.textContent);
    if (text === "24/7" || text === "24 / 7") el.classList.add("kalidad-auth-hidden");
  });

  // Hide the Place Your Order CTA while authenticated, including common
  // capitalization variants. Only the CTA element is hidden, not its section.
  document.querySelectorAll("a,button").forEach(el => {
    const text = normalizedText(el.textContent);
    if (text === "place your order" || text === "place order" || text === "place an order") {
      el.classList.add("kalidad-auth-hidden");
    }
  });
}

function mountStaffLogin() {
  const footer = document.querySelector("footer");
  if (footer && !footer.querySelector(".kalidad-staff-login")) footer.appendChild(createStaffLink("kalidad-staff-login"));
  else if (!footer && !document.querySelector(".kalidad-staff-fallback")) document.body.appendChild(createStaffLink("kalidad-staff-fallback"));
}

function updateCartCount() {
  let count = 0;
  try { const cart = JSON.parse(localStorage.getItem("kalidad_cart") || "[]"); count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0); } catch (_) {}
  [document.querySelector("nav.main-nav"), document.querySelector(".mobile-menu")].forEach(container => {
    if (!container) return;
    [...container.querySelectorAll("a")].forEach(a => {
      const label = normalizedText(a.textContent);
      if (label === "cart" || label === "cart (0)" || /^cart \(\d+\)$/.test(label)) { a.textContent = `Cart (${count})`; a.href = relative(CART_URL); }
    });
  });
}

function preparePrescriptionTarget() {
  if (!isServicesPage()) return;
  const candidates = [...document.querySelectorAll("section, .service-card, article, .service-card.detailed")];
  const target = candidates.find(el => normalizedText(el.textContent).includes("prescription filling"));
  if (target && !target.id) target.id = "prescription-filling";
  if (location.hash === PRESCRIPTION_HASH) requestAnimationFrame(() => {
    const destination = document.getElementById("prescription-filling") || target;
    if (destination) setTimeout(() => destination.scrollIntoView({behavior:"smooth", block:"start"}), 150);
  });
}

function mount() {
  addStyles(); mountStoreLinks(); mountStaffLogin(); updateCartCount(); preparePrescriptionTarget(); hideLoggedInElements();
  window.addEventListener("storage", updateCartCount); window.addEventListener("cartchange", updateCartCount);
}

if (!location.pathname.includes("/store/") && !location.pathname.includes("/admin/")) {
  mount();
  onAuthStateChanged(auth, () => { mountStoreLinks(); updateCartCount(); hideLoggedInElements(); });
}
