const products = [
  { id:'calma', name:'Apostila CALMA', category:'Comportamento e regulação', tag:'PROTOCOLO', description:'Compreender, acolher, manter limites possíveis, modelar comunicação e acompanhar padrões.', icon:'C' },
  { id:'tdah-vida-real', name:'TDAH na Vida Real', category:'TDAH e desenvolvimento', tag:'GUIA PREMIUM', description:'Funções executivas, avaliação responsável, rotina, escola, estudo e registros objetivos.', icon:'T' },
  { id:'durante-a-crise', name:'Durante a Crise', category:'Comportamento e regulação', tag:'PLANO PRÁTICO', description:'Segurança, redução de exigência, comunicação acessível e apoio à recuperação.', icon:'D' },
  { id:'crise-protesto-frustracao', name:'Crise, Protesto ou Frustração?', category:'Comportamento e regulação', tag:'GUIA DE DECISÃO', description:'Observar contexto e capacidade sem rotular, com frases e registro A-B-C ampliado.', icon:'?' },
  { id:'marcos-desenvolvimento', name:'Marcos do Desenvolvimento', category:'TDAH e desenvolvimento', tag:'0 A 5 ANOS', description:'Habilidades por faixa etária, ideias de apoio e sinais para procurar avaliação.', icon:'M' },
  { id:'antes-da-crise', name:'Antes da Crise', category:'Comportamento e regulação', tag:'PREVENÇÃO', description:'Protocolo A.N.T.E.S., mapa de sinais, kit de regulação e plano preventivo.', icon:'A' },
  { id:'estrategias-coletivas', name:'Estratégias Coletivas para Sala', category:'Escola e inclusão', tag:'INCLUSÃO', description:'Seis pilares para uma sala mais previsível, acessível e participativa.', icon:'E' },
  { id:'quadro-emocoes', name:'Quadro de Emoções da Semana', category:'Família e emoções', tag:'PREENCHÍVEL', description:'Observar relações entre emoção, corpo, contexto e apoio sem transformar sentimento em nota.', icon:'Q' },
  { id:'protocolo-luz', name:'Protocolo LUZ', category:'Família e emoções', tag:'FAMÍLIAS', description:'Organizar o caminho após uma preocupação, suspeita ou diagnóstico, sem culpa nem pressa.', icon:'L' },
  { id:'protocolo-ensinar', name:'Protocolo ENSINAR', category:'Escola e inclusão', tag:'PROFESSORES', description:'Transformar barreiras em acesso, participação, comunicação e aprendizagem possível.', icon:'E' },
  { id:'protocolo-esperanca', name:'Protocolo ESPERANÇA', category:'Família e emoções', tag:'REDE DE APOIO', description:'Nove movimentos para organizar respostas e pedir ajuda concreta nos dias difíceis.', icon:'E' },
  { id:'protocolo-acolher', name:'Protocolo ACOLHER', category:'Comportamento e regulação', tag:'CRISE EMOCIONAL', description:'Roteiro de baixa exigência, cartão rápido e plano individual para momentos intensos.', icon:'A' },
];

const offers = {
  'colecao-completa': { name:'Coleção completa — 12 apostilas + 3 bônus', amount:3700, installments:true },
  'kit-essencial': { name:'Kit Essencial — 3 apostilas', amount:1290, installments:false },
};
products.forEach((item) => { offers[item.id] = { name:item.name, amount:510, installments:false }; });

const catalog = document.getElementById('catalog');
const toast = document.getElementById('toast');
let activeFilter = 'Todos';
let embeddedCheckout = null;
let stripeClientPromise = null;
let activeSku = null;
let checkoutMounted = false;
let suppressDownsell = false;

function money(cents) { return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(cents / 100); }

function showToast(message, error=false) {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show${error ? ' error' : ''}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.className = 'toast'; }, 4400);
}

function addFunnelStylesheet() {
  if (document.querySelector('link[href="/funnel.css"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/funnel.css';
  document.head.appendChild(link);
}

function atlas(name, label='') { return `<div class="campaign-image atlas atlas-${name}" role="img" aria-label="${label}"><img src="/assets/funnel-atlas.webp" alt="" aria-hidden="true"></div>`; }

function injectCampaignImages() {
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) heroVisual.innerHTML = atlas('a1', 'Família utilizando apostilas impressas e encadernadas');

  const how = document.getElementById('como-funciona');
  if (how && !document.getElementById('imprimir-encadernar')) {
    how.insertAdjacentHTML('afterend', `<section class="campaign-section section" id="imprimir-encadernar"><div class="container campaign-split"><div>${atlas('a2','Apostilas impressas e encadernadas com espiral')}</div><div class="campaign-copy"><p class="eyebrow">DO ARQUIVO PARA A ROTINA</p><h2>Baixe, imprima e encaderne do seu jeito.</h2><p>Você recebe os arquivos digitais. Pode ler pelo celular ou computador, imprimir somente as páginas necessárias ou montar suas próprias apostilas com espiral para reutilizar em casa, na escola ou nos atendimentos.</p><ul><li>Acesso digital após a confirmação</li><li>Impressão conforme sua necessidade</li><li>Organização prática por temas</li></ul><button class="button button-accent button-large" data-buy="colecao-completa">Quero a coleção completa</button></div></div></section>`);
  }

  const catalogSection = document.getElementById('apostilas');
  if (catalogSection && !document.getElementById('uso-em-familia')) {
    catalogSection.insertAdjacentHTML('afterend', `<section class="campaign-section family-section section" id="uso-em-familia"><div class="container campaign-split reverse"><div class="campaign-copy"><p class="eyebrow">APOIO PARA QUEM CUIDA E ENSINA</p><h2>Materiais para aproximar o adulto da prática.</h2><p>As apostilas ajudam a transformar orientações amplas em atividades, registros e próximos passos mais visíveis. O adulto continua sendo o mediador: observa, adapta e respeita o ritmo da criança.</p><div class="mini-proof"><strong>Use em casa, na escola ou no atendimento</strong><span>Sem promessas universais e sem substituir acompanhamento individualizado.</span></div></div><div>${atlas('a3','Pais e crianças realizando atividades com apostilas')}</div></div></section>`);
  }

  const faq = document.getElementById('duvidas');
  if (faq && !document.getElementById('prova-visual')) {
    faq.insertAdjacentHTML('beforebegin', `<section class="campaign-section proof-section section" id="prova-visual"><div class="container"><div class="section-heading centered"><p class="eyebrow">EXPERIÊNCIA DE USO</p><h2>O material foi pensado para ser simples de receber, imprimir e aplicar.</h2><p>A composição abaixo ilustra situações de uso e comunicação com compradores. Ela não representa conversas ou depoimentos reais.</p></div>${atlas('a4','Composição ilustrativa de mensagens e uso de apostilas')}<p class="illustration-disclaimer">Imagem promocional ilustrativa. Nomes, mensagens e números apresentados na arte não constituem avaliações verificadas nem quantidade real de clientes.</p></div></section>`);
  }
}

function renderCatalog() {
  if (!catalog) return;
  const visible = activeFilter === 'Todos' ? products : products.filter((item) => item.category === activeFilter);
  catalog.innerHTML = visible.map((item, index) => `<article class="product-card" style="--delay:${index * 35}ms"><div class="product-cover cover-${(index % 4) + 1}"><span>${item.tag}</span><strong>${item.name}</strong><i>${item.icon}</i><small>Margareth Almeida</small></div><div class="product-body"><span class="category-label">${item.category}</span><h3>${item.name}</h3><p>${item.description}</p><div class="product-bottom"><div><small>valor promocional</small><strong>${money(510)}</strong></div><button class="button button-primary" data-buy="${item.id}" aria-label="Comprar ${item.name} por R$ 5,10">Comprar</button></div></div></article>`).join('');
}

function loadStripeJs() {
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-stripe-js]');
    if (existing) { existing.addEventListener('load', resolve, { once:true }); existing.addEventListener('error', () => reject(new Error('Não foi possível carregar o pagamento seguro.')), { once:true }); return; }
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
  if (!stripeClientPromise) stripeClientPromise = (async () => {
    await loadStripeJs();
    const response = await fetch('/api/config', { cache:'no-store' });
    const data = await response.json();
    if (!response.ok || !data.publishableKey) throw new Error(data.error || 'A chave pública da Stripe não está configurada.');
    return window.Stripe(data.publishableKey);
  })();
  return stripeClientPromise;
}

function savedLead() {
  try { return JSON.parse(localStorage.getItem('margareth_checkout_lead') || '{}'); } catch { return {}; }
}

function ensureCheckoutModal() {
  let modal = document.getElementById('checkout-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'checkout-modal';
  modal.className = 'checkout-modal';
  modal.hidden = true;
  modal.innerHTML = `<div class="checkout-backdrop" data-checkout-close></div><section class="checkout-panel checkout-panel-wide" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button class="checkout-close" type="button" data-checkout-close aria-label="Fechar pagamento">×</button><div class="checkout-conversion-banner">${atlas('b1','Banner de segurança da compra e apresentação da coleção')}</div><div class="checkout-flow"><header class="checkout-panel-header"><div><p>Pagamento seguro</p><h2 id="checkout-title">Finalize sua compra</h2></div></header><div class="checkout-order"><span id="checkout-product-name">Preparando produto...</span><strong id="checkout-product-price"></strong></div><form id="lead-form" class="lead-form" novalidate><p>Preencha seus dados para vincular a compra e receber o acesso por e-mail.</p><label>Nome completo<input id="lead-name" name="name" autocomplete="name" required minlength="3" placeholder="Seu nome completo"></label><label>E-mail para receber o material<input id="lead-email" name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></label><label>WhatsApp com DDD<input id="lead-whatsapp" name="whatsapp" inputmode="tel" autocomplete="tel" required placeholder="(13) 99999-9999"></label><button class="button button-accent button-full button-large" type="submit">Continuar para o cartão</button><small>Seus dados serão registrados na compra e usados para entrega e suporte. Consulte a Política de Privacidade.</small></form><div class="checkout-stage" id="checkout-stage" hidden><p class="checkout-installment-note" id="checkout-installment-note"></p><div class="checkout-loading" id="checkout-loading"><span></span><p>Carregando ambiente seguro da Stripe...</p></div><div id="embedded-checkout"></div></div><p class="checkout-security">🔒 Os dados do cartão são enviados diretamente à Stripe e não passam pelo nosso servidor.</p></div></section>`;
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-checkout-close]').forEach((el) => el.addEventListener('click', () => closeCheckout(true)));
  modal.querySelector('#lead-form').addEventListener('submit', submitLead);
  const lead = savedLead();
  modal.querySelector('#lead-name').value = lead.name || '';
  modal.querySelector('#lead-email').value = lead.email || '';
  modal.querySelector('#lead-whatsapp').value = lead.whatsapp || '';
  modal.querySelector('#lead-whatsapp').addEventListener('input', (event) => {
    const d = event.target.value.replace(/\D/g, '').slice(0, 11);
    event.target.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3') : d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  });
  return modal;
}

function openCheckoutModal(sku) {
  const offer = offers[sku];
  if (!offer) return showToast('Produto inválido.', true);
  activeSku = sku;
  checkoutMounted = false;
  const modal = ensureCheckoutModal();
  modal.hidden = false;
  modal.classList.add('is-open');
  document.body.classList.add('checkout-open');
  modal.querySelector('#checkout-product-name').textContent = offer.name;
  modal.querySelector('#checkout-product-price').textContent = money(offer.amount);
  modal.querySelector('#lead-form').hidden = false;
  modal.querySelector('#checkout-stage').hidden = true;
  setTimeout(() => modal.querySelector('#lead-name')?.focus(), 50);
}

async function submitLead(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim().toLowerCase();
  const whatsapp = form.elements.whatsapp.value.replace(/\D/g, '');
  if (name.length < 3) return showToast('Informe seu nome completo.', true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Informe um e-mail válido.', true);
  if (whatsapp.length < 10) return showToast('Informe um WhatsApp válido com DDD.', true);
  localStorage.setItem('margareth_checkout_lead', JSON.stringify({ name, email, whatsapp:form.elements.whatsapp.value }));
  const button = form.querySelector('button[type="submit"]');
  const original = button.textContent;
  try {
    button.disabled = true;
    button.textContent = 'Preparando pagamento...';
    const modal = ensureCheckoutModal();
    form.hidden = true;
    modal.querySelector('#checkout-stage').hidden = false;
    modal.querySelector('#checkout-installment-note').textContent = offers[activeSku].installments ? 'Cartão à vista ou parcelado, quando a opção estiver disponível para o cartão utilizado.' : 'Pagamento à vista no cartão.';
    const stripe = await getStripeClient();
    embeddedCheckout = await stripe.initEmbeddedCheckout({ fetchClientSecret: async () => {
      const response = await fetch('/api/create-checkout-session', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ sku:activeSku, name, email, whatsapp }) });
      const data = await response.json();
      if (!response.ok || !data.clientSecret) throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      checkoutMounted = true;
      window.dataLayer?.push({ event:'begin_checkout', ecommerce:{ value:offers[activeSku].amount / 100, currency:'BRL', items:[{ item_id:activeSku, item_name:offers[activeSku].name }] } });
      return data.clientSecret;
    } });
    modal.querySelector('#checkout-loading').hidden = true;
    embeddedCheckout.mount('#embedded-checkout');
  } catch (error) {
    suppressDownsell = true;
    closeCheckout(false);
    suppressDownsell = false;
    showToast(error instanceof Error ? error.message : 'Não foi possível abrir o pagamento.', true);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function closeCheckout(offerDownsell=false) {
  const modal = document.getElementById('checkout-modal');
  if (!modal || modal.hidden) return;
  const shouldDownsell = offerDownsell && !suppressDownsell && activeSku === 'colecao-completa';
  try { embeddedCheckout?.destroy(); } catch (error) { console.warn('checkout_destroy_error', error); }
  embeddedCheckout = null;
  modal.classList.remove('is-open');
  modal.hidden = true;
  modal.querySelector('#embedded-checkout').innerHTML = '';
  modal.querySelector('#checkout-loading').hidden = false;
  document.body.classList.remove('checkout-open');
  activeSku = null;
  checkoutMounted = false;
  if (shouldDownsell) setTimeout(openDownsell, 180);
}

function ensureDownsellModal() {
  let modal = document.getElementById('downsell-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'downsell-modal';
  modal.className = 'checkout-modal';
  modal.hidden = true;
  modal.innerHTML = `<div class="checkout-backdrop" data-downsell-close></div><section class="downsell-panel" role="dialog" aria-modal="true" aria-labelledby="downsell-title"><button class="checkout-close" data-downsell-close aria-label="Fechar oferta">×</button>${atlas('b4','Oferta do Kit Essencial com três apostilas')}<div class="downsell-actions"><div><p class="eyebrow">UMA OPÇÃO MAIS LEVE</p><h2 id="downsell-title">Comece com três apostilas por R$ 12,90.</h2><p>O Kit Essencial libera CALMA, Marcos do Desenvolvimento e Quadro de Emoções.</p></div><button class="button button-accent button-large" data-buy="kit-essencial">Escolher o Kit Essencial</button><button class="button button-ghost" data-downsell-close>Agora não</button></div></section>`;
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-downsell-close]').forEach((el) => el.addEventListener('click', closeDownsell));
  return modal;
}

function openDownsell() { const modal = ensureDownsellModal(); modal.hidden = false; modal.classList.add('is-open'); document.body.classList.add('checkout-open'); }
function closeDownsell() { const modal = document.getElementById('downsell-modal'); if (!modal) return; modal.hidden = true; modal.classList.remove('is-open'); document.body.classList.remove('checkout-open'); }

function applyAuthorPhoto() {
  const seal = document.querySelector('.author-seal');
  if (!seal) return;
  seal.classList.add('author-photo');
  seal.setAttribute('role','img');
  seal.setAttribute('aria-label','Foto de Margareth Almeida');
  seal.innerHTML = '<small>ciência e afeto</small>';
}

function updatePaymentCopy() {
  const offerLead = document.querySelector('.offer-card > small');
  if (offerLead) offerLead.textContent = 'Hoje, cartão à vista ou parcelado';
  const installment = document.querySelector('.installment-copy');
  if (installment) installment.textContent = 'Parcelamento apresentado pela Stripe conforme a disponibilidade para o cartão utilizado.';
  const paymentStep = document.querySelector('.steps-grid li:nth-child(2) p');
  if (paymentStep) paymentStep.textContent = 'Informe nome, e-mail e WhatsApp; depois finalize o cartão dentro da própria página.';
}

document.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) { activeFilter = filter.dataset.filter; document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === filter)); renderCatalog(); return; }
  const buy = event.target.closest('[data-buy]');
  if (buy) { event.preventDefault(); closeDownsell(); openCheckoutModal(buy.dataset.buy); }
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (!document.getElementById('downsell-modal')?.hidden) closeDownsell(); else closeCheckout(true); } });

addFunnelStylesheet();
renderCatalog();
injectCampaignImages();
applyAuthorPhoto();
updatePaymentCopy();
