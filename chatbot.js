/* Kalidad Pharmacy — guided service assistant + live pharmacist chat */
(function () {
  'use strict';

  var WA = '256759845260';
  var PHONE = '+256 759 845 260';
  var WELCOME = 'Hi! I’m Kalidad Pharmacy’s virtual assistant. How can I assist you today?';
  var history = [];
  var liveId = null;
  var firebase = null;
  var liveUnsub = null;
  var conversationUnsub = null;
  var shown = {};

  var SERVICES = [
    { id: 'prescription', label: 'Prescription filling', detail: 'Our prescription filling service helps you get your prescribed medicines prepared by the pharmacy team. Bring or submit a valid prescription and our team can guide you through the next steps, subject to pharmacist review and medicine availability.' },
    { id: 'otc-wellness', label: 'OTC & wellness products', detail: 'We offer over-the-counter and wellness products across nutritional supplements and boosters, personal hygiene and oral care, skincare and body care, and baby care essentials. Our team can help you find the appropriate products available at Kalidad Pharmacy.' },
    { id: 'health-checks', label: 'Free health checks', detail: 'Kalidad Pharmacy offers free health checks as part of its community pharmacy services. The pharmacy team can explain the checks currently available and guide you through the service.' },
    { id: 'delivery', label: 'Same-day delivery', detail: 'We offer same-day delivery. Delivery coverage, timing and order details are confirmed by the Kalidad Pharmacy team for your request.' },
    { id: 'consultation', label: 'Pharmacist consultation', detail: 'You can speak with a Kalidad pharmacist for medication and health-related guidance. For personal symptoms, treatment choices or medicine questions, a live pharmacist is the right next step.' },
    { id: 'refills', label: 'Refill reminders', detail: 'Our refill reminder service helps you remember when it is time to arrange a medicine refill. The Kalidad Pharmacy team can explain how the reminder service works and help you get started.' }
  ];

  function wa(text) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
  }

  var style = document.createElement('style');
  style.textContent = [
    '.kc-bubble{position:fixed!important;right:20px!important;bottom:24px!important;z-index:2147483647!important;width:58px!important;height:58px!important;display:flex!important;align-items:center!important;justify-content:center!important;border:0!important;border-radius:50%!important;background:#163427!important;color:#fff!important;box-shadow:0 10px 28px rgba(0,0,0,.28)!important;cursor:pointer!important;font-size:25px!important;line-height:1!important;padding:0!important;visibility:visible!important;opacity:1!important}',
    '.kc-panel{position:fixed!important;right:20px!important;bottom:92px!important;z-index:2147483647!important;width:min(380px,calc(100vw - 32px))!important;max-height:76vh!important;background:#fff!important;border-radius:18px!important;box-shadow:0 20px 55px rgba(0,0,0,.28)!important;display:none;flex-direction:column;overflow:hidden;border:1px solid #dfe5df!important;font:15px/1.45 system-ui,sans-serif!important}',
    '.kc-panel.open{display:flex!important}',
    '.kc-head{background:#163427!important;color:#fff!important;padding:14px 16px!important;display:flex!important;justify-content:space-between!important;align-items:center!important}',
    '.kc-head strong{font:700 16px Georgia,serif!important}.kc-head small{display:block;opacity:.8;font-size:11px!important}.kc-close{background:none!important;border:0!important;color:#fff!important;font-size:21px!important;cursor:pointer!important}',
    '.kc-messages{flex:1;overflow:auto;padding:14px;background:#f6f4ec;scroll-behavior:smooth}.kc-msg{max-width:88%;margin:0 0 10px;padding:10px 12px;border-radius:14px;white-space:pre-wrap;word-break:break-word}.kc-msg.bot{background:#edf5e8;color:#163427}.kc-msg.user{background:#163427;color:#fff;margin-left:auto}.kc-msg.system{background:transparent;color:#63746d;font-size:11px;padding:2px 4px}',
    '.kc-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.kc-actions button{border:1px solid #dfe5df;background:#fff;color:#163427;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:700;cursor:pointer}.kc-actions .primary{background:#163427;color:#fff}',
    '.kc-quick{display:flex;flex-wrap:wrap;gap:7px;padding:0 14px 10px;background:#f6f4ec}.kc-quick button{border:1px solid #dfe5df;background:#fff;border-radius:999px;padding:7px 10px;font-size:12px;color:#163427;font-weight:700;cursor:pointer}.kc-quick button.primary{background:#163427;color:#fff;border-color:#163427}',
    '.kc-links{display:flex;gap:8px;padding:9px 14px;background:#f6f4ec;border-top:1px solid #dfe5df}.kc-links a{flex:1;text-align:center;text-decoration:none;font-size:12px;font-weight:700;border-radius:999px;padding:8px}.kc-links .wa{background:#163427;color:#fff}.kc-links .tel{background:#fff;color:#163427;border:1px solid #163427}',
    '.kc-form{display:flex;gap:8px;padding:12px;border-top:1px solid #dfe5df}.kc-form input{flex:1;min-width:0;border:1px solid #dfe5df;border-radius:999px;padding:10px 14px;font:inherit}.kc-form button{border:0;background:#163427;color:#fff;border-radius:999px;padding:0 16px;font-weight:700}.kc-form input:disabled,.kc-form button:disabled{opacity:.55;cursor:not-allowed}',
    '.kc-consent{background:#fff;border:1px solid #dfe5df;border-radius:14px;padding:12px;margin-top:8px;font-size:12px}.kc-live-actions{display:flex;gap:7px;padding:8px 14px;background:#f6f4ec;border-top:1px solid #dfe5df}.kc-live-actions button{flex:1;border:1px solid #dfe5df;background:#fff;color:#163427;border-radius:999px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer}.kc-live-actions .primary{background:#163427;color:#fff;border-color:#163427}.kc-live-actions .danger{border-color:#d9b9b2;background:#f7e7e3;color:#6e3027}',
    '@media(max-width:480px){.kc-bubble{right:16px!important;bottom:20px!important}.kc-panel{right:16px!important;bottom:84px!important;width:calc(100vw - 32px)!important;max-height:78vh!important}}'
  ].join('');
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.innerHTML = '<button class="kc-bubble" id="kcB" type="button" aria-label="Open Kalidad Pharmacy chat">💬</button>' +
    '<div class="kc-panel" id="kcP" role="dialog" aria-label="Kalidad Pharmacy chat">' +
      '<div class="kc-head"><div><strong>Kalidad Pharmacy</strong><small id="kcMode">Choose a service</small></div><button class="kc-close" id="kcC" type="button" aria-label="Close chat">×</button></div>' +
      '<div class="kc-messages" id="kcM"></div>' +
      '<div class="kc-quick" id="kcQ"></div>' +
      '<div class="kc-live-actions" id="kcLiveActions" style="display:none"><button class="danger" id="kcCloseLive" type="button">Close chat</button><button class="primary" id="kcNewLive" type="button" style="display:none">Start a new conversation</button></div>' +
      '<div class="kc-links"><a class="wa" target="_blank" rel="noopener" href="' + wa('Hello Kalidad Pharmacy, I need help.') + '">WhatsApp</a><a class="tel" href="tel:+256759845260">Call ' + PHONE + '</a></div>' +
      '<form class="kc-form" id="kcF"><input id="kcI" maxlength="600" placeholder="Choose a service above" autocomplete="off" disabled><button type="submit" disabled>Send</button></form>' +
    '</div>';

  function init() {
    if (!document.body || document.getElementById('kcB')) return;
    document.body.appendChild(root);

    var B = document.getElementById('kcB');
    var P = document.getElementById('kcP');
    var C = document.getElementById('kcC');
    var M = document.getElementById('kcM');
    var Q = document.getElementById('kcQ');
    var F = document.getElementById('kcF');
    var I = document.getElementById('kcI');
    var MODE = document.getElementById('kcMode');
    var LIVEA = document.getElementById('kcLiveActions');
    var CLOSELIVE = document.getElementById('kcCloseLive');
    var NEWLIVE = document.getElementById('kcNewLive');

    function say(text, cls) {
      var e = document.createElement('div');
      e.className = 'kc-msg ' + (cls || 'bot');
      e.textContent = text;
      M.appendChild(e);
      M.scrollTop = M.scrollHeight;
      return e;
    }

    function renderServices(prompt) {
      Q.innerHTML = '';
      SERVICES.forEach(function (service) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = service.label;
        button.onclick = function () { selectService(service.id); };
        Q.appendChild(button);
      });
      var pharmacist = document.createElement('button');
      pharmacist.type = 'button';
      pharmacist.className = 'primary';
      pharmacist.textContent = '🧑‍⚕️ Chat with a pharmacist';
      pharmacist.onclick = consent;
      Q.appendChild(pharmacist);
      Q.style.display = 'flex';
      if (prompt) say('What else can I help you with?', 'bot');
    }

    function setLiveUi(state) {
      var waiting = state === 'waiting';
      var active = state === 'active';
      var closed = state === 'closed' || state === 'resolved';
      var live = waiting || active;
      MODE.textContent = state === 'active' ? 'Live pharmacist' : state === 'waiting' ? 'Waiting for pharmacist' : closed ? 'Chat closed' : 'Choose a service';
      I.placeholder = live ? 'Message your pharmacist…' : 'Choose a service above';
      I.disabled = !live;
      F.querySelector('button').disabled = !live;
      LIVEA.style.display = waiting || active || closed ? 'flex' : 'none';
      CLOSELIVE.style.display = waiting || active ? 'block' : 'none';
      NEWLIVE.style.display = closed ? 'block' : 'none';
    }

    function showMoreServices() {
      setLiveUi('general');
      renderServices(true);
    }

    function addServiceActions() {
      var e = document.createElement('div');
      e.className = 'kc-msg bot';
      var title = document.createElement('b');
      title.textContent = 'Need more info?';
      e.appendChild(title);
      var actions = document.createElement('div');
      actions.className = 'kc-actions';
      var live = document.createElement('button');
      live.className = 'primary';
      live.type = 'button';
      live.textContent = '🧑‍⚕️ Chat live with a pharmacist';
      live.onclick = consent;
      var more = document.createElement('button');
      more.type = 'button';
      more.textContent = 'More services';
      more.onclick = showMoreServices;
      actions.appendChild(live);
      actions.appendChild(more);
      e.appendChild(actions);
      M.appendChild(e);
      M.scrollTop = M.scrollHeight;
    }

    function selectService(id) {
      if (liveId) return;
      var service = SERVICES.find(function (item) { return item.id === id; });
      if (!service) return;
      Q.style.display = 'none';
      history.push({ role: 'user', content: service.label });
      history.push({ role: 'assistant', content: service.detail });
      history = history.slice(-10);
      say(service.label, 'user');
      say(service.detail, 'bot');
      addServiceActions();
    }

    async function fb() {
      if (firebase) return firebase;
      if (!window.KALIDAD_FIREBASE_CONFIG) {
        await new Promise(function (resolve, reject) {
          var script = document.createElement('script');
          script.src = '/firebase-chat-config.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      firebase = await import('/firebase-chat.js');
      return firebase;
    }

    function consent() {
      if (liveId) return;
      var box = document.createElement('div');
      box.className = 'kc-consent';
      box.innerHTML = '<b>Connect to a pharmacist</b><p>Your chat will be placed in the Kalidad pharmacist queue so a team member can reply here. Do not send passwords, PINs, card details or payment credentials.</p><label><input id="kcOK" type="checkbox"> I agree to continue with pharmacist support.</label><div class="kc-actions"><button class="primary" id="kcGo" type="button">Connect me</button><button id="kcNo" type="button">Cancel</button></div>';
      M.appendChild(box);
      M.scrollTop = M.scrollHeight;
      document.getElementById('kcNo').onclick = function () { box.remove(); };
      document.getElementById('kcGo').onclick = function () {
        if (document.getElementById('kcOK').checked) startLive(box);
      };
    }

    async function startLive(box) {
      box.remove();
      setLiveUi('waiting');
      Q.style.display = 'none';
      say('Connecting you securely to the Kalidad pharmacist team…', 'system');
      try {
        var f = await fb();
        liveId = await f.createHandoff({ history: history, reason: 'service-handoff' });
        try { sessionStorage.setItem('kalidad_live_chat_id', liveId); } catch (_) {}
        say('You’re in the pharmacist queue. You can send a message now, and your pharmacist will reply here when they join.', 'system');
        I.focus();
        watchLive(liveId);
      } catch (error) {
        console.error('Kalidad live chat:', error);
        liveId = null;
        setLiveUi('general');
        renderServices(false);
        say('We could not connect you to the live pharmacist right now. You can continue on WhatsApp instead.', 'bot');
      }
    }

    function watchLive(id) {
      Promise.resolve(fb()).then(function (f) {
        f.ensureCustomer().then(function () {
          if (liveUnsub) liveUnsub();
          if (conversationUnsub) conversationUnsub();
          setLiveUi('waiting');
          liveUnsub = f.watchCustomerMessages(id, function (messages) {
            messages.forEach(function (message) {
              if (!shown[message.id] && message.senderType === 'staff') {
                shown[message.id] = true;
                say(message.body, 'bot');
              }
            });
          }, function (error) {
            console.error(error);
            setLiveUi('general');
            renderServices(false);
          });
          conversationUnsub = f.watchConversation(id, function (conversation) {
            if (!conversation) return;
            if (conversation.status === 'active') setLiveUi('active');
            else if (conversation.status === 'waiting') setLiveUi('waiting');
            else if (conversation.status === 'resolved' || conversation.status === 'closed') {
              setLiveUi(conversation.status);
              say('This pharmacist conversation has ended. You can start a new pharmacist chat if you need further help.', 'system');
              try { sessionStorage.removeItem('kalidad_live_chat_id'); } catch (_) {}
              liveId = null;
            }
          });
        }).catch(function (error) {
          console.error(error);
          liveId = null;
          setLiveUi('general');
          renderServices(false);
        });
      });
    }

    async function sendLive(text) {
      if (!liveId) return;
      say(text, 'user');
      I.value = '';
      I.disabled = true;
      F.querySelector('button').disabled = true;
      try {
        var f = await fb();
        await f.sendCustomerMessage(liveId, text);
      } catch (error) {
        console.error(error);
        say('Your message could not be sent. Please try again.', 'system');
      } finally {
        I.disabled = false;
        F.querySelector('button').disabled = false;
      }
    }

    async function closeLive() {
      if (!liveId) return;
      if (!window.confirm('Close this pharmacist conversation?')) return;
      try {
        var f = await fb();
        await f.closeCustomerConversation(liveId);
      } catch (error) {
        console.error(error);
        say('We could not close the chat right now. Please try again.', 'system');
      }
    }

    function startNewConversation() {
      if (liveUnsub) liveUnsub();
      if (conversationUnsub) conversationUnsub();
      liveUnsub = null;
      conversationUnsub = null;
      liveId = null;
      history = [];
      shown = {};
      try { sessionStorage.removeItem('kalidad_live_chat_id'); } catch (_) {}
      M.innerHTML = '';
      setLiveUi('general');
      say(WELCOME, 'bot');
      renderServices(false);
    }

    B.onclick = function () {
      P.classList.add('open');
      if (!M.children.length) {
        say(WELCOME, 'bot');
        renderServices(false);
      }
    };
    C.onclick = function () { P.classList.remove('open'); };
    F.onsubmit = function (event) {
      event.preventDefault();
      var text = I.value.trim();
      if (text && liveId) sendLive(text);
    };
    CLOSELIVE.onclick = closeLive;
    NEWLIVE.onclick = startNewConversation;
    setLiveUi('general');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
