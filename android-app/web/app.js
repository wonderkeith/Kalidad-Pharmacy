const C = window.CONTENT,
  M = window.KModel,
  E = M.esc;
const icons = {
  home: "M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  shop: "M4 7h16l1 14H3L4 7m4 0V6a4 4 0 0 1 8 0v1",
  care: "M12 21S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 13-9 13",
  read: "M12 5v16M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1",
  more: "M4 6h16M4 12h16M4 18h16",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  clock: "M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  heart: "M12 21S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 13-9 13",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  check: "M5 12l4 4L19 6",
  phone: "M7 3H3v4c0 8 6 14 14 14h4v-4l-5-2-2 2c-4-2-5-3-7-7l2-2-2-5",
  bell: "M5 17h14l-2-4V8a5 5 0 0 0-10 0v5l-2 4m5 3h4",
  leaf: "M20 3C5 1 1 14 9 18c8 4 13-5 11-15M5 21 17 7",
  chat: "M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4",
  trash: "M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  wifi: "M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M9 16a5 5 0 0 1 6 0M12 20h.01",
};
function ico(name, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.leaf}"/></svg>`;
}
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem("kalidad." + key)) ?? fallback;
  } catch {
    return fallback;
  }
}
let basket = M.normalizeBasket(read("basket", []), C.products),
  saved = read("saved", []),
  reminders = read("reminders", []),
  drafts = read("drafts", []),
  tab = "home",
  category = "All",
  query = "",
  savedOnly = false,
  modal = null;
if (!Array.isArray(saved)) saved = [];
if (!Array.isArray(reminders)) reminders = [];
if (!Array.isArray(drafts)) drafts = [];
function persist() {
  try {
    localStorage.setItem("kalidad.basket", JSON.stringify(basket));
    localStorage.setItem("kalidad.saved", JSON.stringify(saved));
    localStorage.setItem("kalidad.reminders", JSON.stringify(reminders));
    localStorage.setItem("kalidad.drafts", JSON.stringify(drafts));
  } catch {
    toast("Device storage is full. Changes may not be saved.");
  }
}
function toast(text) {
  let el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}
function act(action, label, cls = "", extra = "") {
  return `<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
}
function external(url) {
  if (window.KalidadNative) {
    window.KalidadNative.openExternal(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
function wa(text) {
  if (!navigator.onLine) {
    toast("Connect to the internet to send this request.");
    return false;
  }
  external("https://wa.me/256764201229?text=" + encodeURIComponent(text));
  return true;
}
function title(kicker, text, sub = "") {
  return `<div class="page-title"><span class="kicker">${kicker}</span><h1>${text}</h1>${sub ? `<p>${sub}</p>` : ""}</div>`;
}
function section(title, action, label = "View all") {
  return `<div class="section-title"><h2>${title}</h2>${action ? act(action, label + " " + ico("arrow"), "text-button") : ""}</div>`;
}
function product(p) {
  return `<article class="product"><div class="product-photo">${act("save", ico("heart"), saved.includes(p.id) ? "save selected" : "save", `data-id="${p.id}" aria-label="${saved.includes(p.id) ? "Unsave" : "Save"} ${E(p.name)}" aria-pressed="${saved.includes(p.id)}"`)}${act("product", `<img src="${p.image}" alt="${E(p.name)}" loading="lazy">`, "image-button", `data-id="${p.id}"`)}</div><div class="product-body"><span class="micro">${E(p.category)}</span>${act("product", E(p.name), "product-name", `data-id="${p.id}"`)}<div class="product-bottom"><span>Ask for price</span>${act("add", ico("plus"), "add", `data-id="${p.id}" aria-label="Add ${E(p.name)} to enquiry"`)}</div></div></article>`;
}
function article(a, compact = false) {
  return `<button class="article ${compact ? "compact" : ""}" data-action="article" data-id="${a.id}"><img src="${a.image}" alt="" loading="lazy"><div><span class="micro">WELLNESS JOURNAL</span><h3>${E(a.title)}</h3><span class="read-link">Read story ${ico("arrow")}</span></div></button>`;
}
function home() {
  return `<div class="welcome"><div><span class="kicker">YOUR NEIGHBOURHOOD PHARMACY</span><h1>A little care.<br>A healthier everyday.</h1></div>${ico("leaf", "welcome-leaf")}</div><article class="hero"><img src="${C.images.hero}" alt="The Kalidad Pharmacy team"><div class="hero-shade"></div><div class="hero-content"><span class="hero-tag"><i></i> HERE FOR YOU, 24/7</span><h2>Your health.<br>Our priority.</h2><p>Thoughtful care, right here in Fort Portal.</p>${act("go-care", "Explore our services " + ico("arrow"), "button lime")}</div></article><div class="quick-actions">${[
    ["request-prescription", "care", "Prescription"],
    ["reminders", "clock", "Reminders"],
    ["branches", "pin", "Find us"],
    ["consult", "chat", "Talk to us"],
  ]
    .map(([a, i, t]) => act(a, ico(i) + `<span>${t}</span>`, "quick"))
    .join(
      "",
    )}</div><div class="soft-banner">${ico("check")}<div><strong>Care you can count on</strong><span>Open every day. Personal, local, trusted.</span></div></div>${section("Everyday essentials", "go-shop")}<div class="product-grid">${C.products
    .filter((p) => [1, 7, 19, 13].includes(p.id))
    .map(product)
    .join(
      "",
    )}</div><div class="consult-banner"><span class="kicker">A HUMAN TOUCH</span><h2>Questions about<br>your medicines?</h2><p>Get clear answers from our pharmacy team.</p>${act("consult", "Speak to a pharmacist " + ico("arrow"), "button light")}</div>${section("Better living, little by little", "go-read")}<div class="article-list">${C.articles
    .slice(0, 2)
    .map((a) => article(a, true))
    .join("")}</div><div class="footer-note">Your health, your wealth.</div>`;
}
function shop() {
  let list = C.products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (!savedOnly || saved.includes(p.id)) &&
      (p.name + " " + p.description)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return `${title("THE WELLNESS EDIT", "Everyday essentials.", "Explore our ranges. We’ll confirm the right product, price, and availability with you.")}<label class="search">${ico("search")}<input id="search" type="search" placeholder="Search baby care, lotions…" value="${E(query)}" aria-label="Search product ranges"></label><div class="chips">${["All", "Baby care", "Skin & body", "Personal care", "Supplements"].map((c) => act("category", c, c === category ? "chip active" : "chip", `data-value="${E(c)}" aria-pressed="${c === category}"`)).join("")}</div><div class="catalog-meta"><span id="results-count">${list.length} ranges to explore</span>${act("saved-filter", ico("heart") + " Saved", savedOnly ? "text-button selected" : "text-button", `aria-pressed="${savedOnly}"`)}</div><div class="product-grid" id="products">${list.map(product).join("") || '<div class="empty"><h3>No matching ranges</h3><p>Try another search or ask our team for help.</p>' + act("consult", "Ask our team", "button") + "</div>"}</div><div class="notice">Product photos show ranges from our website. Brands and pack sizes vary; the pharmacy confirms the exact item before purchase.</div>`;
}
function care() {
  return `${title("CARE, CLOSE TO YOU", "How can we help?", "Practical support for you and the people you love.")}<div class="care-feature"><img src="${C.images.care}" alt="Pharmacist consultation"><div><span class="kicker">LET’S TALK</span><h2>Good advice.<br>Real people.</h2>${act("consult", "Talk to a pharmacist " + ico("arrow"), "button")}</div></div>${section("Our services")}<div class="service-list">${C.services.map((s) => `<button class="service" data-action="service" data-id="${s.id}"><img src="${s.image}" alt="" loading="lazy"><div><h3>${E(s.title)}</h3><p>${E(s.description)}</p></div>${ico("arrow")}</button>`).join("")}</div><div class="reminder-panel">${ico("bell")}<div><h3>A little nudge, every day.</h3><p>Create private, on-device medicine reminders.</p></div>${act("reminders", "Set up " + ico("arrow"), "text-button")}</div><div class="notice">For urgent medical problems, seek care at a health facility. Requests in this app are reviewed by the pharmacy; sending one does not confirm an appointment or dispensing.</div>`;
}
function journal() {
  return `${title("THE KALIDAD JOURNAL", "Small steps.<br>Better wellbeing.", "Practical reads from our pharmacy’s own website.")}<div class="journal-grid">${C.articles.map((a) => article(a)).join("")}</div>`;
}
function more() {
  return `${title("YOUR KALIDAD", "Local care.<br>Always connected.")}<div class="about-card"><img src="${C.images.team}" alt="The Kalidad Pharmacy team"><div><span class="kicker">YOUR HEALTH, YOUR WEALTH</span><h2>Rooted in Fort Portal.</h2><p>Discover the people, services, and branches behind Kalidad Pharmacy.</p>${act("about", "Meet Kalidad " + ico("arrow"), "text-button")}</div></div><div class="menu-list">${[
    ["branches", "pin", "Our branches", "Find Kisenyi and Kahungabunyonyi"],
    [
      "drafts",
      "shop",
      "My enquiry drafts",
      `${drafts.length} saved on this device`,
    ],
    ["reminders", "bell", "Medicine reminders", "Manage your daily reminders"],
    [
      "go-saved",
      "heart",
      "Saved essentials",
      `${saved.length} favourite ranges`,
    ],
    [
      "privacy",
      "check",
      "Privacy & app information",
      "Know what stays on your device",
    ],
    ["call", "phone", "Call the pharmacy", "+256 759 845 260"],
    ["website", "more", "Visit our website", "kalidadpharmacy.com"],
  ]
    .map(
      ([a, i, t, d]) =>
        `<button class="menu-row" data-action="${a}">${ico(i)}<div><strong>${t}</strong><span>${E(d)}</span></div>${ico("arrow")}</button>`,
    )
    .join(
      "",
    )}</div><div class="footer-note">KALIDAD PHARMACY<br><small>Android • Version 1.0.0</small></div>`;
}
function render() {
  const count = basket.reduce((n, x) => n + x.quantity, 0);
  document.getElementById("app").innerHTML =
    `<div class="app-shell"><header><button class="brand" data-action="go-home" aria-label="Kalidad Pharmacy home"><img src="${C.images.logo}" alt="Kalidad Pharmacy"></button><div class="header-right"><span class="open-pill"><i></i> Open 24/7</span>${act("basket", ico("shop") + (count ? `<b>${count}</b>` : ""), "basket-button", `aria-label="Enquiry basket, ${count} items"`)}</div></header><main id="main">${{ home, shop, care, read: journal, more }[tab]()}</main><nav class="bottom-nav" aria-label="Main navigation">${[
      ["home", "Home"],
      ["shop", "Explore"],
      ["care", "Care"],
      ["read", "Journal"],
      ["more", "More"],
    ]
      .map(([t, l]) =>
        act(
          "nav",
          ico(t) + `<span>${l}</span>`,
          tab === t ? "nav-item active" : "nav-item",
          `data-tab="${t}" ${tab === t ? 'aria-current="page"' : ""}`,
        ),
      )
      .join("")}</nav></div>`;
}
function navigate(t) {
  tab = t;
  close();
  render();
  window.scrollTo(0, 0);
}
function openModal(type, id) {
  modal = { type, id };
  drawModal();
  document.body.classList.add("modal-open");
  document.getElementById("app").inert = true;
  setTimeout(() => document.querySelector(".sheet .close-button")?.focus(), 0);
}
function close() {
  modal = null;
  document.getElementById("overlay").innerHTML = "";
  document.body.classList.remove("modal-open");
  document.getElementById("app").inert = false;
  document.querySelector(".nav-item.active")?.focus();
}
function drawModal() {
  if (!modal) return;
  const { type, id } = modal;
  let html = "";
  if (type === "product") {
    const p = C.products.find((x) => x.id === Number(id));
    html = `<img class="detail-photo" src="${p.image}" alt="${E(p.name)}"><span class="kicker">${E(p.category)}</span><h2>${E(p.name)}</h2><p>${E(p.description)}</p><div class="notice">Price and availability confirmed by the pharmacy. Photo represents the product range.</div>${act("add", "Add to enquiry " + ico("plus"), "button full", `data-id="${p.id}"`)}`;
  }
  if (type === "basket") {
    html = `<span class="kicker">LET’S CHECK FOR YOU</span><h2>Your enquiry basket</h2><p>No payment yet. Our team confirms products, prices, and fulfilment.</p>${
      basket.length
        ? `<div class="basket-lines">${basket
            .map((x) => {
              let p = C.products.find((p) => p.id === x.id);
              return `<div class="basket-line"><img src="${p.image}" alt=""><div><strong>${E(p.name)}</strong><span>Price to be confirmed</span><div class="quantity">${act("decrease", "−", "", `data-id="${p.id}" aria-label="Decrease ${E(p.name)}"`)}<b>${x.quantity}</b>${act("increase", "+", "", `data-id="${p.id}" aria-label="Increase ${E(p.name)}"`)}${act("remove", ico("trash"), "remove", `data-id="${p.id}" aria-label="Remove ${E(p.name)}"`)}</div></div></div>`;
            })
            .join(
              "",
            )}</div><form id="enquiry-form"><label>How would you like to receive it?<select name="fulfilment"><option>Collect from pharmacy</option><option>Ask about delivery</option></select></label><label>Your preferred branch<select name="branch"><option>Kisenyi</option><option>Kahungabunyonyi</option></select></label><label>Optional note<textarea name="note" maxlength="400" placeholder="Preferred brand or pack size. Avoid sensitive medical details."></textarea></label><p class="small">The next step opens WhatsApp with a draft. You review and tap Send there.</p><button class="button full" type="submit">Review WhatsApp enquiry ${ico("arrow")}</button></form>`
        : `<div class="empty">${ico("shop")}<h3>A little space for your essentials.</h3><p>Add a range from Explore to get started.</p>${act("go-shop", "Explore products", "button")}</div>`
    }`;
  }
  if (type === "consult") {
    html = `<img class="detail-photo" src="${C.images.care}" alt="Kalidad pharmacist"><span class="kicker">CARE STARTS WITH A CONVERSATION</span><h2>Talk to our team.</h2><p>Ask about a medicine, product, service, or availability.</p><div class="menu-list">${act("whatsapp", "WhatsApp the pharmacy " + ico("arrow"), "button full")}${act("live-chat", "Open website pharmacist chat " + ico("chat"), "button outline full")}${act("call", "Call +256 759 845 260 " + ico("phone"), "button outline full")}</div><p class="small">Live chat opens the pharmacy website in your browser and needs internet. Response times depend on staff availability.</p>`;
  }
  if (type === "service") {
    let s = C.services.find((x) => x.id === Number(id));
    html = `<img class="detail-photo" src="${s.image}" alt="${E(s.title)}"><span class="kicker">KALIDAD CARE</span><h2>${E(s.title)}</h2><p>${E(s.description)}</p><ul class="details-list">${s.details.map((d) => `<li>${E(d)}</li>`).join("")}</ul>${act("request-service", "Ask about this service " + ico("arrow"), "button full", `data-id="${s.id}"`)}${act("source", "Read the full website page", "text-button", `data-page="${E(s.source)}"`)}`;
  }
  if (type === "request") {
    const s = C.services.find((x) => x.id === Number(id));
    html = `<span class="kicker">SERVICE ENQUIRY</span><h2>${E(s.title)}</h2><p>Ask our team to explain the next step. No appointment is confirmed in this app.</p><form id="request-form" data-id="${s.id}"><label>Preferred branch<select name="branch"><option>Kisenyi</option><option>Kahungabunyonyi</option></select></label><label>Optional question<textarea name="note" maxlength="400" placeholder="Ask about the service or a convenient time. Do not enter private clinical details."></textarea></label><p class="small">WhatsApp will open for you to review and send the request. For prescription filling, ask the pharmacist how to share your prescription securely.</p><button class="button full" type="submit">Review request in WhatsApp ${ico("arrow")}</button></form>`;
  }
  if (type === "article") {
    let a = C.articles.find((x) => x.id === id);
    html = `<img class="detail-photo" src="${a.image}" alt=""><span class="kicker">KALIDAD JOURNAL</span><h2>${E(a.title)}</h2><div class="article-copy">${a.blocks.map((b) => (["h2", "h3"].includes(b.type) ? `<h3>${E(b.text)}</h3>` : `<p class="${b.type === "li" ? "article-point" : ""}">${E(b.text)}</p>`)).join("")}</div><div class="notice">General information from the Kalidad website. For advice about your own medicines or symptoms, speak to a qualified healthcare professional.</div>${act("source", "Read on our website " + ico("arrow"), "text-button", `data-page="${a.source}"`)}`;
  }
  if (type === "branches") {
    html = `<span class="kicker">RIGHT HERE IN FORT PORTAL</span><h2>Your local branches.</h2>${[
      [
        "Kisenyi",
        C.images.kisenyi,
        "Next to Rosefoam Mattress Depot at the MT-Bwamba road junction.",
        "https://maps.app.goo.gl/Eaxz7fNvanTzsc7B7",
      ],
      [
        "Kahungabunyonyi",
        C.images.kahunga,
        "Along Kahungabunyonyi road, City Inn building ground floor.",
        "https://www.google.com/maps/search/?api=1&query=Kalidad+Pharmacy+Kahungabunyonyi+Fort+Portal",
      ],
    ]
      .map(
        ([name, img, description, url]) =>
          `<article class="branch"><img src="${img}" alt="Kalidad ${name} branch"><h3>${name}</h3><p>${description}</p><span class="open-pill"><i></i> Open 24/7</span>${act("external", "Get directions " + ico("pin"), "button outline full", `data-url="${E(url)}"`)}</article>`,
      )
      .join("")}`;
  }
  if (type === "reminders") {
    let native = !!window.KalidadNative;
    let allowed = native && window.KalidadNative.notificationsEnabled();
    html = `<span class="kicker">A DAILY MOMENT OF CARE</span><h2>Medicine reminders.</h2><p>Use the schedule given by your prescriber. This app does not recommend doses.</p><div class="notice">${native ? (allowed ? "Notifications enabled." : "Notifications are off. Enable them to receive reminders.") : "Preview mode: reminders save here, but Android notifications work only in the installed app."} Reminders can be delayed by Android battery settings. Keep another reminder for time-critical doses.</div>${native && !allowed ? act("permission", "Enable notifications " + ico("bell"), "button outline full") : ""}<div class="reminder-list">${reminders.map((r) => `<div class="reminder-item">${ico("clock")}<div><strong>${E(r.name)}</strong><span>Daily • ${E(r.time)}</span></div>${act("delete-reminder", ico("trash"), "icon-button", `data-id="${r.id}" aria-label="Delete ${E(r.name)} reminder"`)}</div>`).join("") || '<p class="small">No reminders yet. Add your first below.</p>'}</div><form id="reminder-form"><label>Reminder label<input name="name" required maxlength="60" placeholder="e.g. Morning medicine"></label><label>Daily time<input name="time" type="time" required value="08:00"></label><button class="button full" type="submit">Save daily reminder ${ico("plus")}</button></form><p class="small">Saved only on this device. Notifications use a private, generic message. Removing the app erases your reminders.</p>`;
  }
  if (type === "drafts") {
    html = `<span class="kicker">SAVED ON YOUR DEVICE</span><h2>Enquiry drafts.</h2><p>These are drafts opened in WhatsApp, not confirmed orders. Contact the pharmacy for status.</p>${drafts.map((d) => `<article class="draft"><span class="micro">${new Date(d.date).toLocaleDateString()}</span><h3>${E(d.title)}</h3><p>${E(d.summary)}</p><span class="draft-badge">Draft • awaiting your send</span>${act("resend", "Open draft again " + ico("arrow"), "text-button", `data-id="${d.id}"`)}</article>`).join("") || '<div class="empty"><h3>No enquiries yet.</h3><p>Explore products or ask about a service to begin.</p></div>'}${drafts.length ? act("clear-drafts", "Delete all drafts", "button outline full") : ""}`;
  }
  if (type === "about") {
    html = `<img class="detail-photo" src="${C.images.team}" alt="Kalidad Pharmacy team"><span class="kicker">YOUR HEALTH, YOUR WEALTH</span><h2>Meet Kalidad.</h2><p>Kalidad Pharmacy serves Fort Portal through its Kisenyi and Kahungabunyonyi branches, with prescription filling, wellness essentials, pharmacist consultation, health checks, and delivery enquiries.</p>${act("source", "Our story on the website " + ico("arrow"), "button full", 'data-page="about.html"')}${act("source", "Careers at Kalidad", "button outline full", 'data-page="careers.html"')}`;
  }
  if (type === "privacy") {
    html = `<span class="kicker">CLEAR BY DESIGN</span><h2>Your information.</h2><h3>On this device</h3><p>Saved ranges, enquiry drafts, and reminder labels stay in this app’s private device storage. Android backup is disabled. Anyone who can unlock your phone may see these items.</p><h3>When you contact us</h3><p>WhatsApp, phone calls, maps, website pages, and pharmacist chat open external apps or your browser. Their privacy policies apply. Nothing is sent until you choose to send it in WhatsApp.</p><h3>Simple and transparent</h3><p>No advertising, analytics, account registration, payment collection, or prescription upload is bundled into this app. The app requests notifications only for the reminders you create.</p><h3>Remove local information</h3><p>Deleting local data clears favourites, drafts, basket, and all scheduled reminders on this device.</p>${act("confirm-clear", "Delete local app data", "button outline full")}<p class="small">Kalidad Pharmacy 1.0.0 • Content snapshot from the GitHub repository. Contact the pharmacy to verify current information.</p>`;
  }
  if (type === "confirm-clear") {
    html = `<h2>Delete local app data?</h2><p>This removes saved products, drafts, basket items, and medicine reminders. It cannot be undone.</p>${act("clear-data", "Delete all local data", "button full")}${act("close", "Keep my data", "button outline full")}`;
  }
  document.getElementById("overlay").innerHTML =
    `<div class="scrim" data-action="close"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="${E(type)}"><div class="sheet-top"><span class="sheet-handle"></span>${act("close", ico("close"), "close-button", `aria-label="Close dialog"`)}</div><div class="sheet-body">${html}</div></section>`;
}
function add(id) {
  let row = basket.find((x) => x.id === id);
  if (row) {
    if (row.quantity >= 20) {
      toast("Maximum 20 per range. Ask the pharmacy for bulk orders.");
      return;
    }
    row.quantity++;
  } else basket.push({ id, quantity: 1 });
  persist();
  render();
  toast("Added to your enquiry basket");
  if (modal) drawModal();
}
function saveDraft(title, summary, message) {
  drafts.unshift({ id: Date.now(), date: Date.now(), title, summary, message });
  drafts = drafts.slice(0, 30);
  persist();
}
document.addEventListener("click", (e) => {
  let b = e.target.closest("[data-action]");
  if (!b) return;
  let { action: a, id, value, page, url } = b.dataset;
  let n = Number(id);
  if (a === "close") {
    close();
    return;
  }
  if (a === "nav") {
    navigate(b.dataset.tab);
    return;
  }
  if (a.startsWith("go-")) {
    if (a === "go-saved") {
      savedOnly = true;
      category = "All";
      query = "";
      navigate("shop");
    } else navigate(a.slice(3));
    return;
  }
  if (
    [
      "basket",
      "consult",
      "branches",
      "reminders",
      "drafts",
      "privacy",
      "about",
      "confirm-clear",
    ].includes(a)
  ) {
    openModal(a);
    return;
  }
  if (["product", "article", "service"].includes(a)) {
    openModal(a, id);
    return;
  }
  if (a === "add") {
    add(n);
    return;
  }
  if (a === "save") {
    saved = saved.includes(n) ? saved.filter((x) => x !== n) : [...saved, n];
    persist();
    render();
    return;
  }
  if (a === "category") {
    category = value;
    render();
    return;
  }
  if (a === "saved-filter") {
    savedOnly = !savedOnly;
    render();
    return;
  }
  if (["increase", "decrease", "remove"].includes(a)) {
    let r = basket.find((x) => x.id === n);
    if (a === "increase") r.quantity = Math.min(20, r.quantity + 1);
    if (a === "decrease") r.quantity--;
    basket = basket.filter((x) => x.id !== n || a !== "remove");
    basket = basket.filter((x) => x.quantity > 0);
    persist();
    render();
    drawModal();
    return;
  }
  if (a === "whatsapp")
    wa(
      "Hello Kalidad Pharmacy, I would like to speak with your pharmacy team.",
    );
  if (a === "live-chat") external("https://kalidadpharmacy.com/#kcB");
  if (a === "call") external("tel:+256759845260");
  if (a === "external") external(url);
  if (a === "website") external("https://kalidadpharmacy.com/");
  if (a === "source") external("https://kalidadpharmacy.com/" + page);
  if (a === "request-prescription") openModal("request", 1);
  if (a === "request-service") openModal("request", n);
  if (a === "permission") {
    window.KalidadNative.enableNotifications();
    toast("Enable notifications in Android, then return here.");
  }
  if (a === "delete-reminder") {
    if (window.KalidadNative) window.KalidadNative.cancelReminder(n);
    reminders = reminders.filter((x) => x.id !== n);
    persist();
    drawModal();
  }
  if (a === "resend") {
    const d = drafts.find((x) => x.id === n);
    wa(d.message);
  }
  if (a === "clear-drafts") {
    drafts = [];
    persist();
    render();
    drawModal();
  }
  if (a === "clear-data") {
    if (window.KalidadNative) window.KalidadNative.clearReminders();
    basket = [];
    saved = [];
    reminders = [];
    drafts = [];
    persist();
    navigate("home");
    toast("Local information deleted");
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    query = e.target.value;
    const list = C.products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!savedOnly || saved.includes(p.id)) &&
        (p.name + " " + p.description)
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    document.getElementById("products").innerHTML =
      list.map(product).join("") ||
      '<div class="empty"><h3>No matching ranges</h3><p>Try a different search.</p></div>';
    document.getElementById("results-count").textContent =
      list.length + " ranges to explore";
  }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  let f = e.target,
    data = Object.fromEntries(new FormData(f));
  if (f.id === "enquiry-form") {
    const message = M.message(basket, C.products, data);
    if (wa(message)) {
      saveDraft(
        "Product enquiry",
        basket
          .map(
            (x) =>
              `${x.quantity} × ${C.products.find((p) => p.id === x.id).name}`,
          )
          .join(", "),
        message,
      );
      toast("WhatsApp opened. Review and tap Send there.");
    }
  }
  if (f.id === "request-form") {
    const s = C.services.find((x) => x.id === Number(f.dataset.id));
    const msg = `Hello Kalidad Pharmacy, I would like to enquire about ${s.title}.\nPreferred branch: ${data.branch}\n${data.note || ""}\nPlease confirm the next step and availability.`;
    if (wa(msg)) {
      saveDraft(s.title, data.branch + " • Service enquiry", msg);
      toast("WhatsApp opened. Review and tap Send there.");
    }
  }
  if (f.id === "reminder-form") {
    const name = data.name.trim();
    if (!name) {
      toast("Enter a reminder label");
      return;
    }
    if (reminders.length >= 30) {
      toast("You can save up to 30 daily reminders.");
      return;
    }
    M.nextTime(data.time);
    let id;
    do {
      id = Math.floor(Math.random() * 2000000000) + 1;
    } while (reminders.some((r) => r.id === id));
    if (window.KalidadNative) {
      try {
        const result = JSON.parse(
          window.KalidadNative.scheduleReminder(id, name, data.time),
        );
        if (!result.ok) {
          toast(result.error || "Reminder could not be scheduled");
          return;
        }
      } catch {
        toast("Reminder could not be scheduled");
        return;
      }
    }
    reminders.push({ id, name, time: data.time });
    persist();
    drawModal();
    toast(
      window.KalidadNative
        ? "Reminder saved. Check notification permission."
        : "Reminder saved in preview mode.",
    );
  }
});
document.addEventListener("keydown", (e) => {
  if (!modal) return;
  if (e.key === "Escape") {
    close();
    return;
  }
  if (e.key === "Tab") {
    let els = [
      ...document.querySelectorAll(
        ".sheet button,.sheet input,.sheet select,.sheet textarea",
      ),
    ].filter((x) => !x.disabled);
    let first = els[0],
      last = els.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
window.kalidadBack = () => {
  if (modal) {
    close();
    return true;
  }
  if (tab !== "home") {
    navigate("home");
    return true;
  }
  return false;
};
window.addEventListener("offline", () =>
  toast("Offline: saved content is still available."),
);
window.addEventListener("focus", () => {
  if (modal?.type === "reminders") drawModal();
});
render();
