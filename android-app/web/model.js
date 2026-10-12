(function (root) {
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function normalizeBasket(items, products) {
    return (Array.isArray(items) ? items : [])
      .filter((x) => products.some((p) => p.id === x.id))
      .map((x) => ({
        id: x.id,
        quantity: Math.max(
          1,
          Math.min(20, Math.floor(Number(x.quantity) || 1)),
        ),
      }))
      .filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i);
  }
  function message(basket, products, { fulfilment, branch, note }) {
    const lines = basket.map(
      (x) => `${x.quantity} × ${products.find((p) => p.id === x.id).name}`,
    );
    return [
      "Hello Kalidad Pharmacy, please confirm availability and prices for:",
      ...lines,
      `Preference: ${fulfilment}`,
      `Branch: ${branch}`,
      note ? `Note: ${note}` : "",
      "Please confirm the total, delivery fee (if applicable), and collection/delivery time before placing an order.",
    ]
      .filter(Boolean)
      .join("\n");
  }
  function nextTime(time, now = new Date()) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
      throw Error("Choose a valid time");
    const d = new Date(now);
    const [h, m] = time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  const api = { esc, normalizeBasket, message, nextTime };
  root.KModel = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window === "undefined" ? globalThis : window);
