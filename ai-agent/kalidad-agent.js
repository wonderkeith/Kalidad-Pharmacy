/* Kalidad Pharmacy AI Agent — client UI */
(function () {
  'use strict';
  if (document.getElementById('kalidad-ai')) return;

  var css = document.createElement('style');
  css.textContent = `
    #kalidad-ai{position:fixed;right:22px;bottom:22px;z-index:9999;font-family:Lora,serif}
    #kalidad-ai *{box-sizing:border-box}
    .ka-launch{width:60px;height:60px;border:0;border-radius:50%;background:#1E4F3B;color:#fff;box-shadow:0 14px 34px rgba(18,41,31,.3);display:grid;place-items:center;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}
    .ka-launch:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 18px 38px rgba(18,41,31,.4)}
    .ka-launch svg{width:28px;height:28px}
    .ka-panel{position:absolute;right:0;bottom:74px;width:min(390px,calc(100vw - 28px));height:min(650px,calc(100vh - 110px));background:#F6F4EC;border:1px solid #E4E1D6;border-radius:24px;overflow:hidden;box-shadow:0 24px 70px rgba(18,41,31,.28);display:none;flex-direction:column}
    .ka-panel.open{display:flex;animation:ka-in .22s ease-out}
    @keyframes ka-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
    .ka-head{background:#1E4F3B;color:#fff;padding:18px 18px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .ka-brand{display:flex;align-items:center;gap:11px}.ka-mark{width:40px;height:40px;border-radius:13px;background:#C7EF3E;color:#12291F;display:grid;place-items:center;font-weight:800}.ka-title{font-weight:800;font-size:1rem}.ka-sub{font-size:.7rem;opacity:.78;margin-top:2px}
    .ka-close{border:0;background:transparent;color:#fff;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:20px}
    .ka-messages{flex:1;overflow:auto;padding:18px;display:flex;flex-direction:column;gap:12px}
    .ka-msg{max-width:88%;padding:11px 13px;border-radius:16px;font-size:.86rem;line-height:1.5;white-space:pre-wrap}.ka-msg.bot{align-self:flex-start;background:#fff;color:#16241D;border:1px solid #E4E1D6;border-bottom-left-radius:5px}.ka-msg.user{align-self:flex-end;background:#1E4F3B;color:#fff;border-bottom-right-radius:5px}
    .ka-quick{padding:0 14px 10px;display:flex;flex-wrap:wrap;gap:7px}.ka-quick button{border:1px solid #B8CDBE;background:#fff;color:#1E4F3B;border-radius:999px;padding:8px 11px;font:600 .72rem Lora,serif;cursor:pointer}.ka-quick button:hover{background:#E6F3D9}
    .ka-form{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #E4E1D6;background:#fff}.ka-input{min-width:0;flex:1;border:1px solid #D8D6CC;border-radius:14px;padding:11px 12px;font:inherit;font-size:.84rem;outline:none}.ka-input:focus{border-color:#1E4F3B}.ka-send{width:44px;border:0;border-radius:13px;background:#1E4F3B;color:#fff;cursor:pointer}.ka-note{padding:0 16px 9px;font-size:.62rem;color:#647166;background:#fff;text-align:center}
    @media(max-width:600px){#kalidad-ai{right:14px;bottom:14px}.ka-panel{right:-2px;bottom:70px;height:min(680px,calc(100vh - 94px));border-radius:22px}.ka-launch{width:56px;height:56px}}
  `;
  document.head.appendChild(css);

  var root = document.createElement('div');
  root.id = 'kalidad-ai';
  root.innerHTML = `
    <section class="ka-panel" aria-label="Kalidad AI Pharmacy Assistant">
      <header class="ka-head">
        <div class="ka-brand"><div class="ka-mark">K</div><div><div class="ka-title">Kalidad AI Pharmacy Assistant</div><div class="ka-sub">Here to help • Pharmacist escalation available</div></div></div>
        <button class="ka-close" aria-label="Close assistant">×</button>
      </header>
      <div class="ka-messages" aria-live="polite"></div>
      <div class="ka-quick">
        <button data-q="I have symptoms and need general guidance">🤧 Symptoms</button>
        <button data-q="Help me find a wellness product">🛒 Shop</button>
        <button data-q="I want to speak to a pharmacist">👩🏾‍⚕️ Pharmacist</button>
        <button data-q="What services does Kalidad Pharmacy offer?">🏥 Services</button>
      </div>
      <div class="ka-note">For safety, the assistant does not replace a pharmacist or doctor.</div>
      <form class="ka-form"><input class="ka-input" autocomplete="off" placeholder="Ask Kalidad anything…" aria-label="Message"/><button class="ka-send" aria-label="Send" type="submit">➤</button></form>
    </section>
    <button class="ka-launch" aria-label="Open Kalidad AI Pharmacy Assistant"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.5A7.5 7.5 0 0 1 11.5 9H20v2.5Z"/><path d="M8 13h.01M12 13h.01M16 13h.01"/></svg></button>`;
  document.body.appendChild(root);

  var panel = root.querySelector('.ka-panel'), launch = root.querySelector('.ka-launch'), close = root.querySelector('.ka-close'), messages = root.querySelector('.ka-messages'), form = root.querySelector('.ka-form'), input = root.querySelector('.ka-input');
  var history = [];
  function add(text, who) { var el=document.createElement('div'); el.className='ka-msg '+who; el.textContent=text; messages.appendChild(el); messages.scrollTop=messages.scrollHeight; return el; }
  add('Hello 👋🏾 I’m Kalidad’s AI pharmacy assistant. I can help with common health questions, wellness products, pharmacy services, and connect you with a pharmacist when needed. What can I help you with?', 'bot');
  function open(){panel.classList.add('open');input.focus()}
  function send(text){ text=(text||'').trim(); if(!text)return; add(text,'user'); input.value=''; history.push({role:'user',content:text}); var wait=add('Thinking…','bot');
    fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:history.slice(-10)})})
      .then(function(r){return r.ok?r.json():r.json().catch(function(){return {}}).then(function(x){return Promise.reject(new Error(x.error||'Service unavailable'))})})
      .then(function(data){wait.textContent=data.reply||'I’m unable to answer that right now. Please speak with a Kalidad pharmacist.';history.push({role:'assistant',content:wait.textContent})})
      .catch(function(){wait.textContent='I’m currently unable to reach the AI service. Please use the pharmacist/WhatsApp option or try again shortly.';});
  }
  launch.addEventListener('click',open); close.addEventListener('click',function(){panel.classList.remove('open')}); form.addEventListener('submit',function(e){e.preventDefault();send(input.value)});
  root.querySelectorAll('.ka-quick button').forEach(function(b){b.addEventListener('click',function(){open();send(b.dataset.q)})});
})();
