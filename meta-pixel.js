(() => {
  const PIXEL_ID = '1190062722660898';

  if (!window.fbq) {
    const fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    window.fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/pt_BR/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');

  window.tdahPixel = {
    id: PIXEL_ID,
    track(eventName, parameters = {}, options = {}) {
      window.fbq?.('track', eventName, parameters, options);
    },
    trackOnce(key, eventName, parameters = {}, options = {}) {
      const storageKey = `tdah_pixel_${key}`;
      try {
        if (localStorage.getItem(storageKey)) return false;
        window.fbq?.('track', eventName, parameters, options);
        localStorage.setItem(storageKey, new Date().toISOString());
        return true;
      } catch {
        window.fbq?.('track', eventName, parameters, options);
        return true;
      }
    },
  };

  if (location.pathname === '/' || location.pathname === '/index.html') {
    window.tdahPixel.track('ViewContent', {
      content_ids: ['colecao-completa'],
      content_name: 'Coleção completa — 12 apostilas + 3 recursos interativos',
      content_category: 'Apostilas digitais',
      content_type: 'product',
      value: 37,
      currency: 'BRL',
    });
  }
})();
