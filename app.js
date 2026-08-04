const products = [
  { id: 'calma', name: 'Apostila CALMA', category: 'Comportamento e regulação', tag: 'PROTOCOLO', description: 'Compreender, acolher, manter limites possíveis, modelar comunicação e acompanhar padrões.', icon: 'C' },
  { id: 'tdah-vida-real', name: 'TDAH na Vida Real', category: 'TDAH e desenvolvimento', tag: 'GUIA PREMIUM', description: 'Funções executivas, avaliação responsável, rotina, escola, estudo e registros objetivos.', icon: 'T' },
  { id: 'durante-a-crise', name: 'Durante a Crise', category: 'Comportamento e regulação', tag: 'PLANO PRÁTICO', description: 'Segurança, redução de exigência, comunicação acessível e apoio à recuperação.', icon: 'D' },
  { id: 'crise-protesto-frustracao', name: 'Crise, Protesto ou Frustração?', category: 'Comportamento e regulação', tag: 'GUIA DE DECISÃO', description: 'Observar contexto e capacidade sem rotular, com frases e registro A-B-C ampliado.', icon: '?' },
  { id: 'marcos-desenvolvimento', name: 'Marcos do Desenvolvimento', category: 'TDAH e desenvolvimento', tag: '0 A 5 ANOS', description: 'Habilidades por faixa etária, ideias de apoio e sinais para procurar avaliação.', icon: 'M' },
  { id: 'antes-da-crise', name: 'Antes da Crise', category: 'Comportamento e regulação', tag: 'PREVENÇÃO', description: 'Protocolo A.N.T.E.S., mapa de sinais, kit de regulação e plano preventivo.', icon: 'A' },
  { id: 'estrategias-coletivas', name: 'Estratégias Coletivas para Sala', category: 'Escola e inclusão', tag: 'INCLUSÃO', description: 'Seis pilares para uma sala mais previsível, acessível e participativa.', icon: 'E' },
  { id: 'quadro-emocoes', name: 'Quadro de Emoções da Semana', category: 'Família e emoções', tag: 'PREENCHÍVEL', description: 'Observar relações entre emoção, corpo, contexto e apoio sem transformar sentimento em nota.', icon: 'Q' },
  { id: 'protocolo-luz', name: 'Protocolo LUZ', category: 'Família e emoções', tag: 'FAMÍLIAS', description: 'Organizar o caminho após uma preocupação, suspeita ou diagnóstico, sem culpa nem pressa.', icon: 'L' },
  { id: 'protocolo-ensinar', name: 'Protocolo ENSINAR', category: 'Escola e inclusão', tag: 'PROFESSORES', description: 'Transformar barreiras em acesso, participação, comunicação e aprendizagem possível.', icon: 'E' },
  { id: 'protocolo-esperanca', name: 'Protocolo ESPERANÇA', category: 'Família e emoções', tag: 'REDE DE APOIO', description: 'Nove movimentos para organizar respostas e pedir ajuda concreta nos dias difíceis.', icon: 'E' },
  { id: 'protocolo-acolher', name: 'Protocolo ACOLHER', category: 'Comportamento e regulação', tag: 'CRISE EMOCIONAL', description: 'Roteiro de baixa exigência, cartão rápido e plano individual para momentos intensos.', icon: 'A' },
];

const catalog = document.getElementById('catalog');
const toast = document.getElementById('toast');
let activeFilter = 'Todos';
let embeddedCheckout = null;
let stripeClientPromise = null;

function money(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function productForSku(sku) {
  if (sku === 'colecao-completa') {
    return { name: 'Coleção completa — 12 apostilas + 3 bônus', amount: 3700, installments: true };
  }
  const product = products.find((item) => item.id === sku);
  return product ? { name: product.name, amount: 510, installments: false } : null;
}

function renderCatalog() {
  const visible = activeFilter === 'Todos' ? products : products.filter((item) => item.category === activeFilter);
  catalog.innerHTML = visible.map((item, index) => `
    <article class="product-card" style="--delay:${index * 35}ms">
      <div class="product-cover cover-${(index % 4) + 1}">
        <span>${item.tag}</span>
        <strong>${item.name}</strong>
        <i>${item.icon}</i>
        <small>Margareth Almeida</small>
      </div>
      <div class="product-body">
        <span class="category-label">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="product-bottom">
          <div><small>valor promocional</small><strong>${money(510)}</strong></div>
          <button class="button button-primary" data-buy="${item.id}" aria-label="Comprar ${item.name} por R$ 5,10">Comprar</button>
        </div>
      </div>
    </article>
  `).join('');
}

function showToast(message, error = false) {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show${error ? ' error' : ''}`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.className = 'toast'; }, 4200);
}

function addEmbeddedStylesheet() {
  if (document.querySelector('link[href="/embedded-checkout.css"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/embedded-checkout.css';
  document.head.appendChild(link);
}

function loadStripeJs() {
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-stripe-js]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error('Não foi possível carregar o pagamento seguro.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.dataset.stripeJs = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Não foi possível carregar o pagamento seguro.'));
    document.head.appendChild(script);
  });
}

async function getStripeClient() {
  if (!stripeClientPromise) {
    stripeClientPromise = (async () => {
      await loadStripeJs();
      const response = await fetch('/api/config', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.publishableKey) {
        throw new Error(data.error || 'A chave pública da Stripe não está configurada.');
      }
      return window.Stripe(data.publishableKey);
    })();
  }
  return stripeClientPromise;
}

function ensureCheckoutModal() {
  let modal = document.getElementById('checkout-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'checkout-modal';
  modal.className = 'checkout-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="checkout-backdrop" data-checkout-close></div>
    <section class="checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <header class="checkout-panel-header">
        <div>
          <p>Pagamento seguro</p>
          <h2 id="checkout-title">Finalize sua compra</h2>
        </div>
        <button class="checkout-close" type="button" data-checkout-close aria-label="Fechar pagamento">×</button>
      </header>
      <div class="checkout-order" aria-live="polite">
        <span id="checkout-product-name">Preparando produto...</span>
        <strong id="checkout-product-price"></strong>
      </div>
      <p class="checkout-installment-note" id="checkout-installment-note"></p>
      <div class="checkout-loading" id="checkout-loading">
        <span></span>
        <p>Carregando ambiente seguro da Stripe...</p>
      </div>
      <div id="embedded-checkout"></div>
      <p class="checkout-security">🔒 Os dados do cartão são enviados diretamente à Stripe e não passam pelo nosso servidor.</p>
    </section>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('[data-checkout-close]').forEach((element) => {
    element.addEventListener('click', closeCheckout);
  });
  return modal;
}

function openCheckoutModal(product) {
  const modal = ensureCheckoutModal();
  modal.hidden = false;
  modal.classList.add('is-open');
  document.body.classList.add('checkout-open');
  modal.querySelector('#checkout-product-name').textContent = product.name;
  modal.querySelector('#checkout-product-price').textContent = money(product.amount);
  modal.querySelector('#checkout-installment-note').textContent = product.installments
    ? 'Pague à vista ou escolha até 5 parcelas, quando essa opção estiver habilitada para o seu cartão na Stripe.'
    : 'Pagamento à vista no cartão.';
  modal.querySelector('#checkout-loading').hidden = false;
  modal.querySelector('#embedded-checkout').innerHTML = '';
  window.setTimeout(() => modal.querySelector('.checkout-close')?.focus(), 40);
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (!modal || modal.hidden) return;
  try { embeddedCheckout?.destroy(); } catch (error) { console.warn('checkout_destroy_error', error); }
  embeddedCheckout = null;
  modal.classList.remove('is-open');
  modal.hidden = true;
  document.body.classList.remove('checkout-open');
  modal.querySelector('#embedded-checkout').innerHTML = '';
}

async function startCheckout(sku, button) {
  const product = productForSku(sku);
  if (!product) {
    showToast('Produto inválido.', true);
    return;
  }

  const original = button?.textContent;
  try {
    if (button) {
      button.disabled = true;
      button.textContent = 'Preparando...';
    }
    window.dataLayer?.push({ event: 'begin_checkout', ecommerce: { items: [{ item_id: sku }] } });
    openCheckoutModal(product);

    if (embeddedCheckout) {
      try { embeddedCheckout.destroy(); } catch (error) { console.warn('checkout_destroy_error', error); }
      embeddedCheckout = null;
    }

    const stripe = await getStripeClient();
    embeddedCheckout = await stripe.initEmbeddedCheckout({
      fetchClientSecret: async () => {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sku }),
        });
        const data = await response.json();
        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
        }
        return data.clientSecret;
      },
    });

    document.getElementById('checkout-loading').hidden = true;
    embeddedCheckout.mount('#embedded-checkout');
  } catch (error) {
    closeCheckout();
    showToast(error instanceof Error ? error.message : 'Não foi possível abrir o pagamento.', true);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = original;
    }
  }
}

function applyAuthorPhoto() {
  const seal = document.querySelector('.author-seal');
  if (!seal) return;
  seal.classList.add('author-photo');
  seal.setAttribute('role', 'img');
  seal.setAttribute('aria-label', 'Foto de Margareth Almeida');
  seal.innerHTML = '<small>ciência e afeto</small>';
}

function updatePaymentCopy() {
  const offerLead = document.querySelector('.offer-card > small');
  if (offerLead) offerLead.textContent = 'Hoje, à vista ou em até 5x';
  const installment = document.querySelector('.installment-copy');
  if (installment) installment.textContent = 'Cartão à vista ou em até 5x, conforme as opções habilitadas na Stripe para o cartão utilizado.';

  const paymentStep = document.querySelector('.steps-grid li:nth-child(2) p');
  if (paymentStep) paymentStep.textContent = 'O checkout fica dentro da página e permite cartão à vista ou parcelado, conforme elegibilidade.';

  document.querySelectorAll('.faq-list details').forEach((detail) => {
    const summary = detail.querySelector('summary');
    if (summary?.textContent.includes('Como funciona o pagamento')) {
      const paragraph = detail.querySelector('p');
      if (paragraph) paragraph.textContent = 'O checkout seguro da Stripe abre dentro da própria página. O cartão pode ser pago à vista ou parcelado em até 5 vezes quando a opção estiver habilitada para o cartão e para a sua conta Stripe. Após a confirmação, a biblioteca é liberada automaticamente.';
    }
  });
}

document.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === filter));
    renderCatalog();
    return;
  }

  const buy = event.target.closest('[data-buy]');
  if (buy) {
    event.preventDefault();
    startCheckout(buy.dataset.buy, buy);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCheckout();
});

addEmbeddedStylesheet();
renderCatalog();
applyAuthorPhoto();
updatePaymentCopy();
