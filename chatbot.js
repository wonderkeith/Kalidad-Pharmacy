/* Kalidad Pharmacy — Smart Chat Assistant
   The UI remains client-side, but smart answers are requested from the
   server-side /api/ai-chat endpoint so no AI API key is exposed in the browser.
   Include this file on any page after adding:
   <div id="kalidadChatRoot"></div>
   Optional page buttons can use:
   <button data-kalidad-chat-open>Chat with us</button>
   <button data-kalidad-order-open>Place your order</button>
*/
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '256759845260';
  var PHONE_DISPLAY = '+256 759 845 260';

  var FAQ = [
    { keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      answer: 'Hello! I’m Kalidad Pharmacy’s virtual assistant. I can help with pharmacy services, ordering, delivery, wellness products and general questions. What can I help you with?' },
    { keywords: ['where', 'location', 'address', 'branch', 'find you'],
      answer: 'Kalidad Pharmacy is located in Kisenyi, Fort Portal, Uganda.' },
    { keywords: ['hours', 'open', 'opening', 'close', 'closing', 'time'],
      answer: 'Kalidad Pharmacy is open every day, 24/7.' },
    { keywords: ['service', 'services', 'offer', 'provide'],
      answer: 'We offer prescription filling, OTC & wellness products, health checks, same-day delivery, pharmacist consultations and refill reminders.' },
    { keywords: ['delivery', 'deliver', 'courier', 'same day', 'same-day'],
      answer: 'We offer same-day delivery. Send the team your location and order details on WhatsApp so they can confirm coverage and timing.' },
    { keywords: ['contact', 'call', 'phone', 'number', 'human', 'pharmacist', 'team', 'staff', 'person'],
      answer: 'You can contact the Kalidad team through WhatsApp or by phone using the buttons below.' }
  ];

  var ORDER_SERVICES = [
    { name: 'Prescription Filling', link: 'prescription-filling.html', reply: 'For prescription filling, send the prescription to the Kalidad team on WhatsApp or bring it to the pharmacy. A pharmacist will review it before dispensing.' },
    { name: 'OTC & Wellness', link: 'otc-wellness.html', reply: 'For OTC and wellness products, tell the team what you need. They can confirm suitable products, availability and current pricing.' },
    { name: 'Health Checks', link: 'health-checks.html', reply: 'For health checks, visit the pharmacy and the team can explain the available checks and results.' },
    { name: 'Same-day Delivery', link: 'same-day-delivery.html', reply: 'For same-day delivery, send the order and location on WhatsApp. The team will confirm coverage and timing.' },
    { name: 'Pharmacist Consultation', link: 'pharmacist-consultation.html', reply: 'For a pharmacist consultation, I can help you reach the pharmacy team for direct professional assistance.' },
    { name: 'Refill Reminders', link: 'refill-reminders.html', reply: 'For refill reminders, contact the team to arrange reminders for your regular medicines.' }
  ];

  function findFaq(text) {
    var normalized = String(text || '').toLowerCase();
    for (var i = 0; i < FAQ.length; i++) {
      for (var j = 0; j < FAQ[i].keywords.length; j++) {
        if (normalized.indexOf(FAQ[i].keywords[j]) !== -1) return FAQ[i].answer;
      }
    }
    return null;
  }

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  function apiBase() {
    var meta = document.querySelector('meta[name="kalidad-chat-api"]');
    var configured = (window.KALIDAD_CHAT_API_BASE || (meta && meta.content) || '').trim();
    return configured.replace(/\/+$/, '') || window.location.origin;
  }

  var css = ''
    + '.kc-bubble{position:fixed;right:20px;bottom:24px;z-index:1000;width:56px;height:56px;border-radius:50%;background:#163427;color:#fff;border:none;box-shadow:0 10px 24px rgba(0,0,0,.22);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:24px;transition:transform .2s ease;}'
    + '.kc-bubble:hover{transform:translateY(-2px);}'
    + '.kc-panel{position:fixed;right:20px;bottom:90px;z-index:1000;width:min(360px,calc(100vw - 32px));max-height:72vh;background:#fff;border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;font:15px/1.45 system-ui,sans-serif;border:1px solid #dfe5df;}'
    + '.kc-panel.open{display:flex;}'
    + '.kc-head{background:#163427;color:#fff;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;}'
    + '.kc-head strong{font-family:Georgia,serif;font-size:16px;}'
    + '.kc-head small{display:block;opacity:.75;font-size:11px;font-family:system-ui,sans-serif;font-weight:500;margin-top:2px;}'
    + '.kc-close{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1;}'
    + '.kc-messages{flex:1;overflow-y:auto;padding:14px;background:#f6f4ec;}'
    + '.kc-msg{max-width:88%;margin:0 0 10px;padding:10px 12px;border-radius:14px;white-space:pre-wrap;word-break:break-word;}'
    + '.kc-msg.bot{background:#edf5e8;color:#163427;}'
    + '.kc-msg.user{background:#163427;color:#fff;margin-left:auto;}'
    + '.kc-msg.system{background:transparent;color:#647166;font-size:11px;padding:2px 4px;max-width:100%;}'
    + '.kc-typing{display:inline-flex;gap:4px;align-items:center;}'
    + '.kc-typing i{width:5px;height:5px;border-radius:50%;background:#647166;animation:kcPulse 1s infinite ease-in-out;}'
    + '.kc-typing i:nth-child(2){animation-delay:.15s}.kc-typing i:nth-child(3){animation-delay:.3s}'
    + '@keyframes kcPulse{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}'
    + '.kc-quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px;background:#f6f4ec;}'
    + '.kc-quick button{border:1px solid #dfe5df;background:#fff;border-radius:999px;padding:6px 10px;font-size:12.5px;color:#163427;cursor:pointer;}'
    + '.kc-links{display:flex;gap:8px;padding:10px 14px;background:#f6f4ec;border-top:1px solid #dfe5df;}'
    + '.kc-links a{flex:1;text-align:center;text-decoration:none;font-size:13px;font-weight:600;border-radius:999px;padding:9px 8px;}'
    + '.kc-links a.wa{background:#163427;color:#fff}.kc-links a.tel{background:#fff;color:#163427;border:1px solid #163427}'
    + '.kc-form{display:flex;gap:8px;padding:12px;border-top:1px solid #dfe5df;background:#fff;}'
    + '.kc-form input{flex:1;min-width:0;border:1px solid #dfe5df;border-radius:999px;padding:10px 14px;font:inherit;outline:none;}'
    + '.kc-form input:focus{border-color:#1e4f3b;box-shadow:0 0 0 3px rgba(30,79,59,.10)}'
    + '.kc-form button{border:none;background:#163427;color:#fff;border-radius:999px;padding:0 16px;font-weight:700;cursor:pointer;}'
    + '.kc-order-options{display:flex;flex-direction:column;gap:6px;margin:0 0 10px;}'
    + '.kc-order-options button{border:1px solid #dfe5df;background:#fff;border-radius:12px;padding:9px 12px;font-size:13.5px;color:#163427;text-align:left;cursor:pointer;font-weight:600;}'
    + '.kc-order-options button:hover{background:#edf5e8;}'
    + '@media(max-width:480px){.kc-panel{right:16px;bottom:84px;width:calc(100vw - 32px);max-height:76vh}.kc-bubble{right:16px;bottom:20px}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<button class="kc-bubble" id="kcBubble" aria-label="Chat with us">💬</button>' +
    '<div class="kc-panel" id="kcPanel" role="dialog" aria-label="Kalidad Pharmacy smart chat">' +
    '  <div class="kc-head"><div><strong>Kalidad Pharmacy</strong><small>Smart pharmacy assistant</small></div><button class="kc-close" id="kcClose" aria-label="Close chat">×</button></div>' +
    '  <div class="kc-messages" id="kcMessages"></div>' +
    '  <div class="kc-quick" id="kcQuick">' +
    '    <button type="button" data-q="What services do you offer?">Services</button>' +
    '    <button type="button" data-q="What are your opening hours?">Hours</button>' +
    '    <button type="button" data-q="Where is Kalidad Pharmacy?">Location</button>' +
    '    <button type="button" data-q="Do you offer delivery?">Delivery</button>' +
    '  </div>' +
    '  <div class="kc-links"><a class="wa" target="_blank" rel="noopener" href="' + waLink('Hello Kalidad Pharmacy, I need help.') + '">WhatsApp</a><a class="tel" href="tel:+' + WHATSAPP_NUMBER + '">Call ' + PHONE_DISPLAY + '</a></div>' +
    '  <form class="kc-form" id="kcForm"><input id="kcInput" type="text" maxlength="600" placeholder="Ask me anything…" aria-label="Your question" autocomplete="off"><button type="submit">Send</button></form>' +
    '</div>';
  document.body.appendChild(wrap);

  var bubble = document.getElementById('kcBubble');
  var panel = document.getElementById('kcPanel');
  var closeBtn = document.getElementById('kcClose');
  var messages = document.getElementById('kcMessages');
  var form = document.getElementById('kcForm');
  var input = document.getElementById('kcInput');
  var quick = document.getElementById('kcQuick');
  var opened = false;
  var busy = false;
  var history = [];

  function addMsg(text, who) {
    var el = document.createElement('div');
    el.className = 'kc-msg ' + (who || 'bot');
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addTyping() {
    var el = document.createElement('div');
    el.className = 'kc-msg bot';
    el.id = 'kcTyping';
    el.innerHTML = '<span class="kc-typing"><i></i><i></i><i></i></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function openPanel() {
    panel.classList.add('open');
    if (!opened) {
      opened = true;
      addMsg('Hi! I’m your Kalidad Pharmacy virtual assistant. Ask me a question in your own words, or choose a topic below.', 'bot');
      addMsg('For safety, please do not send passwords, PINs, card numbers or other payment credentials. I’m not a replacement for a pharmacist.', 'system');
    }
    input.focus();
  }

  function closePanel() { panel.classList.remove('open'); }

  function setBusy(value) {
    busy = value;
    input.disabled = value;
    form.querySelector('button').disabled = value;
  }

  async function ask(text) {
    if (busy) return;
    text = String(text || '').trim();
    if (!text) return;

    addMsg(text, 'user');
    history.push({ role: 'user', content: text });
    history = history.slice(-10);

    var typing = addTyping();
    setBusy(true);

    try {
      var response = await fetch(apiBase() + '/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, page: window.location.pathname }),
        credentials: 'include'
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || 'AI endpoint unavailable');

      var reply = String(data.answer || '').trim();
      if (!reply) throw new Error('Empty assistant response');
      history.push({ role: 'assistant', content: reply });
      history = history.slice(-10);
      typing.remove();
      addMsg(reply, 'bot');
      if (data.handoff || data.reason === 'ai-unavailable' || data.reason === 'ai-not-configured') addContactActions(text);
    } catch (error) {
      typing.remove();
      var fallback = findFaq(text);
      if (fallback) {
        history.push({ role: 'assistant', content: fallback });
        addMsg(fallback, 'bot');
      } else {
        addMsg('I’m unable to reach the smart assistant right now. I can still connect you with the Kalidad Pharmacy team.', 'bot');
        addContactActions(text);
      }
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  function addContactActions(text) {
    var more = document.createElement('div');
    more.className = 'kc-msg bot';
    more.innerHTML = '<a href="' + waLink('Hello Kalidad Pharmacy, I need help with: ' + text) + '" target="_blank" rel="noopener" style="color:#163427;font-weight:700;">Continue on WhatsApp →</a>';
    messages.appendChild(more);
    messages.scrollTop = messages.scrollHeight;
  }

  function showOrderOptions() {
    openPanel();
    addMsg('Absolutely. What would you like help with?', 'bot');
    var optWrap = document.createElement('div');
    optWrap.className = 'kc-order-options';
    ORDER_SERVICES.forEach(function (svc) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = svc.name;
      b.addEventListener('click', function () { selectOrderService(svc); });
      optWrap.appendChild(b);
    });
    messages.appendChild(optWrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function selectOrderService(svc) {
    addMsg(svc.name, 'user');
    addMsg(svc.reply, 'bot');
    var actions = document.createElement('div');
    actions.className = 'kc-msg bot';
    actions.innerHTML = '<a href="' + svc.link + '" style="color:#163427;font-weight:700;">View ' + svc.name + ' page →</a><br><a href="' + waLink('Hello Kalidad Pharmacy, I’d like help with ' + svc.name) + '" target="_blank" rel="noopener" style="color:#163427;font-weight:700;">Continue on WhatsApp →</a>';
    messages.appendChild(actions);
    messages.scrollTop = messages.scrollHeight;
  }

  bubble.addEventListener('click', function () { panel.classList.contains('open') ? closePanel() : openPanel(); });
  closeBtn.addEventListener('click', closePanel);
  quick.addEventListener('click', function (e) { var button = e.target.closest && e.target.closest('button'); if (button) ask(button.getAttribute('data-q')); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var val = input.value.trim(); input.value = ''; ask(val); });

  document.addEventListener('click', function (e) {
    var orderTrigger = e.target.closest && e.target.closest('[data-kalidad-order-open]');
    if (orderTrigger) { e.preventDefault(); showOrderOptions(); }
    var trigger = e.target.closest && e.target.closest('[data-kalidad-chat-open]');
    if (trigger) { e.preventDefault(); openPanel(); }
  });
})();
