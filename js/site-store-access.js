import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const SITE_BASE = new URL("../", import.meta.url);
const STORE_URL = "store/index.html";
const LOGIN_URL = "store/login.html";
const ACCOUNT_URL = "store/account.html";
const CART_URL = "store/cart.html";
const ADMIN_URL = "admin/login.html";

function relative(path) { return new URL(path, SITE_BASE).href; }
function label(el) { return (el?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase(); }
function pageName() { return location.pathname.split("/").pop().toLowerCase() || "index.html"; }
function isHome() { return pageName() === "index.html" || pageName() === ""; }
function isCareers() { return pageName().includes("career"); }
function isAbout() { return pageName().includes("about"); }
function isContact() { return pageName().includes("contact"); }
function isNews() { return pageName().includes("news"); }

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
    .kalidad-staff-fallback{position:fixed!important;right:18px!important;bottom:18px!important;z-index:9999!important;background:#1E4F3B!important;color:#fff!important;padding:9px 13px!important;border-radius:999px!important;font-size:.72rem!important;font-weight:700!important;box-shadow:0 8px 24px rgba(18,41,31,.22)!important;text-decoration:none!important}
    @media(max-width:900px){.kalidad-mobile-store{display:flex;flex-direction:column}.kalidad-store-link{justify-content:flex-start;width:100%;padding:12px 8px!important;border-radius:10px!important}}
    @media(min-width:901px){.kalidad-mobile-store{display:none!important}}
  `;
  document.head.appendChild(style);
}
function removeText(container, labels) { if(!container)return; const wanted=labels.map(x=>x.toLowerCase()); [...container.querySelectorAll("a,button,span")].forEach(el=>{if(wanted.includes(label(el)))el.remove();}); }
function removeDuplicates(container,target){if(!container)return;let found=false;[...container.querySelectorAll("a")].forEach(a=>{if(label(a)!==target.toLowerCase())return;if(found)a.remove();else found=true;});}
function findLink(container,target){if(!container)return null;return[...container.querySelectorAll("a")].find(a=>label(a)===target.toLowerCase())||null;}
function makeLink(labelText,href,cls){const a=document.createElement("a");a.href=relative(href);a.textContent=labelText;a.className=`kalidad-store-link ${cls||""}`;return a;}
function ensureLink(container,labelText,href,cls){if(!container)return;const existing=findLink(container,labelText);if(existing){existing.href=relative(href);existing.classList.add("kalidad-store-link",cls);return;}container.appendChild(makeLink(labelText,href,cls));}

function loggedOut(nav,mobile){
  if(nav){removeDuplicates(nav,"Shop Online");ensureLink(nav,"Shop Online",isHome()?LOGIN_URL:STORE_URL,"kalidad-shop-link");if(isHome())removeText(nav,["My Account","Cart","Cart (0)"]);}
  if(mobile){mobile.querySelectorAll(".kalidad-mobile-store").forEach(x=>x.remove());const group=document.createElement("div");group.className="kalidad-mobile-store";group.appendChild(makeLink("Shop Online",isHome()?LOGIN_URL:STORE_URL,"kalidad-shop-link"));if(!isHome())group.appendChild(makeLink("Cart (0)",CART_URL,"kalidad-cart-link"));mobile.appendChild(group);}
}
function loggedIn(nav,mobile){
  removeText(nav,["Shop Online"]);removeText(mobile,["Shop Online"]);
  const accountAllowed=!isCareers()&&!isAbout();
  if(nav&&accountAllowed)ensureLink(nav,"My Account",ACCOUNT_URL,"kalidad-account-link");else removeText(nav,["My Account"]);
  // Logged-in Cart is hidden on Home, Contact, News and About Us.
  const cartAllowed=!isHome()&&!isContact()&&!isNews()&&!isAbout();
  if(nav&&cartAllowed)ensureLink(nav,"Cart (0)",CART_URL,"kalidad-cart-link");else removeText(nav,["Cart","Cart (0)"]);
  if(mobile){mobile.querySelectorAll(".kalidad-mobile-store").forEach(x=>x.remove());const group=document.createElement("div");group.className="kalidad-mobile-store";if(accountAllowed)group.appendChild(makeLink("My Account",ACCOUNT_URL,"kalidad-account-link"));if(cartAllowed)group.appendChild(makeLink("Cart (0)",CART_URL,"kalidad-cart-link"));if(group.children.length)mobile.appendChild(group);}
}
function removeUnwantedHeader(){if(isContact()){document.querySelectorAll(".open-badge").forEach(x=>x.remove());removeText(document.querySelector("header"),["open 24/7","24/7"]);}}
function removeLoggedInCTAs(){if(!auth.currentUser)return;const unwanted=["place your order","place an order","order now","open 24/7","24/7"];document.querySelectorAll("a,button,span,.open-badge").forEach(el=>{if(unwanted.includes(label(el)))el.remove();});document.querySelectorAll(".open-badge").forEach(x=>x.remove());}
function mountStaff(){const footer=document.querySelector("footer");if(footer&&!footer.querySelector(".kalidad-staff-login")){const a=document.createElement("a");a.className="kalidad-staff-login";a.href=relative(ADMIN_URL);a.textContent="Staff / Admin login";footer.appendChild(a);}else if(!footer&&!document.querySelector(".kalidad-staff-fallback")){const a=document.createElement("a");a.className="kalidad-staff-fallback";a.href=relative(ADMIN_URL);a.textContent="Staff / Admin login";document.body.appendChild(a);}}
function updateCart(){let n=0;try{n=JSON.parse(localStorage.getItem("kalidad_cart")||"[]").reduce((s,x)=>s+Number(x.quantity||0),0)}catch(_){}document.querySelectorAll("a").forEach(a=>{if(/^cart( \(\d+\))?$/.test(label(a))){a.textContent=`Cart (${n})`;a.href=relative(CART_URL)}})}
function prescriptionScroll(){if(pageName()!=="services.html"||location.hash!=="#prescription-filling")return;const target=[...document.querySelectorAll("section,article,.service-card,.service-card.detailed")].find(x=>label(x).includes("prescription filling"));if(target&&!target.id)target.id="prescription-filling";if(target)setTimeout(()=>target.scrollIntoView({behavior:"smooth",block:"start"}),180)}
function mount(){addStyles();removeUnwantedHeader();if(auth.currentUser)loggedIn(document.querySelector("nav.main-nav"),document.querySelector(".mobile-menu"));else loggedOut(document.querySelector("nav.main-nav"),document.querySelector(".mobile-menu"));mountStaff();updateCart();removeLoggedInCTAs();prescriptionScroll();}
if(!location.pathname.includes("/store/")&&!location.pathname.includes("/admin/")){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();onAuthStateChanged(auth,()=>{document.querySelectorAll(".kalidad-mobile-store").forEach(x=>x.remove());mount();});}
