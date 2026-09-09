/* Kalidad Pharmacy Firebase configuration for the live pharmacist chat.
 * This web app uses the existing Kalidad Pharmacy Firebase project.
 * Access to customer/staff data is controlled by Firebase Authentication + Firestore Rules.
 */
window.KALIDAD_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBK6nEm0kdCp8aYb_dbTPGB5JP2OK7JhRw',
  authDomain: 'kalidad-pharmacy.firebaseapp.com',
  projectId: 'kalidad-pharmacy',
  storageBucket: 'kalidad-pharmacy.firebasestorage.app',
  messagingSenderId: '108387190764',
  appId: '1:108387190764:web:302264adc7dc73d7a0e2c9',
  measurementId: 'G-XCHJSSPV6M'
};

/* Emergency bootstrap for the pharmacist portal. */
(function(){
  function showError(message){
    var el=document.getElementById('loginError');
    if(el) el.textContent=message || 'The pharmacist portal could not start. Please refresh the page.';
  }
  function scrollToLogin(){
    var login=document.getElementById('login');
    if(login) login.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(function(){var email=document.getElementById('email');if(email)email.focus()},450);
  }
  window.addEventListener('error',function(e){
    if(e&&e.error) console.error('Kalidad portal error:',e.error);
  });
  window.addEventListener('unhandledrejection',function(e){
    console.error('Kalidad portal promise error:',e.reason);
    if(document.getElementById('loginBtn')) showError((e.reason&&e.reason.message)||'The pharmacist portal could not start. Please refresh the page.');
  });

  /* Hard-wired sign-out guard. This runs in capture phase so the portal's normal
   * button handler cannot prevent sign-out. It uses the exact same Firebase module
   * and auth instance as the pharmacist portal, then reloads to a clean signed-out state.
   */
  document.addEventListener('click',async function(e){
    var button=e.target && e.target.closest ? e.target.closest('#logout') : null;
    if(!button || button.dataset.signoutBusy==='1') return;
    if(button.textContent.trim()!=='Sign out') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    button.dataset.signoutBusy='1';
    button.disabled=true;
    button.textContent='Signing out…';
    try{
      var m=await import('/firebase-chat.js');
      await m.logoutStaff();
      sessionStorage.removeItem('kalidad_live_chat_id');
      window.location.reload();
    }catch(error){
      console.error('Kalidad pharmacist sign-out:',error);
      button.dataset.signoutBusy='';
      button.disabled=false;
      button.textContent='Sign out';
      showError(error&&error.message ? error.message : 'Unable to sign out. Please try again.');
    }
  },true);

  function bindFallback(){
    var header=document.getElementById('logout');
    if(header && header.textContent.trim()==='Sign in') header.onclick=scrollToLogin;
    var login=document.getElementById('loginBtn');
    if(!login) return;
    login.onclick=async function(){
      var email=(document.getElementById('email')||{}).value||'';
      var password=(document.getElementById('password')||{}).value||'';
      var error=document.getElementById('loginError');
      if(error) error.textContent='';
      login.disabled=true;
      login.textContent='Signing in…';
      try{
        var m=await import('/firebase-chat.js');
        await m.staffLogin(email.trim(),password);
        var p=await m.staffProfile();
        if(!p||!['pharmacist','admin'].includes(p.role)||p.active===false) throw new Error('This account is not authorised for pharmacist support.');
        document.getElementById('login').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        if(header) header.textContent='Sign out';
        login.disabled=false;
        login.textContent='Sign in to support desk';
        if(typeof window.__KALIDAD_START_QUEUES==='function') window.__KALIDAD_START_QUEUES(m);
      }catch(e){
        login.disabled=false;
        login.textContent='Sign in to support desk';
        showError(e&&e.message ? e.message : 'Unable to sign in.');
        console.error('Kalidad pharmacist sign-in:',e);
      }
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindFallback,{once:true}); else bindFallback();
})();
