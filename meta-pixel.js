(() => {
  const PIXEL_ID = '1190062722660898';
  const CONSENT_KEY = 'ma_analytics_consent_v1';
  const pending = [];
  let initialized = false;

  function send(item) {
    if (!initialized) { pending.push(item); return true; }
    if (item.onceKey) {
      const storageKey = `tdah_pixel_${item.onceKey}`;
      try {
        if (localStorage.getItem(storageKey)) return false;
        window.fbq?.('track', item.eventName, item.parameters, item.options);
        localStorage.setItem(storageKey, new Date().toISOString());
        return true;
      } catch {
        window.fbq?.('track', item.eventName, item.parameters, item.options);
        return true;
      }
    }
    window.fbq?.('track', item.eventName, item.parameters, item.options);
    return true;
  }

  window.tdahPixel = {
    id:PIXEL_ID,
    track(eventName, parameters = {}, options = {}) {
      return send({ eventName, parameters, options });
    },
    trackOnce(onceKey, eventName, parameters = {}, options = {}) {
      return send({ onceKey, eventName, parameters, options });
    },
  };

  function init() {
    if (initialized) return;
    initialized = true;
    if (!window.fbq) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      window.fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/pt_BR/fbevents.js';
      document.head.appendChild(script);
    }
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
    pending.splice(0).forEach(send);
  }

  if (localStorage.getItem(CONSENT_KEY) === 'granted') init();
  else window.addEventListener('ma:analytics-consent', (event) => { if (event.detail === 'granted') init(); });
})();
