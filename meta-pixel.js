(() => {
  const PIXEL_ID = '1190062722660898';
  const CONSENT_KEY = 'ma_analytics_consent_v1';
  const pending = [];
  let initialized = false;
  let consentGranted = safeGet(CONSENT_KEY) !== 'denied';

  function safeGet(key) {
    try { return localStorage.getItem(key); }
    catch { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch { return false; }
  }

  function installFbq() {
    if (window.fbq) return;

    const fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    window.fbq = fbq;
    window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/pt_BR/fbevents.js';
    document.head.appendChild(script);
  }

  function initialize() {
    if (initialized) return;

    installFbq();
    window.fbq('consent', consentGranted ? 'grant' : 'revoke');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');

    if (location.pathname === '/' || location.pathname === '/index.html') {
      window.fbq('track', 'ViewContent', {
        content_ids:['colecao-completa'],
        content_name:'Coleção completa — 12 apostilas + 3 recursos interativos',
        content_category:'Apostilas digitais',
        content_type:'product',
        value:37,
        currency:'BRL',
      });
    }

    initialized = true;
    if (consentGranted) flushPending();
  }

  function dispatch(item) {
    if (!initialized || !consentGranted) {
      if (item.onceKey && pending.some((queued) => queued.onceKey === item.onceKey)) return false;
      pending.push(item);
      return true;
    }

    if (item.onceKey) {
      const storageKey = `tdah_pixel_${item.onceKey}`;
      if (safeGet(storageKey)) return false;
      window.fbq('track', item.eventName, item.parameters, item.options);
      safeSet(storageKey, new Date().toISOString());
      return true;
    }

    window.fbq('track', item.eventName, item.parameters, item.options);
    return true;
  }

  function flushPending() {
    const queued = pending.splice(0);
    queued.forEach(dispatch);
  }

  function updateConsent(value) {
    initialize();
    consentGranted = value === 'granted';
    window.fbq('consent', consentGranted ? 'grant' : 'revoke');

    if (consentGranted) flushPending();
    else pending.splice(0);
  }

  window.tdahPixel = {
    id:PIXEL_ID,
    track(eventName, parameters = {}, options = {}) {
      return dispatch({ eventName, parameters, options });
    },
    trackOnce(onceKey, eventName, parameters = {}, options = {}) {
      return dispatch({ onceKey, eventName, parameters, options });
    },
  };

  window.addEventListener('ma:analytics-consent', (event) => updateConsent(event.detail));
  initialize();
})();
