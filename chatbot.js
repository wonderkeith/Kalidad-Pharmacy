/* Kalidad Pharmacy — FAQ Chat Widget
   No login, no database. Answers from a preset FAQ list; anything else
   hands off to WhatsApp + phone. Include this file on any page after
   adding: <div id="kalidadChatRoot"></div>
   Optionally trigger it from a button: <button data-kalidad-chat-open>Chat with us</button>
*/
(function () {
  var WHATSAPP_NUMBER = '256759845260';
  var PHONE_DISPLAY = '+256 759 845 260';

  // ---- Preset FAQs -------------------------------------------------
  // Add/edit entries here. First matching keyword wins.
  var FAQ = [
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      answer: 'Hello! I can answer quick questions about Kalidad Pharmacy — location, hours, services, delivery and more. What would you like to know?'
    },
    {
      keywords: ['where', 'location', 'address', 'branch', 'find you'],
      answer: 'Kalidad Pharmacy is located in Kisenyi, Fort Portal, Uganda.'
    },
    {
      keywords: ['hours', 'open', 'opening', 'close', 'closing', 'time'],
      answer: 'We are open 24/7, every day.'
    },
    {
      keywords: ['service', 'services', 'offer', 'provide'],
      answer: 'Our services include prescription filling, OTC & wellness products, free health checks, same-day delivery, pharmacist consultations and refill reminders. Ask me about any of these for more detail.'
    },
    {
      keywords: ['prescription', 'refill', 'medicine', 'medication'],
      answer: 'We fill prescriptions and offer refill reminders. For an existing prescription, our team can confirm availability and pricing on WhatsApp.'
    },
    {
      keywords: ['health check', 'checkup', 'blood pressure', 'weight'],
      answer: 'We offer free health checks including weight and blood pressure screening — come by any time, we\u2019re open 24/7.'
    },
    {
      keywords: ['delivery', 'deliver', 'courier', 'same day', 'same-day'],
      answer: 'Yes, we offer same-day delivery. Message our team on WhatsApp with your location to confirm coverage and timing.'
    },
    {
      keywords: ['pharmacist', 'consult', 'consultation', 'advice'],
      answer: 'Our pharmacists are available for consultations. For anything medical or specific to you, it\u2019s best to speak with them directly — I can connect you now.'
    },
    {
      keywords: ['pay', 'payment', 'cash', 'mobile money', 'momo', 'card'],
      answer: 'For current payment options, please check with our team directly — they\u2019ll confirm what works best for your order.'
    },
    {
      keywords: ['order', 'buy', 'purchase'],
      answer: 'To place an order, message our team on WhatsApp with what you need — they\u2019ll confirm availability and any prescription requirement.'
    },
    {
      keywords: ['contact', 'call', 'phone', 'number', 'talk', 'human', 'pharmacist', 'team', 'staff', 'person'],
      answer: 'You can reach our team directly on WhatsApp or by phone — I\u2019ve added the links below.'
    }
  ];

  var FALLBACK = 'I don\u2019t have a preset answer for that yet, but our team can help right away — reach us on WhatsApp or by phone below.';

  // ---- "Place your order" service-selection flow ---------------------
  // Names/links/explanations match the six service panels on services.html.
  var ORDER_SERVICES = [
    {
      name: 'Prescription Filling',
      link: 'prescription-filling.html',
      reply: 'For prescription filling, send us your prescription through WhatsApp or bring it in — we\u2019re open 24 hours a day. Our pharmacist double-checks every order before it reaches you.'
    },
    {
      name: 'OTC & Wellness',
      link: 'otc-wellness.html',
      reply: 'For OTC & wellness products (vitamins, supplements, everyday essentials), message us on WhatsApp or visit in person and our team will help you choose the right product.'
    },
    {
      name: 'Health Checks',
      link: 'health-checks.html',
      reply: 'For health checks (blood pressure, glucose, cholesterol), walk in any time — no appointment needed, and results are explained on the spot.'
    },
    {
      name: 'Same-day Delivery',
      link: 'same-day-delivery.html',
      reply: 'For same-day delivery across Fort Portal, send your order and location on WhatsApp and our team will confirm and coordinate delivery.'
    },
    {
      name: 'Pharmacist Consultation',
      link: 'pharmacist-consultation.html',
      reply: 'For a pharmacist consultation, no appointment is needed for routine questions — visit us any time or message on WhatsApp to arrange a time.'
    },
    {
      name: 'Refill Reminders',
      link: 'refill-reminders.html',
      reply: 'For refill reminders, message us on WhatsApp to set up free SMS or WhatsApp reminders for your regular medication.'
    }
  ];

  function findAnswer(text) {
    var normalized = String(text || '').toLowerCase();
    for (var i = 0; i < FAQ.length; i++) {
      for (var j = 0; j < FAQ[i].keywords.length; j++) {
        if (normalized.indexOf(FAQ[i].keywords[j]) !== -1) return FAQ[i].answer;
      }
    }
    return null;
  }

  var waLink = function (text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
  };

  // ---- Styles --------------------------------------------------------
  var css = ''
    + '.kc-bubble{position:fixed;right:20px;bottom:24px;z-index:1000;width:56px;height:56px;border-radius:50%;'
    + 'background:#163427;color:#fff;border:none;box-shadow:0 10px 24px rgba(0,0,0,.22);cursor:pointer;'
    + 'display:flex;align-items:center;justify-content:center;font-size:24px;}'
    + '.kc-bubble:hover{transform:translateY(-2px);}'
    + '.kc-panel{position:fixed;right:20px;bottom:90px;z-index:1000;width:min(340px,calc(100vw - 32px));'
    + 'max-height:70vh;background:#fff;border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,.25);'
    + 'display:none;flex-direction:column;overflow:hidden;font:15px/1.4 system-ui,sans-serif;border:1px solid #dfe5df;}'
    + '.kc-panel.open{display:flex;}'
    + '.kc-head{background:#163427;color:#fff;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;}'
    + '.kc-head strong{font-family:Georgia,serif;}'
    + '.kc-close{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1;}'
    + '.kc-messages{flex:1;overflow-y:auto;padding:14px;background:#f6f4ec;}'
    + '.kc-msg{max-width:85%;margin:0 0 10px;padding:10px 12px;border-radius:14px;white-space:pre-wrap;}'
    + '.kc-msg.bot{background:#edf5e8;color:#163427;}'
    + '.kc-msg.user{background:#163427;color:#fff;margin-left:auto;}'
    + '.kc-quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px;background:#f6f4ec;}'
    + '.kc-quick button{border:1px solid #dfe5df;background:#fff;border-radius:999px;padding:6px 10px;font-size:12.5px;color:#163427;cursor:pointer;}'
    + '.kc-links{display:flex;gap:8px;padding:10px 14px;background:#f6f4ec;border-top:1px solid #dfe5df;}'
    + '.kc-links a{flex:1;text-align:center;text-decoration:none;font-size:13px;font-weight:600;border-radius:999px;padding:9px 8px;}'
    + '.kc-links a.wa{background:#163427;color:#fff;}'
    + '.kc-links a.tel{background:#fff;color:#163427;border:1px solid #163427;}'
    + '.kc-form{display:flex;gap:8px;padding:12px;border-top:1px solid #dfe5df;background:#fff;}'
    + '.kc-form input{flex:1;border:1px solid #dfe5df;border-radius:999px;padding:10px 14px;font:inherit;}'
    + '.kc-form button{border:none;background:#163427;color:#fff;border-radius:999px;padding:0 16px;font-weight:700;cursor:pointer;}'
    + '.kc-order-options{display:flex;flex-direction:column;gap:6px;margin:0 0 10px;}'
    + '.kc-order-options button{border:1px solid #dfe5df;background:#fff;border-radius:12px;padding:9px 12px;font-size:13.5px;color:#163427;text-align:left;cursor:pointer;font-weight:600;}'
    + '.kc-order-options button:hover{background:#edf5e8;}'
    + '.kc-restart{background:none;border:none;color:#163427;font-weight:700;text-decoration:underline;cursor:pointer;padding:0;font-size:13px;}'
    + '@media(max-width:480px){.kc-panel{right:16px;bottom:86px;}.kc-bubble{right:16px;bottom:20px;}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---- Markup ----------------------------------------------------------
  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<button class="kc-bubble" id="kcBubble" aria-label="Chat with us">💬</button>' +
    '<div class="kc-panel" id="kcPanel" role="dialog" aria-label="Kalidad Pharmacy chat">' +
    '  <div class="kc-head"><strong>Kalidad Pharmacy</strong><button class="kc-close" id="kcClose" aria-label="Close chat">×</button></div>' +
    '  <div class="kc-messages" id="kcMessages"></div>' +
    '  <div class="kc-quick" id="kcQuick">' +
    '    <button type="button" data-q="What are your opening hours?">Hours</button>' +
    '    <button type="button" data-q="Where is Kalidad Pharmacy?">Location</button>' +
    '    <button type="button" data-q="Do you offer delivery?">Delivery</button>' +
    '    <button type="button" data-q="What services do you offer?">Services</button>' +
    '  </div>' +
    '  <div class="kc-links">' +
    '    <a class="wa" target="_blank" rel="noopener" href="' + waLink('') + '">WhatsApp</a>' +
    '    <a class="tel" href="tel:+' + WHATSAPP_NUMBER + '">Call ' + PHONE_DISPLAY + '</a>' +
    '  </div>' +
    '  <form class="kc-form" id="kcForm">' +
    '    <input id="kcInput" type="text" maxlength="200" placeholder="Ask a question…" aria-label="Your question" autocomplete="off">' +
    '    <button type="submit">Send</button>' +
    '  </form>' +
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

  function addMsg(text, who) {
    var el = document.createElement('div');
    el.className = 'kc-msg ' + (who === 'user' ? 'user' : 'bot');
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function openPanel() {
    panel.classList.add('open');
    if (!opened) {
      opened = true;
      addMsg('Hi! I can answer quick questions about Kalidad Pharmacy. Tap a topic below or type your own question.', 'bot');
    }
    input.focus();
  }

  function closePanel() {
    panel.classList.remove('open');
  }

  bubble.addEventListener('click', function () {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  quick.addEventListener('click', function (e) {
    if (e.target.matches('button')) ask(e.target.getAttribute('data-q'));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = input.value.trim();
    if (!val) return;
    input.value = '';
    ask(val);
  });

  function ask(text) {
    addMsg(text, 'user');
    var reply = findAnswer(text);
    setTimeout(function () {
      addMsg(reply || FALLBACK, 'bot');
      if (!reply) {
        var moreLink = document.createElement('div');
        moreLink.className = 'kc-msg bot';
        moreLink.innerHTML = '<a href="' + waLink('Hello Kalidad Pharmacy, I have a question: ' + text) + '" target="_blank" rel="noopener" style="color:#163427;font-weight:700;">Continue on WhatsApp →</a>';
        messages.appendChild(moreLink);
        messages.scrollTop = messages.scrollHeight;
      }
    }, 250);
  }

  function showOrderOptions() {
    addMsg('What service would you like help with?', 'bot');
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
    setTimeout(function () {
      addMsg(svc.reply, 'bot');
      var actions = document.createElement('div');
      actions.className = 'kc-msg bot';
      actions.innerHTML =
        '<a href="' + svc.link + '" style="color:#163427;font-weight:700;">View ' + svc.name + ' page →</a><br>' +
        '<a href="' + waLink('Hello Kalidad Pharmacy, I\u2019d like help with ' + svc.name) + '" target="_blank" rel="noopener" style="color:#163427;font-weight:700;">Continue on WhatsApp →</a>';
      messages.appendChild(actions);
      var again = document.createElement('button');
      again.type = 'button';
      again.className = 'kc-restart';
      again.textContent = 'Choose another service';
      again.addEventListener('click', showOrderOptions);
      var againWrap = document.createElement('div');
      againWrap.className = 'kc-msg bot';
      againWrap.style.background = 'transparent';
      againWrap.style.padding = '0';
      againWrap.appendChild(again);
      messages.appendChild(againWrap);
      messages.scrollTop = messages.scrollHeight;
    }, 250);
  }

  // Any element with data-kalidad-order-open opens the chat directly into
  // the "place your order" service-selection flow.
  document.addEventListener('click', function (e) {
    var orderTrigger = e.target.closest && e.target.closest('[data-kalidad-order-open]');
    if (orderTrigger) {
      e.preventDefault();
      openPanel();
      showOrderOptions();
    }
  });

  // Allow any element with data-kalidad-chat-open to open the widget
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-kalidad-chat-open]');
    if (trigger) {
      e.preventDefault();
      openPanel();
    }
  });
})();
